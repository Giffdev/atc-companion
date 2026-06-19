import { fetchAirportFromNfdc, findAirportReference, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";

const NASR_SOURCE = getDataSource("faaNasr");

export interface RunwayInfo {
  designator: string;   // e.g. "16R/34L"
  lengthFeet: number | null;
  widthFeet: number | null;
  surface: string | null;
  lighting: string | null;
}

export interface AirportRunways {
  airportIcao: string;
  airportName: string;
  runways: RunwayInfo[];
  source: string;
}

/**
 * Fetch runway data for an airport from the FAA NFDC airport display page.
 * Results are cached for 28 days (runway data rarely changes).
 */
export const getAirportRunways = async (airportCodeInput: string): Promise<ApiResponse<AirportRunways>> => {
  const faaCode = toFaaCode(airportCodeInput);
  const icaoCode = airportCodeInput.toUpperCase();
  const airportRef = findAirportReference(airportCodeInput) ?? await fetchAirportFromNfdc(airportCodeInput);
  const cacheKey = createCacheKey("airport-runways", { airport: icaoCode });
  const sourceUrl = `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${faaCode}`;

  if (!airportRef) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_NOT_FOUND",
        message: `Airport ${airportCodeInput} not found in FAA database.`,
        retryable: false,
        status: 404
      },
      { source: withSourceUrl(NASR_SOURCE, sourceUrl), fetchedAt: toIsoNow() }
    );
  }

  const { value } = await getOrPopulateCache(cacheKey, getCacheTtlMs("frequencyLookup"), async () => {
    const fetchedAt = toIsoNow();
    const source = withSourceUrl(NASR_SOURCE, sourceUrl);

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

      const runways = parseRunwaysFromHtml(result.data);

      if (runways.length > 0) {
        return createApiResponse(
          { airportIcao: icaoCode, airportName: airportRef.name, runways, source: "FAA NFDC" },
          source,
          { fetchedAt }
        );
      }
    } catch {
      // Fall through to inference
    }

    // Fallback: derive from approach plates if we have them
    const inferredRunways = inferRunwaysFromAirportData(airportRef);
    return createApiResponse(
      { airportIcao: icaoCode, airportName: airportRef.name, runways: inferredRunways, source: "Inferred from airport data" },
      source,
      { fetchedAt }
    );
  });

  return value as ApiResponse<AirportRunways>;
};

/**
 * Parse runway data from the FAA NFDC airport display HTML page.
 * The page contains runway rows with designator, length, width, surface, and lighting.
 */
const parseRunwaysFromHtml = (html: string): RunwayInfo[] => {
  const runways: RunwayInfo[] = [];

  // The FAA NFDC page typically lists runways in a table or structured format.
  // Pattern: runway designator like "16/34", "16R/34L", etc.
  // Look for runway designator patterns followed by dimensional data.

  // Match patterns like "RWY 16R/34L" or "Runway 16/34" or "16R/34L"
  const rwyPattern = /(?:RWY|Runway|RY)\s*(\d{1,2}[LRCG]?\s*\/\s*\d{1,2}[LRCG]?)/gi;
  const rwyMatches = [...html.matchAll(rwyPattern)];

  for (const match of rwyMatches) {
    const designator = match[1].replace(/\s/g, "");

    // Look for length near this runway mention
    const afterMatch = html.slice(match.index!, match.index! + 500);
    const lengthMatch = afterMatch.match(/(\d{3,5})\s*(?:x|×|X)\s*(\d{2,4})/);
    const surfaceMatch = afterMatch.match(/(?:ASPH|CONC|TURF|GRVL|DIRT|ASPHALT|CONCRETE|GRASS|GRAVEL)/i);
    const lightingMatch = afterMatch.match(/(?:HIRL|MIRL|LIRL|REIL|VASI|PAPI|ALS|MALSR|ALSF)/i);

    // Avoid duplicates
    if (!runways.some((r) => r.designator === designator)) {
      runways.push({
        designator,
        lengthFeet: lengthMatch ? parseInt(lengthMatch[1], 10) : null,
        widthFeet: lengthMatch ? parseInt(lengthMatch[2], 10) : null,
        surface: surfaceMatch?.[0]?.toUpperCase() ?? null,
        lighting: lightingMatch?.[0]?.toUpperCase() ?? null
      });
    }
  }

  // Also try a more general pattern for standalone runway designators in tables
  if (runways.length === 0) {
    const generalPattern = /\b(\d{1,2}[LRCG]?\s*\/\s*\d{1,2}[LRCG]?)\b.*?(\d{3,5})\s*(?:x|×|X)\s*(\d{2,4})/gi;
    const generalMatches = [...html.matchAll(generalPattern)];

    for (const match of generalMatches) {
      const designator = match[1].replace(/\s/g, "");
      if (!runways.some((r) => r.designator === designator)) {
        runways.push({
          designator,
          lengthFeet: parseInt(match[2], 10),
          widthFeet: parseInt(match[3], 10),
          surface: null,
          lighting: null
        });
      }
    }
  }

  return runways;
};

/**
 * Infer basic runway info from static airport data if FAA NFDC fails.
 */
const inferRunwaysFromAirportData = (airport: { runways?: string[] }): RunwayInfo[] => {
  if (airport.runways && airport.runways.length > 0) {
    return airport.runways.map((designator) => ({
      designator,
      lengthFeet: null,
      widthFeet: null,
      surface: null,
      lighting: null
    }));
  }

  return [];
};
