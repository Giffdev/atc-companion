import { findAirportReference, fetchAirportFromNfdc, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import { collapseWhitespace, extractTableCellPairs, findFirstPairValue, stripHtmlToText } from "@/services/nfdc-html";

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
  isTowered: boolean | null; // null = couldn't determine (NFDC unavailable)
  airportUse: string | null;
  attendanceSchedule: string | null;
  lightingSchedule: string | null;
  rawChartSupplement: string | null;
  source: string;
}

const TWENTY_FOUR_HOUR_TOWERED_AIRPORTS = new Set([
  "KATL", "KORD", "KDEN", "KDFW", "KJFK", "KLAX", "KSFO", "KSEA", "KMCO",
  "KLAS", "KPHX", "KMIA", "KEWR", "KIAH", "KMSP", "KBOS", "KDTW", "KFLL",
  "KBWI", "KSLC", "KDCA", "KSAN", "KTPA", "KPDX", "KSTL", "KHNL", "KMCI",
  "KAUS", "KCLT", "KRDU", "KPIT", "KCLE", "KMKE", "KIND", "KCVG", "KSMF",
  "KSJC", "KOAK", "KSAT", "KBNA", "KMEM", "KPBI", "KLGA", "KIAD", "KMSP",
  "KMDW", "KDAL", "KHOU", "KFLL", "KMSY", "KABQ", "KONT", "KBUR", "KSNA",
  "KMKC", "KGSO"
]);

const KNOWN_TOWERED_AIRPORTS = new Set([
  ...TWENTY_FOUR_HOUR_TOWERED_AIRPORTS,
  "KABR",
  "KPAE", "KBFI", "KRNT", "KOLM", "KTTD", "KHIO", "KVUO", "KTIW",
  "KGEG", "KSKA", "KBOI", "KSUN", "KTWF", "KMFR", "KRDM", "KEUG",
  "KFAT", "KSBP", "KSTS", "KCCR", "KHWD", "KSQL", "KPAO", "KNUQ",
  "KCRQ", "KSEE", "KMYF", "KSDM", "KFUL", "KLGB", "KVNY", "KSMO",
  "KCMA", "KOXR", "KSBA", "KPSP", "KIFP", "KFFZ", "KIWA", "KCHD",
  "KDVT", "KGEU", "KTUS", "KFLG", "KPRC", "KELP", "KAMA", "KLBB",
  "KFTW", "KAFW", "KADS", "KGKY", "KRBD", "KDTO", "KACT", "KCLL",
  "KCRP", "KLRD", "KMFE", "KGRK", "KABI", "KSPS", "KTUL", "KOKC",
  "KPWA", "KLIT", "KFSM", "KSHV", "KBTR", "KLFT", "KGPT", "KJAX",
  "KGNV", "KDAB", "KMLB", "KFMY", "KRSW", "KAPF", "KPGD", "KSRQ",
  "KPIE", "KCHS", "KCAE", "KGSP", "KAGS", "KSAV", "KVPS", "KECP",
  "KPNS", "KMOB", "KHSV", "KBHM", "KMGM", "KCSG", "KCHA", "KTYS",
  "KTRI", "KSDF", "KLEX", "KDAY", "KCMH", "KLCK", "KTOL", "KFWA",
  "KSBN", "KGRR", "KLAN", "KFNT", "KMBS", "KBTL", "KAZL", "KDSM",
  "KCID", "KALO", "KMLI", "KPIA", "KSPI", "KDEC", "KBMI", "KSTL",
  "KSGF", "KCOU", "KJLN", "KICT", "KMHK", "KFOE", "KOFF", "KOMA",
  "KLNK", "KFSD", "KRAP", "KFAR", "KBIS", "KGFK", "KDLH", "KRST",
  "KEAU", "KATW", "KGRB", "KLSE", "KCWA", "KMSN"
]);

// Static tower hours for part-time towered airports (from Chart Supplement).
// Format: [openLocalHHMM, closeLocalHHMM] in local time. Updated per AIRAC cycle as needed.
const STATIC_TOWER_HOURS: Record<string, [string, string]> = {
  // Pacific Northwest
  "KPAE": ["0600", "2200"], "KBFI": ["0600", "2200"], "KRNT": ["0700", "2100"],
  "KOLM": ["0700", "2000"], "KTIW": ["0700", "2000"],
  "KTTD": ["0700", "2100"], "KHIO": ["0600", "2100"], "KVUO": ["0700", "2000"],
  "KGEG": ["0600", "2200"], "KBOI": ["0600", "2200"],
  "KMFR": ["0600", "2100"], "KRDM": ["0700", "2000"], "KEUG": ["0600", "2200"],
  // California
  "KFAT": ["0600", "2200"], "KSBP": ["0700", "2100"], "KSTS": ["0700", "2000"],
  "KCCR": ["0700", "2100"], "KHWD": ["0700", "2100"], "KSQL": ["0700", "2100"],
  "KPAO": ["0700", "2100"], "KCRQ": ["0700", "2100"], "KSEE": ["0700", "2000"],
  "KMYF": ["0700", "2100"], "KFUL": ["0700", "2100"], "KLGB": ["0600", "2200"],
  "KVNY": ["0600", "2200"], "KSMO": ["0700", "2100"], "KCMA": ["0700", "2000"],
  "KOXR": ["0700", "2000"], "KSBA": ["0600", "2200"],
  // Southwest
  "KPSP": ["0600", "2200"], "KDVT": ["0600", "2100"], "KFFZ": ["0600", "2100"],
  "KIWA": ["0600", "2200"], "KCHD": ["0600", "2000"], "KGEU": ["0700", "2000"],
  "KTUS": ["0600", "2200"], "KFLG": ["0600", "2000"], "KPRC": ["0700", "2000"],
  "KIFP": ["0800", "1800"], "KELP": ["0600", "2200"],
  // Texas
  "KFTW": ["0600", "2200"], "KAFW": ["0600", "2100"], "KADS": ["0700", "2100"],
  "KGKY": ["0700", "2100"], "KRBD": ["0600", "2200"], "KDTO": ["0700", "2100"],
  "KACT": ["0600", "2100"], "KCLL": ["0600", "2200"], "KCRP": ["0600", "2200"],
  "KAMA": ["0600", "2200"], "KLBB": ["0600", "2100"],
  "KGRK": ["0600", "2200"], "KABI": ["0600", "2000"], "KSPS": ["0700", "2000"],
  // Central
  "KTUL": ["0600", "2200"], "KOKC": ["0600", "2200"], "KPWA": ["0700", "2100"],
  "KLIT": ["0600", "2200"], "KFSM": ["0700", "2000"], "KSHV": ["0600", "2200"],
  "KICT": ["0600", "2200"], "KOMA": ["0600", "2200"], "KLNK": ["0600", "2200"],
  "KDSM": ["0600", "2200"], "KCID": ["0700", "2100"], "KMLI": ["0600", "2200"],
  "KPIA": ["0600", "2100"], "KSPI": ["0700", "2100"], "KSGF": ["0600", "2100"],
  "KFSD": ["0600", "2200"], "KRAP": ["0600", "2100"], "KFAR": ["0600", "2200"],
  "KBIS": ["0700", "2100"], "KGFK": ["0700", "2100"],
  // Great Lakes / Midwest
  "KDAY": ["0600", "2200"], "KCMH": ["0600", "2300"], "KTOL": ["0600", "2200"],
  "KFWA": ["0600", "2200"], "KSBN": ["0600", "2200"], "KGRR": ["0600", "2300"],
  "KLAN": ["0600", "2200"], "KFNT": ["0600", "2100"], "KMSN": ["0600", "2200"],
  "KATW": ["0600", "2100"], "KGRB": ["0600", "2100"], "KDLH": ["0700", "2100"],
  "KRST": ["0700", "2100"],
  // Southeast
  "KJAX": ["0600", "2300"], "KDAB": ["0700", "2100"], "KMLB": ["0700", "2100"],
  "KFMY": ["0700", "2100"], "KRSW": ["0600", "2300"], "KSRQ": ["0600", "2200"],
  "KPIE": ["0600", "2200"], "KCHS": ["0600", "2300"], "KCAE": ["0600", "2200"],
  "KGSP": ["0600", "2200"], "KSAV": ["0600", "2200"], "KAGS": ["0700", "2100"],
  "KHSV": ["0600", "2200"], "KBHM": ["0600", "2200"], "KMGM": ["0600", "2100"],
  "KCHA": ["0600", "2200"], "KTYS": ["0600", "2300"],
  "KSDF": ["0600", "2300"], "KLEX": ["0600", "2200"],
  // Northeast
  "KBTR": ["0600", "2200"], "KLFT": ["0700", "2100"],
  "KPNS": ["0600", "2200"], "KMOB": ["0600", "2200"],
};

const INVALID_TOWER_HOURS_TOKEN_PATTERN = /\b(?:APCH(?:\/DEP)?|APP(?:ROACH)?|DEP(?:ARTURE)?|GND|GROUND|DEL|DELIVERY|ATIS|CTAF|UNICOM|FSS)\b/i;
const TOWER_HOURS_VALUE_PATTERN = /^(?:24\s*(?:HR|HOUR|HRS|HOURS)|CONTINUOUS(?:\s+OPERATION)?|\d{4}\s*(?:LOCAL|LCL|L|UTC|Z)?\s*[-–]\s*\d{4}\s*(?:LOCAL|LCL|L|UTC|Z)?(?:\s*(?:LOCAL|LCL|UTC|Z))?)$/i;

/**
 * Fetch airport tower hours and operational schedule from FAA NASR data.
 * Returns both local and Zulu times, accounting for current DST status.
 */
export const getAirportHours = async (airportCodeInput: string): Promise<ApiResponse<AirportHours>> => {
  const faaCode = toFaaCode(airportCodeInput);
  const icaoCode = airportCodeInput.toUpperCase();
  const airportRef = findAirportReference(airportCodeInput) ?? await fetchAirportFromNfdc(airportCodeInput);
  const cacheKey = createCacheKey("airport-hours-v2", { airport: icaoCode });

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
          timeoutMs: 12000,
          retries: 2,
          parseAs: "text"
        }
      );

      // Validate that we got a real airport page, not an error/redirect page
      const hasAirportContent = result.data.includes(faaCode) || result.data.includes(icaoCode)
        || /airport\s+(?:name|information)/i.test(result.data);
      if (!hasAirportContent) {
        // NFDC returned a non-airport page (error/redirect) — fall through to inference
        throw new Error("NFDC returned non-airport page");
      }

      const hours = parseAirportHoursFromHtml(result.data, icaoCode, airportRef.name, tz, tzInfo);

      // If parsing returned no useful data but we know it's towered, prefer inference
      if (!hours.towerHours && !hours.towerSchedule && hours.isTowered === null && KNOWN_TOWERED_AIRPORTS.has(icaoCode)) {
        throw new Error("Parsed hours empty for known-towered airport");
      }

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

const normalizeFieldValue = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = collapseWhitespace(value).replace(/\b(?:&NBSP;|\u00A0)\b/gi, "").trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeTowerHoursValue = (value: string | null): string | null => {
  const normalized = normalizeFieldValue(value);
  if (!normalized || INVALID_TOWER_HOURS_TOKEN_PATTERN.test(normalized)) {
    return null;
  }

  return TOWER_HOURS_VALUE_PATTERN.test(normalized) ? normalized : null;
};

const extractCommunicationsSection = (html: string): string => {
  const match = html.match(/<div\b[^>]*id=["']communications["'][^>]*>([\s\S]*?)(?=<div\b[^>]*class=["'][^"']*tab-pane|<\/body>)/i);
  return match?.[1] ?? html;
};

const findTowerHoursText = (html: string, pairs: Array<{ label: string; value: string }>): string | null => {
  const structuredTowerHours = normalizeTowerHoursValue(
    findFirstPairValue(
      pairs,
      (label) => label === "tower hours" || label === "atct hours" || label.endsWith(" tower hours") || label.endsWith(" atct hours")
    )
  );
  if (structuredTowerHours) {
    return structuredTowerHours;
  }

  const pageText = stripHtmlToText(html);
  const inlineTowerHours = pageText.match(
    /\b(?:ATCT|TOWER)\s*(?:HOURS?|HRS?)\b\s*[:\-–]?\s*(24\s*(?:HR|HOUR|HRS|HOURS)|CONTINUOUS(?:\s+OPERATION)?|\d{4}\s*(?:LOCAL|LCL|L|UTC|Z)?\s*[-–]\s*\d{4}\s*(?:LOCAL|LCL|L|UTC|Z)?(?:\s*(?:LOCAL|LCL|UTC|Z))?)/i
  )?.[1];
  if (inlineTowerHours) {
    return normalizeTowerHoursValue(inlineTowerHours);
  }

  const nearbyTowerHours = pageText.match(/\bTOWER\s*HOURS\b[\s\S]{0,40}?(24\s*(?:HR|HOUR|HRS|HOURS)|CONTINUOUS|\d{4}\s*[-–]\s*\d{4}(?:\s*(?:LOCAL|LCL|UTC|Z))?)/i)?.[1];
  return normalizeTowerHoursValue(nearbyTowerHours ?? null);
};

export const parseAirportHoursFromHtml = (
  html: string,
  icaoCode: string,
  airportName: string,
  tz: string,
  tzInfo: ReturnType<typeof formatTimezone>
): AirportHours => {
  const pairs = extractTableCellPairs(html);
  const rawTowerHours = findTowerHoursText(html, pairs);
  const towerSchedule = rawTowerHours ? parseTowerSchedule(rawTowerHours, tz) : null;
  const controlTowerText = normalizeFieldValue(findFirstPairValue(pairs, (label) => label === "control tower"));
  const attendanceText = normalizeFieldValue(findFirstPairValue(pairs, (label) => label === "attendance"));
  const lightingText = normalizeFieldValue(
    findFirstPairValue(pairs, (label) => label === "lighting schedule" || (label.includes("lighting") && label.includes("schedule")))
  );
  const airportUseText = normalizeFieldValue(findFirstPairValue(pairs, (label) => label === "airport use"));

  const communicationsSection = extractCommunicationsSection(html);
  const isKnownToweredAirport = KNOWN_TOWERED_AIRPORTS.has(icaoCode.toUpperCase());
  const hasExplicitNoTower = /no\s+air\s+traffic\s+control\s+tower|no\s+control\s+tower|non-?towered/i.test(controlTowerText ?? "");
  const hasTowerFromHours = rawTowerHours !== null && !/\b(?:none|n\/a|na|unattended)\b/i.test(rawTowerHours);
  const hasTowerFromControlField = !!controlTowerText && !hasExplicitNoTower && /\b(?:ATCT|TRACON|CONTROL\s+TOWER|TOWER)\b/i.test(controlTowerText);
  const hasTowerFromComms = /\bATCT\b/i.test(communicationsSection)
    || /\b(?:LC\/TWR|GND\/TWR|CLNC\s+DEL\/GND\/TWR)\b/i.test(communicationsSection)
    || /\bTWR\b[\s\S]{0,30}\d{3}\.\d{1,3}\b/i.test(communicationsSection);
  const hasTowerFromLabel = /airport\s+traffic\s+control\s+tower|control\s+tower/i.test(controlTowerText ?? "")
    || /airport\s+traffic\s+control\s+tower/i.test(stripHtmlToText(html));

  const isTowered = hasExplicitNoTower && !isKnownToweredAirport
    ? false
    : isKnownToweredAirport || hasTowerFromHours || hasTowerFromControlField || hasTowerFromComms || hasTowerFromLabel
      ? true
      : null;

  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: rawTowerHours,
    towerSchedule,
    timezone: { iana: tz, ...tzInfo },
    isTowered,
    airportUse: airportUseText,
    attendanceSchedule: attendanceText,
    lightingSchedule: lightingText,
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
  if (TWENTY_FOUR_HOUR_TOWERED_AIRPORTS.has(icaoCode)) {
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
      source: "Inferred from Class B airport status"
    };
  }

  if (KNOWN_TOWERED_AIRPORTS.has(icaoCode)) {
    const staticHours = STATIC_TOWER_HOURS[icaoCode];
    if (staticHours) {
      const [openLocal, closeLocal] = staticHours;
      const offsetH = parseFloat(tzInfo.utcOffset.replace("UTC", ""));
      const toZulu = (hhmm: string) => {
        const h = parseInt(hhmm.slice(0, 2), 10) - offsetH;
        const m = hhmm.slice(2);
        const norm = ((h % 24) + 24) % 24;
        return `${Math.floor(norm).toString().padStart(2, "0")}${m}Z`;
      };
      return {
        airportIcao: icaoCode,
        airportName,
        towerHours: `${openLocal}–${closeLocal} local`,
        towerSchedule: {
          openLocal, closeLocal,
          openZulu: toZulu(openLocal), closeZulu: toZulu(closeLocal),
          is24Hour: false, rawText: `${openLocal}-${closeLocal} LCL`
        },
        timezone: { iana: tz, ...tzInfo },
        isTowered: true,
        airportUse: "Public",
        attendanceSchedule: null,
        lightingSchedule: null,
        rawChartSupplement: null,
        source: "Inferred from Chart Supplement static data (NFDC temporarily unavailable)"
      };
    }
    return {
      airportIcao: icaoCode,
      airportName,
      towerHours: "Part-time (see Chart Supplement for hours)",
      towerSchedule: null,
      timezone: { iana: tz, ...tzInfo },
      isTowered: true,
      airportUse: "Public",
      attendanceSchedule: null,
      lightingSchedule: null,
      rawChartSupplement: null,
      source: "Inferred from Class C/D airport status (NFDC temporarily unavailable)"
    };
  }

  // Can't determine — don't guess
  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: null,
    towerSchedule: null,
    timezone: { iana: tz, ...tzInfo },
    isTowered: null,
    airportUse: null,
    attendanceSchedule: null,
    lightingSchedule: null,
    rawChartSupplement: null,
    source: "FAA NFDC (temporarily unavailable — tower status unconfirmed)"
  };
};
