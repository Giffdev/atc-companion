import {
  createInvalidParamResponse,
  getResponseStatus,
  jsonWithStandardHeaders,
  readBooleanSearchParam,
  readOptionalSearchParam
} from "@/app/api/route-utils";
import { getDataSource } from "@/data/sources";
import { appCache } from "@/lib/cache";
import { getTraffic } from "@/services/traffic";

export async function GET(request: Request) {
  const airportCode = readOptionalSearchParam(request, "airport");
  const bounds = readOptionalSearchParam(request, "bounds");
  const refresh = readBooleanSearchParam(request, "refresh");
  const source = getDataSource("openSkyNetwork");

  if (!airportCode && !bounds) {
    return createInvalidParamResponse("airport", "Provide airport=KJFK or bounds=minLat,minLon,maxLat,maxLon.", source);
  }

  if (airportCode && !/^[A-Za-z0-9]{3,4}$/.test(airportCode)) {
    return createInvalidParamResponse("airport", "Use a valid FAA or ICAO airport identifier.", source);
  }

  let parsedBounds:
    | {
        minLat: number;
        minLon: number;
        maxLat: number;
        maxLon: number;
      }
    | undefined;

  if (bounds) {
    const parts = bounds.split(",").map((value) => Number.parseFloat(value.trim()));
    if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
      return createInvalidParamResponse("bounds", "Use four comma-separated numbers: minLat,minLon,maxLat,maxLon.", source);
    }

    parsedBounds = {
      minLat: parts[0],
      minLon: parts[1],
      maxLat: parts[2],
      maxLon: parts[3]
    };
  }

  if (refresh) {
    appCache.invalidateByPrefix("traffic-search:");
  }

  const response = await getTraffic({ airport: airportCode?.toUpperCase(), bounds: parsedBounds });
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
