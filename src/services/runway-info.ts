import { fetchAirportFromNfdc, findAirportReference, toFaaCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import { collapseWhitespace, extractTableCellPairs, stripHtmlToText } from "@/services/nfdc-html";

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
const RUNWAY_SECTION_ID_REGEX = /<div\b[^>]*id=["']runway_([^"']+)["'][^>]*>/gi;
const RUNWAY_HEADING_REGEX = /<(?:h[1-6]|caption|span)\b[^>]*>[\s\S]*?\b(?:RUNWAY|RWY)\s+([^<]+?)\s*<\/(?:h[1-6]|caption|span)>/gi;
const RUNWAY_DESIGNATOR_REGEX = /\b(?:RUNWAY|RWY)\s+(\d{1,2}[LRCG]?\s*\/\s*\d{1,2}[LRCG]?)\b/i;
const RUNWAY_TEXT_FALLBACK_REGEX =
  /\b(?:RUNWAY|RWY)\s+(\d{1,2}[LRCG]?\s*\/\s*\d{1,2}[LRCG]?)[\s\S]{0,240}?(\d[\d,]*)\s*(?:FT\.?|FEET)?\s*[X×]\s*(\d[\d,]*)\s*(?:FT\.?|FEET)?/gi;

const isValidRunwayDesignator = (value: string): boolean => /^\d{1,2}[LRCG]?\/\d{1,2}[LRCG]?$/.test(value);

const normalizeRunwayDesignator = (value: string): string => {
  const normalized = collapseWhitespace(value)
    .toUpperCase()
    .replace(/^RUNWAY\s+/, "")
    .replace(/^RWY\s+/, "")
    .replace(/_/g, "/")
    .replace(/\s+/g, "")
    .replace(/[^0-9A-Z/]/g, "");

  return isValidRunwayDesignator(normalized) ? normalized : "";
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

const extractSurfaceType = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = normalizeSurfaceType(value);
  return normalized && normalized.length <= 16 ? normalized : null;
};

const extractLightingType = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = normalizeLightingType(value);
  return normalized && normalized.length <= 16 ? normalized : null;
};

type RunwaySection = {
  designatorHint: string;
  sectionHtml: string;
};

const findFirstPairValue = (
  pairs: Array<{ label: string; value: string }>,
  predicate: (label: string) => boolean
): string | null => {
  const match = pairs.find(({ label, value }) => predicate(label) && value.length > 0);
  return match?.value ?? null;
};

const extractDesignatorFromSectionText = (value: string): string => {
  const match = collapseWhitespace(value).match(RUNWAY_DESIGNATOR_REGEX);
  return normalizeRunwayDesignator(match?.[1] ?? "");
};

const extractRunwaySectionsByDivId = (html: string): RunwaySection[] => {
  const sections = [...html.matchAll(RUNWAY_SECTION_ID_REGEX)];
  const runwaySections: RunwaySection[] = [];

  for (let index = 0; index < sections.length; index += 1) {
    const current = sections[index];
    const sectionStart = current.index ?? 0;
    const sectionEnd = sections[index + 1]?.index ?? html.length;
    const sectionHtml = html.slice(sectionStart, sectionEnd);
    const designatorHint = extractDesignatorFromSectionText(sectionHtml.slice(0, 1200))
      || normalizeRunwayDesignator(current[1]);

    runwaySections.push({ designatorHint, sectionHtml });
  }

  return runwaySections;
};

const extractRunwaySectionsByHeading = (html: string): RunwaySection[] => {
  const headings = [...html.matchAll(RUNWAY_HEADING_REGEX)];
  const runwaySections: RunwaySection[] = [];

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const designatorHint = normalizeRunwayDesignator(current[1]);
    if (!designatorHint) {
      continue;
    }

    const sectionStart = current.index ?? 0;
    const sectionEnd = headings[index + 1]?.index ?? html.length;
    runwaySections.push({
      designatorHint,
      sectionHtml: html.slice(sectionStart, sectionEnd)
    });
  }

  return runwaySections;
};

const extractRunwaySectionInfo = (section: RunwaySection): RunwayInfo | null => {
  const designator = extractDesignatorFromSectionText(section.sectionHtml.slice(0, 1200)) || section.designatorHint;
  if (!designator) {
    return null;
  }

  const tableHtml = section.sectionHtml.match(/<table\b[^>]*>[\s\S]*?<\/table>/i)?.[0] ?? section.sectionHtml;
  const pairs = extractTableCellPairs(tableHtml);
  const sectionText = stripHtmlToText(section.sectionHtml);
  const dimensions = parseRunwayDimensions(
    findFirstPairValue(pairs, (label) => label === "dimensions")
      ?? sectionText
  );

  const surfaceText = findFirstPairValue(pairs, (label) => label === "surface type" || label === "surface");
  const lightingText = findFirstPairValue(
    pairs,
    (label) => label === "runway edge lights" || label.includes("edge lights") || label.endsWith("lights")
  );

  return {
    designator,
    lengthFeet: dimensions.lengthFeet,
    widthFeet: dimensions.widthFeet,
    surface: extractSurfaceType(surfaceText) ?? extractSurfaceType(sectionText),
    lighting: extractLightingType(lightingText) ?? extractLightingType(sectionText)
  };
};

const extractRunwaysFromPlainText = (html: string): RunwayInfo[] => {
  const runways: RunwayInfo[] = [];
  const text = stripHtmlToText(html);

  for (const match of text.matchAll(RUNWAY_TEXT_FALLBACK_REGEX)) {
    runways.push({
      designator: normalizeRunwayDesignator(match[1]),
      lengthFeet: Number.parseInt(match[2].replace(/,/g, ""), 10),
      widthFeet: Number.parseInt(match[3].replace(/,/g, ""), 10),
      surface: extractSurfaceType(match[0]),
      lighting: extractLightingType(match[0])
    });
  }

  return runways;
};

export const parseRunwaysFromHtml = (html: string): RunwayInfo[] => {
  const runways: RunwayInfo[] = [];
  const seen = new Set<string>();

  const addRunway = (runway: RunwayInfo | null) => {
    if (!runway) {
      return;
    }

    const designator = normalizeRunwayDesignator(runway.designator);
    if (!designator || seen.has(designator)) {
      return;
    }

    runways.push({
      designator,
      lengthFeet: runway.lengthFeet,
      widthFeet: runway.widthFeet,
      surface: runway.surface,
      lighting: runway.lighting
    });
    seen.add(designator);
  };

  for (const section of extractRunwaySectionsByDivId(html)) {
    addRunway(extractRunwaySectionInfo(section));
  }

  for (const section of extractRunwaySectionsByHeading(html)) {
    addRunway(extractRunwaySectionInfo(section));
  }

  for (const runway of extractRunwaysFromPlainText(html)) {
    addRunway(runway);
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

/**
 * Extract unique runway designators from approach plate names.
 * Plates have names like "ILS RWY 16", "RNAV (GPS) RWY 34", "LOC/DME RWY 16".
 * Returns paired designators (e.g., "16/34") when both ends are found.
 */
export const inferRunwaysFromPlates = (plates: Array<{ procedureName?: string; runway?: string }>): RunwayInfo[] => {
  const runwayNumbers = new Set<string>();

  for (const plate of plates) {
    const rwy = plate.runway?.trim();
    if (rwy && /^\d{1,2}[LRCG]?$/.test(rwy)) {
      runwayNumbers.add(rwy.padStart(2, "0").toUpperCase());
    }
    const nameMatch = plate.procedureName?.match(/\bRWY\s+(\d{1,2}[LRCG]?)\b/i);
    if (nameMatch) {
      runwayNumbers.add(nameMatch[1].padStart(2, "0").toUpperCase());
    }
  }

  if (runwayNumbers.size === 0) return [];

  // Pair reciprocal runways (e.g., 16 and 34)
  const paired = new Set<string>();
  const result: RunwayInfo[] = [];
  const sorted = [...runwayNumbers].sort();

  for (const rwy of sorted) {
    if (paired.has(rwy)) continue;
    const num = parseInt(rwy.replace(/[LRCG]$/, ""), 10);
    const suffix = rwy.match(/[LRCG]$/)?.[0] ?? "";
    const reciprocalNum = ((num + 18 - 1) % 36) + 1;
    const reciprocalSuffix = suffix === "L" ? "R" : suffix === "R" ? "L" : suffix;
    const reciprocal = `${reciprocalNum.toString().padStart(2, "0")}${reciprocalSuffix}`;

    if (runwayNumbers.has(reciprocal)) {
      paired.add(rwy);
      paired.add(reciprocal);
      result.push({ designator: `${rwy}/${reciprocal}`, lengthFeet: null, widthFeet: null, surface: null, lighting: null });
    } else {
      paired.add(rwy);
      result.push({ designator: `${rwy}/${reciprocal}`, lengthFeet: null, widthFeet: null, surface: null, lighting: null });
    }
  }

  return result;
};
