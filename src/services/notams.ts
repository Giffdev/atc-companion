import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse, DataSource } from "@/types/api";
import type { Notam, NotamCategory } from "@/types/aviation";
import { toIsoTimestamp, toServiceErrorResponse } from "@/services/_shared";

const NOTAM_SOURCE = getDataSource("faaNotams");
const NOTAM_API_URL = "https://external-api.faa.gov/notamapi/v1/notams";
const AVIATION_API_NOTAM_URL = "https://api.aviationapi.com/v1/notams";
const FAA_NOTAM_SEARCH_URL = "https://notams.aim.faa.gov/notamSearch/";
const AVIATION_API_SOURCE: DataSource = {
  id: "aviationapi-notams",
  name: "AviationAPI NOTAMs",
  url: "https://api.aviationapi.com",
  reliability: "medium",
  refresh_interval: "Near real time"
};

// ---------------------------------------------------------------------------
// NOTAM classification — single source of truth for category, isCritical, summary
// ---------------------------------------------------------------------------

const RWY_CLOSURE_RE = /\bRWY\s+([\w/\-]+)\s+(?:CLSD|CLOSED)\b/i;
const AD_CLOSURE_RE = /\b(?:AD\s+CLSD|AERODROME\s+CLOSED|AIRPORT\s+CLOSED)\b/i;
const NAV_OUTAGE_RE = /\b(?:ILS|VOR|GPS|NDB|LOCALIZER|GLIDE\s*SLOPE)\b.{0,40}?\b(?:U\/S|OTS|UNSERVICEABLE|OUT\s+OF\s+SERVICE)\b/i;
const OBSTACLE_RE = /\b(?:OBST|CRANE|TOWER|WIND\s+TURBINE)\b/i;

interface Classification {
  category: NotamCategory;
  isCritical: boolean;
  summary?: string;
}

/**
 * Derives `category`, `isCritical`, and a short `summary` from a NOTAM's type
 * and free-text. Called at parse time so every returned Notam carries these fields.
 */
export const classifyNotam = (notam: Pick<Notam, "type" | "text"> & { purpose?: string }): Classification => {
  const { type, text } = notam;
  const upper = text.toUpperCase();

  // TFR — always critical
  if (type === "TFR") {
    const purpose = (notam as { purpose?: string }).purpose;
    const summaryText = purpose ? `TFR \u2014 ${purpose.toUpperCase()}` : "TFR";
    return { category: "TFR", isCritical: true, summary: summaryText };
  }

  // Airport closure
  if (AD_CLOSURE_RE.test(text)) {
    return { category: "AIRPORT_CLOSURE", isCritical: true, summary: "AD CLSD" };
  }

  // Runway closure — capture designator for summary
  const rwyMatch = RWY_CLOSURE_RE.exec(text);
  if (rwyMatch) {
    return {
      category: "RUNWAY_CLOSURE",
      isCritical: true,
      summary: `RWY ${rwyMatch[1].toUpperCase()} CLSD`
    };
  }

  // FDC — regulatory/procedure change, not auto-critical
  if (type === "FDC") {
    return { category: "FDC", isCritical: false };
  }

  // Navaid outage
  if (NAV_OUTAGE_RE.test(upper)) {
    return { category: "NAV_OUTAGE", isCritical: false };
  }

  // Obstacle
  if (OBSTACLE_RE.test(upper)) {
    return { category: "OBSTACLE", isCritical: false };
  }

  return { category: "OTHER", isCritical: false };
};

// ---------------------------------------------------------------------------
// Temporal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the NOTAM is currently active:
 * effectiveAt <= nowMs AND (no expiresAt OR nowMs <= expiresAt).
 * Treats an unparseable effectiveAt as active so the NOTAM is never silently hidden.
 */
export const isNotamActive = (notam: Pick<Notam, "effectiveAt" | "expiresAt">, nowMs = Date.now()): boolean => {
  const effectiveMs = Date.parse(notam.effectiveAt);
  if (isNaN(effectiveMs)) return true; // fail-safe: show it
  if (effectiveMs > nowMs) return false;
  if (notam.expiresAt) {
    const expiresMs = Date.parse(notam.expiresAt);
    if (!isNaN(expiresMs) && nowMs > expiresMs) return false;
  }
  return true;
};

/**
 * Returns true when the NOTAM is upcoming (effectiveAt is in the future).
 * Treats an unparseable effectiveAt as NOT upcoming.
 */
export const isNotamUpcoming = (notam: Pick<Notam, "effectiveAt">, nowMs = Date.now()): boolean => {
  const effectiveMs = Date.parse(notam.effectiveAt);
  if (isNaN(effectiveMs)) return false;
  return effectiveMs > nowMs;
};

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

    const nestedArray = Object.values(record).find(Array.isArray);
    if (nestedArray) {
      return nestedArray.filter((item): item is RawNotam => !!item && typeof item === "object");
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

const parseNotam = (raw: RawNotam, sourceBase: DataSource, sourceUrl: string, fetchedAt: string, airport?: string): Notam => {
  const type = inferNotamType(raw);
  const notamId = String(raw.notamNumber ?? raw.notamId ?? raw.id ?? raw.number ?? `${airport ?? "NOTAM"}-UNKNOWN`);
  const affectedFacility = toIcaoCode(String(raw.icaoId ?? raw.airport ?? raw.location ?? airport ?? "UNKNOWN").toUpperCase());
  const effectiveAt = toIsoTimestamp(
    (raw.effectiveDate as string | undefined) ??
      (raw.startDate as string | undefined) ??
      (raw.start_time as string | undefined) ??
      (raw.issued as string | undefined) ??
      (raw.issueDate as string | undefined) ??
      (raw.created as string | undefined),
    fetchedAt
  );
  const expiresAtCandidate =
    (raw.endDate as string | undefined) ??
    (raw.expirationDate as string | undefined) ??
    (raw.end_time as string | undefined) ??
    (raw.expires as string | undefined);
  const text = String(raw.text ?? raw.notam ?? raw.notam_text ?? raw.body ?? raw.remarks ?? raw.description ?? raw.message ?? "");
  const source = { ...sourceBase, url: sourceUrl };

  if (type === "TFR") {
    const purpose = raw.purpose ? String(raw.purpose) : undefined;
    const classification = classifyNotam({ type, text, purpose });
    return {
      notamId,
      type,
      affectedFacility,
      effectiveAt,
      expiresAt: expiresAtCandidate ? toIsoTimestamp(expiresAtCandidate, fetchedAt) : undefined,
      text,
      tfrNumber: String(raw.tfrNumber ?? raw.notamNumber ?? notamId),
      purpose,
      source,
      fetchedAt,
      isStale: false,
      ...classification
    };
  }

  if (type === "FDC") {
    const classification = classifyNotam({ type, text });
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
      isStale: false,
      ...classification
    };
  }

  const classification = classifyNotam({ type, text });
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
    isStale: false,
    ...classification
  };
};

const createHelpfulNotamError = (airport?: string): ApiResponse<Notam[]> => {
  const faaCode = airport?.replace(/^K/, "") ?? "";
  const searchUrl = `${FAA_NOTAM_SEARCH_URL}${faaCode ? `?designatorsForLocation=${faaCode}` : ""}`;

  return createApiErrorResponse(
    {
      code: "NOTAM_EMBEDDED_SEARCH",
      message: airport
        ? `View live NOTAMs for ${airport} at the FAA NOTAM Search portal.`
        : "Use the FAA NOTAM Search portal to look up NOTAMs by location.",
      details: searchUrl,
      retryable: false,
      status: 200
    },
    {
      source: NOTAM_SOURCE,
      fetchedAt: toIsoNow(),
      stalenessCategory: "notam"
    }
  );
};

const fetchNotamsFromAviationApi = async (
  airport: string,
  typeFilter?: string
): Promise<ApiResponse<Notam[]>> => {
  const result = await fetchWithRetry<unknown>(AVIATION_API_NOTAM_URL, {
    source: AVIATION_API_SOURCE,
    headers: {
      Accept: "application/json"
    },
    query: {
      apt: airport
    },
    ttlMs: getCacheTtlMs("notam"),
    cacheNamespace: "notam-search",
    cacheKey: createCacheKey("notam-search", { airport, typeFilter, provider: "aviationapi" })
  });

  const items = resolveNotamItems(result.data);
  const notams = items
    .map((item) => parseNotam(item, AVIATION_API_SOURCE, result.url, result.fetchedAt, airport))
    .filter((item) => (typeFilter ? item.type === typeFilter : true));

  return createApiResponse(notams, result.source, {
    fetchedAt: result.fetchedAt,
    stalenessCategory: "notam",
    cache: result.cache,
    supportingSources: [NOTAM_SOURCE]
  });
};

export const getNotams = async (params: { airport?: string; type_filter?: string }): Promise<ApiResponse<Notam[]>> => {
  const apiKey = process.env.FAA_NOTAM_API_KEY ?? process.env.FAA_NMS_API_KEY;
  const airport = params.airport ? toFaaCode(params.airport) : undefined;
  const icao = params.airport ? toIcaoCode(params.airport) : undefined;
  const typeFilter = params.type_filter?.toUpperCase();
  const notamLookupCode = icao ?? airport;

  if (!apiKey) {
    if (notamLookupCode) {
      try {
        return await fetchNotamsFromAviationApi(notamLookupCode, typeFilter);
      } catch {
        return createHelpfulNotamError(notamLookupCode);
      }
    }

    return createHelpfulNotamError();
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
        icaoId: notamLookupCode,
        type: typeFilter
      },
      ttlMs: getCacheTtlMs("notam"),
      cacheNamespace: "notam-search",
      cacheKey: createCacheKey("notam-search", { airport: notamLookupCode, typeFilter })
    });

    const items = resolveNotamItems(result.data);
    return createApiResponse(
      items.map((item) => parseNotam(item, NOTAM_SOURCE, result.url, result.fetchedAt, airport)),
      result.source,
      {
        fetchedAt: result.fetchedAt,
        stalenessCategory: "notam",
        cache: result.cache
      }
    );
  } catch (error) {
    if (notamLookupCode) {
      try {
        return await fetchNotamsFromAviationApi(notamLookupCode, typeFilter);
      } catch {
        return createHelpfulNotamError(notamLookupCode);
      }
    }

    return toServiceErrorResponse(error, NOTAM_SOURCE, "notam");
  }
};
