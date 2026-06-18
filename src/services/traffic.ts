import { findAirportReference, toBoundingBox, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { TrafficTarget } from "@/types/aviation";
import { metersPerSecondToFpm, metersPerSecondToKnots, metersToFeet, toServiceErrorResponse } from "@/services/_shared";

const TRAFFIC_SOURCE = getDataSource("openSkyNetwork");
const OPEN_SKY_URL = "https://opensky-network.org/api/states/all";

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

const resolveBoundingBox = (params: { airport?: string; bounds?: BoundingBox }): BoundingBox | null => {
  if (params.bounds) {
    return params.bounds;
  }

  if (!params.airport) {
    return null;
  }

  const airport = findAirportReference(params.airport);
  return airport ? toBoundingBox(airport.latitude, airport.longitude, 35) : null;
};

export const getTraffic = async (params: {
  airport?: string;
  bounds?: BoundingBox;
}): Promise<ApiResponse<TrafficTarget[]>> => {
  const bounds = resolveBoundingBox(params);

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
        source: TRAFFIC_SOURCE,
        fetchedAt: toIsoNow(),
        stalenessCategory: "trafficTarget"
      }
    );
  }

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
      })
    });

    const source = result.source;
    const traffic = (result.data.states ?? []).map(
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
        fetchedAt: result.fetchedAt,
        isStale: false
      })
    );

    return createApiResponse(traffic, source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "trafficTarget",
      cache: result.cache
    });
  } catch (error) {
    return toServiceErrorResponse(error, TRAFFIC_SOURCE, "trafficTarget");
  }
};
