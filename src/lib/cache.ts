import { STALENESS_THRESHOLDS_MS, type StalenessCategory } from "@/data/staleness";
import type { ApiCacheMetadata } from "@/types/api";

type CacheEntry<T> = {
  value: T;
  storedAt: number;
  expiresAt: number;
  ttlMs: number;
  lastAccessedAt: number;
};

type CacheNamespace = StalenessCategory | "dtppXml" | "frequencyLookup" | "airportReference";

const EXTRA_TTLS_MS: Record<Exclude<CacheNamespace, StalenessCategory>, number> = {
  dtppXml: 12 * 60 * 60 * 1000,
  frequencyLookup: 28 * 24 * 60 * 60 * 1000,
  airportReference: 28 * 24 * 60 * 60 * 1000
};

// Cache TTL overrides — decouple re-fetch interval from the staleness-warn threshold
// for feeds where new data can arrive much more frequently than the warn window.
const CACHE_TTL_OVERRIDES_MS: Partial<Record<StalenessCategory, number>> = {
  notam: 15 * 60 * 1000 // 15 min re-fetch; keep 2h/6h warn threshold in staleness.ts
};

const DEFAULT_MAX_ENTRIES = 250;

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
};

export const getCacheTtlMs = (namespace: CacheNamespace): number => {
  if (namespace in CACHE_TTL_OVERRIDES_MS) {
    return CACHE_TTL_OVERRIDES_MS[namespace as StalenessCategory]!;
  }
  return namespace in STALENESS_THRESHOLDS_MS
    ? STALENESS_THRESHOLDS_MS[namespace as StalenessCategory]
    : EXTRA_TTLS_MS[namespace as Exclude<CacheNamespace, StalenessCategory>];
};

export const createCacheKey = (namespace: string, params: unknown): string => `${namespace}:${stableStringify(params)}`;

class MemoryCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly maxEntries = DEFAULT_MAX_ENTRIES) {}

  get<T>(key: string, now = Date.now()): CacheEntry<T> | null {
    const entry = this.entries.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return null;
    }

    entry.lastAccessedAt = now;
    return entry;
  }

  set<T>(key: string, value: T, ttlMs: number, now = Date.now()): CacheEntry<T> {
    const entry: CacheEntry<T> = {
      value,
      storedAt: now,
      expiresAt: now + ttlMs,
      ttlMs,
      lastAccessedAt: now
    };

    this.entries.set(key, entry);
    this.evictIfNeeded();
    return entry;
  }

  invalidate(key: string): void {
    this.entries.delete(key);
  }

  invalidateByPrefix(prefix: string): number {
    let removed = 0;

    for (const key of this.entries.keys()) {
      if (key.startsWith(prefix)) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    return removed;
  }

  clear(): void {
    this.entries.clear();
  }

  private evictIfNeeded(): void {
    if (this.entries.size <= this.maxEntries) {
      return;
    }

    const sortedEntries = [...this.entries.entries()].sort(
      ([, left], [, right]) => left.lastAccessedAt - right.lastAccessedAt
    );

    while (this.entries.size > this.maxEntries && sortedEntries.length) {
      const [key] = sortedEntries.shift()!;
      this.entries.delete(key);
    }
  }
}

export const appCache = new MemoryCache();

export const toCacheMetadata = (
  key: string,
  entry: CacheEntry<unknown>,
  status: ApiCacheMetadata["status"],
  now = Date.now()
): ApiCacheMetadata => ({
  key,
  status,
  ageSeconds: Math.max(0, Math.floor((now - entry.storedAt) / 1000)),
  ttlSeconds: Math.max(1, Math.floor(entry.ttlMs / 1000)),
  cached: status === "hit"
});

export const getOrPopulateCache = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
  options: { bypass?: boolean } = {}
): Promise<{ value: T; cache: ApiCacheMetadata }> => {
  const now = Date.now();

  if (!options.bypass) {
    const cachedEntry = appCache.get<T>(key, now);

    if (cachedEntry) {
      return {
        value: cachedEntry.value,
        cache: toCacheMetadata(key, cachedEntry, "hit", now)
      };
    }
  } else {
    appCache.invalidate(key);
  }

  const value = await loader();
  const storedEntry = appCache.set(key, value, ttlMs, Date.now());

  return {
    value,
    cache: toCacheMetadata(key, storedEntry, options.bypass ? "bypass" : "miss", Date.now())
  };
};
