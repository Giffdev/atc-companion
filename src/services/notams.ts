import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { Notam } from "@/types/aviation";
import { toIsoTimestamp, toServiceErrorResponse } from "@/services/_shared";

const NOTAM_SOURCE = getDataSource("faaNotams");
const NOTAM_API_URL = "https://external-api.faa.gov/notamapi/v1/notams";

type RawNotam = Record<string, unknown>;

const resolveNotamItems = (payload: unknown): RawNotam[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is RawNotam => !!item && typeof item === "object");
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["items", "notams", "results", "data"]) {
      if (Array.isArray(record[key])) {
        return record[key].filter((item): item is RawNotam => !!item && typeof item === "object");
      }
    }
  }

  return [];
};

const inferNotamType = (raw: RawNotam): Notam["type"] => {
  const composite = [raw.notamClass, raw.class, raw.type, raw.notamType, raw.notamNumber]
    .map((value) => String(value ?? "").toUpperCase())
    .join(" ");

  if (composite.includes("TFR")) {
    return "TFR";
  }

  if (composite.includes("FDC")) {
    return "FDC";
  }

  return "D";
};

const parseNotam = (raw: RawNotam, sourceUrl: string, fetchedAt: string, airport?: string): Notam => {
  const type = inferNotamType(raw);
  const notamId = String(raw.notamNumber ?? raw.notamId ?? raw.id ?? raw.number ?? `${airport ?? "NOTAM"}-UNKNOWN`);
  const affectedFacility = toIcaoCode(String(raw.icaoId ?? raw.airport ?? raw.location ?? airport ?? "UNKNOWN").toUpperCase());
  const effectiveAt = toIsoTimestamp(
    (raw.effectiveDate as string | undefined) ??
      (raw.startDate as string | undefined) ??
      (raw.issueDate as string | undefined) ??
      (raw.created as string | undefined),
    fetchedAt
  );
  const expiresAtCandidate = (raw.endDate as string | undefined) ?? (raw.expirationDate as string | undefined);
  const text = String(raw.text ?? raw.remarks ?? raw.description ?? raw.message ?? "");
  const source = { ...NOTAM_SOURCE, url: sourceUrl };

  if (type === "TFR") {
    return {
      notamId,
      type,
      affectedFacility,
      effectiveAt,
      expiresAt: expiresAtCandidate ? toIsoTimestamp(expiresAtCandidate, fetchedAt) : undefined,
      text,
      tfrNumber: String(raw.tfrNumber ?? raw.notamNumber ?? notamId),
      purpose: raw.purpose ? String(raw.purpose) : undefined,
      source,
      fetchedAt,
      isStale: false
    };
  }

  if (type === "FDC") {
    return {
      notamId,
      type,
      affectedFacility,
      effectiveAt,
      expiresAt: expiresAtCandidate ? toIsoTimestamp(expiresAtCandidate, fetchedAt) : undefined,
      text,
      reference: raw.reference ? String(raw.reference) : raw.entity ? String(raw.entity) : undefined,
      source,
      fetchedAt,
      isStale: false
    };
  }

  return {
    notamId,
    type,
    affectedFacility,
    effectiveAt,
    expiresAt: expiresAtCandidate ? toIsoTimestamp(expiresAtCandidate, fetchedAt) : undefined,
    text,
    keyword: raw.entity ? String(raw.entity) : raw.area ? String(raw.area) : undefined,
    source,
    fetchedAt,
    isStale: false
  };
};

export const getNotams = async (params: { airport?: string; type_filter?: string }): Promise<ApiResponse<Notam[]>> => {
  const apiKey = process.env.FAA_NOTAM_API_KEY ?? process.env.FAA_NMS_API_KEY;
  const airport = params.airport ? toFaaCode(params.airport) : undefined;
  const icao = params.airport ? toIcaoCode(params.airport) : undefined;
  const typeFilter = params.type_filter?.toUpperCase();

  if (!apiKey) {
    return createApiErrorResponse(
      {
        code: "MISSING_API_KEY",
        message: "FAA NOTAM API key not configured. Register free at api.faa.gov, then set FAA_NOTAM_API_KEY in .env.local.",
        details: "The FAA NOTAM Management System requires a free API key. Visit https://api.faa.gov to register.",
        retryable: false,
        status: 503
      },
      {
        source: NOTAM_SOURCE,
        fetchedAt: toIsoNow(),
        stalenessCategory: "notam"
      }
    );
  }

  try {
    const result = await fetchWithRetry<unknown>(NOTAM_API_URL, {
      source: NOTAM_SOURCE,
      headers: {
        "x-apikey": apiKey,
        "Ocp-Apim-Subscription-Key": apiKey,
        Accept: "application/json"
      },
      query: {
        icaoId: icao ?? airport,
        type: typeFilter
      },
      ttlMs: getCacheTtlMs("notam"),
      cacheNamespace: "notam-search",
      cacheKey: createCacheKey("notam-search", { airport: icao ?? airport, typeFilter })
    });

    const items = resolveNotamItems(result.data);
    return createApiResponse(
      items.map((item) => parseNotam(item, result.url, result.fetchedAt, airport)),
      result.source,
      {
        fetchedAt: result.fetchedAt,
        stalenessCategory: "notam",
        cache: result.cache
      }
    );
  } catch (error) {
    return toServiceErrorResponse(error, NOTAM_SOURCE, "notam");
  }
};
