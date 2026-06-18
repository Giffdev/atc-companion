import { createCacheKey, getOrPopulateCache } from "@/lib/cache";
import { toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiCacheMetadata, DataSource } from "@/types/api";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRY_COUNT = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelayMs = (attempt: number, retryAfterHeader: string | null): number => {
  if (retryAfterHeader) {
    const seconds = Number.parseInt(retryAfterHeader, 10);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return seconds * 1000;
    }

    const until = Date.parse(retryAfterHeader);
    if (!Number.isNaN(until)) {
      return Math.max(0, until - Date.now());
    }
  }

  return 250 * 2 ** attempt;
};

const readResponseBody = async (response: Response): Promise<string> => {
  try {
    return await response.text();
  } catch {
    return "";
  }
};

export class FetcherError extends Error {
  constructor(
    message: string,
    readonly options: {
      code: string;
      status: number;
      retryable: boolean;
      source: DataSource;
      fetchedAt: string;
      details?: string;
    }
  ) {
    super(message);
    this.name = "FetcherError";
  }
}

type ParseMode = "json" | "text";

export interface FetcherResult<T> {
  data: T;
  fetchedAt: string;
  url: string;
  source: DataSource;
  cache: ApiCacheMetadata;
  status: number;
  headers: Headers;
}

type FetchWithRetryOptions<T> = {
  source: DataSource;
  query?: Record<string, string | number | boolean | null | undefined>;
  method?: "GET" | "POST";
  headers?: HeadersInit;
  body?: BodyInit;
  timeoutMs?: number;
  retries?: number;
  ttlMs?: number;
  cacheNamespace?: string;
  cacheKey?: string;
  bypassCache?: boolean;
  parseAs?: ParseMode;
  transform?: (payload: unknown) => T;
};

const buildUrl = (baseUrl: string, query?: FetchWithRetryOptions<unknown>["query"]): string => {
  const url = new URL(baseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

const parsePayload = async (response: Response, parseAs: ParseMode): Promise<unknown> => {
  if (parseAs === "text") {
    return response.text();
  }

  return response.json();
};

const logFetch = (message: string, context: Record<string, unknown>): void => {
  console.info(`[fetcher] ${message} ${JSON.stringify(context)}`);
};

export const fetchWithRetry = async <T = unknown>(
  baseUrl: string,
  options: FetchWithRetryOptions<T>
): Promise<FetcherResult<T>> => {
  const url = buildUrl(baseUrl, options.query);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRY_COUNT;
  const parseAs = options.parseAs ?? "json";
  const cacheKey = options.ttlMs
    ? (options.cacheKey ?? createCacheKey(options.cacheNamespace ?? url, { url, method: options.method ?? "GET" }))
    : undefined;

  const execute = async (): Promise<Omit<FetcherResult<T>, "cache">> => {
    for (let attempt = 0; attempt < retries; attempt += 1) {
      const fetchedAt = toIsoNow();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        logFetch("request", { url, attempt: attempt + 1 });

        const response = await fetch(url, {
          method: options.method ?? "GET",
          headers: options.headers,
          body: options.body,
          signal: controller.signal
        });

        if (response.status === 429 && attempt < retries - 1) {
          const delayMs = getRetryDelayMs(attempt, response.headers.get("Retry-After"));
          logFetch("rate-limited", { url, delayMs, attempt: attempt + 1 });
          await sleep(delayMs);
          continue;
        }

        if (!response.ok) {
          const body = await readResponseBody(response);
          const status = response.status;
          const code =
            status === 401 || status === 403
              ? "UPSTREAM_AUTH_ERROR"
              : status === 404
                ? "UPSTREAM_NOT_FOUND"
                : status === 429
                  ? "UPSTREAM_RATE_LIMIT"
                  : status >= 500
                    ? "UPSTREAM_SERVER_ERROR"
                    : "UPSTREAM_CLIENT_ERROR";
          const retryable = status === 429 || status >= 500;

          if (retryable && attempt < retries - 1) {
            const delayMs = getRetryDelayMs(attempt, response.headers.get("Retry-After"));
            logFetch("retry", { url, status, delayMs, attempt: attempt + 1 });
            await sleep(delayMs);
            continue;
          }

          throw new FetcherError(`Upstream request failed with status ${status}.`, {
            code,
            status,
            retryable,
            source: withSourceUrl(options.source, url),
            fetchedAt,
            details: body.slice(0, 500)
          });
        }

        const payload = await parsePayload(response, parseAs);
        const data = options.transform ? options.transform(payload) : (payload as T);

        return {
          data,
          fetchedAt,
          url,
          source: withSourceUrl(options.source, url),
          status: response.status,
          headers: response.headers
        };
      } catch (error) {
        const isAbort = error instanceof Error && error.name === "AbortError";
        const isNetwork = error instanceof TypeError;

        if (error instanceof FetcherError) {
          throw error;
        }

        if ((isAbort || isNetwork) && attempt < retries - 1) {
          const delayMs = getRetryDelayMs(attempt, null);
          logFetch("transient-error", {
            url,
            attempt: attempt + 1,
            error: error instanceof Error ? error.message : String(error),
            delayMs
          });
          await sleep(delayMs);
          continue;
        }

        throw new FetcherError(isAbort ? "Upstream request timed out." : "Network request failed.", {
          code: isAbort ? "UPSTREAM_TIMEOUT" : "NETWORK_ERROR",
          status: 504,
          retryable: true,
          source: withSourceUrl(options.source, url),
          fetchedAt,
          details: error instanceof Error ? error.message : String(error)
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new FetcherError("Network request failed.", {
      code: "NETWORK_ERROR",
      status: 504,
      retryable: true,
      source: withSourceUrl(options.source, url),
      fetchedAt: toIsoNow()
    });
  };

  if (!options.ttlMs || !cacheKey) {
    const result = await execute();
    return {
      ...result,
      cache: {
        key: cacheKey ?? createCacheKey(url, { uncached: true }),
        status: options.bypassCache ? "bypass" : "miss",
        ageSeconds: 0,
        ttlSeconds: 0,
        cached: false
      }
    };
  }

  const { value, cache } = await getOrPopulateCache(cacheKey, options.ttlMs, execute, {
    bypass: options.bypassCache
  });

  return {
    ...value,
    cache
  };
};
