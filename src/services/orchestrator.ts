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
import { getAirportRunways, inferRunwaysFromPlates, type AirportRunways } from "@/services/runway-info";
import { getTraffic } from "@/services/traffic";
import { getMetar, getPireps, getTaf, getWeather } from "@/services/weather";
import type { ApiResponse, DataSource } from "@/types/api";
import type { ApproachPlate, Frequency, TrafficTarget, WeatherBundle } from "@/types/aviation";
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
  sids?: ApiResponse<ApproachPlate[]>;
  stars?: ApiResponse<ApproachPlate[]>;
  odps?: ApiResponse<ApproachPlate[]>;
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

const isGroundTrafficTarget = (target: TrafficTarget): boolean =>
  target.onGround ||
  (typeof target.groundspeedKnots === "number" &&
    target.groundspeedKnots < 30 &&
    typeof target.altitudeFeet === "number" &&
    target.altitudeFeet < 100);

const filterTrafficTargets = (
  targets: TrafficTarget[],
  altitudeRange?: [number, number]
): TrafficTarget[] =>
  targets.filter((target) => {
    if (isGroundTrafficTarget(target)) {
      return false;
    }

    if (!altitudeRange || target.altitudeFeet === null) {
      return true;
    }

    return target.altitudeFeet >= altitudeRange[0] && target.altitudeFeet <= altitudeRange[1];
  });

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
  const fetchHours = true; // Always include tower hours in facility overview
  const [weather, frequencies, plates, diagram, hours, runwayDetails, sids, stars, odps] = await Promise.all([
    getWeather(intent.airport, { bypassCache: options.bypassCache }),
    getFrequencies(intent.airport),
    getPlates({ airport: intent.airport }),
    getAirportDiagram(intent.airport),
    fetchHours ? getAirportHours(intent.airport) : Promise.resolve(undefined),
    getAirportRunways(intent.airport),
    getSids(intent.airport),
    getStars(intent.airport),
    getOdps(intent.airport)
  ]);

  // Build runway designator list: prefer live FAA data, fall back to plates inference, then static
  const airportReference = findAirportReference(intent.airport) ?? await fetchAirportFromNfdc(intent.airport);
  const platesData = plates.ok ? plates.data : [];
  const runways = runwayDetails.ok && runwayDetails.data.runways.length > 0
    ? runwayDetails.data.runways.map((r) => r.designator)
    : airportReference?.runways && airportReference.runways.length > 0
      ? airportReference.runways
      : inferRunwaysFromPlates(platesData).map((r) => r.designator);

  // Enrich runwayDetails with plate-inferred data if NFDC returned empty
  if (runwayDetails.ok && runwayDetails.data.runways.length === 0 && platesData.length > 0) {
    const inferred = inferRunwaysFromPlates(platesData);
    if (inferred.length > 0) {
      runwayDetails.data.runways = inferred;
      runwayDetails.data.source = "Inferred from approach plates";
    }
  }

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
      sids: sids as ApiResponse<ApproachPlate[]>,
      stars: stars as ApiResponse<ApproachPlate[]>,
      odps: odps as ApiResponse<ApproachPlate[]>,
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
        airport: intent.airport
      });
    case "traffic": {
      const trafficResponse = await getTraffic({
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
      if (!trafficResponse.ok) {
        return trafficResponse;
      }

      return {
        ...trafficResponse,
        data: filterTrafficTargets(trafficResponse.data, intent.altitude_range)
      };
    }
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
