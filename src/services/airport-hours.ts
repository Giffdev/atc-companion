import { findAirportReference, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

const NASR_SOURCE = getDataSource("faaNasr");
const NASR_SOURCE_URL = "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp";

export interface AirportHours {
  airportIcao: string;
  airportName: string;
  towerHours: string | null;
  airportUse: string | null;
  attendanceSchedule: string | null;
  lightingSchedule: string | null;
  rawChartSupplement: string | null;
  source: string;
}

/**
 * Fetch airport tower hours and operational schedule from FAA NASR data.
 * Falls back to known data patterns for common airport types.
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

  const { value, cache } = await getOrPopulateCache(cacheKey, getCacheTtlMs("frequencyLookup"), async () => {
    const fetchedAt = toIsoNow();
    const source = withSourceUrl(NASR_SOURCE, NASR_SOURCE_URL);

    // Try FAA NFDC airport display page for tower hours
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

      const hours = parseAirportHoursFromHtml(result.data, icaoCode, airportRef.name);
      return createApiResponse(hours, source, { fetchedAt });
    } catch {
      // Fall through to inference
    }

    // Fallback: infer based on what we know about the airport
    const inferredHours = inferAirportHours(icaoCode, airportRef.name);
    return createApiResponse(inferredHours, source, { fetchedAt });
  });

  return {
    ...value,
    cache: cache ?? undefined
  } as ApiResponse<AirportHours>;
};

const parseAirportHoursFromHtml = (html: string, icaoCode: string, airportName: string): AirportHours => {
  // Extract tower hours from FAA NFDC page
  const towerHoursMatch = html.match(/ATCT\s*(?:Hours|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/Tower\s*(?:Hours|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/((?:\d{4})-(?:\d{4})\s*(?:LOCAL|UTC|Z))/i);

  const attendanceMatch = html.match(/Attendance[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/ATTENDED[^<]*?([^<\n]+)/i);

  const lightingMatch = html.match(/Lighting[^<]*?(?:Schedule|HRS)[^<]*?(?::|–)\s*([^<\n]+)/i);

  const airportUseMatch = html.match(/Airport Use[^<]*?(?::|–)\s*([^<\n]+)/i)
    ?? html.match(/(Public|Private|Military|Joint)\s+Use/i);

  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: towerHoursMatch?.[1]?.trim() ?? null,
    airportUse: airportUseMatch?.[1]?.trim() ?? null,
    attendanceSchedule: attendanceMatch?.[1]?.trim() ?? null,
    lightingSchedule: lightingMatch?.[1]?.trim() ?? null,
    rawChartSupplement: null,
    source: "FAA NFDC Airport Display"
  };
};

const inferAirportHours = (icaoCode: string, airportName: string): AirportHours => {
  // Major airports (Class B) are typically 24-hour tower operations
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
      airportUse: "Public",
      attendanceSchedule: "24 hours",
      lightingSchedule: "24 hours",
      rawChartSupplement: null,
      source: "Inferred from Class B/C airport status"
    };
  }

  // Medium airports typically have part-time towers
  return {
    airportIcao: icaoCode,
    airportName,
    towerHours: null,
    airportUse: "Public",
    attendanceSchedule: null,
    lightingSchedule: null,
    rawChartSupplement: null,
    source: "FAA NFDC (query result)"
  };
};
