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
import { searchFars } from "@/services/regulatory";

export async function GET(request: Request) {
  const query = readRequiredSearchParam(request, "q");
  const partParam = readOptionalSearchParam(request, "part");
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!query) {
    return createMissingParamResponse("q", getDataSource("ecfr"));
  }

  const part = partParam ? Number.parseInt(partParam, 10) : undefined;
  if (partParam && !Number.isFinite(part)) {
    return createInvalidParamResponse("part", "part must be a valid integer such as 91 or 121.", getDataSource("ecfr"));
  }

  if (refresh) {
    appCache.invalidateByPrefix("regulatory-search:");
  }

  const response = await searchFars(query, part);
  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
