# ATC Companion — Decisions

## Decision Log

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
### 2026-06-23T21:48:33-07:00: PAE runway completeness and static fallback pairing
**By:** Aaron (Data)
**Requested by:** Devin Sinha
**What:** Treat fallback runway lists as physical reciprocal runway pairs, and keep KPAE static runway reference data complete with `16L`, `16R`, `34L`, and `34R`.
**Why:** When NFDC runway details are unavailable, static fallback and approach-plate inference can miss non-procedure runways. PAE exposed the systemic issue because approach plates only surfaced procedure runways, not both physical runways.
**Validation:** Added multi-runway NFDC parse and NFDC-unavailable fallback tests; combined build/lint/Vitest passed (30 files, 210 tests).
**Outcome:** Shipped in commit `f980f81`; live deployment verified.
### 2026-06-23T21:48:33-07:00: D-ATIS stale threshold widened to 75 minutes
**By:** Mattingly (Backend)
**Requested by:** Devin Sinha
**What:** Set `ATIS_STALE_THRESHOLD_MIN` to 75 minutes for D-ATIS responses from `datis-clowd`, superseding the earlier 30-minute threshold.
**Why:** D-ATIS is event-driven; in stable conditions a current information letter can persist for 60+ minutes. The previous 30-minute threshold falsely marked current ATIS as stale even though Zulu parsing and day rollover handling were correct.
**Validation:** Added service and route tests for 60-minute fresh, 76-minute stale, and midnight UTC rollover behavior; combined build/lint/Vitest passed (30 files, 210 tests).
**Outcome:** Shipped in commit `f980f81`; live KSEA ATIS age 68 minutes verified as `stale=false`.

### 2026-06-24T09:12:58-07:00: Fresh ATIS uses calm cyan, stale remains amber
**By:** Swigert (Frontend)
**Requested by:** Devin Sinha
**What:** Fresh/non-stale ATIS badges now use the console's calm informational cyan palette instead of amber/yellow. Fresh ATIS letter chips and FacilityOverview capsules use cyan tones; stale ATIS remains amber/yellow and keeps the explicit `STALE` label/ring.
**Why:** Amber/yellow reads as caution in the dark tower UI and should be reserved for stale or unavailable ATIS states. Cyan communicates nominal/current information while preserving strong contrast and non-color stale affordances.


### 2026-06-24T16:26:24-07:00: US airport coverage via live NFDC fallback
**By:** Aaron (Data)

**Requested by:** Devin Sinha

**Decision:** Use live FAA NFDC Airport Display lookup plus contextual FAA local identifier recognition for durable small-airport coverage. Do **not** bulk-import a full NASR airport dataset into `src/data/airports.ts`.

**Rationale:** The static `AIRPORT_REFERENCES` list remains useful for common airports and aliases, but it is not a full US airport inventory. FAA local identifiers such as `S18`, `38W`, `0S9`, `W10`, and `1A1` should flow through the same live NFDC-backed services already used for runway/hours/frequency data. Recognition accepts 3-4 character alphanumeric FAA LIDs only when airport context is present, while direct bare LID extraction remains limited to curated known references to avoid swallowing ordinary words, aircraft types, N-numbers, and unrelated numbers.

**Implementation notes:** `fetchAirportFromNfdc` now uses the existing cache layer (`airportReference` TTL), parses NFDC title/name, From-city state, latitude/longitude, and runway designators, and caches successful references in the in-memory airport index. Static airports without curated `runways` no longer short-circuit live NFDC enrichment. `getAirportRunways` returns `RUNWAY_DATA_UNAVAILABLE` when neither live NFDC parsing nor authoritative fallback runway designators are available. Facility overview posts `/api/query` with the correct `input` field and uses live-resolved `airportName`/runway details from airport-info responses.

**Validation:** Added mocked NFDC tests for S18-style LID resolution, small-airport runway population, contextual FAA LID recognition, and FacilityOverview live-name display. Full validation passed: `npm run lint`, `npm run build`, and `npx vitest run` (31 files / 217 tests). Shipped in `d942978` and deployed live.

### 2026-06-24T23:51:00Z: INFO airport-code overmatch fix
**By:** Aaron (Data)

**What:** Fixed a regression where the contextual airport-code gate accepted any four-letter all-alpha token, causing the app phrase `airport info for S18` to extract `INFO` before the real FAA local identifier.

**Decision:** Mirror the direct ICAO gate by only accepting four-letter contextual codes when they are in the airport reference list or start with `K`; FAA local identifiers still flow through `isFaaLocalIdentifier`.

**Why:** The full-US coverage change correctly allowed contextual FAA local identifiers, but its relaxed four-letter branch could swallow common English words. Requiring the K-prefix on the contextual four-letter ICAO branch preserves US ICAO recognition while avoiding `INFO`-style false positives; the FAA-LID shape still requires a digit, so common words are rejected.

**Validation:** Added extractor regressions for `airport info for S18`, `airport info for 38W`, and `airport info for KSEA`, plus an intent-parser regression that selects `S18` rather than `INFO`. Live checks verified S18→FORKS rw 04/22, 38W→Lynden rw 08/26, and KSEA unaffected. Shipped in `d418853` and deployed live.

### 2026-06-24T17:56:00-07:00: City/state airport resolution requires actual city match in named state
**By:** Aaron (Data)
**Requested by:** Devin Sinha (via Copilot)

**What:** Fixed place-name airport resolution for city/state queries so `forks, wa` and `forks, washington` resolve to `S18` (Forks), while `kelso, wa` still resolves to `KKLS`.

**Root cause:** Place-name extraction only searched curated `AIRPORT_REFERENCES`, which did not include `S18`, and full state names such as `Washington` could be treated as loose airport-name substrings (for example Kelso's `Southwest Washington Regional Airport`) without requiring an actual matching city.

**Decision:** Detect state from both abbreviations and full names, but state match alone is never sufficient. When a city/state query is supplied, require an actual city match within the named state before loose airport-name matching, with position-ordered selection and `airportPriorityScore` as the tiebreaker. Add `S18` / Forks, WA to curated `AIRPORT_REFERENCES` so city-name resolution has an authoritative local reference.

**Validation:** Added entity-extractor and intent-parser regressions for `forks, wa`, `forks, washington`, and `yakima, washington`; full validation passed (`npm exec vitest -- run tests\unit\entity-extractor.test.ts tests\unit\intent-parser.test.ts`, `npm run lint`, `npm run build`, `npx vitest run` — 221 tests). Live verification: `forks, wa`→S18, `forks, washington`→S18, `kelso, wa`→KKLS. Shipped in commit `bdf3b0c` and deployed to atc-companion.vercel.app.
