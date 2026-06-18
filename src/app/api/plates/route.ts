import {
  createInvalidParamResponse,
  createMissingParamResponse,
  getResponseStatus,
  jsonWithStandardHeaders,
  readBooleanSearchParam,
  readOptionalSearchParam,
  readRequiredSearchParam
} from "@/app/api/route-utils";
import { getDataSource } from "@/data/sources";
import { appCache } from "@/lib/cache";
import { getPlates } from "@/services/plates";

export async function GET(request: Request) {
  const airportCode = readRequiredSearchParam(request, "airport");
  const type = readOptionalSearchParam(request, "type");
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!airportCode) {
    return createMissingParamResponse("airport", getDataSource("faaDtpp"));
  }

  if (!/^[A-Za-z0-9]{3,4}$/.test(airportCode)) {
    return createInvalidParamResponse("airport", "Use a valid FAA or ICAO airport identifier.", getDataSource("faaDtpp"));
  }

  if (refresh) {
    appCache.invalidateByPrefix("dtpp-xml:");
  }

  const response = await getPlates({ airport: airportCode.toUpperCase(), type: type ?? undefined });
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
