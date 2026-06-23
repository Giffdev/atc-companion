import { DEFAULT_SOURCE } from "@/lib/constants";
import { DEFAULT_STALENESS_THRESHOLD_MS, isDataStale, type StalenessCategory } from "@/data/staleness";
import type { ApiCacheMetadata, ApiError, ApiResponse, DataSource } from "@/types/api";

export const toIsoNow = (): string => new Date().toISOString();

export const isStale = (timestamp: string, thresholdMs = DEFAULT_STALENESS_THRESHOLD_MS): boolean =>
  Date.now() - new Date(timestamp).getTime() > thresholdMs;

type CreateApiResponseOptions = {
  fetchedAt?: string;
  stalenessCategory?: StalenessCategory;
  supportingSources?: DataSource[];
  cache?: ApiCacheMetadata;
};

export const createApiResponse = <T>(
  data: T,
  source: DataSource,
  options: CreateApiResponseOptions = {}
): ApiResponse<T> => {
  const fetchedAt = options.fetchedAt ?? toIsoNow();
  const stale = options.stalenessCategory ? isDataStale(fetchedAt, options.stalenessCategory) : false;

  return {
    data,
    source,
    attribution: {
      primary: source,
      supporting: options.supportingSources?.length ? options.supportingSources : undefined
    },
    fetchedAt,
    isStale: stale,
    stalenessWarning: stale
      ? `Data from ${source.name} is older than its expected ${source.refresh_interval} refresh interval.`
      : undefined,
    cache: options.cache,
    ok: true
  };
};

type CreateApiErrorResponseOptions = {
  fetchedAt?: string;
  source?: DataSource;
  stalenessCategory?: StalenessCategory;
  cache?: ApiCacheMetadata;
  supportingSources?: DataSource[];
};

export const createApiErrorResponse = (
  error: ApiError,
  options: CreateApiErrorResponseOptions = {}
): ApiResponse<never> => {
  const fetchedAt = options.fetchedAt ?? toIsoNow();
  const fallbackSource: DataSource = options.source
    ? options.source
    : {
        id: "default-source",
        name: "Default source",
        url: DEFAULT_SOURCE,
        reliability: "low",
        refresh_interval: "unknown"
      };
  const stale = options.stalenessCategory ? isDataStale(fetchedAt, options.stalenessCategory) : false;

  return {
    data: null,
    source: fallbackSource,
    attribution: {
      primary: fallbackSource,
      supporting: options.supportingSources?.length ? options.supportingSources : undefined
    },
    fetchedAt,
    isStale: stale,
    stalenessWarning: stale ? `Data from ${fallbackSource.name} may be stale.` : undefined,
    cache: options.cache,
    ok: false,
    error
  };
};

export const withSourceUrl = (source: DataSource, url: string): DataSource => ({
  ...source,
  url
});

export const withQueryParam = (baseUrl: string, key: string, value: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.set(key, value);
  return url.toString();
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp || "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(date);
};

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

const RELATIVE_TIME_UNITS = [
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
  ["second", 1000]
] as const;

export const formatRelativeTime = (timestamp: string, referenceTime: string | number = Date.now()): string => {
  const referenceMs = typeof referenceTime === "string" ? new Date(referenceTime).getTime() : referenceTime;
  const tsMs = new Date(timestamp).getTime();
  if (Number.isNaN(tsMs) || Number.isNaN(referenceMs)) return "unknown";
  const deltaMs = tsMs - referenceMs;

  for (const [unit, unitMs] of RELATIVE_TIME_UNITS) {
    if (Math.abs(deltaMs) >= unitMs || unit === "second") {
      return RELATIVE_TIME_FORMATTER.format(Math.round(deltaMs / unitMs), unit);
    }
  }

  return "just now";
};
