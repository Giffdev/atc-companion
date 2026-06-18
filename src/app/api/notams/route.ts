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
import { getNotams } from "@/services/notams";

export async function GET(request: Request) {
  const facility = readRequiredSearchParam(request, "facility");
  const typeFilter = readOptionalSearchParam(request, "type_filter");
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!facility) {
    return createMissingParamResponse("facility", getDataSource("faaNotams"));
  }

  if (!/^[A-Za-z0-9]{3,4}$/.test(facility)) {
    return createInvalidParamResponse("facility", "Use a valid FAA or ICAO airport identifier.", getDataSource("faaNotams"));
  }

  if (typeFilter && !["D", "FDC", "TFR"].includes(typeFilter.toUpperCase())) {
    return createInvalidParamResponse("type_filter", "Supported NOTAM types are D, FDC, and TFR.", getDataSource("faaNotams"));
  }

  if (refresh) {
    appCache.invalidateByPrefix("notam-search:");
  }

  const response = await getNotams({ airport: facility.toUpperCase(), type_filter: typeFilter ?? undefined });
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
