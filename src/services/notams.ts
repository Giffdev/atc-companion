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
const FAA_NOTAM_SEARCH_URL = "https://notams.aim.faa.gov/notamSearch/";

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

type FaaNotamCredentials = {
  clientId: string;
  clientSecret: string;
};

const isRecord = (value: unknown): value is RawNotam => !!value && typeof value === "object" && !Array.isArray(value);

const compactRecords = (...values: unknown[]): RawNotam[] => values.filter(isRecord);

const mergeRecordLayers = (...layers: unknown[]): RawNotam => Object.assign({}, ...compactRecords(...layers));

const getPath = (record: RawNotam, path: string[]): unknown => {
  let current: unknown = record;

  for (const segment of path) {
    if (!isRecord(current)) return undefined;
    current = current[segment];
  }

  return current;
};

const firstString = (record: RawNotam, paths: string[][]): string | undefined => {
  for (const path of paths) {
    const value = getPath(record, path);
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return undefined;
};

const normalizeFaaNotamItem = (raw: RawNotam): RawNotam => {
  const properties = isRecord(raw.properties) ? raw.properties : undefined;
  const coreData = isRecord(properties?.coreNOTAMData) ? properties.coreNOTAMData : undefined;
  const notam = isRecord(coreData?.notam) ? coreData.notam : undefined;

  return mergeRecordLayers(raw, properties, coreData, notam, {
    properties,
    coreNOTAMData: coreData,
    notam
  });
};

const resolveNotamItems = (payload: unknown): RawNotam[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord).map(normalizeFaaNotamItem);
  }

  if (isRecord(payload)) {
    for (const key of ["items", "notams", "results", "data", "features"]) {
      if (Array.isArray(payload[key])) {
        return payload[key].filter(isRecord).map(normalizeFaaNotamItem);
      }
    }

    const nestedArray = Object.values(payload).find(Array.isArray);
    if (nestedArray) {
      return nestedArray.filter(isRecord).map(normalizeFaaNotamItem);
    }
  }

  return [];
};

const inferNotamType = (raw: RawNotam): Notam["type"] => {
  const composite = [
    raw.notamClass,
    raw.class,
    raw.type,
    raw.notamType,
    raw.notamNumber,
    raw.number,
    raw.id,
    raw.keyword,
    raw.code,
    getPath(raw, ["notam", "classification"]),
    getPath(raw, ["notam", "type"])
  ]
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

const parseNotam = (rawItem: RawNotam, sourceBase: DataSource, sourceUrl: string, fetchedAt: string, airport?: string): Notam => {
  const raw = normalizeFaaNotamItem(rawItem);
  const type = inferNotamType(raw);
  const notamId = firstString(raw, [
    ["notamNumber"],
    ["notamId"],
    ["id"],
    ["number"],
    ["notam", "id"],
    ["notam", "number"]
  ]) ?? `${airport ?? "NOTAM"}-UNKNOWN`;
  const facility = firstString(raw, [
    ["icaoLocation"],
    ["icaoId"],
    ["airport"],
    ["affectedFacility"],
    ["location"],
    ["affectedLocation"],
    ["locationDesignator"],
    ["aerodrome"],
    ["notam", "icaoLocation"],
    ["notam", "location"]
  ]);
  const affectedFacility = toIcaoCode(String(facility ?? airport ?? "UNKNOWN").toUpperCase());
  const effectiveAt = toIsoTimestamp(
    firstString(raw, [
      ["effectiveDate"],
      ["startDate"],
      ["startDateTime"],
      ["effectiveStart"],
      ["start_time"],
      ["issued"],
      ["issueDate"],
      ["created"],
      ["notam", "effectiveStart"],
      ["notam", "startDate"]
    ]),
    fetchedAt
  );
  const expiresAtCandidate = firstString(raw, [
    ["endDate"],
    ["endDateTime"],
    ["expirationDate"],
    ["expiration"],
    ["effectiveEnd"],
    ["end_time"],
    ["expires"],
    ["notam", "effectiveEnd"],
    ["notam", "endDate"]
  ]);
  const text = firstString(raw, [
    ["text"],
    ["notamText"],
    ["traditionalMessage"],
    ["rawText"],
    ["notam"],
    ["body"],
    ["remarks"],
    ["description"],
    ["message"],
    ["notam", "text"],
    ["notam", "notamText"],
    ["notam", "traditionalMessage"],
    ["notam", "rawText"]
  ]) ?? "";
  const source = { ...sourceBase, url: sourceUrl };

  if (type === "TFR") {
    const purpose = firstString(raw, [["purpose"], ["notam", "purpose"]]);
    const classification = classifyNotam({ type, text, purpose });
    return {
      notamId,
      type,
      affectedFacility,
      effectiveAt,
      expiresAt: expiresAtCandidate ? toIsoTimestamp(expiresAtCandidate, fetchedAt) : undefined,
      text,
      tfrNumber: firstString(raw, [["tfrNumber"], ["notamNumber"], ["number"]]) ?? notamId,
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
      reference: firstString(raw, [["reference"], ["entity"], ["keyword"], ["notam", "keyword"]]),
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
    keyword: firstString(raw, [["entity"], ["area"], ["keyword"], ["notam", "keyword"]]),
    source,
    fetchedAt,
    isStale: false,
    ...classification
  };
};

const createNotamSearchUrl = (airport?: string): string => {
  const faaCode = airport?.replace(/^K/, "") ?? "";
  return `${FAA_NOTAM_SEARCH_URL}${faaCode ? `?designatorsForLocation=${faaCode}` : ""}`;
};

const createNotamFeedUnavailableResponse = (airport?: string): ApiResponse<Notam[]> => {
  const searchUrl = createNotamSearchUrl(airport);

  return createApiErrorResponse(
    {
      code: "NOTAM_FEED_NOT_CONFIGURED",
      message: airport
        ? `Live inline NOTAMs for ${airport} require FAA NOTAM API credentials. Use FAA NOTAM Search for the authoritative briefing.`
        : "Live inline NOTAMs require FAA NOTAM API credentials. Use FAA NOTAM Search for the authoritative briefing.",
      details: searchUrl,
      retryable: false,
      status: 200
    },
    {
      source: { ...NOTAM_SOURCE, url: searchUrl },
      fetchedAt: toIsoNow(),
      stalenessCategory: "notam"
    }
  );
};

const getFaaNotamCredentials = (): FaaNotamCredentials | null => {
  const clientId = process.env.FAA_NOTAM_CLIENT_ID ?? process.env.FAA_NMS_CLIENT_ID;
  const clientSecret = process.env.FAA_NOTAM_CLIENT_SECRET ?? process.env.FAA_NMS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
};

export const getNotams = async (params: { airport?: string; type_filter?: string }): Promise<ApiResponse<Notam[]>> => {
  const credentials = getFaaNotamCredentials();
  const airport = params.airport ? toFaaCode(params.airport) : undefined;
  const icao = params.airport ? toIcaoCode(params.airport) : undefined;
  const typeFilter = params.type_filter?.toUpperCase();
  const notamLookupCode = icao ?? airport;

  if (!credentials) {
    return createNotamFeedUnavailableResponse(notamLookupCode);
  }

  try {
    const result = await fetchWithRetry<unknown>(NOTAM_API_URL, {
      source: NOTAM_SOURCE,
      headers: {
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        Accept: "application/json"
      },
      query: {
        icaoLocation: notamLookupCode,
        responseFormat: "geoJson"
      },
      ttlMs: getCacheTtlMs("notam"),
      cacheNamespace: "notam-search",
      cacheKey: createCacheKey("notam-search", { airport: notamLookupCode, typeFilter, provider: "faa-notamapi-v1" })
    });

    const notams = resolveNotamItems(result.data)
      .map((item) => parseNotam(item, NOTAM_SOURCE, result.url, result.fetchedAt, notamLookupCode))
      .filter((item) => (typeFilter ? item.type === typeFilter : true));

    return createApiResponse(notams, result.source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "notam",
      cache: result.cache
    });
  } catch (error) {
    return toServiceErrorResponse(error, NOTAM_SOURCE, "notam");
  }
};

