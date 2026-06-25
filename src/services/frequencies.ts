import { findApproachFacility, findApproachFacilityByAirport } from "@/data/approach-facilities";
import { getDatasetAirport, getDatasetFrequencies, type DatasetAirport } from "@/data/airport-dataset";
import { LOCAL_FREQUENCY_SEED } from "@/data/frequency-seed";
import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import { OURAIRPORTS_SOURCE } from "@/services/dataset-airport-fallback";
import type { ApiResponse } from "@/types/api";
import type { Frequency, FrequencyType } from "@/types/aviation";

export const FREQUENCY_DATA_GAP_CODE = "FREQUENCY_DATA_GAP";

export interface InferredCtafConvention {
  frequencyMHz: 122.9;
  unverified: true;
  basis: "FAA default CTAF for non-towered airports without an assigned frequency";
}

const DEFAULT_CTAF_CONVENTION: InferredCtafConvention = {
  frequencyMHz: 122.9,
  unverified: true,
  basis: "FAA default CTAF for non-towered airports without an assigned frequency"
};

const NON_TOWERED_DATASET_AIRPORT_TYPES = new Set(["small_airport", "seaplane_base", "heliport", "balloonport"]);
const FREQUENCY_SOURCE = getDataSource("faaNasr");
const FREQUENCY_SOURCE_URL = "https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/";
const NFDC_BASE_URL = "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp";

const NFDC_TYPE_MAP: Record<string, FrequencyType> = {
  UNICOM: "UNICOM", CTAF: "CTAF", ATIS: "ATIS", "D-ATIS": "ATIS",
  AWOS: "AWOS", ASOS: "AWOS", TOWER: "TWR", TWR: "TWR",
  GROUND: "GND", GND: "GND", CLEARANCE: "DEL", "CLNC DEL": "DEL",
  CLD: "DEL", CD: "DEL", "APP/DEP": "APP", APPROACH: "APP", DEPARTURE: "APP",
  DEP: "APP", APP: "APP", CENTER: "CENTER", CTR: "CENTER", FSS: "FSS"
};

const classifyNfdcFreqType = (label: string): FrequencyType => {
  const upper = label.toUpperCase().replace(/[^A-Z/ -]/g, "").trim();
  for (const [key, type] of Object.entries(NFDC_TYPE_MAP)) {
    if (upper.includes(key)) return type;
  }
  if (/\bTOWER\b/.test(upper) || /\bLCL\b/.test(upper)) return "TWR";
  if (/\bGROUND\b/.test(upper) || /\bGND\b/.test(upper)) return "GND";
  return "UNICOM";
};

const classifyDatasetFreqType = (type: string): FrequencyType => {
  const upper = type.toUpperCase().replace(/[^A-Z/ -]/g, "").trim();
  if (NFDC_TYPE_MAP[upper]) return NFDC_TYPE_MAP[upper];
  if (/\bTOWER\b/.test(upper) || /\bLCL\b/.test(upper)) return "TWR";
  if (/\bGROUND\b/.test(upper) || /\bGND\b/.test(upper)) return "GND";
  return "OTHER";
};

const getDatasetFallbackFrequencies = (airportCode: string, requestedType?: string): Frequency[] => {
  const fetchedAt = toIsoNow();
  const requestedFrequencyType = requestedType?.toUpperCase() as FrequencyType | undefined;

  return getDatasetFrequencies(airportCode)
    .map((record): Frequency => ({
      type: classifyDatasetFreqType(record.type),
      valueMHz: record.frequencyMHz,
      name: record.description ?? record.type,
      source: OURAIRPORTS_SOURCE,
      fetchedAt,
      isStale: false
    }))
    .filter((record) => !requestedFrequencyType || record.type === requestedFrequencyType);
};

const getDatasetAirportForFrequencyLookup = (airport: string, airportCode: string, faaCode: string): DatasetAirport | undefined => {
  return getDatasetAirport(airportCode) ?? getDatasetAirport(faaCode) ?? getDatasetAirport(airport) ?? undefined;
};

const getFrequencyGapVerificationText = (
  datasetAirport: DatasetAirport | undefined,
  hasNonToweredHint: boolean
): string | undefined => {
  if (datasetAirport?.country === "CA") {
    return "verify frequency assignments in official Canadian aeronautical publications or with NAV CANADA before use";
  }

  if (datasetAirport?.country && datasetAirport.country !== "US") {
    return "verify frequency assignments in official aeronautical publications for that airport's jurisdiction before use";
  }

  if (!hasNonToweredHint) {
    return "verify CTAF/UNICOM in the official FAA Chart Supplement";
  }

  return undefined;
};

const toFrequencyDataGapResponse = (
  airport: string,
  airportCode: string,
  faaCode: string,
  datasetAirport = getDatasetAirportForFrequencyLookup(airport, airportCode, faaCode)
): ApiResponse<never> => {
  const hasNonToweredHint =
    datasetAirport?.country === "US" &&
    NON_TOWERED_DATASET_AIRPORT_TYPES.has(datasetAirport.type);
  const verificationText = getFrequencyGapVerificationText(datasetAirport, hasNonToweredHint);
  const message = `Frequency data could not be loaded for ${airportCode} from our available sources. This is not confirmation that the airport has no published frequency${
    verificationText ? `; ${verificationText}.` : "."
  }`;
  const details = verificationText
    ? `Available sources returned no confirmed frequency records. ${verificationText[0].toUpperCase()}${verificationText.slice(1)}.`
    : "Available sources returned no confirmed frequency records. Verify CTAF/UNICOM in the official FAA Chart Supplement before use.";
  const source = datasetAirport?.country && datasetAirport.country !== "US"
    ? OURAIRPORTS_SOURCE
    : withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL);

  return createApiErrorResponse(
    {
      code: FREQUENCY_DATA_GAP_CODE,
      message,
      details,
      retryable: true,
      status: 503,
      frequencies: [],
      inferredCtaf: hasNonToweredHint ? DEFAULT_CTAF_CONVENTION : undefined
    },
    {
      source,
      fetchedAt: toIsoNow(),
      stalenessCategory: "frequency"
    }
  );
};

const fetchNfdcFrequencies = async (faaCode: string): Promise<Frequency[]> => {
  const url = `${NFDC_BASE_URL}?airportId=${encodeURIComponent(faaCode)}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return [];

  const html = await response.text();
  const fetchedAt = toIsoNow();
  const source = withSourceUrl(FREQUENCY_SOURCE, url);

  const commStart = html.indexOf("COMMUNICATIONS");
  if (commStart < 0) return [];
  const commEnd = html.indexOf("NAVAIDS", commStart);
  const commSection = html.substring(commStart, commEnd > 0 ? commEnd : commStart + 5000);

  const frequencies: Frequency[] = [];
  const seen = new Set<string>();

  // Match <td>LABEL:</td> ... <td>FREQ MHz</td> patterns across multi-line HTML
  const rowPattern = /<td[^>]*>\s*([\s\S]*?)\s*<\/td>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(commSection)) !== null) {
    const rawLabel = match[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    const rawValue = match[2].replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

    // Extract frequency from value cell
    const freqMatch = rawValue.match(/(\d{2,3}\.\d{1,3})\s*MHz/i);
    if (!freqMatch) continue;

    const freqMHz = parseFloat(freqMatch[1]);
    if (freqMHz < 108 || freqMHz > 225) continue; // VHF aviation band only

    const label = rawLabel.replace(/:$/, "").trim();
    if (!label) continue;

    const type = classifyNfdcFreqType(label);
    const key = `${type}-${freqMHz}`;
    if (seen.has(key)) continue;
    seen.add(key);

    frequencies.push({ type, valueMHz: freqMHz, name: label, source, fetchedAt, isStale: false });
  }

  return frequencies;
};

const toApproachFacilityResponse = async (facilityLookup: string, airportCode: string): Promise<ApiResponse<Frequency[]>> => {
  const facility = findApproachFacility(facilityLookup) ?? findApproachFacilityByAirport(airportCode);
  const cacheKey = createCacheKey("approach-frequencies", {
    facility: facility?.icao ?? facilityLookup.trim().toUpperCase(),
    airportCode
  });

  if (!facility) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_NOT_FOUND",
        message: `No FAA approach-control frequency seed data is available for ${facilityLookup.trim().toUpperCase()}.`,
        details: "The local approach-control facility seed covers major TRACON and RAPCON facilities only.",
        retryable: false,
        status: 404
      },
      {
        source: withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL),
        fetchedAt: toIsoNow(),
        stalenessCategory: "frequency"
      }
    );
  }

  const { value, cache } = await getOrPopulateCache(cacheKey, getCacheTtlMs("frequencyLookup"), async () => {
    const fetchedAt = toIsoNow();
    const source = withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL);

    return facility.frequencies.map(
      (record): Frequency => ({
        type: "APP",
        valueMHz: record.valueMHz,
        name: record.sector ? `${facility.name} - ${record.sector}` : facility.name,
        source,
        fetchedAt,
        isStale: false
      })
    );
  });

  return createApiResponse(value, withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL), {
    fetchedAt: value[0]?.fetchedAt ?? toIsoNow(),
    stalenessCategory: "frequency",
    cache
  });
};

export const getFrequencies = async (airport: string, freqType?: string): Promise<ApiResponse<Frequency[]>> => {
  const airportCode = toIcaoCode(airport);

  if (freqType?.toUpperCase() === "APP") {
    return toApproachFacilityResponse(airport, airportCode);
  }

  const cacheKey = createCacheKey("airport-frequencies", { airportCode });
  const lookup = LOCAL_FREQUENCY_SEED[airportCode];

  if (lookup) {
    const { value, cache } = await getOrPopulateCache(cacheKey, getCacheTtlMs("frequencyLookup"), async () => {
      const fetchedAt = toIsoNow();
      const source = withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL);

      return lookup.map(
        (record): Frequency => ({
          ...record,
          source,
          fetchedAt,
          isStale: false
        })
      );
    });

    return createApiResponse(value, withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL), {
      fetchedAt: value[0]?.fetchedAt ?? toIsoNow(),
      stalenessCategory: "frequency",
      cache
    });
  }

  // Fallback: fetch from FAA NFDC
  const faaCode = toFaaCode(airport);
  const datasetAirport = getDatasetAirportForFrequencyLookup(airport, airportCode, faaCode);
  const shouldQueryNfdc = !datasetAirport || datasetAirport.country === "US";
  const tryDatasetFallback = (): ApiResponse<Frequency[]> | undefined => {
    const datasetFreqs = getDatasetFallbackFrequencies(airportCode, freqType);
    if (datasetFreqs.length > 0) {
      return createApiResponse(datasetFreqs, OURAIRPORTS_SOURCE, {
        fetchedAt: datasetFreqs[0]?.fetchedAt ?? toIsoNow(),
        stalenessCategory: "frequency"
      });
    }

    return undefined;
  };

  if (!shouldQueryNfdc) {
    const datasetResponse = tryDatasetFallback();
    if (datasetResponse) {
      return datasetResponse;
    }

    return toFrequencyDataGapResponse(airport, airportCode, faaCode, datasetAirport);
  }

  const nfdcCacheKey = createCacheKey("nfdc-frequencies", { faaCode });
  try {
    const { value: nfdcFreqs, cache } = await getOrPopulateCache(nfdcCacheKey, getCacheTtlMs("frequencyLookup"), () =>
      fetchNfdcFrequencies(faaCode)
    );

    if (nfdcFreqs.length > 0) {
      return createApiResponse(nfdcFreqs, withSourceUrl(FREQUENCY_SOURCE, `${NFDC_BASE_URL}?airportId=${faaCode}`), {
        fetchedAt: nfdcFreqs[0]?.fetchedAt ?? toIsoNow(),
        stalenessCategory: "frequency",
        cache
      });
    }
  } catch {
    // fall through to error
  }

  const datasetResponse = tryDatasetFallback();
  if (datasetResponse) {
    return datasetResponse;
  }

  return toFrequencyDataGapResponse(airport, airportCode, faaCode, datasetAirport);
};
