import { findAirportReference } from "@/data/airports";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import { getFrequencies } from "@/services/frequencies";
import { getNotams } from "@/services/notams";
import { getAirportDiagram, getPlates, getSids, getStars } from "@/services/plates";
import { searchFars } from "@/services/regulatory";
import { getTraffic } from "@/services/traffic";
import { getMetar, getPireps, getTaf, getWeather } from "@/services/weather";
import type { ApiResponse, DataSource } from "@/types/api";
import type { ApproachPlate, Frequency, WeatherBundle } from "@/types/aviation";
import type { ParsedIntent } from "@/types/intents";

const ORCHESTRATOR_SOURCE: DataSource = {
  id: "internal-query-orchestrator",
  name: "Internal Query Orchestrator",
  url: "internal://query-orchestrator",
  reliability: "high",
  refresh_interval: "on-demand"
};

export interface AirportInfoQueryPayload {
  airport: string;
  runways: string[];
  weather: ApiResponse<WeatherBundle>;
  frequencies: ApiResponse<Frequency[]>;
  plates: ApiResponse<ApproachPlate[]>;
  diagram?: ApiResponse<ApproachPlate | null>;
}

export interface QueryResult {
  intent: ParsedIntent;
  response: ApiResponse<unknown>;
  executionTimeMs: number;
  timestamp: string;
}

interface ExecuteQueryOptions {
  bypassCache?: boolean;
}

const dedupeSources = (sources: DataSource[]): DataSource[] => {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.id}:${source.url}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const isDataSource = (source: DataSource | undefined): source is DataSource => Boolean(source);

const getClarificationResponse = (intent: ParsedIntent): ApiResponse<never> =>
  createApiErrorResponse(
    {
      code: "CLARIFICATION_REQUIRED",
      message: intent.clarificationPrompt ?? "Clarify the aviation request before dispatching data services.",
      details: intent.rawInput ? `Original input: ${intent.rawInput}` : undefined,
      retryable: false,
      status: 400
    },
    {
      source: intent.source,
      fetchedAt: intent.parsedAt
    }
  );

const executeAirportInfo = async (
  intent: Extract<ParsedIntent, { type: "airport_info" }>,
  options: ExecuteQueryOptions = {}
): Promise<ApiResponse<AirportInfoQueryPayload>> => {
  const airportReference = findAirportReference(intent.airport);
  const runways = airportReference?.runways ?? [];
  const [weather, frequencies, plates, diagram] = await Promise.all([
    getWeather(intent.airport, { bypassCache: options.bypassCache }),
    getFrequencies(intent.airport),
    getPlates({ airport: intent.airport }),
    intent.detail === "runways" ? getAirportDiagram(intent.airport) : Promise.resolve(undefined)
  ]);

  if (!weather.ok && !frequencies.ok && !plates.ok && !runways.length && !diagram?.ok) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_INFO_UNAVAILABLE",
        message: `Airport information is unavailable for ${intent.airport}.`,
        details: [weather, frequencies, plates, diagram]
          .filter((response): response is Exclude<typeof response, undefined> => Boolean(response))
          .filter((response): response is Exclude<typeof response, { ok: true }> => !response.ok)
          .map((response) => response.error.message)
          .join(" | "),
        retryable: [weather, frequencies, plates, diagram]
          .filter((response): response is Exclude<typeof response, undefined> => Boolean(response))
          .filter((response): response is Exclude<typeof response, { ok: true }> => !response.ok)
          .some((response) => response.error.retryable),
        status: 503
      },
      {
        source: ORCHESTRATOR_SOURCE,
        fetchedAt: toIsoNow(),
        supportingSources: dedupeSources([weather.source, frequencies.source, plates.source, diagram?.source].filter(isDataSource))
      }
    );
  }

  return createApiResponse(
    {
      airport: intent.airport,
      runways,
      weather,
      frequencies,
      plates,
      diagram
    },
    ORCHESTRATOR_SOURCE,
    {
      fetchedAt: toIsoNow(),
      supportingSources: dedupeSources(
        [weather, frequencies, plates, diagram]
          .filter((response): response is Exclude<typeof response, undefined> => Boolean(response))
          .filter((response) => response.ok)
          .map((response) => response.source)
      )
    }
  );
};

const dispatchIntent = async (intent: ParsedIntent, options: ExecuteQueryOptions = {}): Promise<ApiResponse<unknown>> => {
  if (intent.requiresClarification || intent.type === "unknown") {
    return getClarificationResponse(intent);
  }

  switch (intent.type) {
    case "weather":
      switch (intent.subtype) {
        case "metar":
          return getMetar(intent.airport, { bypassCache: options.bypassCache });
        case "taf":
          return getTaf(intent.airport, { bypassCache: options.bypassCache });
        case "pirep":
          return getPireps({ station: intent.airport, distance: intent.radius ?? 75, bypassCache: options.bypassCache });
        case "all":
          return getWeather(intent.airport, { bypassCache: options.bypassCache });
      }
    case "plates":
      if (intent.procedure_type === "SID") {
        return getSids(intent.airport);
      }

      if (intent.procedure_type === "STAR") {
        return getStars(intent.airport);
      }

      return getPlates({
        airport: intent.airport,
        type: intent.procedure_type
      });
    case "traffic":
      return getTraffic({
        airport: intent.airport,
        bounds: intent.bounds
          ? {
              minLat: intent.bounds.south,
              minLon: intent.bounds.west,
              maxLat: intent.bounds.north,
              maxLon: intent.bounds.east
            }
          : undefined,
        bypassCache: options.bypassCache
      });
    case "frequency":
      return getFrequencies(intent.facility, intent.freq_type);
    case "notam":
      return getNotams({
        airport: intent.airport,
        type_filter: intent.type_filter
      });
    case "regulatory":
      return searchFars(intent.query, intent.part);
    case "airport_info":
      return executeAirportInfo(intent, options);
  }
};

export const executeQuery = async (intent: ParsedIntent, options: ExecuteQueryOptions = {}): Promise<QueryResult> => {
  const start = performance.now();
  const response = await dispatchIntent(intent, options);
  const executionTimeMs = Number((performance.now() - start).toFixed(2));

  return {
    intent,
    response,
    executionTimeMs,
    timestamp: toIsoNow()
  };
};
