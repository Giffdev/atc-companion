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
import { searchAimReferences, searchAllRegulatory, searchAtcReferences, searchFars } from "@/services/regulatory";

const REGULATORY_ROUTE_SOURCE = getDataSource("faaAtc");

export async function GET(request: Request) {
  const query = readRequiredSearchParam(request, "q");
  const partParam = readOptionalSearchParam(request, "part");
  const scopeParam = (readOptionalSearchParam(request, "scope") ?? readOptionalSearchParam(request, "source") ?? "all")
    .trim()
    .toLowerCase();
  const refresh = readBooleanSearchParam(request, "refresh");

  if (!query) {
    return createMissingParamResponse("q", REGULATORY_ROUTE_SOURCE);
  }

  const part = partParam ? Number.parseInt(partParam, 10) : undefined;
  if (partParam && !Number.isFinite(part)) {
    return createInvalidParamResponse("part", "part must be a valid integer such as 91 or 121.", REGULATORY_ROUTE_SOURCE);
  }

  if (!["all", "far", "fars", "atc", "aim"].includes(scopeParam)) {
    return createInvalidParamResponse(
      "scope",
      "scope must be one of: all, far, atc, or aim.",
      REGULATORY_ROUTE_SOURCE
    );
  }

  if (refresh) {
    appCache.invalidateByPrefix("regulatory-search:");
    appCache.invalidateByPrefix("atc-reference-search:");
    appCache.invalidateByPrefix("aim-reference-search:");
  }

  const response =
    scopeParam === "far" || scopeParam === "fars"
      ? await searchFars(query, part)
      : scopeParam === "atc"
        ? await searchAtcReferences(query)
        : scopeParam === "aim"
          ? await searchAimReferences(query)
          : await searchAllRegulatory(query, part);

  return jsonWithStandardHeaders(response, { status: getResponseStatus(response) });
}
