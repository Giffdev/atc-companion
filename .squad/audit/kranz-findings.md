# Kranz — Architecture & Refactor Audit Findings
**Date:** 2026-06-23  
**Scope:** Architecture, structural patterns, API envelope consistency, type hygiene, dead code  
**Status:** READ-ONLY — no code was modified during this pass

---

## Findings (ordered by severity)

---

### **[SEVERITY: HIGH]** Three API routes bypass the shared `ApiResponse<T>` envelope
**Files:** `src/app/api/adjacent/route.ts:10,14,17` · `src/app/api/plate-proxy/route.ts:11,25,29,43,61` · `src/app/api/atis/route.ts:9,14,63`

**WHAT is wrong:**  
All three routes use bare `NextResponse.json({ error: "..." })` or `NextResponse.json(rawData)` without the `ApiResponse<T>` wrapper, without `jsonWithStandardHeaders`, and without the standard error codes from `route-utils.ts`. Every other route (`weather`, `notams`, `frequencies`, `plates`, `traffic`, `regulatory`, `intent`, `query`) uses the full envelope.

**WHY it matters:**  
Any frontend consumer or API client that inspects `response.ok`, `response.data`, `response.error.code`, `X-Cache`, or `X-Source-Url` headers will find inconsistent shapes depending on which endpoint they hit. The `adjacent` route is used by the facility adjacency view; its `{ error: "..." }` response can never be distinguished from a successful empty result at the type level. The `atis` route is also diverged (acknowledged in scope constraints — noting for standardisation).

**HOW to fix:**  
Migrate all three to use `jsonWithStandardHeaders` + `createMissingParamResponse`/`createInvalidParamResponse` from `route-utils.ts`. `adjacent` should wrap its success payload in `createApiResponse(getAdjacentFacilities(facilityId), getDataSource(...), {...})`. `plate-proxy` is a binary-proxy so it can legitimately omit the JSON envelope for non-error responses but should use `createMissingParamResponse`/`createInvalidParamResponse` for its 4xx paths.

---

### **[SEVERITY: HIGH]** `plates.ts` — `getDtppAirportData` throws an `ApiResponse` object, not an `Error`
**File:** `src/services/plates.ts:97-111`

**WHAT is wrong:**  
```ts
throw createApiErrorResponse({ code: "AIRPORT_NOT_FOUND", ... }, { ... });
```
`getDtppAirportData` throws the return value of `createApiErrorResponse(...)` — a plain data object — as an exception. All five callers (`getPlates`, `getAirportDiagram`, `getSids`, `getStars`, `getOdps`) catch it with the guard `if (error && typeof error === "object" && "ok" in error)`. This is using data objects as error signals and is a structural inversion.

**WHY it matters:**  
Any unrelated `Error` thrown inside `getDtppAirportData` that happens to have an `ok` property (or any future code change that adds one) would be silently swallowed as an API error response. TypeScript cannot model that the thrown value is `ApiResponse`, so the catch guard is not type-safe. Stack traces become useless.

**HOW to fix:**  
Introduce a `DtppNotFoundError extends Error` carrying an `apiResponse: ApiResponse<never>` payload, or change `getDtppAirportData` to return `ApiResponse<DtppAirportPayload>` (a discriminated union result) instead of throwing. All five call sites would then type-narrow on `.ok` instead of catching.

---

### **[SEVERITY: HIGH]** `orchestrator.ts` `regulatory` case dispatches only to `searchFars`, not `searchAllRegulatory`
**File:** `src/services/orchestrator.ts:300-301`

**WHAT is wrong:**  
```ts
case "regulatory":
  return searchFars(intent.query, intent.part);
```
The intent-driven path through `/api/query` only queries eCFR (FARs). The direct `/api/regulatory` route with `scope=all` calls `searchAllRegulatory`, which also searches ATC Order 7110.65 references and AIM references.

**WHY it matters:**  
A user asking "what's the phraseology for a go-around?" via the query interface gets only eCFR results (likely empty), while hitting `/api/regulatory` directly returns the relevant ATC/AIM reference. Silent data divergence between the two data access paths for the same domain.

**HOW to fix:**  
Change line 301 to `return searchAllRegulatory(intent.query, intent.part);`. One-line fix.

---

### **[SEVERITY: HIGH]** `orchestrator.ts` `facility_info` silently handles unimplemented `query_type` values as "adjacent"
**File:** `src/services/orchestrator.ts:304-336`

**WHAT is wrong:**  
`FacilityInfoQuery` has 5 values: `"adjacent" | "overlying" | "underlying" | "general" | "airports"`. The orchestrator only explicitly branches on `"airports"`. All other values (`"overlying"`, `"underlying"`, `"general"`) fall through to `getAdjacentFacilities`, silently returning adjacent data instead of the requested relationship type.

**WHY it matters:**  
A user asking "what does SoCal TRACON underlie?" gets adjacent facilities instead of underlying sectors. Silent wrong-answer bug — the UI shows data that looks plausible but is semantically incorrect.

**HOW to fix:**  
Add explicit `if/else if` branches for each `query_type`. For unimplemented types, return `createApiErrorResponse` with `code: "NOT_IMPLEMENTED"` and `status: 501` rather than silently returning wrong data.

---

### **[SEVERITY: MED]** `readRequiredSearchParam` and `readOptionalSearchParam` are identical functions
**File:** `src/app/api/route-utils.ts:44-47` and `78-81`

**WHAT is wrong:**  
Both functions have exactly the same implementation body. The only difference is the name. Neither enforces "required" at runtime — callers still check for `null` themselves.

**WHY it matters:**  
Naming distinction implies semantic enforcement that does not exist. Dead duplicate code. New contributors may assume the "required" variant auto-validates.

**HOW to fix:**  
Delete `readOptionalSearchParam`; rename the remaining function to `readSearchParam`. Update all call sites (mechanical). Add a JSDoc clarifying the caller is responsible for null checks.

---

### **[SEVERITY: MED]** `findFirstPairValue` duplicated between `nfdc-html.ts` (exported) and `runway-info.ts` (local private)
**Files:** `src/services/nfdc-html.ts:84` · `src/services/runway-info.ts:185-191`

**WHAT is wrong:**  
`runway-info.ts` imports `collapseWhitespace`, `extractTableCellPairs`, `stripHtmlToText` from `nfdc-html.ts` (line 7) but defines its own local `findFirstPairValue` copy (line 185) with the identical signature and body. `nfdc-html.ts` already exports `findFirstPairValue`; `airport-hours.ts` imports it correctly.

**WHY it matters:**  
Any future bug fix in `nfdc-html.ts:findFirstPairValue` must be applied to both copies. Silent divergence risk.

**HOW to fix:**  
Add `findFirstPairValue` to the existing import from `nfdc-html.ts` in `runway-info.ts` and delete lines 185-191.

---

### **[SEVERITY: MED]** `BoundingBox` interface defined twice with different field shapes
**Files:** `src/types/intents.ts:3-8` · `src/services/traffic.ts:16-21`

**WHAT is wrong:**  
`intents.ts` defines `{ north, south, east, west }`. `traffic.ts` defines a private `{ minLat, minLon, maxLat, maxLon }`. The orchestrator manually translates between them at lines 233-240.

**WHY it matters:**  
Any future caller that passes an `intents.BoundingBox` directly to `getTraffic` will silently use the wrong field names and get no traffic. The translation step is easy to miss.

**HOW to fix:**  
Pick one canonical shape (NSEW is more idiomatic for geo APIs); export it from `src/types/aviation.ts` or a new `src/types/geo.ts`. Update `traffic.ts` and remove the manual mapping in the orchestrator.

---

### **[SEVERITY: MED]** `plates.ts` module-level `plateManifest` is undocumented in-process singleton state
**File:** `src/services/plates.ts:30`

**WHAT is wrong:**  
`const plateManifest = new Map<string, string>()` is module-level state. `getPlateUrl` reads from it. In serverless deployments, this is empty on cold start, so `getPlateUrl` returns `undefined` until a plate fetch has occurred in that process lifetime.

**WHY it matters:**  
Silent `undefined` return on cold start. `prewarmPlateCache` exists but is not guaranteed to run first.

**HOW to fix:**  
Option A: Remove `plateManifest` / `getPlateUrl`; callers should hold the URL from the plate fetch result. Option B: Wire `prewarmPlateCache` to a Next.js `instrumentation.ts` startup hook and document the invariant. If keeping the manifest, back it with `appCache` so TTL management is consistent.

---

### **[SEVERITY: MED]** `orchestrator.ts` `weather` outer `switch` case falls through to `plates` if inner switch has no default
**File:** `src/services/orchestrator.ts:203-213`

**WHAT is wrong:**  
`case "weather":` contains a nested `switch (intent.subtype)` with no `break` or `return` at the outer level. Today all `WeatherSubtype` values are covered so the inner switch always returns — but if a new subtype is added without updating the inner switch, the outer switch silently falls through to `case "plates":`.

**WHY it matters:**  
Latent silent-wrong-answer bug for the weather domain.

**HOW to fix:**  
Extract weather dispatch to a `dispatchWeatherIntent` helper, or add an explicit `return` after the inner switch: `throw new Error("Unreachable: unhandled weather subtype")`.

---

### **[SEVERITY: MED]** `/api/query` route inlines the same `DataSource` literal three times
**File:** `src/app/api/query/route.ts:29-33, 43-48, 53-57`

**WHAT is wrong:**  
The empty-input error branch copy-pastes `{ id: "internal-query-route", name: "Internal Query Route", url: "internal://query-route", ... }` three times. A nearly identical object also exists as `ORCHESTRATOR_SOURCE` in `orchestrator.ts`.

**HOW to fix:**  
Extract to a module-level `QUERY_ROUTE_SOURCE: DataSource` constant. Evaluate consolidating with `ORCHESTRATOR_SOURCE`.

---

### **[SEVERITY: LOW]** `services/regulatory.ts` dead export alias `searchRegulatory`
**File:** `src/services/regulatory.ts:262`

**WHAT is wrong:**  
`export const searchRegulatory = searchAllRegulatory;` is never imported anywhere (confirmed by grep).

**HOW to fix:** Delete line 262.

---

### **[SEVERITY: LOW]** `RATE_LIMIT_HEADERS` in `route-utils.ts` are hardcoded stubs
**File:** `src/app/api/route-utils.ts:6-13`

**WHAT is wrong:**  
`RateLimit-Remaining` is hardcoded to `"59"` on every response regardless of actual usage.

**WHY it matters:**  
Any client implementing exponential backoff based on these headers will be misled. If no real rate limiting exists, these headers should not be sent.

**HOW to fix:**  
Implement real rate limiting or remove the fake headers. At minimum, add a comment marking them as unimplemented stubs.

---

### **[SEVERITY: LOW]** `lib/utils.ts` exports `isStale` — overlaps with `isDataStale` from `staleness.ts`
**File:** `src/lib/utils.ts:7-8`

**WHAT is wrong:**  
`isStale(timestamp, thresholdMs)` is exported but only used in tests. All services use `isDataStale(fetchedAt, category)` from `staleness.ts`. Two functions with overlapping semantics.

**HOW to fix:**  
Remove `isStale` from the production module; replace test usage with `isDataStale` or an inline threshold comparison.

---

### **[SEVERITY: LOW]** `API_ENDPOINTS` constant is incomplete — omits `adjacent`, `atis`, `plate-proxy`, `search`
**File:** `src/lib/constants.ts:6-16`

**WHAT is wrong:**  
4 of 13 API routes are missing from the central constant, which means those URLs are hardcoded wherever they are used.

**HOW to fix:**  
Add the missing entries. If `search` is being deprecated in favour of `regulatory`, exclude it but add a deprecation comment.

---

### **[SEVERITY: LOW]** `_shared.ts:toIsoTimestamp` silently assumes numeric inputs are Unix seconds
**File:** `src/services/_shared.ts:43-56`

**WHAT is wrong:**  
`if (typeof value === "number") return new Date(value * 1000).toISOString();` — the `* 1000` conversion assumes the caller passes epoch seconds, not milliseconds. No JSDoc warns callers.

**HOW to fix:**  
Add `@param value - Unix epoch **seconds** (integer) or ISO string` JSDoc, or add a runtime guard detecting accidental millisecond inputs (`value > 1e12`).

---

## Top 5 Refactor Priorities

1. **Migrate `adjacent`, `plate-proxy`, `atis` to the standard `ApiResponse<T>` envelope** — Restores API consumer consistency across all 13 routes; medium effort, high impact on type-safety.

2. **Replace `getDtppAirportData` throw-an-ApiResponse antipattern** — All 5 plate/SID/STAR/ODP/diagram functions depend on this fragile catch guard. Replace with a typed discriminated union result.

3. **Fix `orchestrator.ts` regulatory dispatch and `facility_info` fallthrough** — Two silent wrong-answer data bugs reachable via normal user queries. Combined ~10-line fix.

4. **Consolidate `BoundingBox` into a canonical shared type; eliminate `findFirstPairValue` duplication** — Cleans up geo-domain and HTML-parsing-domain type hygiene before more callers accumulate.

5. **Delete `readOptionalSearchParam` and `searchRegulatory` dead code; complete `API_ENDPOINTS`** — Low-risk, high code-clarity cleanup sweep.

---

*Findings authored by Kranz (Lead/Architect agent) — audit pass only, no code modified.*
