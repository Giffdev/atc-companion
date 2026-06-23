# Mattingly Backend Audit — API / Service Layer
**Date:** 2026-06-23  
**Author:** Mattingly (Backend dev)  
**Scope:** `src/app/api/*/route.ts`, `src/services/*.ts`, `src/lib/`  
**Status:** READ-ONLY audit; no source modifications made.

---

## 🔴 Traffic-Service Cache Test Failures — Root Cause Verdict

**Verdict: DUAL ROOT CAUSE — Test Bug (primary) + Service Bug (secondary)**

### What the test runner confirms
Running `npx vitest run tests/unit/services/traffic-service.test.ts` surfaces exactly 3 failures:

| Test | Expected | Actual | Root cause |
|---|---|---|---|
| maps upstream 404/500/timeout → explicit error codes | `UPSTREAM_NOT_FOUND` / `UPSTREAM_SERVER_ERROR` / `UPSTREAM_TIMEOUT` | `UPSTREAM_UNAVAILABLE` (503) | **Test bug + Service bug** |
| uses cache metadata to avoid refetching | fetchMock called 1× | fetchMock called 3× | **Test bug** |
| bypasses cache when explicitly requested | fetchMock called 2× | fetchMock called 4× | **Test bug** |

### Root Cause A — Test Bug: ADSB.fi missing from mock fixture

`tests/fixtures/mock-aviation-fetch.ts:203` — `KEY_BY_URL` has **no entry for `opendata.adsb.fi/api/v2`**, but the service (`src/services/traffic.ts`) was refactored to call ADSB.fi as the **primary** source (OpenSky is now the fallback). Every `getTraffic(...)` call fires `https://opendata.adsb.fi/api/v2/lat/.../lon/.../dist/...` first. The mock's `vi.fn` finds no match and throws `new Error("Unexpected fetch URL in test: ...")`.

This plain `Error` (not `AbortError`, not `TypeError`, not `FetcherError`) is caught by `fetchWithRetry`'s catch block. Since `isAbort = false` and `isNetwork = false`, it falls through to `throw new FetcherError("Network request failed.", { code: "NETWORK_ERROR", ... })` — **no retry, 1 fetchMock call consumed per getTraffic invocation.**

The service catches this in the ADSB.fi `try/catch` and falls back to OpenSky. OpenSky **is** properly mocked, so data arrives — but at the cost of 1 extra mock call every time.

**Cache count math:**
- "avoid refetching" test: call 1 → ADSB.fi(fail) + OpenSky(miss) = 2; call 2 → ADSB.fi(fail) + OpenSky(**hit, no fetch**) = 1. Total = **3** (expected 1).
- "bypasses cache" test: call 1 → 2 fetches; call 2 (bypassCache) → ADSB.fi(fail) + OpenSky(bypass) = 2. Total = **4** (expected 2).

### Root Cause B — Service Bug: non-retryable 4xx errors fall through to OpenSky

`src/services/traffic.ts:203` — The ADSB.fi `catch` block unconditionally falls through to the OpenSky block for **all** errors, including non-retryable 4xx responses. When the error test overrides `opensky: new Response("not found", { status: 404 })`, the flow is:
1. ADSB.fi → no mock match → `FetcherError(NETWORK_ERROR)` → outer catch triggers
2. OpenSky → 404 → `FetcherError(UPSTREAM_NOT_FOUND)` thrown from `fetchWithRetry`
3. OpenSky catch block wraps it as `UPSTREAM_UNAVAILABLE` — test expects `UPSTREAM_NOT_FOUND`.

The intent of the error test is that 404/500/timeout from the primary source should propagate as `UPSTREAM_NOT_FOUND` / `UPSTREAM_SERVER_ERROR` / `UPSTREAM_TIMEOUT`. The current code always returns `UPSTREAM_UNAVAILABLE` regardless.

### Fix Plan

**Step 1 — Fix the mock fixture** (`tests/fixtures/mock-aviation-fetch.ts`):
```ts
// 1. Extend MockKey:
type MockKey = "metar" | "taf" | "pirep" | "notams" | "dtpp" | "opensky" | "ecfr" | "adsb-fi";

// 2. Add sample payload (AdsbFiResponse shape):
export const SAMPLE_ADSB_FI_PAYLOAD = {
  ac: [
    { hex: "a4b294", flight: "ASA123 ", lat: 47.533, lon: -122.302, alt_baro: 3000, gs: 120, track: 141, baro_rate: 0 },
    { hex: "a80811", flight: "DAL456 ", lat: 47.518, lon: -122.295, alt_baro: "ground", gs: 8, track: 321, baro_rate: 0 }
  ]
};

// 3. Add to KEY_BY_URL (before "opensky" so it matches first):
["adsb-fi", "opendata.adsb.fi/api/v2"],

// 4. Add default case in buildDefaultResponse:
case "adsb-fi":
  return jsonResponse(SAMPLE_ADSB_FI_PAYLOAD);
```

**Step 2 — Fix the error-code test** (`tests/unit/services/traffic-service.test.ts`):
Update all three sub-cases to override `"adsb-fi"` (the primary) instead of `"opensky"`:
```ts
installAviationApiMock({ "adsb-fi": new Response("not found", { status: 404 }) });
// ...
installAviationApiMock({ "adsb-fi": new Response("server down", { status: 500 }) });
// ...
installAviationApiMock({ "adsb-fi": adsbFiTimeoutFn });
```
BUT — these still fall through to OpenSky (which would succeed from the default mock). So the test will still fail unless both primary AND fallback are failed, or the service is fixed.

**Step 3 — Fix the service fallback logic** (`src/services/traffic.ts`):
Add a guard in the ADSB.fi catch block to re-throw non-retryable errors (4xx):
```ts
} catch (adsbError) {
  // Don't fall through to OpenSky for authoritative 4xx errors (404 = no traffic here)
  if (adsbError instanceof FetcherError && !adsbError.options.retryable) {
    return toServiceErrorResponse(adsbError, TRAFFIC_FALLBACK_SOURCE, "trafficTarget");
  }
  // Fall back to OpenSky only for retryable errors (5xx, timeout, network)
  try {
    // ... OpenSky fetch
```
With this + Step 2, the error-code test passes correctly:
- 404 from ADSB.fi → `FetcherError(UPSTREAM_NOT_FOUND, retryable: false)` → re-thrown → `UPSTREAM_NOT_FOUND` ✓
- 500 from ADSB.fi → `FetcherError(UPSTREAM_SERVER_ERROR, retryable: true)` → falls to OpenSky → OpenSky default mock succeeds → returns data (test would need adjustment — or override both)
- timeout from ADSB.fi → `FetcherError(UPSTREAM_TIMEOUT, retryable: true)` → falls to OpenSky

For 5xx and timeout the fallback-to-OpenSky behavior is **correct** (retryable). The error-code test should override ADSB.fi for 500/timeout AND ensure OpenSky also fails if the test wants an error response. Simplest fix: override both sources in the 500/timeout sub-cases.

---

## All Findings

---

### **[SEVERITY: HIGH]** ATIS route returns raw JSON instead of `ApiResponse<T>` envelope

**File:** `src/app/api/atis/route.ts:9, 63`

**WHAT:** The ATIS route returns `NextResponse.json({ error: "..." })` for errors and `NextResponse.json({ airports: results, fetchedAt: ... })` for success. Neither conforms to `ApiResponse<T>` (`src/types/api.ts`). The fields `ok`, `data`, `source`, `attribution`, `isStale`, `cache` are all absent. The route also bypasses `jsonWithStandardHeaders` entirely — so `X-Cache`, `X-Fetched-At`, `X-Source-Url`, `Cache-Control`, and rate-limit headers are all missing.

**WHY:** The route was written independently of the `route-utils.ts` + service pattern used by all other routes. It duplicates the `datis.ts` fetch logic inline rather than calling `getAtis(icao)`.

**HOW TO FIX:** Replace inline fetch with `getAtis(icao)` (the service already exists and returns `ApiResponse<AtisInfo[]>`). Wrap the per-airport responses using `jsonWithStandardHeaders(response, { status: getResponseStatus(response) })`. For the multi-airport batch, collect `ApiResponse` objects keyed by ICAO. Error validation (missing/empty `airports` param) should use `createMissingParamResponse`.

---

### **[SEVERITY: HIGH]** `adjacent` route returns raw JSON instead of `ApiResponse<T>` envelope

**File:** `src/app/api/adjacent/route.ts:10, 14, 17`

**WHAT:** Returns `NextResponse.json({ error: ... })` on error and a raw facility list on success — no `ok`, `data`, `source`, `attribution`, `isStale`, `cache` wrapper. Does not use `jsonWithStandardHeaders`, `createMissingParamResponse`, or `createApiErrorResponse`.

**WHY:** Likely written as a quick internal lookup without aligning to the API contract.

**HOW TO FIX:** Wrap the success payload in `createApiResponse(getAdjacentFacilities(facilityId), source, ...)` and use `createApiErrorResponse` for the 400/404 cases. Use `jsonWithStandardHeaders` for the response. The data source for `adjacent` should be added to `src/data/sources.ts` (e.g., `"facilityAdjacency"`).

---

### **[SEVERITY: MED]** `plate-proxy` fetch is unbounded — no timeout or AbortController

**File:** `src/app/api/plate-proxy/route.ts:36`

**WHAT:**
```ts
const response = await fetch(url, { headers: { "User-Agent": "..." } });
```
No `signal`, no `AbortSignal.timeout(...)`, no timeout at all. A slow or stalled `aeronav.faa.gov` response holds the Next.js handler indefinitely.

**WHY:** Raw `fetch` without the `fetchWithRetry` wrapper (appropriate here since it's a proxy, not a JSON API). Timeout protection was omitted.

**HOW TO FIX:**
```ts
const response = await fetch(url, {
  headers: { "User-Agent": "ATC-Companion/1.0 (FAA chart viewer)" },
  signal: AbortSignal.timeout(15_000)
});
```
Catch the `AbortError` in the existing `catch` block and return 504.

---

### **[SEVERITY: MED]** `fetchNfdcFrequencies` is unbounded — raw `fetch` without timeout

**File:** `src/services/frequencies.ts:33`

**WHAT:**
```ts
const response = await fetch(url, { next: { revalidate: 86400 } });
```
Direct `fetch` with no `signal` or AbortController. All other service fetches go through `fetchWithRetry` which enforces a 10-second timeout via `AbortController`. NFDC HTML scraping is inherently fragile and this path has no timeout protection.

**WHY:** `fetchWithRetry` is designed for JSON/text APIs and doesn't easily accommodate the HTML scraping + frequency parsing pipeline here. Raw `fetch` was chosen but the timeout was forgotten.

**HOW TO FIX:** Add `signal: AbortSignal.timeout(10_000)` to the fetch options. The existing `if (!response.ok) return []` handler already catches HTTP errors; add a `try/catch` around the `fetch` itself to handle `AbortError` and return `[]`.

---

### **[SEVERITY: MED]** ATIS service caches error responses inside `getOrPopulateCache`

**File:** `src/services/datis.ts:82–147`

**WHAT:** The `getOrPopulateCache` loader `return`s error `ApiResponse` objects (`DATIS_UNAVAILABLE`, `DATIS_EMPTY`, `DATIS_FETCH_ERROR`) rather than throwing. These error responses are stored in the cache for the full 90-second TTL. Any caller within that window gets the cached error rather than a fresh attempt.

**WHY:** The loader was written to never throw, returning a `Result`-style value. This is inconsistent with how weather, plates, and notams services work — they `throw` on error from inside the loader, which prevents caching the error.

**HOW TO FIX:** Inside the loader, `throw` instead of returning the error response. Wrap the `getOrPopulateCache` call in a `try/catch` to convert the thrown error into the `ApiResponse` error. Example:
```ts
try {
  const { value } = await getOrPopulateCache(cacheKey, DATIS_TTL_MS, async () => {
    // ... on error: throw new Error(...) or throw a FetcherError
    return entries; // only on success
  });
  return createApiResponse(value, source, ...);
} catch (err) {
  return createApiErrorResponse(...);
}
```

---

### **[SEVERITY: MED]** Traffic service: non-retryable ADSB.fi errors fall through to OpenSky fallback

**File:** `src/services/traffic.ts:203`

**WHAT:** The ADSB.fi `catch` block unconditionally falls through to the OpenSky path for all error types, including non-retryable 4xx. A `404` from ADSB.fi ("no aircraft found for this area") should be authoritative — there is no reason to try OpenSky. Instead, the service makes an unnecessary second request and, if OpenSky also fails, returns `UPSTREAM_UNAVAILABLE` rather than a meaningful code.

**WHY:** The dual-fallback logic was added without distinguishing retryable vs. non-retryable failures from the primary source.

**HOW TO FIX:** In the ADSB.fi catch:
```ts
} catch (adsbError) {
  if (adsbError instanceof FetcherError && !adsbError.options.retryable) {
    return toServiceErrorResponse(adsbError, TRAFFIC_FALLBACK_SOURCE, "trafficTarget");
  }
  // Only fall through to OpenSky for retryable errors (5xx, timeout, network)
  ...
```
`FetcherError.options.retryable` is `false` for 4xx (see `fetcher.ts:155`).

---

### **[SEVERITY: LOW]** Traffic/weather route `refresh` shows `cache.status: "miss"` not `"bypass"`

**Files:** `src/app/api/traffic/route.ts:49–53`, `src/app/api/weather/route.ts:25–29`

**WHAT:** Routes call `appCache.invalidateByPrefix(...)` then call the service **without** passing `bypassCache: true`. The service sees a normal cache miss (entry was deleted) and returns `cache.status: "miss"`. Clients monitoring `X-Cache: MISS` vs `X-Cache: BYPASS` cannot distinguish a natural miss from a forced refresh.

**WHY:** Functionally equivalent for data correctness. The `bypassCache: true` flag was not threaded through from the route's `refresh` param.

**HOW TO FIX:** Pass `bypassCache: refresh` to the service call:
```ts
const response = await getTraffic({ airport: ..., bounds: ..., bypassCache: refresh });
```
Remove the separate `invalidateByPrefix` call (the `bypassCache` path inside `getOrPopulateCache` already calls `appCache.invalidate(key)` before re-fetching).

---

### **[SEVERITY: LOW]** Traffic ADSB.fi cache key uses raw bounding box instead of center point

**File:** `src/services/traffic.ts:190–195`

**WHAT:**
```ts
cacheKey: createCacheKey("traffic-search", {
  airport: params.airport ? toIcaoCode(params.airport) : null,
  bounds,           // <-- full BoundingBox object
  provider: "adsb-fi"
})
```
The actual ADSB.fi URL uses `centerLat.toFixed(4)` / `centerLon.toFixed(4)`. Two different calls that produce the same center (e.g., bounds queries slightly offset) will generate different cache keys for what is effectively the same upstream request. Not a correctness bug (you always get fresh data), but wasted cache capacity.

**HOW TO FIX:** Key on `centerLat.toFixed(4)`, `centerLon.toFixed(4)`, and `TRAFFIC_RADIUS_NM` instead of the raw `bounds` object.

---

## Summary Table

| # | Severity | Area | Finding | File |
|---|---|---|---|---|
| 1 | HIGH | Tests | Missing ADSB.fi mock key → all traffic cache tests fail | `tests/fixtures/mock-aviation-fetch.ts:203` |
| 2 | HIGH | Service | Non-retryable ADSB.fi 4xx falls through to OpenSky (wrong codes) | `src/services/traffic.ts:203` |
| 3 | HIGH | Route | ATIS route returns raw JSON, not `ApiResponse<T>` envelope | `src/app/api/atis/route.ts:9,63` |
| 4 | HIGH | Route | Adjacent route returns raw JSON, not `ApiResponse<T>` envelope | `src/app/api/adjacent/route.ts:10,17` |
| 5 | MED | Route | plate-proxy fetch unbounded — no timeout | `src/app/api/plate-proxy/route.ts:36` |
| 6 | MED | Service | fetchNfdcFrequencies unbounded — raw fetch, no timeout | `src/services/frequencies.ts:33` |
| 7 | MED | Service | ATIS service caches error responses (90s error lock-in) | `src/services/datis.ts:82–147` |
| 8 | MED | Service | ADSB.fi non-retryable fallback — service bug enabling test failure | `src/services/traffic.ts:203` |
| 9 | LOW | Route | `refresh` reports `cache.status: "miss"` not `"bypass"` | `src/app/api/traffic/route.ts:49`, `weather/route.ts:25` |
| 10 | LOW | Cache | Traffic ADSB.fi cache key uses raw bounds vs center-point | `src/services/traffic.ts:190` |

---

## What Passes Cleanly (no findings)

- `src/lib/cache.ts` — `MemoryCache`, `getOrPopulateCache`, `toCacheMetadata`, `createCacheKey`: logic is correct. LRU eviction is sound. Bypass path correctly invalidates before re-populating.
- `src/lib/fetcher.ts` — All fetches are bounded (10s timeout + AbortController). Retry logic correctly distinguishes retryable vs non-retryable status codes. Cache integration via `getOrPopulateCache` is correct.
- `src/lib/utils.ts` — `createApiResponse` / `createApiErrorResponse` correctly produces `ApiResponse<T>` envelope.
- `src/services/weather.ts` — Error handling consistent; `toServiceErrorResponse` used in catch blocks; `bypassCache` threaded through correctly.
- `src/services/plates.ts` — Error handling consistent; DTPP cache key uses stable `{ cycle: "current" }` (single global XML file, correct).
- `src/services/notams.ts` — Cache keys include all discriminating params (airport + typeFilter + provider). Fallback chain is sound.
- `src/services/regulatory.ts` — Local search cache keys include query; `fetchWithRetry` used for eCFR with proper timeout.
- `src/app/api/route-utils.ts` — `jsonWithStandardHeaders` correctly sets `Cache-Control`, `X-Cache`, `Age`, `X-Source-Url`, rate-limit headers.
