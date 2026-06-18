import {
  createInvalidParamResponse,
  createMissingParamResponse,
  getResponseStatus,
  jsonWithStandardHeaders,
  readBooleanSearchParam,
  readRequiredSearchParam
} from "@/app/api/route-utils";
import { getDataSource } from "@/data/sources";
import { appCache } from "@/lib/cache";
import { getWeather } from "@/services/weather";

export async function GET(request: Request) {
  const station = readRequiredSearchParam(request, "station");
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!station) {
    return createMissingParamResponse("station", getDataSource("aviationWeather"));
  }

  if (!/^[A-Za-z0-9]{3,4}$/.test(station)) {
    return createInvalidParamResponse("station", "Use a 3- or 4-character airport/station identifier.", getDataSource("aviationWeather"));
  }

  if (refresh) {
    appCache.invalidateByPrefix("weather-metar:");
    appCache.invalidateByPrefix("weather-taf:");
    appCache.invalidateByPrefix("weather-pirep:");
  }

  const response = await getWeather(station.toUpperCase());
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
