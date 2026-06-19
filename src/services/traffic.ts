import { fetchAirportFromNfdc, findAirportReference, toBoundingBox, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { FetcherError, fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { TrafficTarget } from "@/types/aviation";
import { metersPerSecondToFpm, metersPerSecondToKnots, metersToFeet } from "@/services/_shared";

const TRAFFIC_SOURCE = getDataSource("openSkyNetwork");
const TRAFFIC_FALLBACK_SOURCE = getDataSource("adsbFi");
const OPEN_SKY_URL = "https://opensky-network.org/api/states/all";
const ADSB_FI_URL = "https://opendata.adsb.fi/api/v2";
const TRAFFIC_RADIUS_NM = 15;

interface BoundingBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

type OpenSkyResponse = {
  time?: number;
  states?: Array<
    [
      string,
      string | null,
      string | null,
      number | null,
      number | null,
      number | null,
      number | null,
      number | null,
      boolean,
      number | null,
      number | null,
      number | null,
      unknown,
      number | null,
      string | null,
      boolean,
      number | null
    ]
  >;
};

type AdsbFiAircraft = {
  hex?: string;
  flight?: string | null;
  lat?: number | null;
  lon?: number | null;
  alt_baro?: number | string | null;
  gs?: number | null;
  track?: number | null;
  baro_rate?: number | null;
  alt_geom?: number | null;
};

type AdsbFiResponse = {
  ac?: AdsbFiAircraft[];
  aircraft?: AdsbFiAircraft[];
};

const resolveBoundingBox = async (params: { airport?: string; bounds?: BoundingBox }): Promise<BoundingBox | null> => {
  if (params.bounds) {
    return params.bounds;
  }

  if (!params.airport) {
    return null;
  }

  const airport = findAirportReference(params.airport) ?? (await fetchAirportFromNfdc(params.airport));
  return airport ? toBoundingBox(airport.latitude, airport.longitude, TRAFFIC_RADIUS_NM) : null;
};

const mapOpenSkyTraffic = (response: OpenSkyResponse, fetchedAt: string, source: typeof TRAFFIC_SOURCE): TrafficTarget[] =>
  (response.states ?? []).map(
    (state): TrafficTarget => ({
      icao24: state[0],
      callsign: state[1]?.trim() || null,
      position:
        typeof state[6] === "number" && typeof state[5] === "number"
          ? {
              latitude: state[6],
              longitude: state[5]
            }
          : null,
      altitudeFeet: metersToFeet(state[13] ?? state[7]),
      groundspeedKnots: metersPerSecondToKnots(state[9]),
      trackDegrees: typeof state[10] === "number" ? Math.round(state[10]) : null,
      verticalRateFpm: metersPerSecondToFpm(state[11]),
      onGround: Boolean(state[8]),
      source,
      fetchedAt,
      isStale: false
    })
  );

const resolveAdsbFiAircraft = (payload: AdsbFiResponse): AdsbFiAircraft[] => payload.ac ?? payload.aircraft ?? [];

const parseAdsbFiAltitudeFeet = (value: AdsbFiAircraft["alt_baro"]): number | null => {
  if (typeof value === "number") {
    return Math.round(value);
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "ground") {
      return 0;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
  }

  return null;
};

const mapAdsbFiTraffic = (response: AdsbFiResponse, fetchedAt: string, source: typeof TRAFFIC_FALLBACK_SOURCE): TrafficTarget[] =>
  resolveAdsbFiAircraft(response).map(
    (aircraft): TrafficTarget => {
      const altitudeFeet = parseAdsbFiAltitudeFeet(aircraft.alt_baro);
      const onGround =
        aircraft.alt_baro === "ground" || (typeof altitudeFeet === "number" ? altitudeFeet <= 0 : false);

      return {
        icao24: aircraft.hex ?? "unknown",
        callsign: aircraft.flight?.trim() || null,
        position:
          typeof aircraft.lat === "number" && typeof aircraft.lon === "number"
            ? {
                latitude: aircraft.lat,
                longitude: aircraft.lon
              }
            : null,
        altitudeFeet,
        groundspeedKnots: typeof aircraft.gs === "number" ? Math.round(aircraft.gs) : null,
        trackDegrees: typeof aircraft.track === "number" ? Math.round(aircraft.track) : null,
        verticalRateFpm: typeof aircraft.baro_rate === "number" ? Math.round(aircraft.baro_rate) : null,
        onGround,
        source,
        fetchedAt,
        isStale: false
      };
    }
  );

const formatTrafficError = (sourceName: string, error: unknown): string => {
  if (error instanceof FetcherError) {
    return `${sourceName}: ${error.message}${error.options.details ? ` ${error.options.details}` : ""}`;
  }

  return `${sourceName}: ${error instanceof Error ? error.message : String(error)}`;
};

export const getTraffic = async (params: {
  airport?: string;
  bounds?: BoundingBox;
  bypassCache?: boolean;
}): Promise<ApiResponse<TrafficTarget[]>> => {
  const bounds = await resolveBoundingBox(params);

  if (!bounds) {
    return createApiErrorResponse(
      {
        code: "MISSING_REQUIRED_PARAMETER",
        message: "Traffic requests require an airport or explicit bounding box.",
        details: "Provide airport=KJFK or bounds=minLat,minLon,maxLat,maxLon.",
        retryable: false,
        status: 400
      },
      {
        source: TRAFFIC_FALLBACK_SOURCE,
        fetchedAt: toIsoNow(),
        stalenessCategory: "trafficTarget"
      }
    );
  }

  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;

  // ADSB.fi is primary — free, fast, no auth required
  try {
    const result = await fetchWithRetry<AdsbFiResponse>(`${ADSB_FI_URL}/lat/${centerLat.toFixed(4)}/lon/${centerLon.toFixed(4)}/dist/${TRAFFIC_RADIUS_NM}`, {
      source: TRAFFIC_FALLBACK_SOURCE,
      ttlMs: getCacheTtlMs("trafficTarget"),
      cacheNamespace: "traffic-search",
      cacheKey: createCacheKey("traffic-search", {
        airport: params.airport ? toIcaoCode(params.airport) : null,
        bounds,
        provider: "adsb-fi"
      }),
      bypassCache: params.bypassCache
    });

    return createApiResponse(mapAdsbFiTraffic(result.data, result.fetchedAt, result.source), result.source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "trafficTarget",
      cache: result.cache
    });
  } catch (adsbError) {
    // Fall back to OpenSky if ADSB.fi fails and credentials are configured
    const authHeader =
      process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD
        ? {
            Authorization: `Basic ${Buffer.from(`${process.env.OPENSKY_USERNAME}:${process.env.OPENSKY_PASSWORD}`).toString("base64")}`
          }
        : undefined;

    try {
      const result = await fetchWithRetry<OpenSkyResponse>(OPEN_SKY_URL, {
        source: TRAFFIC_SOURCE,
        headers: authHeader,
        query: {
          lamin: bounds.minLat.toFixed(4),
          lomin: bounds.minLon.toFixed(4),
          lamax: bounds.maxLat.toFixed(4),
          lomax: bounds.maxLon.toFixed(4)
        },
        ttlMs: getCacheTtlMs("trafficTarget"),
        cacheNamespace: "traffic-search",
        cacheKey: createCacheKey("traffic-search", {
          airport: params.airport ? toIcaoCode(params.airport) : null,
          bounds
        }),
        bypassCache: params.bypassCache
      });

      return createApiResponse(mapOpenSkyTraffic(result.data, result.fetchedAt, result.source), result.source, {
        fetchedAt: result.fetchedAt,
        stalenessCategory: "trafficTarget",
        cache: result.cache,
        supportingSources: [TRAFFIC_FALLBACK_SOURCE]
      });
    } catch (openSkyError) {
      return createApiErrorResponse(
        {
          code: "UPSTREAM_UNAVAILABLE",
          message: "ADSB.fi and OpenSky Network are currently unavailable for traffic data.",
          details: `${formatTrafficError("ADSB.fi", adsbError)} | ${formatTrafficError("OpenSky", openSkyError)}`,
          retryable: true,
          status: 503
        },
        {
          source: TRAFFIC_FALLBACK_SOURCE,
          fetchedAt: toIsoNow(),
          stalenessCategory: "trafficTarget",
          supportingSources: [TRAFFIC_SOURCE]
        }
      );
    }
  }
};
