import { getFacilityById } from "@/data/facilities";
import { getDataSource } from "@/data/sources";
import { findAirportReference, fetchAirportFromNfdc } from "@/data/airports";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import { getAirportHours, type AirportHours } from "@/services/airport-hours";
import { getFrequencies } from "@/services/frequencies";
import { getNavigationBetween } from "@/services/navigation";
import { getNotams } from "@/services/notams";
import { getAirportDiagram, getOdps, getPlates, getSids, getStars } from "@/services/plates";
import { searchFars } from "@/services/regulatory";
import { getAirportRunways, type AirportRunways } from "@/services/runway-info";
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
  airportName?: string;
  airportCity?: string;
  airportState?: string;
  runways: string[];
  runwayDetails?: ApiResponse<AirportRunways>;
  weather: ApiResponse<WeatherBundle>;
  frequencies: ApiResponse<Frequency[]>;
  plates: ApiResponse<ApproachPlate[]>;
  diagram?: ApiResponse<ApproachPlate | null>;
  hours?: ApiResponse<AirportHours>;
}

export interface QueryResult {
  intent: ParsedIntent;
  response: ApiResponse<unknown>;
  executionTimeMs: number;
  timestamp: string;
}

interface ExecuteQueryOptions {
  bypassCache?: boolean;
  facilityId?: string;
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
  const fetchHours = intent.detail === "hours" || intent.detail === "all" || !intent.detail;
  const [weather, frequencies, plates, diagram, hours, runwayDetails] = await Promise.all([
    getWeather(intent.airport, { bypassCache: options.bypassCache }),
    getFrequencies(intent.airport),
    getPlates({ airport: intent.airport }),
    getAirportDiagram(intent.airport),
    fetchHours ? getAirportHours(intent.airport) : Promise.resolve(undefined),
    getAirportRunways(intent.airport)
  ]);

  // Build runway designator list: prefer live FAA data, fall back to static
  const airportReference = findAirportReference(intent.airport) ?? await fetchAirportFromNfdc(intent.airport);
  const runways = runwayDetails.ok && runwayDetails.data.runways.length > 0
    ? runwayDetails.data.runways.map((r) => r.designator)
    : airportReference?.runways ?? [];

  if (!weather.ok && !frequencies.ok && !plates.ok && !runways.length && !diagram?.ok && !hours?.ok && !runwayDetails.ok) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_INFO_UNAVAILABLE",
        message: `Airport information is unavailable for ${intent.airport}.`,
        details: [weather, frequencies, plates, diagram, hours, runwayDetails]
          .filter((response): response is Exclude<typeof response, undefined> => Boolean(response))
          .filter((response): response is Exclude<typeof response, { ok: true }> => !response.ok)
          .map((response) => response.error.message)
          .join(" | "),
        retryable: [weather, frequencies, plates, diagram, hours, runwayDetails]
          .filter((response): response is Exclude<typeof response, undefined> => Boolean(response))
          .filter((response): response is Exclude<typeof response, { ok: true }> => !response.ok)
          .some((response) => response.error.retryable),
        status: 503
      },
      {
        source: ORCHESTRATOR_SOURCE,
        fetchedAt: toIsoNow(),
        supportingSources: dedupeSources([weather.source, frequencies.source, plates.source, diagram?.source, hours?.source, runwayDetails.source].filter(isDataSource))
      }
    );
  }

  return createApiResponse(
    {
      airport: intent.airport,
      airportName: airportReference?.name,
      airportCity: airportReference?.city,
      airportState: airportReference?.state,
      runways,
      runwayDetails,
      weather,
      frequencies,
      plates,
      diagram,
      hours
    },
    ORCHESTRATOR_SOURCE,
    {
      fetchedAt: toIsoNow(),
      supportingSources: dedupeSources(
        [weather, frequencies, plates, diagram, hours, runwayDetails]
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

      if (intent.procedure_type === "ODP") {
        return getOdps(intent.airport);
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
    case "navigation": {
      const selectedFacility = options.facilityId ? getFacilityById(options.facilityId) : null;
      const fromAirport = intent.from ?? selectedFacility?.primaryAirport;

      if (!fromAirport) {
        return createApiErrorResponse(
          {
            code: "NAVIGATION_FROM_REQUIRED",
            message: "Navigation queries need an origin airport or a selected facility with a primary airport.",
            retryable: false,
            status: 400
          },
          {
            source: ORCHESTRATOR_SOURCE,
            fetchedAt: toIsoNow()
          }
        );
      }

      const navigation = getNavigationBetween(fromAirport, intent.to, intent.speed_knots);

      if (!navigation) {
        return createApiErrorResponse(
          {
            code: "NAVIGATION_LOOKUP_FAILED",
            message: `Unable to resolve navigation coordinates for ${fromAirport} to ${intent.to}.`,
            retryable: false,
            status: 404
          },
          {
            source: ORCHESTRATOR_SOURCE,
            fetchedAt: toIsoNow()
          }
        );
      }

      return createApiResponse(navigation, getDataSource("faaNasr"), {
        fetchedAt: toIsoNow(),
        supportingSources: [ORCHESTRATOR_SOURCE]
      });
    }
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
    case "facility_info": {
      const facilityId = intent.facility ?? options.facilityId;
      if (!facilityId) {
        return createApiErrorResponse(
          { code: "FACILITY_REQUIRED", message: "Please specify a facility or select one from the facility picker.", retryable: false, status: 400 },
          { source: ORCHESTRATOR_SOURCE, fetchedAt: toIsoNow() }
        );
      }
      try {
        if (intent.query_type === "airports") {
          const { getFacilityById, getFacilityAirports } = await import("@/data/facilities");
          const { findApproachFacilityByAirport } = await import("@/data/approach-facilities");
          const facility = getFacilityById(facilityId);
          const approachFacility = !facility ? findApproachFacilityByAirport(facilityId) : null;
          const airports = getFacilityAirports(facilityId);
          const resolvedName = facility?.name ?? approachFacility?.name ?? facilityId;
          const resolvedType = facility?.type ?? (approachFacility ? "approach" : "approach");
          return createApiResponse(
            { facility: { id: facility?.id ?? facilityId, name: resolvedName, type: resolvedType }, airports, query_type: "airports" as const },
            ORCHESTRATOR_SOURCE,
            { fetchedAt: toIsoNow() }
          );
        }
        const { getAdjacentFacilities } = await import("@/data/facility-adjacency");
        const result = getAdjacentFacilities(facilityId);
        return createApiResponse(result, ORCHESTRATOR_SOURCE, { fetchedAt: toIsoNow() });
      } catch {
        return createApiErrorResponse(
          { code: "FACILITY_LOOKUP_FAILED", message: `Unable to find facility information for ${facilityId}.`, retryable: false, status: 404 },
          { source: ORCHESTRATOR_SOURCE, fetchedAt: toIsoNow() }
        );
      }
    }
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
