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
import { getFrequencies } from "@/services/frequencies";

export async function GET(request: Request) {
  const airportCode = readRequiredSearchParam(request, "airport");
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!airportCode) {
    return createMissingParamResponse("airport", getDataSource("faaNasr"));
  }

  if (!/^[A-Za-z0-9]{3,4}$/.test(airportCode)) {
    return createInvalidParamResponse("airport", "Use a valid FAA or ICAO airport identifier.", getDataSource("faaNasr"));
  }

  if (refresh) {
    appCache.invalidateByPrefix("airport-frequencies:");
  }

  const response = await getFrequencies(airportCode.toUpperCase());
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
