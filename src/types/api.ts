/** High-level confidence signal for a data source. */
export type SourceReliabilityRating = "high" | "medium" | "low";

/** Minimal source descriptor embedded in API payloads and domain records. */
export interface DataSource {
  id: string;
  name: string;
  url: string;
  reliability: SourceReliabilityRating;
  refresh_interval: string;
}

/** API errors are surfaced without losing provenance or fetch timing. */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
  status?: number;
  inferredCtaf?: {
    frequencyMHz: number;
    unverified: true;
    basis: string;
  };
  frequencies?: [];
}

export interface ApiCacheMetadata {
  key: string;
  status: "hit" | "miss" | "bypass";
  ageSeconds: number;
  ttlSeconds: number;
  cached: boolean;
}

/** Wrapper describing where the data came from. */
export interface SourceAttribution {
  primary: DataSource;
  supporting?: DataSource[];
}

/** Successful API response with provenance and stale-data messaging. */
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  source: DataSource;
  attribution: SourceAttribution;
  fetchedAt: string;
  isStale: boolean;
  stalenessWarning?: string;
  cache?: ApiCacheMetadata;
  error?: never;
}

/** Failed API response preserving the same envelope shape. */
export interface ApiErrorResponse {
  ok: false;
  data: null;
  source: DataSource;
  attribution: SourceAttribution;
  fetchedAt: string;
  isStale: boolean;
  stalenessWarning?: string;
  cache?: ApiCacheMetadata;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
