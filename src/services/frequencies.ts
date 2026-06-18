import { findApproachFacility, findApproachFacilityByAirport } from "@/data/approach-facilities";
import { LOCAL_FREQUENCY_SEED } from "@/data/frequency-seed";
import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { Frequency, FrequencyType } from "@/types/aviation";

const FREQUENCY_SOURCE = getDataSource("faaNasr");
const FREQUENCY_SOURCE_URL = "https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/";
const NFDC_BASE_URL = "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp";

const NFDC_TYPE_MAP: Record<string, FrequencyType> = {
  UNICOM: "UNICOM", CTAF: "CTAF", ATIS: "ATIS", "D-ATIS": "ATIS",
  AWOS: "AWOS", ASOS: "AWOS", TOWER: "TWR", TWR: "TWR",
  GROUND: "GND", GND: "GND", CLEARANCE: "DEL", "CLNC DEL": "DEL",
  CD: "DEL", "APP/DEP": "APP", APPROACH: "APP", DEPARTURE: "APP"
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

  return createApiErrorResponse(
    {
      code: "AIRPORT_NOT_FOUND",
      message: `No FAA frequency data found for ${airportCode}.`,
      details: "Neither the local seed nor the FAA NFDC returned frequency data for this airport.",
      retryable: false,
      status: 404
    },
    {
      source: withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL),
      fetchedAt: toIsoNow(),
      stalenessCategory: "frequency"
    }
  );
};
