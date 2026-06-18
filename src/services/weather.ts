import { findNearestWeatherStations, toIcaoCode, findAirportReference, fetchAirportFromNfdc } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type {
  CeilingCondition,
  Metar,
  Pirep,
  SkyConditionLayer,
  SkyCoverage,
  Taf,
  TafForecastGroup,
  TafForecastGroupType,
  WeatherBundle
} from "@/types/aviation";
import { parseVisibilityMiles, toIsoTimestamp, toServiceErrorResponse } from "@/services/_shared";

const WEATHER_SOURCE = getDataSource("aviationWeather");
const WEATHER_BASE_URL = "https://aviationweather.gov/api/data";

type AviationWeatherMetarPayload = {
  icaoId?: string;
  obsTime?: number;
  reportTime?: string;
  rawOb?: string;
  wdir?: number;
  wspd?: number;
  wgst?: number;
  visib?: string | number;
  clouds?: Array<{ cover?: string; base?: number; type?: string }>;
  temp?: number;
  dewp?: number;
  altim?: number;
  fltCat?: string;
  wxString?: string;
  vertVis?: number;
};

type AviationWeatherTafPayload = {
  icaoId?: string;
  issueTime?: string;
  rawTAF?: string;
  validTimeFrom?: number;
  validTimeTo?: number;
  fcsts?: Array<{
    timeFrom?: number;
    timeTo?: number;
    fcstChange?: string | null;
    probability?: number | null;
    wdir?: number | null;
    wspd?: number | null;
    wgst?: number | null;
    visib?: string | number | null;
    wxString?: string | null;
    vertVis?: number | null;
    clouds?: Array<{ cover?: string; base?: number; type?: string | null }>;
  }>;
};

type AviationWeatherPirepPayload = {
  receiptTime?: string;
  obsTime?: number;
  icaoId?: string;
  acType?: string;
  lat?: number;
  lon?: number;
  fltLvl?: number;
  rawOb?: string;
  wxString?: string;
  clouds?: Array<{ cover?: string; base?: number; top?: number }>;
  icgBas1?: number | null;
  icgTop1?: number | null;
  icgInt1?: string | null;
  icgType1?: string | null;
  icgBas2?: number | null;
  icgTop2?: number | null;
  icgInt2?: string | null;
  icgType2?: string | null;
  tbBas1?: number | null;
  tbTop1?: number | null;
  tbInt1?: string | null;
  tbFreq1?: string | null;
  tbBas2?: number | null;
  tbTop2?: number | null;
  tbInt2?: string | null;
  tbFreq2?: string | null;
};

const normalizeSkyCoverage = (value: string | undefined | null): SkyCoverage => {
  const normalized = value?.trim().toUpperCase();

  switch (normalized) {
    case "SKC":
    case "CLR":
    case "FEW":
    case "SCT":
    case "BKN":
    case "OVC":
    case "VV":
    case "NSC":
      return normalized;
    default:
      return "NSC";
  }
};

const parseSkyConditions = (
  clouds: Array<{ cover?: string; base?: number; type?: string | null }> | undefined
): SkyConditionLayer[] =>
  (clouds ?? []).map((cloud) => ({
    coverage: normalizeSkyCoverage(cloud.cover),
    baseFeetAgl: cloud.base ?? null,
    cloudType: cloud.type ?? undefined
  }));

const parseCeiling = (
  skyConditions: SkyConditionLayer[],
  verticalVisibilityFeetAgl?: number | null
): CeilingCondition | null => {
  const ceilingCandidates = skyConditions
    .filter((layer) => layer.coverage === "BKN" || layer.coverage === "OVC")
    .map((layer) => layer.baseFeetAgl)
    .filter((value): value is number => typeof value === "number");

  if (!ceilingCandidates.length && !verticalVisibilityFeetAgl) {
    return null;
  }

  return {
    minimumBrokenOrOvercastFeetAgl: ceilingCandidates.length ? Math.min(...ceilingCandidates) : null,
    verticalVisibilityFeetAgl: verticalVisibilityFeetAgl ?? undefined
  };
};

const parseFlightCategory = (value: string | undefined): Metar["flightCategory"] => {
  switch (value) {
    case "VFR":
    case "MVFR":
    case "IFR":
    case "LIFR":
      return value;
    default:
      return "UNKNOWN";
  }
};

const parseWeatherCodes = (value: string | null | undefined): string[] =>
  value?.trim()
    ? value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    : [];

const parseAltimeterInHg = (altim: number | undefined): number | null =>
  typeof altim === "number" ? Number((altim / 33.8638866667).toFixed(2)) : null;

const parseMetar = (payload: AviationWeatherMetarPayload, sourceUrl: string, fetchedAt: string): Metar => {
  const source = { ...WEATHER_SOURCE, url: sourceUrl };
  const skyConditions = parseSkyConditions(payload.clouds);

  return {
    stationIcao: payload.icaoId ?? "UNKNOWN",
    rawText: payload.rawOb ?? "",
    observedAt: toIsoTimestamp(payload.reportTime ?? payload.obsTime, fetchedAt),
    wind:
      typeof payload.wspd === "number"
        ? {
            directionDegrees: payload.wdir ?? null,
            speedKnots: payload.wspd,
            gustKnots: payload.wgst ?? undefined,
            variableDirection: payload.wdir === undefined || payload.wdir === null
          }
        : null,
    visibility:
      payload.visib !== undefined
        ? {
            prevailingStatuteMiles: parseVisibilityMiles(payload.visib),
            rawValue: typeof payload.visib === "string" ? payload.visib : undefined
          }
        : null,
    ceiling: parseCeiling(skyConditions, payload.vertVis),
    skyConditions,
    weather: parseWeatherCodes(payload.wxString),
    temperatureC: payload.temp ?? null,
    dewpointC: payload.dewp ?? null,
    altimeterInHg: parseAltimeterInHg(payload.altim),
    flightCategory: parseFlightCategory(payload.fltCat),
    remarks: payload.rawOb?.includes(" RMK ") ? payload.rawOb.split(" RMK ")[1].split(/\s+/).filter(Boolean) : [],
    source,
    fetchedAt,
    isStale: false
  };
};

const toForecastGroupType = (change: string | null | undefined, probability: number | null | undefined): TafForecastGroupType => {
  if (change === "FM" || change === "TEMPO" || change === "BECMG") {
    return change;
  }

  if (change === "PROB") {
    return probability === 40 ? "PROB40" : "PROB30";
  }

  return "INITIAL";
};

const parseForecastGroup = (
  payload: NonNullable<AviationWeatherTafPayload["fcsts"]>[number],
  fetchedAt: string
): TafForecastGroup => {
  const skyConditions = parseSkyConditions(payload.clouds);

  return {
    groupType: toForecastGroupType(payload.fcstChange, payload.probability),
    validFrom: toIsoTimestamp(payload.timeFrom, fetchedAt),
    validTo: payload.timeTo ? toIsoTimestamp(payload.timeTo, fetchedAt) : undefined,
    wind:
      typeof payload.wspd === "number"
        ? {
            directionDegrees: payload.wdir ?? null,
            speedKnots: payload.wspd,
            gustKnots: payload.wgst ?? undefined,
            variableDirection: payload.wdir === undefined || payload.wdir === null
          }
        : null,
    visibility:
      payload.visib !== undefined && payload.visib !== null
        ? {
            prevailingStatuteMiles: parseVisibilityMiles(payload.visib),
            rawValue: typeof payload.visib === "string" ? payload.visib : undefined
          }
        : null,
    skyConditions,
    weather: parseWeatherCodes(payload.wxString),
    ceiling: parseCeiling(skyConditions, payload.vertVis)
  };
};

const parseTaf = (payload: AviationWeatherTafPayload, sourceUrl: string, fetchedAt: string): Taf => ({
  stationIcao: payload.icaoId ?? "UNKNOWN",
  rawText: payload.rawTAF ?? "",
  issuedAt: toIsoTimestamp(payload.issueTime, fetchedAt),
  validFrom: toIsoTimestamp(payload.validTimeFrom, fetchedAt),
  validTo: toIsoTimestamp(payload.validTimeTo, fetchedAt),
  forecastGroups: (payload.fcsts ?? []).map((group) => parseForecastGroup(group, fetchedAt)),
  source: { ...WEATHER_SOURCE, url: sourceUrl },
  fetchedAt,
  isStale: false
});

const parseIntensity = (value: string | null | undefined): "TRACE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME" | "UNKNOWN" => {
  switch ((value ?? "").trim().toUpperCase()) {
    case "TRC":
    case "TRACE":
      return "TRACE";
    case "LGT":
    case "LIGHT":
      return "LIGHT";
    case "MOD":
    case "MODERATE":
      return "MODERATE";
    case "SEV":
    case "SEVERE":
      return "SEVERE";
    case "EXTRM":
    case "EXTREME":
      return "EXTREME";
    default:
      return "UNKNOWN";
  }
};

const parseIcingType = (value: string | null | undefined): "RIME" | "CLEAR" | "MIXED" | "UNKNOWN" | undefined => {
  switch ((value ?? "").trim().toUpperCase()) {
    case "RIME":
      return "RIME";
    case "CLR":
    case "CLEAR":
      return "CLEAR";
    case "MXD":
    case "MIXED":
      return "MIXED";
    case "":
      return undefined;
    default:
      return "UNKNOWN";
  }
};

const parseFrequency = (value: string | null | undefined): "OCCASIONAL" | "INTERMITTENT" | "CONTINUOUS" | undefined => {
  switch ((value ?? "").trim().toUpperCase()) {
    case "OCNL":
    case "OCCASIONAL":
      return "OCCASIONAL";
    case "INT":
    case "INTERMITTENT":
      return "INTERMITTENT";
    case "CONS":
    case "CONTINUOUS":
      return "CONTINUOUS";
    default:
      return undefined;
  }
};

const parsePirep = (payload: AviationWeatherPirepPayload, sourceUrl: string, fetchedAt: string): Pirep => {
  const icing = [
    payload.icgInt1
      ? {
          intensity: parseIntensity(payload.icgInt1),
          type: parseIcingType(payload.icgType1),
          baseFeetMsl: payload.icgBas1 ?? undefined,
          topFeetMsl: payload.icgTop1 ?? undefined
        }
      : null,
    payload.icgInt2
      ? {
          intensity: parseIntensity(payload.icgInt2),
          type: parseIcingType(payload.icgType2),
          baseFeetMsl: payload.icgBas2 ?? undefined,
          topFeetMsl: payload.icgTop2 ?? undefined
        }
      : null
  ].filter((value): value is NonNullable<typeof value> => value !== null && value.intensity !== "UNKNOWN");

  const turbulence = [
    payload.tbInt1 && payload.tbInt1 !== "NEG"
      ? {
          intensity: parseIntensity(payload.tbInt1) as "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME" | "UNKNOWN",
          frequency: parseFrequency(payload.tbFreq1),
          baseFeetMsl: payload.tbBas1 ?? undefined,
          topFeetMsl: payload.tbTop1 ?? undefined
        }
      : null,
    payload.tbInt2 && payload.tbInt2 !== "NEG"
      ? {
          intensity: parseIntensity(payload.tbInt2) as "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME" | "UNKNOWN",
          frequency: parseFrequency(payload.tbFreq2),
          baseFeetMsl: payload.tbBas2 ?? undefined,
          topFeetMsl: payload.tbTop2 ?? undefined
        }
      : null
  ].filter((value): value is NonNullable<typeof value> => value !== null && value.intensity !== "UNKNOWN");

  return {
    reportId: payload.rawOb?.match(/^\w+\s+(UA|UUA)\s+\/?/)?.[0]?.trim(),
    type: payload.rawOb?.includes(" UUA ") ? "UUA" : "UA",
    rawText: payload.rawOb ?? "",
    issuedAt: toIsoTimestamp(payload.receiptTime ?? payload.obsTime, fetchedAt),
    aircraftType: payload.acType ?? undefined,
    stationIcao: payload.icaoId ?? undefined,
    location: {
      description: payload.rawOb ?? payload.icaoId ?? "Unknown location",
      point:
        typeof payload.lat === "number" && typeof payload.lon === "number"
          ? {
              latitude: payload.lat,
              longitude: payload.lon
            }
          : undefined
    },
    altitudeFeetMsl: typeof payload.fltLvl === "number" ? payload.fltLvl * 100 : null,
    icing,
    turbulence,
    skyConditions: (payload.clouds ?? []).map((cloud) => ({
      coverage: normalizeSkyCoverage(cloud.cover),
      baseFeetMsl: cloud.base ?? undefined,
      topFeetMsl: cloud.top ?? undefined
    })),
    weather: parseWeatherCodes(payload.wxString),
    remarks: payload.rawOb ?? undefined,
    source: { ...WEATHER_SOURCE, url: sourceUrl },
    fetchedAt,
    isStale: false
  };
};

type WeatherRequestOptions = {
  bypassCache?: boolean;
};

export const getMetar = async (station: string, options: WeatherRequestOptions = {}): Promise<ApiResponse<Metar>> => {
  const normalizedStation = toIcaoCode(station);

  try {
    const result = await fetchWithRetry<AviationWeatherMetarPayload[]>(`${WEATHER_BASE_URL}/metar`, {
      source: WEATHER_SOURCE,
      query: { ids: normalizedStation, format: "json" },
      ttlMs: getCacheTtlMs("metar"),
      cacheNamespace: "weather-metar",
      cacheKey: createCacheKey("weather-metar", { station: normalizedStation }),
      bypassCache: options.bypassCache
    });

    const payload = result.data[0];
    if (!payload) {
      return createApiErrorResponse(
        {
          code: "METAR_NOT_FOUND",
          message: `No METAR was returned for ${normalizedStation}.`,
          details: "The Aviation Weather Center returned an empty result set for this station.",
          retryable: false,
          status: 404
        },
        {
          source: result.source,
          fetchedAt: result.fetchedAt,
          stalenessCategory: "metar",
          cache: result.cache
        }
      );
    }

    return createApiResponse(parseMetar(payload, result.url, result.fetchedAt), result.source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "metar",
      cache: result.cache
    });
  } catch (error) {
    return toServiceErrorResponse(error, WEATHER_SOURCE, "metar");
  }
};

export const getTaf = async (station: string, options: WeatherRequestOptions = {}): Promise<ApiResponse<Taf>> => {
  const normalizedStation = toIcaoCode(station);

  try {
    const result = await fetchWithRetry<AviationWeatherTafPayload[]>(`${WEATHER_BASE_URL}/taf`, {
      source: WEATHER_SOURCE,
      query: { ids: normalizedStation, format: "json" },
      ttlMs: getCacheTtlMs("taf"),
      cacheNamespace: "weather-taf",
      cacheKey: createCacheKey("weather-taf", { station: normalizedStation }),
      bypassCache: options.bypassCache
    });

    const payload = result.data[0];
    if (!payload) {
      return createApiErrorResponse(
        {
          code: "TAF_NOT_FOUND",
          message: `No TAF was returned for ${normalizedStation}.`,
          details: "The Aviation Weather Center returned an empty forecast result set for this station.",
          retryable: false,
          status: 404
        },
        {
          source: result.source,
          fetchedAt: result.fetchedAt,
          stalenessCategory: "taf",
          cache: result.cache
        }
      );
    }

    return createApiResponse(parseTaf(payload, result.url, result.fetchedAt), result.source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "taf",
      cache: result.cache
    });
  } catch (error) {
    return toServiceErrorResponse(error, WEATHER_SOURCE, "taf");
  }
};

export const getPireps = async (params: {
  station?: string;
  distance?: number;
  bypassCache?: boolean;
}): Promise<ApiResponse<Pirep[]>> => {
  const normalizedStation = params.station ? toIcaoCode(params.station) : undefined;
  const distance = params.distance ?? 75;

  if (!normalizedStation) {
    return createApiErrorResponse(
      {
        code: "MISSING_REQUIRED_PARAMETER",
        message: "A station is required to scope PIREPs.",
        details: "Provide a station query parameter so the PIREP search can stay geographically constrained.",
        retryable: false,
        status: 400
      },
      {
        source: WEATHER_SOURCE,
        fetchedAt: toIsoNow(),
        stalenessCategory: "pirep"
      }
    );
  }

  try {
    const result = await fetchWithRetry<AviationWeatherPirepPayload[]>(`${WEATHER_BASE_URL}/pirep`, {
      source: WEATHER_SOURCE,
      query: { id: normalizedStation, distance, format: "json" },
      ttlMs: getCacheTtlMs("pirep"),
      cacheNamespace: "weather-pirep",
      cacheKey: createCacheKey("weather-pirep", { station: normalizedStation, distance }),
      bypassCache: params.bypassCache
    });

    return createApiResponse(
      result.data.map((item) => parsePirep(item, result.url, result.fetchedAt)),
      result.source,
      {
        fetchedAt: result.fetchedAt,
        stalenessCategory: "pirep",
        cache: result.cache
      }
    );
  } catch (error) {
    return toServiceErrorResponse(error, WEATHER_SOURCE, "pirep");
  }
};

export const getWeather = async (station: string, options: WeatherRequestOptions = {}): Promise<ApiResponse<WeatherBundle>> => {
  const normalizedStation = toIcaoCode(station);
  const [metarResponse, tafResponse, pirepResponse] = await Promise.all([
    getMetar(normalizedStation, options),
    getTaf(normalizedStation, options),
    getPireps({ station: normalizedStation, distance: 75, bypassCache: options.bypassCache })
  ]);

  // If no METAR found, try nearest weather-reporting stations
  let effectiveMetar = metarResponse;
  let nearestStationNote: string | undefined;
  if (!metarResponse.ok) {
    // Ensure we have coordinates — try dynamic NFDC lookup if not in static DB
    if (!findAirportReference(station)) {
      await fetchAirportFromNfdc(station);
    }
    const nearbyStations = findNearestWeatherStations(station, 3);
    for (const candidate of nearbyStations) {
      if (candidate.distanceNm === 0) continue;
      const fallback = await getMetar(candidate.icao, options);
      if (fallback.ok) {
        effectiveMetar = fallback;
        nearestStationNote = `No weather station at ${normalizedStation}. Showing nearest: ${candidate.icao} (${candidate.name}, ${Math.round(candidate.distanceNm)}nm away)`;
        break;
      }
    }
  }

  if (!effectiveMetar.ok && !tafResponse.ok && !pirepResponse.ok) {
    return createApiErrorResponse(
      !metarResponse.ok ? metarResponse.error : { code: "NO_DATA", message: "No weather data available" },
      { source: metarResponse.source, fetchedAt: toIsoNow() }
    );
  }

  const fetchedAt = toIsoNow();
  const primarySource = effectiveMetar.ok ? effectiveMetar.source : tafResponse.ok ? tafResponse.source : pirepResponse.source;
  const supportingSources = [tafResponse, pirepResponse]
    .filter((response) => response.ok)
    .map((response) => response.source)
    .filter((source, index, all) => all.findIndex((candidate) => candidate.url === source.url) === index);
  const cache = effectiveMetar.cache ?? tafResponse.cache ?? pirepResponse.cache;

  const bundle: WeatherBundle = {
    stationIcao: effectiveMetar.ok && effectiveMetar.data.stationIcao !== normalizedStation
      ? effectiveMetar.data.stationIcao
      : normalizedStation,
    metar: effectiveMetar.ok ? effectiveMetar.data : null,
    taf: tafResponse.ok ? tafResponse.data : null,
    pireps: pirepResponse.ok ? pirepResponse.data : [],
    source: primarySource,
    fetchedAt,
    isStale: false,
    nearestStationNote
  };

  return createApiResponse(bundle, primarySource, {
    fetchedAt,
    stalenessCategory: "metar",
    supportingSources,
    cache
  });
};
