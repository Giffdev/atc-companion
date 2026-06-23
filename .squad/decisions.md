# ATC Companion — Decisions

## Decision Log

### 2026-06-17: Team formed — Apollo 13 cast
**By:** Devin Sinha
**What:** Team assembled with Kranz (Lead), Swigert (Frontend), Mattingly (Backend), Aaron (Aviation Data), Haise (AI/NLP), Lovell (Tester/Safety). Universe: Apollo 13.
**Why:** Project kickoff. YOLO mode — autonomous execution, no approval gates.

### 2026-06-17: Core architecture — Next.js full-stack
**By:** Devin Sinha
**What:** Next.js App Router with TypeScript. Server-side API routes proxy all external data sources. Web Speech API for voice input with Whisper fallback. Dark high-contrast UI optimized for tower environments.
**Why:** User requirement. Single deployable app, SSR for performance, API routes for secure key management.

### 2026-06-17: Data integrity policy — NEVER fabricate
**By:** Devin Sinha
**What:** Aviation data must NEVER be fabricated or hallucinated. All data must come from authoritative sources (FAA, aviationweather.gov, OpenSky). Every data point must include source attribution and timestamp. Stale data must be flagged. AI/LLM is used ONLY for intent parsing, never for generating aviation data.
**Why:** Safety-critical application. Incorrect aviation data can endanger lives.

### 2026-06-23: D-ATIS staleness threshold — 30 minutes
**By:** Aaron (Aviation Data Specialist)
**What:** `ATIS_STALE_THRESHOLD_MIN` set to 30 (down from 60). clowd.io rated reliability: medium — can lag the authoritative FAA D-ATIS by one or more letters. The `issuedAt` timestamp and ATIS letter must always be visible to the user.
**Why:** At 60 min a 54-min-old ATIS would not warn; at 30 min it correctly flags. Partially compensates for unknown clowd.io polling latency. Earlier "verify this letter" signal reduces risk. Full rationale: `docs/data-sources/datis.md`.

### 2026-06-23: D-ATIS source — retain clowd.io; FAA SWIM deferred
**By:** Aaron (Aviation Data Specialist)
**What:** No currently available public REST source is meaningfully fresher or more authoritative than clowd.io. Retain clowd.io with 30-min threshold. Pursue FAA SWIM only if the project formally engages as an aviation data services partner.
**Why:** FAA SWIM requires NASG gateway and formal application; nasstatus.com has ToS risk and is fragile.

### 2026-06-23: D-ATIS — parse issuance time from HHMMZ token
**By:** Mattingly (Backend Dev)
**What:** `parseAtisIssuanceTime(datis, nowMs?)` added to `src/services/datis.ts`. Extracts `HHMMZ` token from D-ATIS text and constructs an absolute ISO UTC timestamp. Handles day-rollover near 00Z. `AtisInfo` extended with `issuedAt: string|null`, `ageMinutes: number|null`, `stale: boolean`. `route.ts` updated to expose all three fields. Optional `nowMs` param added for testability.
**Why:** The UI was showing fetch time as ATIS currency. clowd.io can lag FAA D-ATIS by 45–55 min; displaying fetch time masked real staleness.

### 2026-06-23: ATIS currency display overhaul (AtisStrip.tsx)
**By:** Swigert (Frontend Dev)
**What:** Airport chip now shows ATIS issue time as primary timestamp. Stale ATIS triggers amber ring, compact `STALE` badge (`aria-label="Stale ATIS"`), and amber panel border/bg. `role="alert"` on expanded warning. "Checked" label demoted to clarify it is the data-fetch time. `toHHMMZ` helper converts ISO-8601 `issuedAt` to `HHMMZ` display format at all three render sites.
**Why:** Displaying fetch time as currency was dangerous in ATC context. Lovell safety review found R1 (route missing fields) and R2 (ISO vs HHMM mismatch); both fixed before ship.

### 2026-06-23: ATIS Phase 1 safety review — conditional pass
**By:** Lovell (Tester / Safety)
**What:** 🟡 Conditional pass. R1 (route.ts not exposing issuedAt/ageMinutes/stale) and R2 (ISO vs HHMM mismatch in AtisStrip) were required fixes; both resolved by Swigert-1 and Mattingly-1. 15 new ATIS unit tests added — all pass. 6 pre-existing unrelated failures unchanged.
**Why:** Safety-critical data display must surface actual ATIS age, not fetch time.

### 2026-06-23: API envelope inconsistency — 3 routes use bare NextResponse.json
**By:** Kranz (Tech Lead)
**What:** `adjacent/route.ts`, `plate-proxy/route.ts`, and `atis/route.ts` bypass the shared `ApiResponse<T>` envelope. Fix order: (1) `adjacent` — wrap data in `createApiResponse`; (2) `plate-proxy` — wrap 4xx error responses only, keep binary 200; (3) `atis` — Phase 3 (post Phase-2 freeze).
**Why:** Inconsistency breaks shared error-handling middleware, API client SDK assertions, and blocks the unified source-attribution/staleness-badge UI. Severity HIGH. Ref: `kranz-findings.md`.

### 2026-06-23: Phase 2 data audit — staleness threshold table finalized
**By:** Aaron (Aviation Data Specialist)
**What:** 4 HIGH / 4 MED / 4 LOW findings. Four decisions adopted: (F-01) `formatTimestamp` must add `timeZone:"UTC"`; (F-02) METAR staleness must use `observedAt` not `fetchedAt`, threshold 45 min; (F-03) `toIsoTimestamp` must normalize tz-ambiguous strings by appending `Z`; (F-04) NOTAM cache TTL decoupled from staleness — cache=15 min, warn=2h (TFR/FDC)/6h (D-type). Authoritative threshold table: METAR 45 min, TAF 6h, PIREP 60 min (UUA 30 min), NOTAM cache 15 min/warn 2h, Traffic 30 s.
**Why:** Safety defects: formatTimestamp was emitting local time; METAR staleness never fired (cache TTL = threshold); TFR NOTAMs could be 12h stale in cache.

### 2026-06-23: Failing test triage — Lovell Phase 2 audit
**By:** Lovell (Tester / Safety)
**What:** 6 scoped failures root-caused. KTCM missing from `TOWERED_AIRPORTS` (real product bug → data team). OperationsConsole auto-refresh ×2 (stale tests — warmup fetch added post-write). Traffic-service error-code ×1 + cache ×2 (test + service dual root cause: ADSB.fi mock missing, non-retryable 4xx should not fall through to OpenSky). Source-verification allowlist gap (`opendata.adsb.fi` missing — escalated to data owner).
**Why:** Findings delivered; awaiting Devin triage and dispatch per fix-ownership table in inbox record.

### 2026-06-23: Traffic-service test failures — dual root cause
**By:** Mattingly (Backend Dev)
**What:** Primary: `mock-aviation-fetch.ts` has no `opendata.adsb.fi` entry — every test call fires un-matchable fetch, consuming a mock slot and triggering OpenSky fallback. Secondary: `traffic.ts:203` catches ALL ADSB.fi errors and unconditionally retries OpenSky; non-retryable 4xx should not fall through. Fix requires: (1) add `adsb-fi` mock key + payload + URL mapping; (2) update error-code test to override `adsb-fi`; (3) guard non-retryable `FetcherError` in `traffic.ts:203`.
**Why:** Cache-count tests fail (3 vs expected) and error-code test sees `UPSTREAM_UNAVAILABLE` instead of `UPSTREAM_NOT_FOUND` — both incorrect production behaviors.

### 2026-06-23: UX/A11y audit — Phase 2 findings
**By:** Swigert (Frontend Dev)
**What:** 16 findings: 7 HIGH (safety-critical) / 6 MED / 3 LOW. Three components carry the fetch-time-vs-data-time bug: WeatherDisplay/SourceBadge (F1), FacilityOverview ATIS (F2), StatusBar frozen SSR time (F3). 12 real no-floating-promises lint bugs cause silent panel failures (F7). Full findings in `.squad/audit/swigert-findings.md`. Audit is read-only.
**Why:** Phase 2 safety pass. F1/F2/F3/F5 were dispatched to Wave 1. F7 reserved for a dedicated promise-hygiene pass.

### 2026-06-23: Phase 2b Wave 1 — Orchestrator regulatory dispatch + facility_info 501
**By:** Mattingly (Backend Dev)
**What:** T1g — `dispatchIntent` regulatory case changed from `searchFars` → `searchAllRegulatory`; now queries eCFR + ATC Order 7110.65 + AIM references via `Promise.all`. T1h — explicit guard block returns `NOT_IMPLEMENTED` 501 for `overlying`, `underlying`, and `general` `FacilityInfoQuery` types instead of silently returning adjacent-facility data. File: `src/services/orchestrator.ts`. Build clean; 0 new failures.
**Why:** T1g: natural-language `/api/query` regulatory path returned empty results while `/api/regulatory?scope=all` returned correct data — silent divergence. T1h: wrong-query-type silently returned plausible-but-wrong data.

### 2026-06-23: Phase 2b Wave 1 — Data correctness fixes (UTC, NOTAM cache, METAR staleness, KTCM, adsb.fi)
**By:** Aaron (Aviation Data Specialist)
**What:** T1c — `Metar` gains `ageMinutes`/`stale`; staleness uses `observedAt` (45 min threshold). T1d — `formatTimestamp` adds `timeZone:"UTC"`. T1e — `toIsoTimestamp` appends `Z` to tz-ambiguous strings. T1f — NOTAM cache TTL → 15 min (`cache.ts`), warn threshold → 2h (`staleness.ts`). T1i — `KTCM` added to `TOWERED_AIRPORTS`. T1j+T3c — `opendata.adsb.fi` added to `AUTHORITATIVE_DOMAIN_ALLOWLIST`. Build clean; facility-adjacency and source-verification tests now pass.
**Why:** Implementing Phase 2 audit decisions F-01 through F-04 plus data coverage gaps found by Lovell.

### 2026-06-23: Phase 2b Wave 1 — Frontend staleness & error-state fixes
**By:** Swigert (Frontend Dev)
**What:** T1a — FacilityOverview now imports canonical `AtisEntry`+`toHHMMZ` from AtisStrip; amber ring + STALE badge propagated to airport overview cards. T1b (WeatherDisplay) — METAR stale ring/badge/`Observed HHMMZ` label; imports `toHHMMZ`. T1b (StatusBar) — `"use client"` + `setInterval(30s)` replaces frozen SSR `referenceTime`. T1k — AtisStrip explicit error state: `⚠ ATIS unavailable` with `role="alert"` on fetch failure. Collateral: `demo-results.ts` Metar mock updated for new required fields. Build clean; 92 passed / 5 pre-existing failures.
**Why:** UX audit F1/F2/F3/F5 — fetch-time-vs-data-time bugs and missing error states were safety defects in a tower-environment tool.

### 2026-06-23: NOTAM classifier contract — category, criticality, summary, active/upcoming helpers
**By:** Aaron (Aviation Data Specialist)
**What:** Added `NotamCategory`, `BaseNotam.category`, `BaseNotam.isCritical`, and optional `BaseNotam.summary`; implemented `classifyNotam()`, `isNotamActive()`, and `isNotamUpcoming()` in `src/services/notams.ts`; added 19 classifier tests. Critical categories are airport closure, runway closure, and TFR. Unparseable effective time is treated fail-safe active.
**Why:** Facility badges and NOTAM panels need one shared server-side criticality contract; UI must consume classification rather than re-implementing safety heuristics.

### 2026-06-23: Phase 2b Wave 2 — Traffic API robustness and ADSB.fi mock contract
**By:** Mattingly (Backend Dev)
**What:** `traffic.ts` now stops OpenSky fallback for non-retryable ADSB.fi `FetcherError` 4xx and propagates OpenSky `FetcherError` codes. `mock-aviation-fetch.ts` now has `adsb-fi` key/payload/URL mapping. T2b plates handling and T2d timeout audit needed no changes. Three traffic tests pass.
**Why:** ADSB.fi 4xx is authoritative and should not be retried through OpenSky; tests were consuming unexpected mock slots because ADSB.fi lacked a fixture branch.

### 2026-06-23: NOTAM UI — critical card badge and grouped active/upcoming panel
**By:** Swigert (Frontend Dev)
**What:** `NotamList.tsx` groups active and upcoming NOTAMs, excludes expired entries, sorts active critical-first by category severity, and shows category chips plus critical badges. `FacilityOverview.tsx` accepts `notams?` and renders a critical NOTAM card badge. `OperationsConsole.tsx` threads `dashboardData.notams`; demo data includes an active runway-closure NOTAM.
**Why:** Tower UI must surface safety-critical active NOTAMs inline without duplicating Aaron's classifier logic.

### 2026-06-23: Wave 3 frontend a11y and promise hygiene
**By:** Swigert (Frontend Dev)
**What:** `QueryInput.tsx` now has accessible labels for query and voice controls. `AtisStrip.tsx` and `OperationsConsole.tsx` mark intentional fire-and-forget async work with `void`, wrap interval callbacks, remove unused types, and use narrow eslint disables only for known React hook false positives/intentional hydration or dependency patterns. Targeted lint is clean.
**Why:** Placeholder/hidden responsive labels are not reliable accessible names, and floating promises can hide panel or fetch failures.

### 2026-06-23: Wave 3 backend dedup — canonical helper reuse
**By:** Mattingly (Backend Dev)
**What:** Removed the private `findFirstPairValue` copy from `runway-info.ts` and imports the canonical helper from `nfdc-html.ts`. `adjacent/route.ts` now uses `readRequiredSearchParam`; `intent/route.ts` uses `readOptionalSearchParam`. `atis` and `plate-proxy` remain deferred because their parsing/envelope patterns differ.
**Why:** Duplicate parsing helpers drift over time and make future API-envelope work riskier. Build and targeted lint are clean.

### 2026-06-23: Wave 3 test stabilization and coverage expansion
**By:** Lovell (Tester / Safety)
**What:** Fixed two OperationsConsole autorefresh tests by draining the mount warmup fetch and clearing mocks before click assertions. Added four test files: NOTAM service (9), orchestrator (8), frequencies service (7), and ATIS route (12). Final reported suite: 152 passed, 0 failed.
**Why:** Tests needed to reflect warmup fetch behavior without weakening assertions, and Wave 1/2/NOTAM contracts needed durable coverage.

### 2026-06-23: NOTAM service lint cleanup — delete dead FAA TFR URL constant
**By:** Aaron (Aviation Data Specialist)
**What:** Removed unused `FAA_TFR_SEARCH_URL` from `src/services/notams.ts`.
**Why:** The constant had no consumers, and inventing one would risk changing the validated NOTAM classifier/data path solely to satisfy lint.

### 2026-06-23: Frontend lint cleanup — render purity and promise hygiene complete
**By:** Swigert (Frontend Dev)
**What:** Removed unused NOTAM chip import; moved Date.now()-during-render logic in `FacilityOverview` and `NotamList` into stable state plus `useMemo`; hoisted category weights; fixed `PlateViewer`, `StatusBar`, and `TrafficMap` lint issues with minimal refactors/targeted disable. Repo-wide lint exits 0.
**Why:** The repo lint gate requires stable render semantics and explicit promise handling; the team ends Wave 3 lint-clean.


### 2026-06-23T15:06:00-07:00: NOTAM live feed requires FAA credentials; no keyless fallback
**By:** Aaron (Data)

**What:** Removed the dead AviationAPI no-key fallback and made the NOTAM service explicitly depend on official FAA NOTAM/NMS machine-to-machine credentials for inline NOTAMs. When credentials are not configured, the service returns a clear `NOTAM_FEED_NOT_CONFIGURED` envelope with an FAA NOTAM Search deep link, and the UI renders that as an intentional degraded state instead of an unexplained empty panel.

**Evidence:** `api.aviationapi.com` has no A/AAAA DNS answer from this network; API-looking AviationAPI paths return an app shell rather than JSON. No replacement AviationAPI API host was found. Public/keyless alternatives investigated were not shippable defaults: FAA NOTAM Search is an HTML portal, NASA DIP exposes a catalog/web client but not a verified unauthenticated airport NOTAM JSON endpoint, and SkyLink/RapidAPI requires a key.

**Implementation direction:** Official keyed path sends `client_id` and `client_secret` headers, queries `icaoLocation` with `responseFormat=geoJson`, and parses the FAA GeoJSON-ish `items[].properties.coreNOTAMData.notam` shape in addition to legacy flat test shapes. Supported environment variables are `FAA_NOTAM_CLIENT_ID` / `FAA_NOTAM_CLIENT_SECRET`, with legacy aliases `FAA_NMS_CLIENT_ID` / `FAA_NMS_CLIENT_SECRET`. Do not use `FAA_NOTAM_API_KEY`, `FAA_NMS_API_KEY`, or `api.aviationapi.com` going forward.

**Why:** Inline NOTAMs cannot honestly be provided from a viable keyless live source. Provision FAA NOTAM/NMS credentials in Vercel after FAA API/NMS onboarding; without those credentials, inline NOTAMs remain unavailable by design and the app links users to official FAA NOTAM Search.

### 2026-06-23T15:01:06-07:00: T2a envelope migration contract
**By:** Kranz

**What:** Ratified the T2a `ApiResponse<T>` envelope migration contract. `/api/plate-proxy` is excluded from success-envelope standardization because its 200 response is a binary document passthrough consumed by iframe/source URLs; only JSON error paths may optionally be normalized. `/api/atis` becomes `ApiResponse<AtisBatchData>` with route-level `fetchedAt`, unchanged per-airport null semantics, and `DATIS_BATCH_SOURCE`. `/api/adjacent` becomes `ApiResponse<AdjacentFacilityResult>` with a local/static adjacency source descriptor. Consumers update `AtisStrip.tsx` and `FacilityOverview.tsx` to unwrap `ApiResponse<Record<string, AtisEntry | null>>`; PlateViewer and DiagramPanel must not change. Tests must update ATIS route, adjacent integration assertions, and add/record the AtisStrip envelope consumer coverage gap as specified in the inbox contract.

**Why:** The codebase already standardizes JSON service/route payloads on `ApiResponse<T>`, but `/api/atis` and `/api/adjacent` are JSON outliers. `/api/plate-proxy` only looks like an outlier; JSON-wrapping its success would break chart/document rendering. This contract isolates the binary exemption, preserves ATIS batch semantics, and provides a lockstep implementation/test order so backend and frontend do not land incompatible shapes.

**Reference:** Full implementation contract was merged from `decisions/inbox/kranz-t2a-contract.md` on 2026-06-23T15:23:00Z.

### 2026-06-23T15:22:00Z: Keep NOTAM fallback UI in lockstep with service error code
**By:** Swigert

**What:** Updated the secondary Operations Console NOTAM fallback render path to recognize both `NOTAM_FEED_NOT_CONFIGURED` and legacy `NOTAM_EMBEDDED_SEARCH` error codes.

**Why:** The live NOTAM service now emits `NOTAM_FEED_NOT_CONFIGURED`; accepting both codes preserves the dedicated FAA NOTAM Search link for current responses while remaining tolerant of cached legacy responses.


#### T2a detailed implementation contract (merged from inbox)

1. **plate-proxy ruling.**
   - `src/app/api/plate-proxy/route.ts` is EXCLUDED from `ApiResponse<T>` success-envelope standardization. Evidence: success path reads upstream `arrayBuffer()` and returns `new NextResponse(body, { status: 200, headers: { "Content-Type": contentType } })`; consumers use the route as a document URL via `PlateViewer.tsx` and `DiagramPanel.tsx` iframe/source URLs.
   - Mattingly must NOT JSON-wrap the PDF/HTML success stream. Success bytes, `Content-Type`, and cache headers remain untouched.
   - Optional/allowed change only: normalize error JSON (`missing url`, invalid URL, disallowed host, upstream failure, catch) into `ApiResponse<never>` with `createApiErrorResponse`, `jsonWithStandardHeaders`, and `getResponseStatus`, because those are JSON responses already. If done, set `source` to FAA DTPP/NFDC passthrough source as appropriate. If this is too much for T2a, leave errors unchanged.
   - Required code comment in `plate-proxy/route.ts` above the success response: `// Binary passthrough exemption: this route is consumed as an iframe/src URL, so the 200 response must remain raw bytes and must not be wrapped in ApiResponse<T>. Only JSON error paths may use the envelope.`

2. **atis enveloped shape.**
   - Route: `src/app/api/atis/route.ts` becomes `ApiResponse<AtisBatchData>`.
   - Exact payload type:
     ```ts
     export interface AtisLetterPayload {
       letter: string;
       type: "combined" | "departure" | "arrival";
       fullText: string;
       fetchedAt: string;
       issuedAt: string | null;
       ageMinutes: number | null;
       stale: boolean;
     }
     export type AtisBatchData = Record<string, AtisLetterPayload | null>;
     ```
   - Success body shape is exactly `{ ok: true, data: AtisBatchData, source, attribution: { primary: source }, fetchedAt, isStale, stalenessWarning?, cache? }`.
   - There is no top-level `airports` property and no nested `data.airports` wrapper. The old `{ airports, fetchedAt }` becomes `data` plus envelope `fetchedAt`.
   - Per-airport record fields are unchanged from current route behavior; null semantics are unchanged (`null` for upstream non-OK, empty array, malformed/empty response, or fetch exception for that airport).
   - `fetchedAt` rules: compute one route-level `const fetchedAt = toIsoNow()` after validation and before launching the batch. Use that same `fetchedAt` for the envelope and every non-null `AtisLetterPayload.fetchedAt`; do not call `new Date().toISOString()` separately per airport.
   - `issuedAt`, `ageMinutes`, and `stale` continue to use `parseAtisIssuanceTime` and `ATIS_STALE_THRESHOLD_MIN` from `src/services/datis.ts`.
   - Source descriptor is exact:
     ```ts
     const DATIS_BATCH_SOURCE: DataSource = {
       id: "datis-clowd",
       name: "FAA D-ATIS (clowd.io)",
       url: "https://datis.clowd.io/api",
       reliability: "medium",
       refresh_interval: "60s"
     };
     ```
     `source` and `attribution.primary` both use this descriptor. Do not use `withSourceUrl` for a single airport URL on the batch route because the request may contain up to 10 airports.
   - Implementation decision: keep the route's existing up-to-10-airport `Promise.allSettled` batch loop and wrap the final `Record` with `createApiResponse(results, DATIS_BATCH_SOURCE, { fetchedAt })`. Do not switch this route to `getAtis()` per airport in T2a. Reason: `getAtis()` returns `ApiResponse<AtisInfo[]>` and preserves all D-ATIS entries, while the route currently returns one preferred `combined` entry per airport plus `null` per failed airport. Keeping the loop preserves response semantics, request concurrency, and failure isolation; this migration changes only the envelope.
   - Validation errors: replace `{ error: string }` with `createApiErrorResponse(...)` using `DATIS_BATCH_SOURCE`, `data:null`, `ok:false`, and error statuses set to 400. Codes: missing airports => `MISSING_REQUIRED_PARAMETER` / `Missing required parameter: airports` / 400; empty/invalid after trimming => `INVALID_PARAMETER` / `Invalid parameter: airports` / details `Provide at least one comma-separated ICAO code.` / 400.
   - Response writing: use `jsonWithStandardHeaders(response, { status: getResponseStatus(response) })` for both success and error envelopes. Import `createApiResponse`, `createApiErrorResponse`, `toIsoNow` from `@/lib/utils`, `jsonWithStandardHeaders` and `getResponseStatus` from `@/app/api/route-utils`, and `DataSource`/`ApiResponse` types as needed.

3. **adjacent enveloped shape.**
   - Route: `src/app/api/adjacent/route.ts` becomes `ApiResponse<AdjacentFacilityResult>` where `AdjacentFacilityResult` is the existing exported type from `src/data/facility-adjacency.ts`: `{ facility, overlying?, adjacentCenters, adjacentApproach, adjacentTowers }`.
   - Success body shape is exactly `createApiResponse(getAdjacentFacilities(facilityId), ADJACENCY_SOURCE, { fetchedAt })`; consumers must read `payload.data.facility`, `payload.data.adjacentCenters`, etc.
   - Source descriptor is local/static, not an external network feed:
     ```ts
     const ADJACENCY_SOURCE: DataSource = {
       id: "atc-companion-facility-adjacency",
       name: "ATC Companion facility adjacency dataset",
       url: "local://src/data/facility-adjacency.ts",
       reliability: "medium",
       refresh_interval: "static bundled data"
     };
     ```
   - Errors: missing `facility` becomes `MISSING_REQUIRED_PARAMETER` status 400; unknown facility becomes `NOT_FOUND` status 404. Both use `createApiErrorResponse(..., { source: ADJACENCY_SOURCE })` and `jsonWithStandardHeaders(..., { status: getResponseStatus(response) })`.
   - Consumer check: no app fetch of `/api/adjacent`; server-side orchestration imports `getAdjacentFacilities` directly and is unaffected. Even with zero route consumers, standardize this route now for consistency and because tests are the only known route-level consumers.

4. **Consumer migration list.**
   - `src/components/AtisStrip.tsx`: parse JSON as `ApiResponse<Record<string, AtisEntry | null>>`; if `!payload.ok`, set fetch error, clear ATIS data, and use `payload.fetchedAt`; otherwise set data from `payload.data` and last fetch from `payload.fetchedAt`. Keep the existing `!response.ok` branch for non-envelope transport failures. Import `ApiResponse` from `@/types/api`.
   - `src/components/FacilityOverview.tsx`: replace local `AtisResponse` with `type AtisBatchResponse = ApiResponse<Record<string, AtisEntry | null>>`; parse the response and return `atisPayload.ok ? atisPayload.data : {}`. Keep current catch returning `{}`.
   - No `PlateViewer.tsx` or `DiagramPanel.tsx` JSON unwrapping changes. They must continue to pass `/api/plate-proxy?...` URLs to iframes/links.
   - No `/api/adjacent` frontend consumer changes are required; only tests currently parse it.

5. **Test impact.**
   - Update `tests/unit/routes/atis-route.test.ts`: validation tests expect `ok:false`, `data:null`, `error.code`, and HTTP/error status 400 instead of `body.error`; happy-path tests read `body.data.KSEA` / `body.data.KBFI` and expect top-level `ok:true`, source and attribution IDs `datis-clowd`, top-level `fetchedAt`, `isStale:false`, and no top-level `airports`; error/fallback tests read `body.data.<ICAO>` and preserve null semantics and 10-airport limit.
   - Adjacent tests: update existing `tests/integration/api-routes.test.ts` adjacent cases to unwrap `payload.ok === true` and assert against `payload.data`. Missing-param assertions expect `ok:false`, `data:null`, `error.code === "MISSING_REQUIRED_PARAMETER"`. Add unknown facility assertion for `/api/adjacent?facility=NOPE` expecting HTTP 404 and `error.code === "NOT_FOUND"` if absent.
   - Component tests: no dedicated `AtisStrip` or `FacilityOverview` unit tests exist. Lovell must add at least `tests/unit/components/atis-strip.test.tsx` covering successful envelope unwrap, `ok:false` envelope handling, and per-airport `null` hiding/No D-ATIS behavior as feasible. Add FacilityOverview only if low-risk; otherwise record the deferred gap explicitly.
   - Plate-proxy tests: do not add a success-envelope assertion. If touched, add/keep a test that success returns raw bytes with `Content-Type: application/pdf` and does not include JSON `ok/data`.

6. **Lockstep ordering.**
   - Mattingly: update `/api/atis` and `/api/adjacent` backend envelopes; add the plate-proxy binary exemption comment; do not wrap plate-proxy success.
   - Swigert: in the same change set before merge/full validation, update `AtisStrip.tsx` and `FacilityOverview.tsx` to unwrap `ApiResponse<Record<string, AtisEntry | null>>`. Do not change PlateViewer/DiagramPanel behavior.
   - Lovell: update route tests and integration assertions after backend+frontend compile; add the AtisStrip envelope consumer test; note/defer FacilityOverview component-test gap if not added.
   - Final validation: typecheck/lint/test commands already used by the repo. The app must never land with backend envelopes but old consumers, or old backend with new consumers.


### 2026-06-23T15:30:00Z: Keep plate-proxy JSON errors unchanged
**By:** Mattingly

**What:** Added the required binary passthrough exemption comment above the `/api/plate-proxy` success response, but did not normalize the existing JSON error paths to `ApiResponse<never>` in this backend slice.

**Why:** The frozen contract makes error normalization optional and prioritizes not breaking the binary iframe/source success path. Leaving the existing error JSON untouched is lower risk for T2a while Swigert and Lovell complete consumer and test migration around the required ATIS/adjacent envelopes.

### 2026-06-23T15:45:00Z: Facility summary leads selected airport dashboards
**By:** Swigert
**What:** Render the selected tower airport's facility overview section before the general query/status information when a home facility is selected.
**Why:** A specific airport selection should orient controllers with airport-specific hours, runways, frequencies, and procedure links before broader dashboard panels or general query details.

### 2026-06-23T16:30:00Z: FacilityOverview T2a component coverage deferred
**By:** Lovell
**What:** FacilityOverview dedicated component coverage is deferred for T2a.
**Why:** The final gate coverage focused on required AtisStrip envelope consumer cases plus route/integration envelope assertions; FacilityOverview remains covered by build/type checks and existing integration paths for this pass.


### 2026-06-23T23-01-07: Added real NFDC parser Vitest coverage
**By:** Lovell
**What:** Added real NFDC parser Vitest coverage
**References:** src/services/__tests__/nfdc-parser.test.ts, src/services/airport-hours.ts, src/services/runway-info.ts
**Why:** Replaced the unfinished NFDC parser test harness with 4 Vitest tests in src/services/__tests__/nfdc-parser.test.ts. Coverage added: parseRunwaysFromHtml happy path for NFDC-style runway sections including designator, dimensions, surface, and lighting normalization; parseRunwaysFromHtml empty/no-runway fallback; parseAirportHoursFromHtml happy path for tower hours, schedule, timezone, and airport fields; parseAirportHoursFromHtml empty/unstructured HTML fallback with null parser fields. Validation results: npx vitest run src/services/__tests__/nfdc-parser.test.ts passed (4 tests); npx vitest run passed with exit code 0; npm run lint passed with exit code 0; npm run build passed with exit code 0.


### 2026-06-23T23-27-48: Clarified NOTAM failure messaging so unavailable feed is not presented as zero NOTAMs
**By:** Swigert
**What:** Clarified NOTAM failure messaging so unavailable feed is not presented as zero NOTAMs
**References:** src/components/OperationsConsole.tsx, tests/unit/components/operations-console-autorefresh.test.tsx
**Why:** Decision: The NOTAM panel now uses a three-state presentation: (1) feed unavailable/error/not-configured renders an amber warning headed "⚠️ NOTAMs could not be loaded" and explicitly says this is NOT confirmation of zero active NOTAMs; (2) successful live response with an empty array renders "No active NOTAMs" only after response.ok with zero records; (3) successful non-empty response renders the NOTAM list.

Changed files: src/components/OperationsConsole.tsx and tests/unit/components/operations-console-autorefresh.test.tsx.

Before: facility dashboard NOTAM errors in facilityResults were not used by the panel, so an unconfigured/error response could fall through to "No active NOTAMs were returned by the live feed for this query." The query summary also treated NOTAM feed fallback with a cyan informational block.

After: the panel derives notamPanelResult from the active NOTAM query or the facility NOTAM fetch, branches on response.ok vs known NOTAM feed-unavailable error codes, preserves FAA NOTAM Search and TFR links, and uses amber warning/ring treatment for unavailable feed states. The query summary now uses the same warning model for NOTAM_FEED_NOT_CONFIGURED / NOTAM_EMBEDDED_SEARCH.

API route touched: no.

Validation: npm run lint passed; npm run build passed; npx vitest run passed (30 files, 205 tests). Focused component tests added for unavailable vs successful-empty NOTAM states.
