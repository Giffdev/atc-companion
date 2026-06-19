import { fetchAirportFromNfdc, findAirportReference, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import { collapseWhitespace, extractTableCellPairs } from "@/services/nfdc-html";

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
const RUNWAY_HEADER_REGEX = /<div\b[^>]*id=["']runway_[^"']+["'][^>]*>[\s\S]*?<span[^>]*>\s*RUNWAY\s+([^<]+?)\s*<\/span>[\s\S]*?<\/div>/gi;

const normalizeRunwayDesignator = (value: string): string => {
  return collapseWhitespace(value)
    .toUpperCase()
    .replace(/^RUNWAY\s+/, "")
    .replace(/\s+/g, "")
    .replace(/[^0-9A-Z/]/g, "");
};

const parseRunwayDimensions = (value: string): Pick<RunwayInfo, "lengthFeet" | "widthFeet"> => {
  const match = value.match(/(\d[\d,]*)\s*(?:FT\.?|FEET)?\s*[X×]\s*(\d[\d,]*)\s*(?:FT\.?|FEET)?/i)
    ?? value.match(/(\d{3,5})\s*[X×]\s*(\d{2,4})/i);

  return {
    lengthFeet: match ? Number.parseInt(match[1].replace(/,/g, ""), 10) : null,
    widthFeet: match ? Number.parseInt(match[2].replace(/,/g, ""), 10) : null
  };
};

const normalizeSurfaceType = (value: string): string | null => {
  const normalized = collapseWhitespace(value).toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/\bASPH(?:ALT)?\b/.test(normalized)) return "ASPH";
  if (/\bCONC(?:RETE)?\b/.test(normalized)) return "CONC";
  if (/\bPEM\b|\bPENETRATED\s+MACADAM\b/.test(normalized)) return "PEM";
  if (/\bGRVL\b|\bGRAVEL\b/.test(normalized)) return "GRVL";
  if (/\bTURF\b/.test(normalized)) return "TURF";
  if (/\bGRASS\b/.test(normalized)) return "GRASS";
  if (/\bDIRT\b/.test(normalized)) return "DIRT";

  return normalized;
};

const normalizeLightingType = (value: string): string | null => {
  const normalized = collapseWhitespace(value).toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/\bHIRL\b|HIGH\s+INTENSITY/.test(normalized)) return "HIRL";
  if (/\bMIRL\b|MEDIUM\s+INTENSITY/.test(normalized)) return "MIRL";
  if (/\bLIRL\b|LOW\s+INTENSITY/.test(normalized)) return "LIRL";

  const acronym = normalized.match(/\b(HIRL|MIRL|LIRL|REIL|PAPI|VASI|MALSR|MALSF|ALSF(?:-\d+)?|ODALS|SSALS|SSALR)\b/);
  return acronym?.[1] ?? normalized;
};

export const parseRunwaysFromHtml = (html: string): RunwayInfo[] => {
  const runways: RunwayInfo[] = [];
  const seen = new Set<string>();
  const sections = [...html.matchAll(RUNWAY_HEADER_REGEX)];

  for (let index = 0; index < sections.length; index += 1) {
    const current = sections[index];
    const designator = normalizeRunwayDesignator(current[1]);
    if (!designator || seen.has(designator)) {
      continue;
    }

    const sectionStart = (current.index ?? 0) + current[0].length;
    const sectionEnd = sections[index + 1]?.index ?? html.length;
    const sectionHtml = html.slice(sectionStart, sectionEnd);
    const tableHtml = sectionHtml.match(/<table\b[^>]*>[\s\S]*?<\/table>/i)?.[0] ?? sectionHtml;
    const pairs = extractTableCellPairs(tableHtml);

    const dimensions = parseRunwayDimensions(
      pairs.find(({ label }) => label === "dimensions")?.value ?? ""
    );

    runways.push({
      designator,
      lengthFeet: dimensions.lengthFeet,
      widthFeet: dimensions.widthFeet,
      surface: normalizeSurfaceType(pairs.find(({ label }) => label === "surface type")?.value ?? ""),
      lighting: normalizeLightingType(
        pairs.find(({ label }) => label === "runway edge lights")?.value
          ?? pairs.find(({ label }) => label.includes("lights"))?.value
          ?? ""
      )
    });

    seen.add(designator);
  }

  if (runways.length > 0) {
    return runways;
  }

  for (const match of html.matchAll(/\b(\d{1,2}[LRCG]?\s*\/\s*\d{1,2}[LRCG]?)\b[\s\S]{0,400}?(\d[\d,]*)\s*(?:FT\.?|FEET)?\s*[X×]\s*(\d[\d,]*)/gi)) {
    const designator = normalizeRunwayDesignator(match[1]);
    if (!designator || seen.has(designator)) {
      continue;
    }

    runways.push({
      designator,
      lengthFeet: Number.parseInt(match[2].replace(/,/g, ""), 10),
      widthFeet: Number.parseInt(match[3].replace(/,/g, ""), 10),
      surface: null,
      lighting: null
    });
    seen.add(designator);
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
