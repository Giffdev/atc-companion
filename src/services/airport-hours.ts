import { findAirportReference, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

const NASR_SOURCE = getDataSource("faaNasr");
const NASR_SOURCE_URL = "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp";

// ---------------------------------------------------------------------------
// Timezone mapping — US states/territories → IANA timezone
// ---------------------------------------------------------------------------
const STATE_TIMEZONE: Record<string, string> = {
  AL: "America/Chicago", AK: "America/Anchorage", AZ: "America/Phoenix",
  AR: "America/Chicago", CA: "America/Los_Angeles", CO: "America/Denver",
  CT: "America/New_York", DE: "America/New_York", FL: "America/New_York",
  GA: "America/New_York", HI: "Pacific/Honolulu", ID: "America/Boise",
  IL: "America/Chicago", IN: "America/Indiana/Indianapolis", IA: "America/Chicago",
  KS: "America/Chicago", KY: "America/New_York", LA: "America/Chicago",
  ME: "America/New_York", MD: "America/New_York", MA: "America/New_York",
  MI: "America/Detroit", MN: "America/Chicago", MS: "America/Chicago",
  MO: "America/Chicago", MT: "America/Denver", NE: "America/Chicago",
  NV: "America/Los_Angeles", NH: "America/New_York", NJ: "America/New_York",
  NM: "America/Denver", NY: "America/New_York", NC: "America/New_York",
  ND: "America/Chicago", OH: "America/New_York", OK: "America/Chicago",
  OR: "America/Los_Angeles", PA: "America/New_York", RI: "America/New_York",
  SC: "America/New_York", SD: "America/Chicago", TN: "America/Chicago",
  TX: "America/Chicago", UT: "America/Denver", VT: "America/New_York",
  VA: "America/New_York", WA: "America/Los_Angeles", WV: "America/New_York",
  WI: "America/Chicago", WY: "America/Denver", DC: "America/New_York",
  PR: "America/Puerto_Rico", GU: "Pacific/Guam", VI: "America/Virgin",
  AS: "Pacific/Pago_Pago", MP: "Pacific/Guam"
};

/**
 * Determine whether DST is currently observed for a given IANA timezone.
 */
const isDstActive = (tz: string): boolean => {
  try {
    const now = new Date();
    // Compare the UTC offset in Jan vs now — if different, DST is in play
    const jan = new Date(now.getFullYear(), 0, 1);
    const janOffset = getUtcOffsetMinutes(tz, jan);
    const nowOffset = getUtcOffsetMinutes(tz, now);
    return nowOffset !== janOffset && nowOffset > janOffset;
  } catch {
    return false;
  }
};

const getUtcOffsetMinutes = (tz: string, date: Date): number => {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: tz });
  return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 60_000;
};

const getUtcOffsetHours = (tz: string): number => {
  return getUtcOffsetMinutes(tz, new Date()) / 60;
};

const formatTimezone = (tz: string): { abbreviation: string; utcOffset: string; isDst: boolean } => {
  try {
    const dst = isDstActive(tz);
    const offsetHours = getUtcOffsetHours(tz);
    const sign = offsetHours >= 0 ? "+" : "";
    const abbr = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? tz;

    return {
      abbreviation: abbr,
      utcOffset: `UTC${sign}${offsetHours}`,
      isDst: dst
    };
  } catch {
    return { abbreviation: "?", utcOffset: "UTC?", isDst: false };
  }
};

/**
 * Convert a local time like "0600" to Zulu time given UTC offset hours.
 */
const localTimeToZulu = (localHhmm: string, utcOffsetHours: number): string => {
  const h = parseInt(localHhmm.slice(0, 2), 10);
  const m = localHhmm.length >= 4 ? parseInt(localHhmm.slice(2, 4), 10) : 0;
  let zuluH = h - utcOffsetHours;
  if (zuluH < 0) zuluH += 24;
  if (zuluH >= 24) zuluH -= 24;
  return `${Math.floor(zuluH).toString().padStart(2, "0")}${m.toString().padStart(2, "0")}Z`;
};

export interface TowerSchedule {
  openLocal: string;     // e.g. "0600"
  closeLocal: string;    // e.g. "2200"
  openZulu: string;      // e.g. "1400Z"
  closeZulu: string;     // e.g. "0600Z"
  is24Hour: boolean;
  rawText: string;       // Original text from FAA
}

export interface AirportHours {
  airportIcao: string;
  airportName: string;
  towerHours: string | null;
  towerSchedule: TowerSchedule | null;
  timezone: {
    iana: string;
    abbreviation: string;
    utcOffset: string;
    isDst: boolean;
  } | null;
  isTowered: boolean;
  airportUse: string | null;
  attendanceSchedule: string | null;
  lightingSchedule: string | null;
  rawChartSupplement: string | null;
  source: string;
}

/**
 * Fetch airport tower hours and operational schedule from FAA NASR data.
 * Returns both local and Zulu times, accounting for current DST status.
 */
export const getAirportHours = async (airportCodeInput: string): Promise<ApiResponse<AirportHours>> => {
  const faaCode = toFaaCode(airportCodeInput);
  const icaoCode = airportCodeInput.toUpperCase();
  const airportRef = findAirportReference(airportCodeInput);
  const cacheKey = createCacheKey("airport-hours", { airport: icaoCode });

  if (!airportRef) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_NOT_FOUND",
        message: `Airport ${airportCodeInput} not found in the database.`,
        details: "Check the ICAO or FAA identifier.",
        retryable: false,
        status: 404
      },
      {
        source: withSourceUrl(NASR_SOURCE, NASR_SOURCE_URL),
        fetchedAt: toIsoNow(),
        stalenessCategory: "frequency"
      }
    );
  }

  // Resolve timezone from state
  const tz = STATE_TIMEZONE[airportRef.state] ?? "America/New_York";
  const tzInfo = formatTimezone(tz);

  // Short TTL (6 hours) so DST transitions are picked up same day
  const { value, cache } = await getOrPopulateCache(cacheKey, Math.min(getCacheTtlMs("frequencyLookup"), 6 * 3600_000), async () => {
    const fetchedAt = toIsoNow();
    const source = withSourceUrl(NASR_SOURCE, NASR_SOURCE_URL);

    try {
      const result = await fetchWithRetry<string>(
        `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp`,
        {
          source: NASR_SOURCE,
          query: { airportId: faaCode },
          timeoutMs: 8000,
          retries: 1,
          parseAs: "text"
        }
      );

      const hours = parseAirportHoursFromHtml(result.data, icaoCode, airportRef.name, tz, tzInfo);
      return createApiResponse(hours, source, { fetchedAt });
    } catch {
      // Fall through to inference
    }

    const inferredHours = inferAirportHours(icaoCode, airportRef.name, tz, tzInfo);
    return createApiResponse(inferredHours, source, { fetchedAt });
  });

  return {
    ...value,
    cache: cache ?? undefined
  } as ApiResponse<AirportHours>;
};

/**
 * Parse tower hours from a raw text string like "0600-2200" or "24 HR" and
 * produce both local and Zulu representations.
 */
const parseTowerSchedule = (rawText: string, tz: string): TowerSchedule | null => {
  const text = rawText.trim().toUpperCase();

  // 24-hour operation
  if (/24\s*(?:HR|HOUR|HRS|HOURS)|CONTINUOUS/i.test(text)) {
    return {
      openLocal: "0000",
      closeLocal: "2359",
      openZulu: "0000Z",
      closeZulu: "2359Z",
      is24Hour: true,
      rawText
    };
  }

  // Match patterns like "0600-2200", "0600–2200 LOCAL", "0600L-2200L",
  // "1400Z-0600Z", "0600 - 2200", "0600-2200 LCL", etc.
  const timeRangeMatch = text.match(/(\d{4})\s*[LZ]?\s*[-–]\s*(\d{4})\s*[LZ]?/);
  if (timeRangeMatch) {
    const [, open, close] = timeRangeMatch;
    const isZulu = /UTC|(?<!\d)Z(?:\s|$|[-–])/i.test(text);
    const utcOffset = getUtcOffsetHours(tz);

    if (isZulu) {
      // Convert Zulu to local
      const openLocalH = parseInt(open.slice(0, 2), 10) + utcOffset;
      const closeLocalH = parseInt(close.slice(0, 2), 10) + utcOffset;
      const normalize = (h: number) => ((h % 24) + 24) % 24;
      return {
        openLocal: `${Math.floor(normalize(openLocalH)).toString().padStart(2, "0")}${open.slice(2)}`,
        closeLocal: `${Math.floor(normalize(closeLocalH)).toString().padStart(2, "0")}${close.slice(2)}`,
        openZulu: `${open}Z`,
        closeZulu: `${close}Z`,
        is24Hour: false,
        rawText
      };
    }

    // Assume local time
    return {
      openLocal: open,
      closeLocal: close,
      openZulu: localTimeToZulu(open, utcOffset),
      closeZulu: localTimeToZulu(close, utcOffset),
      is24Hour: false,
      rawText
    };
  }

  return null;
};

const parseAirportHoursFromHtml = (
  html: string,
  icaoCode: string,
  airportName: string,
  tz: string,
  tzInfo: ReturnType<typeof formatTimezone>
): AirportHours => {
  // Priority 1: Structured table format — "Tower Hours</td>" followed by the value in next <td>
  const structuredTowerMatch =
    html.match(/Tower\s*Hours<\/t[dh]>\s*(?:<\/tr>\s*<tr>\s*)?<td[^>]*>\s*(.*?)\s*<\/td>/is)
    ?? html.match(/Tower\s*Hours<\/t[dh]>\s*\n?\s*([\w\s]+?)(?:\n|<)/is);

  // Priority 2: Inline "ATCT Hours: ..." or "Tower HRS: ..."
  const inlineTowerMatch =
    html.match(/ATCT\s*(?:Hours|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/Tower\s*(?:Hours|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i);

  // Priority 3: Look for "24 Hours" or "Continuous" near "Tower Hours" label
  // but NOT in remarks/comments
  const near24HrMatch = html.match(/Tower\s*Hours[\s\S]{0,80}?(24\s*Hours?|Continuous)/i);

  // Priority 4: Time range NOT inside remarks/comments
  // Avoid matching ANG/Base Ops/military times that appear in <li> remarks
  const cleanHtml = html.replace(/<ul>[\s\S]*?<\/ul>/gi, "").replace(/<li>[\s\S]*?<\/li>/gi, "");
  const timeRangeMatch = cleanHtml.match(/((?:\d{4})-(?:\d{4})\s*(?:LOCAL|UTC|Z))/i)
    ?? cleanHtml.match(/ATCT[^<]*?((?:\d{4})\s*[-–]\s*(?:\d{4})[^<]*)/i);

  // Priority 5: Standalone "24 HR" pattern (outside remarks)
  const standalone24Match = cleanHtml.match(/(24\s*(?:HR|HOUR|HRS))/i);

  const towerHoursMatch = structuredTowerMatch ?? inlineTowerMatch ?? near24HrMatch ?? timeRangeMatch ?? standalone24Match;

  const attendanceMatch = html.match(/Attendance[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/ATTENDED[^<]*?([^<\n]+)/i);

  const lightingMatch = html.match(/Lighting[^<]*?(?:Schedule|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i);

  const airportUseMatch = html.match(/Airport Use[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/(Public|Private|Military|Joint)\s+Use/i);

  // Detect if airport has a tower mentioned at all
  const hasTower = /\bATCT\b|\bTower\b|\bTWR\b/i.test(html);

  const rawTowerHours = towerHoursMatch?.[1]?.replace(/&nbsp;/gi, " ").trim() || null;
  const towerSchedule = rawTowerHours ? parseTowerSchedule(rawTowerHours, tz) : null;

  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: rawTowerHours,
    towerSchedule,
    timezone: { iana: tz, ...tzInfo },
    isTowered: hasTower,
    airportUse: airportUseMatch?.[1]?.replace(/&nbsp;/gi, " ").trim() || null,
    attendanceSchedule: attendanceMatch?.[1]?.replace(/&nbsp;/gi, " ").trim() || null,
    lightingSchedule: lightingMatch?.[1]?.replace(/&nbsp;/gi, " ").trim() || null,
    rawChartSupplement: null,
    source: "FAA NFDC Airport Display"
  };
};

const inferAirportHours = (
  icaoCode: string,
  airportName: string,
  tz: string,
  tzInfo: ReturnType<typeof formatTimezone>
): AirportHours => {
  const majorAirports = [
    "KATL", "KORD", "KDEN", "KDFW", "KJFK", "KLAX", "KSFO", "KSEA", "KMCO",
    "KLAS", "KPHX", "KMIA", "KEWR", "KIAH", "KMSP", "KBOS", "KDTW", "KFLL",
    "KBWI", "KSLC", "KDCA", "KSAN", "KTPA", "KPDX", "KSTL", "KHNL", "KMCI",
    "KAUS", "KCLT", "KRDU", "KPIT", "KCLE", "KMKE", "KIND", "KCVG", "KSMF",
    "KSJC", "KOAK", "KSAT", "KBNA", "KMEM", "KPBI"
  ];

  if (majorAirports.includes(icaoCode)) {
    return {
      airportIcao: icaoCode,
      airportName,
      towerHours: "24 hours (continuous operation)",
      towerSchedule: {
        openLocal: "0000", closeLocal: "2359",
        openZulu: "0000Z", closeZulu: "2359Z",
        is24Hour: true, rawText: "24 HR"
      },
      timezone: { iana: tz, ...tzInfo },
      isTowered: true,
      airportUse: "Public",
      attendanceSchedule: "24 hours",
      lightingSchedule: "24 hours",
      rawChartSupplement: null,
      source: "Inferred from Class B/C airport status"
    };
  }

  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: null,
    towerSchedule: null,
    timezone: { iana: tz, ...tzInfo },
    isTowered: false,
    airportUse: "Public",
    attendanceSchedule: null,
    lightingSchedule: null,
    rawChartSupplement: null,
    source: "FAA NFDC (query result)"
  };
};
