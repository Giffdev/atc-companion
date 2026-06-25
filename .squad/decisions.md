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

### 2026-06-24T19:00:00-07:00: Aaron airport dataset build
**By:** Aaron (inbox merge)

_Source inbox:_ `aaron-airport-dataset-build.md`

# Aaron airport dataset build

- Built Phase A as a US-only generated static dataset from OurAirports public-domain `airports.csv` and `runways.csv`.
- Kept `COUNTRIES = ["US"]` at the top of the generator so CA / Caribbean expansion is a one-line allowlist edit.
- Excluded `closed`, `heliport`, and `balloonport`; preserved small, medium, large, and seaplane-base airports.
- Emitted compact JSON into `src/data/generated/us-airports.json` and `src/data/generated/us-runways.json`.
- Loaded generated JSON server-side with `fs.readFileSync` in `src/data/airport-dataset.ts` instead of importing the JSON into bundled modules.
- Added explicit `server-only` marker and only server/test code imports the lookup module.
- Preserved all runways per airport; PAE returns `11/29`, `16L/34R`, and `16R/34L`.
- Applied an explicit local designator correction for 38W from `07/25` to `08/26` because the Phase A bug fix requires the current Lynden runway designator.

### 2026-06-24T19:00:00-07:00: Aaron data-source research: airport coverage expansion
**By:** Aaron (inbox merge)

_Source inbox:_ `aaron-airport-dataset-research.md`

# Aaron data-source research: airport coverage expansion

Date: 2026-06-24
Requester: Devin Sinha
Repo: Giffdev/atc-companion

## Recommendation

Use **OurAirports** as the primary airport/runway source for the next ingestion design. It is the best fit because it is worldwide, nightly refreshed, CSV/UTF-8, has both airport and runway files, includes municipality/city and region/country codes, and is explicitly public domain. Keep FAA NFDC/NASR as an optional later US-only quality overlay, not the base source; use OpenFlights only as a comparison/reference source, not as app input.

## Existing app target model

`src/data/airports.ts` defines:

```ts
export interface AirportReference {
  icao: string;
  faa: string;
  iata?: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
  runways?: string[];
}
```

`AIRPORT_REFERENCES` is currently a static TypeScript array. The `icao` field already contains true ICAO identifiers where available, but also local/non-ICAO identifiers for small fields (for example `S18`); `faa` is required and currently acts as the FAA/local code used for US lookup/search.

## Candidate 1: OurAirports

### Source facts

- Download page: https://ourairports.com/data/
- Data dictionary: https://ourairports.com/help/data-dictionary.html
- GitHub-hosted CSVs: https://davidmegginson.github.io/ourairports-data/
- OurAirports says the CSV dump covers airports, countries, regions, and related files, is updated every night, and is stored on GitHub.
- Terms: "All data is released to the Public Domain"; credit is appreciated but not required.
- Current page snapshot fetched 2026-06-24 lists:
  - `airports.csv`: 12,659,501 bytes, last modified Jun 24, 2026
  - `runways.csv`: 3,952,801 bytes, last modified Jun 24, 2026
  - `regions.csv`: 484,619 bytes
  - `countries.csv`: 24,583 bytes

### Coverage counts from current CSV snapshot

Computed directly from `airports.csv` and `runways.csv` on 2026-06-24.

| Area | Airport rows, all types | Not closed | App-candidate airfields (large/medium/small/seaplane only) | Candidate runway rows |
|---|---:|---:|---:|---:|
| United States (`US`) | 32,553 | 25,117 | 16,865 | 17,223 |
| Canada (`CA`) | 3,316 | 2,454 | 1,933 | 1,439 |
| Caribbean set below | 507 | 419 | 334 | 178 |
| US + Canada + Caribbean | 36,376 | 27,990 | 19,132 | 18,840 |

Type breakdown for US + Canada + Caribbean: 146 large, 1,146 medium, 16,702 small, 1,138 seaplane bases, 8,824 heliports, 8,386 closed, 34 balloonports.

The current CSV uses `closed` as the closed-airport type; the data dictionary mentions `closed_airport`. Ingestion should tolerate both.

### Caribbean ISO country codes to include

Recommended Caribbean operating set for this project:

`PR`, `VI`, `BS`, `JM`, `DO`, `HT`, `CU`, `TT`, `BB`, `KY`, `TC`, `AG`, `AI`, `AW`, `BL`, `BQ`, `CW`, `DM`, `GD`, `GP`, `KN`, `LC`, `MF`, `MQ`, `MS`, `SX`, `VC`, `VG`; optionally include `BM` for Bermuda if product scope treats it as nearby North Atlantic/Caribbean.

Current OurAirports all-type row counts: PR 73, VI 11, BS 78, JM 27, DO 50, HT 22, CU 156, TT 3, BB 2, KY 10, TC 9, AG 6, AI 2, AW 4, BL 1, BQ 4, CW 1, DM 3, GD 3, GP 10, KN 3, LC 2, MF 2, MQ 4, MS 2, SX 1, VC 6, VG 8, BM 4.

### Fields

`airports.csv` fields needed by the app:

- identifiers: `ident`, `icao_code`, `iata_code`, `gps_code`, `local_code`
- display/search: `name`, `municipality`, `keywords`
- geography: `latitude_deg`, `longitude_deg`, `elevation_ft`, `continent`, `iso_country`, `iso_region`
- status/type: `type`, `scheduled_service`
- optional links: `home_link`, `wikipedia_link`

Important dictionary details:

- `ident` is the interoperable key and is ICAO if available; otherwise local code or generated ISO2-prefixed code.
- `iso_region` is a country-prefixed subdivision code such as `US-WA` or `CA-BC`.
- `municipality` is the primary municipality served when available, not necessarily the physical municipality.
- Airport types include large/medium/small/heliport/seaplane/balloon/closed variants.

`runways.csv` is suitable for the non-US runway gap. It has one row per landing surface and includes:

- join keys: `airport_ref`, `airport_ident`
- geometry/dimensions: `length_ft`, `width_ft`, `surface`
- status: `lighted`, `closed`
- runway-end identifiers and details: `le_ident`, `he_ident`, endpoint lat/lon/elevation, true headings, displaced thresholds

### Size and format

All required OurAirports files are CSV/UTF-8.

Raw source size today: `airports.csv` 12.66 MB + `runways.csv` 3.95 MB. A filtered US+Canada+Caribbean all-type subset is about 4.68 MB airports + 2.09 MB runways as CSV. A likely app-candidate subset excluding closed airports, heliports, and balloonports is 19,132 airport rows and 18,840 runway rows, about 2.67 MB airports + 1.58 MB runways as CSV before app-specific compaction/minification.

This is large for direct client bundling if kept as full objects, but reasonable for a generated compact lookup artifact, lazy-loaded JSON, or server/API-backed search index.

### Data quality notes

Strengths:

- Best public/open single source found for combined US, Canadian, and Caribbean coverage.
- Includes runways globally, which is critical because FAA NFDC cannot supply Canadian/Caribbean runway data.
- Nightly refresh cadence and public GitHub-hosted CSV snapshots make deterministic ingestion straightforward.
- Includes closed airports and heliports explicitly, allowing product-level filtering instead of silent omissions.

Known gaps/risks:

- Not official for navigation; use for reference/search only.
- Municipality can be empty or represent served city rather than physical city.
- `ident` is not always ICAO; generated idents exist for sites without ICAO/local codes.
- Runway surface is not a strict controlled vocabulary; normalize common values but preserve raw surface if later displayed.
- Some countries/territories have sparse runway coverage for small/private fields.
- Heliports and closed airports create noise if not filtered.

## Candidate 2: OpenFlights

### Source facts

- Source: https://openflights.org/data.php
- Download: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
- The site says the airport database has over 10,000 airports/train/ferry terminals globally; `airports.csv` contains only type `airport` and source `OurAirports`.
- Current GitHub `airports.dat` fetched 2026-06-24 has 7,698 rows and is 1,127,225 bytes.
- Fields include Airport ID, Name, City, Country, IATA, ICAO, Latitude, Longitude, Altitude, timezone/DST/tz database timezone, Type, Source.
- Licensing is Open Database License/Database Contents License for the OpenFlights databases; public redistribution of derived works may require attribution and share-alike licensing. The page also says airport base data derived from OurAirports/DAFIF is public domain, but the published OpenFlights database is still presented under ODbL.

### Coverage counts from current `airports.dat`

- United States: 1,512
- Canada: 430
- Caribbean set: 146

This is much smaller than OurAirports and lacks runway data. It is focused on airline/travel airports, not comprehensive ATC/reference coverage.

### Verdict

Do not use as the ingestion base. It is useful only for sanity checks on major commercial airports or timezone enrichment if needed. The share-alike licensing and no-runways limitation are poor fits for this app.

## Candidate 3: FAA NFDC/NASR

FAA NFDC/NASR is the authoritative US aviation source and includes airport/runway detail with a 28-day aeronautical data cycle. It remains valuable for US-specific quality improvements and may be what the app already relies on for live NFDC lookups.

However, it is US-only. It does not solve Canada or Caribbean coverage. Treat as an optional US overlay after the OurAirports base works:

1. Start from OurAirports for all selected countries/territories.
2. For `iso_country = US`, optionally override/augment runway details and identifiers from FAA NFDC if a build phase needs official US fidelity.
3. Do not block Canada/Caribbean ingestion on FAA integration.

## Candidate 4: country civil-aviation/open-government sources

Examples include Canadian open-data/GIS airport layers and individual civil aviation authority datasets. These can be official, but they are fragmented by country, often GIS-oriented, inconsistently licensed, and inconsistent in runway schema. Canada has open-government airport layers, but Caribbean coverage would require many separate sources and license checks.

Use these only as targeted validation/overlays for high-value countries later. They are not a good phase-one base source.

## Ingestion plan recommendation

Do not build this yet, but scope the build around this plan:

1. Snapshot source files into a dated data-input folder or generated-data cache:
   - `airports.csv`
   - `runways.csv`
   - `regions.csv`
   - `countries.csv`
   - store source URL, fetched timestamp, byte size, and row count in metadata.
2. Filter `airports.csv` where `iso_country` is one of:
   - `US`, `CA`, and the Caribbean set above.
3. Product filter for initial app search:
   - include `large_airport`, `medium_airport`, `small_airport`, `seaplane_base`
   - exclude `heliport`, `balloonport`, `closed`/`closed_airport` by default
   - keep an option to include heliports later behind a feature flag/search filter.
4. Join `runways.csv` on `runways.airport_ident = airports.ident`; include only `closed = 0` runway surfaces.
5. Shape to `AirportReference`:
   - `icao`: prefer `icao_code`, else `gps_code`, else `ident`.
   - `faa`: for US, prefer `local_code`, else strip leading `K` only when `icao_code` is a standard contiguous-US `Kxxx`; for non-US, use `local_code || gps_code || ident` until the model is renamed to `localCode`.
   - `iata`: `iata_code` when present.
   - `name`: `name`.
   - `city`: `municipality` when present; fallback to parsed `keywords`, then `name`.
   - `state`: split `iso_region` after the first hyphen for US/CA (`WA`, `BC`, etc.); for Caribbean, preserve full region suffix or display country/territory code if region is not useful.
   - `latitude`/`longitude`: parse `latitude_deg`/`longitude_deg`.
   - `runways`: map each non-closed runway to `le_ident/he_ident` if both are present; otherwise single end ident. Sort naturally and de-duplicate.
   - `aliases`: include `iata_code`, `gps_code`, `local_code`, `ident`, `keywords` tokens, and maybe region/country names from `regions.csv`/`countries.csv`.
6. Generate compact app artifact(s):
   - `AirportReference[]` for existing code compatibility, or
   - a compact JSON search index plus an adapter to current `AirportReference`.
7. Add validation checks before shipping:
   - no missing `icao`/`faa`/`name`/`city`/coordinates in final records, or explicit fallback reason logged
   - runway join rate by country/territory
   - duplicate search keys by `icao`, `faa`, `iata`
   - sample golden airports: KSEA, S18, CYVR, CYYZ, MYNN, MKJP, MDPC, MDSD, TJSJ, TIST.

## Decision

Proceed with **OurAirports as the phase-one canonical source** for US + Canada + Caribbean airport and runway ingestion. Design the code so FAA NFDC can later override US details, but do not mix sources in the first build unless a specific quality issue demands it.

### 2026-06-24T19:00:00-07:00: Aaron frequencies dataset decisions
**By:** Aaron (inbox merge)

_Source inbox:_ `aaron-frequencies-dataset.md`

# Aaron frequencies dataset decisions

- 2026-06-24T18:29:28-07:00 — Extended the generated static airport dataset with OurAirports airport-frequencies.csv, filtered to the existing US airport subset by airport_ident and emitted compact frequency records keyed by generated airport ident.
- 2026-06-24T18:29:28-07:00 — Kept OurAirports frequency type tokens raw (for example CTAF, UNICOM, TWR, GND) and exposed DatasetFrequency through getDatasetFrequencies(code), resolving the same code variants as airport/runway lookups.
- 2026-06-24T18:29:28-07:00 — Added an explicit local correction for Lynden 38W CTAF 122.9 because the current OurAirports frequency CSV has no 38W row while the product requirement needs the static dataset to cover it.

### 2026-06-24T19:00:00-07:00: 2026-06-24 Haise city/state detection
**By:** Haise (inbox merge)

_Source inbox:_ `haise-city-detection.md`

## 2026-06-24 Haise city/state detection
- Added client-safe detection only for comma-style US city/region phrases; no server-only airport dataset imports.
- Emits `cityLocations: [{ city, regionCode }]` from `extractEntities`, and parsed intent entities include `{ label: "city", value: city, city, regionCode }`.
- Suppresses named-airport text matching when an explicit city/state phrase is present so `forks, washington` is not misread as KKLS.
- Added regression coverage for `INFO` not being treated as an airport code and for KSEA/38W/S18 code queries.

### 2026-06-24T19:00:00-07:00: Decision/Scoping Record: Global Airport Database Expansion
**By:** Kranz (inbox merge)

_Source inbox:_ `kranz-global-airport-db-plan.md`

# Decision/Scoping Record: Global Airport Database Expansion

**Owner:** Kranz (Lead/Architect)  
**Requested by:** Devin Sinha  
**Date:** 2026-06-24  
**Status:** Proposed — do not build until approved

## Context

ATC Companion currently resolves airports through a hand-curated `AIRPORT_REFERENCES` array in `src/data/airports.ts`, plus live FAA NFDC lookups keyed by airport ID. The recent city/state name-resolution work (`findAirportReferencesInText()`, `detectAirportAmbiguity()`, city abbreviations, state-name normalization) only works for airports present in that curated list. FAA NFDC remains useful for US airport IDs, but it cannot answer "airport near obscure city by city name" unless we already know the airport identifier.

The user wants two related capabilities:

1. Larger airport database so any US city resolves by name.
2. Airport coverage for Canada and the Caribbean.

Aaron/Data is separately evaluating source datasets. This plan assumes a public-domain global airports + runways dataset will be available with municipality/city, country, region, ICAO/IATA/local identifiers, coordinates, runway metadata, and source/license metadata.

## Decision Summary

Adopt a **generated, server-loaded regional airport reference dataset** rather than a hand-curated TypeScript array or client-bundled global module.

Recommended shape:

- Keep the existing curated `AIRPORT_REFERENCES` as a small high-confidence override layer.
- Add a build-time generation pipeline that ingests the public-domain global dataset and emits compact regional artifacts for:
  - `US`
  - `CA`
  - explicitly scoped Caribbean countries/territories
- Load those artifacts from server-only code for query parsing/API execution.
- Emit a compact city/region index alongside the airport list so city-name resolution is an indexed lookup, not an O(n) scan across tens of thousands of rows.
- Expose only tiny lookup results to client components via existing `/api/query` envelopes; do not import the generated dataset from `"use client"` components.

This gives broad name coverage without inflating the Next.js client bundle or depending on a live third-party airport-search API at request time.

## 1. Data Strategy

### Options Considered

#### A. Bundle the full global dataset into `src/data/airports.ts`

Reject.

Pros:

- Simple imports.
- Works offline.

Cons:

- A global airport dataset can contain tens of thousands of rows and runway rows.
- `src/data/airports.ts` is already imported by client components (`FacilityOverview.tsx`, `OperationsConsole.tsx`). If the large dataset remains in that import path, Next.js can pull it into client bundles.
- TypeScript compile and lint time will degrade if we generate a huge `.ts` literal.
- Hard to refresh cleanly.

#### B. Live API lookup for city/name search

Reject as the primary path.

Pros:

- Small bundle.
- Freshness delegated to provider.

Cons:

- Query latency and availability become user-facing.
- Requires provider-specific behavior, rate-limit handling, and probably an API key if reliable.
- Name resolution is core UX and should not fail just because an upstream search API is unavailable.
- FAA NFDC is US-only and identifier-keyed, so it does not solve Canada/Caribbean city lookup.

#### C. Generated server-side regional data files plus indexes

Recommend.

Pros:

- Keeps client bundle small.
- Supports offline/server-local name and code resolution.
- Can be refreshed on a known cadence.
- Allows country/region scoping instead of shipping every global heliport/seaplane base.
- Gives deterministic tests and deterministic ambiguity behavior.

Cons:

- Requires a generation script and artifacts.
- Server code must avoid importing large data into client modules.

### Recommended Implementation Shape

Create a new generated-data boundary:

- `scripts/generate-airport-reference-data.ts`
  - Input: Aaron's selected public-domain source files.
  - Output:
    - `src/generated/airports/airports.us-ca-caribbean.json`
    - `src/generated/airports/city-index.us-ca-caribbean.json`
    - `src/generated/airports/code-index.us-ca-caribbean.json`
    - `src/generated/airports/metadata.json`
  - Optional later split:
    - `airports.us.json`
    - `airports.ca.json`
    - `airports.caribbean.json`

Use JSON rather than a huge generated TypeScript module. JSON can be loaded server-side with dynamic import or `fs/promises`, and it avoids TypeScript parsing tens of thousands of object literals.

Add server-only accessor module:

- `src/data/airport-reference.server.ts`
  - `getAirportReferenceByCode(code)`
  - `searchAirportReferencesByText(input)`
  - `resolveAirportByCityRegion(query)`
  - `getAirportRunwaysFromReferenceData(code)`
  - Caches parsed JSON in module scope.
  - Imports `server-only` so accidental client imports fail during development/build.

Keep a small shared module:

- `src/data/airport-types.ts`
  - `AirportReference`
  - `AirportRegion`
  - `AirportDataSourceKind`
  - `AirportResolutionCandidate`
  - type-only exports safe for client/server.

Refactor current `src/data/airports.ts` into one of two patterns:

1. **Preferred:** split into:
   - `airports.static.ts` for the curated override array.
   - `airport-lookup.server.ts` for generated server lookup + NFDC dynamic lookup.
   - `airport-lookup.shared.ts` for small helpers that client code can use without pulling generated JSON.
2. **Interim:** keep `airports.ts` API names, but move large generated access behind dynamic server-only functions and stop importing it from `"use client"` files.

Because `FacilityOverview.tsx` and `OperationsConsole.tsx` currently import `findAirportReference` directly, the client-import boundary must be fixed before adding large data. Options:

- For client display labels, use data already returned by API (`airportName`, `airportCity`, `airportState`) wherever possible.
- Add a tiny client-safe curated lookup for facility airports only.
- Replace broad client calls to `findAirportReference()` with server-provided labels, or a lightweight `src/data/airport-labels.client.ts` generated with only the current facility airports if needed.

### Dataset Fields to Keep

The generated artifact should be compact. Keep only fields used by current or near-term code:

```ts
interface AirportReference {
  icao: string;
  faa?: string;       // US FAA LID when available
  iata?: string;
  local?: string;     // Canadian/foreign local identifier if distinct
  name: string;
  city: string;
  region: string;     // US state, CA province/territory, foreign admin region
  country: string;    // ISO-3166 alpha-2
  latitude: number;
  longitude: number;
  type?: "large_airport" | "medium_airport" | "small_airport" | "seaplane_base" | "heliport" | "closed";
  scheduledService?: boolean;
  runways?: RunwayInfo[];
  source: "curated" | "faa-nfdc" | "open-dataset";
}
```

Keep runway records compact:

```ts
interface RunwayInfo {
  designator: string;
  lengthFeet: number | null;
  widthFeet: number | null;
  surface: string | null;
  lighting: string | null;
}
```

Filter out closed facilities by default. Include heliports/seaplane bases only if the product explicitly needs them; otherwise they create noisy city matches.

## 2. City to Airport Resolution

### Index Design

Generate indexes at build time instead of deriving all search keys on every request.

Recommended JSON shape:

```json
{
  "cityRegion": {
    "SEATTLE|WA|US": ["KSEA", "KBFI", "KRNT", "KPAE"],
    "VANCOUVER|BC|CA": ["CYVR", "CZBB", "CYPK"],
    "SAN JUAN|PR|US": ["TJSJ", "TJIG", "TJRV"]
  },
  "cityCountry": {
    "SEATTLE|US": ["KSEA", "KBFI", "KRNT", "KPAE"],
    "VANCOUVER|CA": ["CYVR", "CZBB", "CYPK"]
  },
  "cityOnly": {
    "PORTLAND": ["KPDX", "KPWM", "..."]
  },
  "nameKeys": {
    "SEATTLE TACOMA": ["KSEA"],
    "PEARSON": ["CYYZ"]
  },
  "code": {
    "KSEA": "KSEA",
    "SEA": "KSEA",
    "CYVR": "CYVR",
    "YVR": "CYVR"
  }
}
```

Normalize with the same spirit as `normalizeAirportLookupKey()`:

- Uppercase.
- Strip punctuation to spaces.
- Collapse whitespace.
- Normalize accents/diacritics if the source includes them.
- Preserve slash-separated municipality aliases by emitting multiple city keys.

Add region-name maps:

- Existing US state names to abbreviations.
- Canadian province/territory names to abbreviations.
- Caribbean territory/country aliases:
  - "Puerto Rico" / "PR"
  - "USVI" / "U.S. Virgin Islands" / "VI"
  - "Bahamas"
  - "Jamaica"
  - etc., based on the approved Caribbean scope.

### Ranking

For each city key, pre-sort candidate ICAOs using an explicit `airportPriorityScore`. Current scoring in `src/data/airports.ts` gives weight to IATA, "International", city in name, and runway presence. Extend it:

1. Not closed.
2. Facility type priority:
   - large airport
   - medium airport
   - small airport
   - seaplane base
   - heliport
3. Scheduled service or IATA code.
4. Towered/controlled if the source has that field.
5. International/major-name indicators.
6. Runway length, if available.
7. Distance to city centroid only if the source provides reliable municipality coordinates; otherwise avoid invented precision.

Do not silently choose among multiple plausible airports when the user asked for a city. Instead:

- If the city+region maps to one dominant airport and the next candidate is clearly secondary, resolve to the dominant airport.
- If multiple candidates are plausible, return a clarification with the top 3-5:
  - "Multiple airports match Vancouver, BC: CYVR (Vancouver Intl), CZBB (Boundary Bay), CYPK (Pitt Meadows). Which one?"
- If the user asks for "nearest airport to [city]", prefer the ranked primary but still include alternate candidates if close/ambiguous.

### Integration Points

`findAirportReference(code)` should remain the code-lookup API, but it should be backed by:

1. Curated overrides.
2. Generated code index.
3. FAA NFDC dynamic lookup for US airport IDs only.

`findAirportReferencesInText(input)` should become:

1. Fast code extraction from generated code index.
2. Explicit city+region/country matching from generated city indexes.
3. Name-key matching from generated name index.
4. Curated aliases and facility/team-specific aliases.

Keep `detectAirportAmbiguity(input)`, but update it to understand city ambiguity, not just same-name ambiguity. Today it only triggers for name-derived matches and explicitly avoids city-derived matches. With a large database, city-derived ambiguity is expected and should be first-class.

Recommended API addition:

```ts
type AirportResolution =
  | { kind: "resolved"; airport: AirportReference; candidates?: AirportReference[] }
  | { kind: "ambiguous"; candidates: AirportReference[]; prompt: string }
  | { kind: "not_found" };
```

Use this internally in the intent parser so ambiguity can produce the existing `unknown` intent with `reason: "ambiguous-airport"`.

## 3. Canada and Caribbean Integration

### Key Risk: Current ICAO Recognition Rejects Non-US 4-Letter ICAOs

`src/ai/entity-extractor.ts` currently has a deliberate K-prefix gate:

- Direct 4-letter ICAO matches require `code.startsWith("K")` or `findAirportReference(code)`.
- Contextual matches allow `findAirportReference(code)`, `K***`, or FAA local identifiers.

That gate prevents "INFO", "FROM", "WITH", etc. from being interpreted as airports, but it would reject valid Canadian and Caribbean ICAOs unless they are already in the static/generated reference set:

- Canada: `CYVR`, `CYYZ`, `CYUL`, `CYOW`, etc.
- Caribbean examples: `TJSJ`, `MKJP`, `MYNN`, `TNCM`, `MBPV`, etc.

### Recommended Recognition Model

Do not simply change the gate to "any 4 uppercase letters". That will reintroduce the INFO/FROM over-match bug.

Use a two-tier model:

#### Tier 1: Known-code acceptance

Accept any 3- or 4-character airport code if it exists in the generated code index:

- ICAO
- IATA
- FAA LID
- Canadian/foreign local identifiers if source quality is good

This is the safest expansion. Once `CYVR`, `MKJP`, `TJSJ`, etc. are in the generated dataset, direct references resolve without broad regex trust.

#### Tier 2: Region-prefix acceptance only in aviation context

For unknown 4-letter codes, accept only when:

- The token matches a known ICAO prefix for approved regions, and
- The user phrase has airport context (`at`, `for`, `near`, `from`, `to`, `airport`, `field`, `METAR`, `TAF`, `NOTAM`, `runways`, etc.), and
- The token is not in the stopword list.

Approved prefixes for this feature should be generated from the actual dataset, not hardcoded ad hoc. Expected examples:

- US: `K`, plus Alaska/Hawaii/Pacific prefixes already in curated data such as `PA`, `PH`, `PG`, `PJ` as applicable.
- Canada: `C` ICAO space, especially `CY`, `CZ`, `CW`.
- Caribbean: `T`, `M`, `MY`, `MK`, `MB`, `MD`, `MU`, `MW`, `TN`, `TT`, etc., constrained by approved country scope.

Unknown prefix acceptance should be conservative. It should support "METAR CYVR" even if the generated dataset misses it, but direct bare `INFO` must remain rejected.

### Specific Entity Extractor Changes

Replace hard-coded `code.startsWith("K")` with helpers:

```ts
isKnownAirportCode(code): boolean
isRecognizedIcaoPrefix(code): boolean
isAirportCodeInContext(code, surroundingText): boolean
```

Behavior:

- Bare direct extraction:
  - Accept if `isKnownAirportCode(code)`.
  - Optionally accept `K***` for US backwards compatibility.
  - Do not accept unknown `C***`, `T***`, `M***` bare unless confidence is high and tests prove no over-match.
- Contextual extraction:
  - Accept known code.
  - Accept known regional ICAO prefix if the token appears in airport context.
  - Keep `AIRPORT_CODE_STOPWORDS`, and expand it with observed false positives from tests (`INFO`, `FROM`, `THIS`, `THAT`, `WIND`, etc. as needed).
- IATA extraction:
  - Continue requiring known generated lookup; never accept arbitrary 3-letter words.

Add tests for both sides:

Positive:

- `airport info for CYVR`
- `show runways at CYYZ`
- `METAR TJSJ`
- `airport info for MKJP`
- `weather at TNCM`
- city names: `airport info for Vancouver BC`, `runways for Montego Bay Jamaica`

Negative:

- `show me airport info`
- `information from weather`
- `show info for runway`
- `from this airport`
- `with wind info`

### Non-US Runway Lookup

`getAirportRunways()` currently resolves ref -> FAA NFDC URL -> parse runway table -> fallback to static runway designators. FAA NFDC is US-only.

Recommended behavior:

1. If airport country is `US` and has FAA identifier:
   - Use current FAA NFDC live path first.
   - Fall back to generated runway data.
2. If airport country is `CA` or approved Caribbean country:
   - Do not call FAA NFDC.
   - Return generated runway data from the open dataset if available.
   - If runway data is missing, return `RUNWAY_DATA_UNAVAILABLE` with non-FAA verification messaging.

This requires the airport reference to carry `country` and a source marker. `toFaaCode()` should not blindly strip `K` for non-US airports.

Expected new source behavior:

- `source: "FAA NFDC"` for US live runway data.
- `source: "Open airport reference dataset"` for non-US generated runway data.
- `source: "Inferred from airport data"` only when we are deriving designators without dimensions.

## 4. Attribution and Reliability

The existing API pattern is good: `ApiResponse<T>` carries `source`, `attribution.primary`, `supporting`, `reliability`, `refresh_interval`, `fetchedAt`, stale markers, and cache metadata. `runwayDetails` already nests its own source envelope inside the airport-info orchestrator payload.

Add a source registry entry once Aaron finalizes the dataset:

```ts
openAirportDataset: {
  id: "open-airport-reference",
  name: "<final dataset name>",
  authority: "Open aviation dataset",
  reliability: "medium",
  refresh_interval: "Generated from public dataset; refresh on approved cadence",
  dataFormat: ["CSV", "JSON"],
  reliabilityNotes: "Community/public-domain reference data. Useful for discovery and non-US coverage; verify operational use against official AIP/airport publications."
}
```

If the selected source is official for a country, set reliability accordingly per source. If it is a global public-domain dataset, default to `medium`, not `high`.

User-facing messaging:

- US FAA-derived results:
  - "Source: FAA NASR/NFDC, 28-day cycle."
- Non-US generated results:
  - "Source: open airport reference dataset. Verify runway and operational details against official AIP/airport publications before operational use."
- Missing non-US authoritative data:
  - Avoid "official FAA Chart Supplement" wording for foreign airports.
  - Use: "Runway data could not be loaded for CYVR. Verify current airport information using official NAV CANADA / state AIP / airport publications."

Update `FacilityOverview.tsx` and runway error text so it does not always say "official FAA Chart Supplement link." That copy is only correct for FAA-covered US airports.

## 5. Phased Plan and Agent Assignments

### Phase A — Larger US City Coverage

Goal: Any US city in the selected dataset can resolve by city/state name without adding Canada/Caribbean behavior yet.

Scope:

- Generate US-only airport + city indexes.
- Keep FAA NFDC live lookup as authoritative for US ID lookups and runway details.
- Add server-only loading boundary.
- Refactor client imports so generated data does not enter client bundles.
- Extend ambiguity handling for city-derived matches.

Assignments:

- **Aaron (Data/Pipeline):**
  - Provide source files, license confirmation, field mapping, and refresh cadence.
  - Define filters: active public-use airports, include/exclude heliports/seaplane bases.
- **Mattingly (API/server-loading):**
  - Build `airport-reference.server.ts`.
  - Add generated JSON loading and module-scope cache.
  - Refactor `airports.ts` to keep public API stable while avoiding client bundle bloat.
- **Haise (Entity extraction/code recognition):**
  - Wire generated known-code lookup into `entity-extractor`.
  - Preserve INFO/FROM false-positive protections.
- **Lovell (Tests):**
  - Add US city/state resolution tests, ambiguity tests, bundle-boundary regression tests if feasible, and existing parser regression coverage.
- **Swigert (UI):**
  - Update ambiguity prompt presentation if needed.
  - Update non-specific runway error copy only where Phase A touches it.

Hard dependencies:

- Aaron's source schema.
- Mattingly's server-only boundary before large generated data lands.

Parallelizable:

- Aaron can finalize source mapping while Haise writes extractor tests against a mocked generated lookup.
- Swigert can update copy/clarification rendering independently.

Exit criteria:

- `airport info for Springfield IL` resolves correctly.
- Ambiguous `airport info for Portland` asks for clarification instead of guessing.
- `npm run lint`, `npm run build`, and `npx vitest run` pass.
- Client bundle does not include the generated regional dataset.

### Phase B — Canadian Coverage

Goal: Canadian airport codes and city/province names resolve, with runway data from generated dataset and honest non-FAA attribution.

Scope:

- Add `CA` data to generated artifacts.
- Add Canadian province/territory name normalization.
- Add Canadian ICAO prefix handling through known-code lookup and contextual fallback.
- Ensure runway lookup bypasses FAA NFDC for `country === "CA"`.
- Update weather/NOTAM/plates expectations:
  - Weather may work for ICAO stations if NOAA/AviationWeather covers them.
  - FAA plates/diagram/hours likely won't; airport-info should degrade gracefully.

Assignments:

- **Aaron:** Validate Canadian fields and province mappings.
- **Mattingly:** Add country-aware runway source selection and `toFaaCode()` safeguards.
- **Haise:** Add `CY**`/`CZ**` recognition and negative over-match tests.
- **Swigert:** Ensure UI labels say province/country cleanly.
- **Lovell:** Add tests for `CYVR`, `CYYZ`, `Vancouver BC`, `Toronto Ontario`, ambiguity cases.

Hard dependencies:

- Phase A server-only data architecture.
- Canadian data quality sufficient for code/city/runway fields.

Parallelizable:

- Haise can implement code-gate tests once generated lookup stubs exist.
- Swigert can update display formatting for `city, region, country`.

Exit criteria:

- `airport info for CYVR` recognized.
- `airport info for Vancouver BC` resolves or clarifies among Vancouver-area airports.
- FAA NFDC is not called for Canadian airports.
- Non-US runway responses carry open-dataset attribution.

### Phase C — Caribbean Coverage

Goal: Approved Caribbean country/territory airport codes and city/country names resolve.

Scope:

- Define exact Caribbean scope before implementation.
- Add country/territory aliases and region normalization.
- Add generated code/city/runway data for that scope.
- Add ICAO prefix handling constrained by generated known-code lookup and contextual regional prefixes.
- Update verification copy for non-US/non-FAA airports.

Assignments:

- **Aaron:** Produce final country/territory list and dataset coverage notes.
- **Mattingly:** Add regional split or lazy loading if Caribbean data meaningfully increases artifact size.
- **Haise:** Add recognition tests for `TJSJ`, `MKJP`, `MYNN`, `TNCM`, plus negative INFO/FROM regressions.
- **Swigert:** Add country display and ambiguity UI polish.
- **Lovell:** Add city/country tests: `San Juan PR`, `Kingston Jamaica`, `Nassau Bahamas`, `St Maarten`.

Hard dependencies:

- User approval of "Caribbean" scope.
- Phase B non-US source attribution and runway behavior.

Parallelizable:

- Aaron's country list and Haise's prefix fixture work can run in parallel.

Exit criteria:

- Approved Caribbean city and code lookups work.
- Non-US/non-FAA runway lookup does not call NFDC.
- Ambiguous city names surface clarification.

## 6. Risks and Open Questions

### Risks

1. **Client bundle bloat**
   - `findAirportReference` is currently imported by client components. Adding large generated data without refactoring will likely increase client JS. This is the first architectural blocker.

2. **False-positive ICAO extraction**
   - Broadening from `K***` to global ICAO patterns can reintroduce the old INFO/FROM bug. The solution must require known-code lookup and aviation context for unknown regional prefixes.

3. **City ambiguity**
   - "Any city resolves" does not mean "one airport per city." Many cities have primary, reliever, GA, heliport, and nearby metro airports. The product must clarify rather than pretend certainty.

4. **Data freshness and authority**
   - FAA NFDC is authoritative for US. A public-domain global dataset may be stale or community-maintained. The UI/API must distinguish FAA high-reliability data from open-dataset medium-reliability data.

5. **Non-US downstream services**
   - Airport code resolution is only one layer. Plates, diagrams, hours, NOTAMs, and some weather paths are FAA/US-oriented. Airport-info responses for Canada/Caribbean must degrade gracefully and avoid US-specific verification copy.

6. **Identifier semantics**
   - `faa` is required on the current `AirportReference` interface. Non-US airports need optional `faa`, plus `local` and `country`. Several helper functions assume US behavior (`toFaaCode()` strips `K`).

### Open Questions for Devin/Product

1. What exactly counts as "Caribbean" for launch?
   - Caribbean sovereign states only?
   - Include US territories (PR/USVI), Dutch/French territories, Bermuda, Bahamas, Turks and Caicos?

2. Should the generated dataset include only public-use airports, or also private airports, heliports, and seaplane bases?
   - Recommendation: start with active public-use airports, include seaplane bases only if they have ICAO/IATA or operational relevance, exclude heliports unless explicitly requested.

3. Is offline/server-local lookup a requirement?
   - Recommendation: yes for name/code resolution. Use live sources only for authoritative operational overlays where available.

4. What freshness SLA is acceptable for open-dataset airport/runway data?
   - Recommendation: refresh generated artifacts monthly or per upstream release; display source generation date.

5. Should ambiguous city queries prefer "commercial primary" by default, or always ask?
   - Recommendation: default only when a candidate is clearly dominant by IATA/scheduled/large-airport ranking; otherwise ask.

6. Do we need official Canadian/NAV CANADA data in Phase B, or is the open dataset acceptable for initial discovery?
   - Recommendation: ship open-dataset discovery with clear verification messaging, then evaluate official sources for future reliability upgrades.

## Concrete Implementation Checklist After Approval

1. Add `AirportReference` v2 type with optional `faa`, `local`, `region`, `country`, `source`.
2. Add generated-data script and region filters.
3. Add server-only airport reference loader and module-scope parsed JSON cache.
4. Refactor client imports away from broad `findAirportReference`.
5. Replace O(n) city scan with generated city/name indexes.
6. Add city-derived ambiguity model.
7. Update entity extractor from `K` gate to known-code/contextual-prefix model.
8. Make runway lookup country-aware:
   - US: FAA NFDC first, generated fallback.
   - Non-US: generated data only, no NFDC.
9. Add source registry entry for the selected open airport dataset.
10. Update UI/API copy for non-FAA verification.
11. Add regression tests for US city coverage, Canadian/Caribbean codes, ambiguity, and INFO/FROM false positives.

## Recommendation

Approve Phase A first: generated US regional airport/city index behind a server-only boundary. This de-risks bundle size and ambiguity handling while delivering the largest immediate user value. Then layer Phase B Canada and Phase C Caribbean on the same architecture, with code-recognition expansion tied to known generated airport codes rather than broad regex acceptance.

### 2026-06-24T19:00:00-07:00: Lovell Phase A validation — 2026-06-24 18:52 PT
**By:** Lovell (inbox merge)

_Source inbox:_ `lovell-phasea-validation.md`

## Lovell Phase A validation — 2026-06-24 18:52 PT

Verdict: 🟢 PASS for shipping Phase A to production.

Validation gates:
- `npm run lint`: exit 0, eslint `--max-warnings=0` produced 0 warnings.
- `npm run build`: exit 0, printed `✓ Compiled successfully in 3.4s`.
- `npx vitest run --reporter=dot`: exit 0, 32 test files passed, 237 tests passed. Builders' original count was independently reproduced at 235 before I added two reviewer tests for KSEA seed precedence and bare-city graceful handling.
- Client bundle grep after build: no matches in `.next\static` for `us-airports`, `us-runways`, `us-frequencies`, `Aero B Ranch Airport`, or `OurAirports community dataset`.

Independent proof checks:
- PASS — 38W frequencies include CTAF 122.9.
- PASS — 38W runways include 08/26 via OurAirports fallback, not unavailable.
- PASS — KPAE fallback returns all runways: 11/29, 16L/34R, 16R/34L.
- PASS — S18 airport-info resolves.
- PASS — `Forks, WA` and `Forks, Washington` resolve to S18, not KKLS.
- PASS — `INFO` is not extracted as an airport code.
- PASS — curated AIRPORT_REFERENCES wins over dataset where both exist; S18 returns curated `FORKS`, not dataset `Forks Airport`.
- PASS — KSEA local FAA/NASR seed path remains authoritative and is not overridden by dataset fallback.

Regression sweep:
- PASS — dataset runway/frequency provenance is labeled `OurAirports community dataset` / `ourairports-community-dataset`, reliability medium; no FAA-authoritative overclaim found.
- PASS — `airport-dataset.ts` has `server-only`; imports trace only through server services/routes/tests. No client component transitively imports it; bundle grep confirms no generated dataset leakage.
- PASS — bare `Forks` without region does not throw; it returns a clarification response.
- PASS — unknown dataset code paths return null/empty arrays; service-level unknown handling remains NOT_FOUND/UNAVAILABLE style, no crash found.
- NOTE — pre-existing weather/plates panel prior-data-on-failure debt appears unchanged; Phase A did not touch those client components.

No blocking issues found.

### 2026-06-24T19:00:00-07:00: 2026-06-24 Phase A Wave 2 dataset wiring
**By:** Mattingly (inbox merge)

_Source inbox:_ `mattingly-dataset-wiring.md`

## 2026-06-24 Phase A Wave 2 dataset wiring
- Kept curated AIRPORT_REFERENCES and live FAA NFDC as higher priority than OurAirports.
- Added server-only OurAirports fallback at service/orchestrator seams only; did not import the dataset into client-shared airports.ts.
- Frequency fallback maps OurAirports CTAF/UNICOM/TWR/GND/ATIS/AWOS/ASOS/CLD/CD/APP/DEP/CENTER/FSS tokens into the existing FrequencyType enum and marks source as OurAirports community dataset.
- Runway fallback uses all OurAirports runway records after NFDC misses, preserving multi-runway airports such as KPAE.
- City entities resolve server-side through the dataset; Forks, WA/Washington selects S18 deterministically.
- Validation: lint passed, build compiled successfully, client static bundle grep found no us-airports/us-runways/us-frequencies JSON, vitest passed 235/235 tests.

### 2026-06-24T19:00:00-07:00: Swigert frequency panel fix
**By:** Swigert (inbox merge)

_Source inbox:_ `swigert-frequency-panel-fix.md`

# Swigert frequency panel fix

## Decision
For `airport_info` responses, clear the frequency panel to `[]` when the nested FAA frequency lookup fails instead of retaining prior dashboard frequencies.

## Rationale
Retaining prior frequency data can show a different airport's radios for the queried airport. The card label should also derive from the queried airport for `airport_info`, not from the weather station, because small airports may use a nearby METAR station.

## Follow-up risk
The airport-info merge still retains prior weather and procedure data when those nested lookups fail. This fix is scoped to frequencies per request; plates/weather should be assessed separately before changing fallback behavior.

### 2026-06-24T21:33:19-07:00: Explicit query exits facility-dashboard mode and clears stale facility panels
**By:** Swigert (Frontend)

**What:** Added an explicit facility-dashboard mode to `OperationsConsole`: selecting a home facility enables facility-summary-first rendering, while an explicit airport query disables that mode and clears prior facility/query/supplemental panels.

**Why:** Selecting a home facility such as KDEN left facility summary panels rendered after an explicit query for another airport such as 38W. Explicit queries must render the queried airport without stale home-facility dashboard state.

**Validation:** Updated `src/components/OperationsConsole.tsx` and `tests/unit/components/operations-console-autorefresh.test.tsx`. Swigert reported 238 tests passing, lint with 0 warnings, and a clean build. Coordinator committed `4cab907`, pushed `origin/master`, and deployed production at `atc-companion.vercel.app`.

### 2026-06-24T21:44:52-07:00: Kranz frequency-gap policy recommendation
**By:** Kranz (inbox merge)

_Source inbox:_ `kranz-frequency-gap-policy.md`

# Kranz frequency-gap policy recommendation

**Date:** 2026-06-24T21:44:52-07:00  
**Requested by:** Devin Sinha  
**Owner:** Kranz (Lead / Architect)  
**Status:** Recommendation — do not implement until assigned

## Confirmed code path

For a US airport such as `4W0`, `getFrequencies()` first checks the local seed, then live FAA NFDC, then the generated OurAirports frequency dataset:

- `src/services/frequencies.ts:151-156` normalizes the airport and handles APP separately.
- `src/services/frequencies.ts:158-181` returns local seed frequencies when present.
- `src/services/frequencies.ts:183-200` tries FAA NFDC Airport Display frequencies and silently falls through when fetch/parsing fails.
- `src/services/frequencies.ts:202-208` calls `getDatasetFallbackFrequencies()` and returns OurAirports frequencies when present.
- `src/data/airport-dataset.ts:130-131` returns `[]` for unknown frequency records, so an airport present in the airport dataset but missing from `us-frequencies.json` is indistinguishable from "no frequency records in our static source."
- `src/services/frequencies.ts:210-217` currently emits `AIRPORT_NOT_FOUND` with `No FAA frequency data found for ${airportCode}.` and details `Neither the local seed nor the FAA NFDC returned frequency data for this airport.`

User-facing paths:

- Direct failed live query: `src/components/OperationsConsole.tsx:410-431` renders `liveResult.response.error.message`, so users can see `No FAA frequency data found for K4W0.`
- Airport-info/frequency panel gap: `src/components/OperationsConsole.tsx:965-971` computes `frequencyEmptyMessage` as `No published FAA frequencies for ${formatAirportTitle(frequencyPanelAirport)}. Verify via official FAA sources.`
- `src/components/OperationsConsole.tsx:1653-1655` renders that message when the frequency panel has no rows.

The current UI therefore asserts "no published FAA frequencies" even when the evidence is only "our live NFDC request failed and OurAirports has no row."

## Prior pattern to preserve

The project already avoids asserting absence on data gaps:

- `src/services/runway-info.ts:107-115` returns `RUNWAY_DATA_UNAVAILABLE` when runway details cannot be loaded.
- `src/components/OperationsConsole.tsx:644-647` says: `Runways could not be loaded from FAA NFDC. This is not confirmation that the airport has no runways; verify using the official FAA Chart Supplement link.`
- `src/components\FacilityOverview.tsx:262-264` uses the shorter facility-card version: `Runways could not be loaded. Verify using the official FAA Chart Supplement link.`

## Options

### Option A — Messaging-only gap fix

Do not show an inferred frequency. Change the empty/error copy to stop claiming absence.

Proposed user-facing messaging:

- Direct frequency query: `Frequency data could not be loaded for 4W0 from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement.`
- Airport-info panel: `Frequencies could not be loaded from FAA NFDC or the static dataset. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement link.`

Pros:

- Safest; no guessed operational value is displayed.
- Fully consistent with the runway-gap and NOTAM-unavailable patterns.
- Small implementation surface: service error code/message plus frontend panel copy/tests.

Cons:

- Does not answer the user's "wouldn't it be at least 122.9?" intuition inline.
- Users must open the Chart Supplement to discover the likely CTAF convention or the actual published value.

### Option B — Messaging plus informational 122.9 default

Keep the gap warning, and add an explicitly non-authoritative convention note.

Proposed user-facing messaging:

- Primary warning: `Frequency data could not be loaded for 4W0 from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement.`
- Secondary note: `AIM/FAA convention: a non-towered airport without an assigned CTAF/UNICOM may use 122.9 MHz for self-announce. This is a default convention, not confirmed published data for 4W0. Verify before use.`

Pros:

- Directly addresses the user's 122.9 question.
- Makes the convention explicit while avoiding an authoritative-looking frequency row.

Cons:

- Still risks a user mentally promoting 122.9 into "the answer," especially in a frequency panel.
- Requires careful display treatment and tests so the hint never appears as a normal `Frequency` record.
- May be wrong for fields with assigned CTAF/UNICOM values such as 122.8, 123.0, 122.7, or 122.725.

### Option C — Guarded hybrid: show the 122.9 convention only when the app has non-towered/small-airport evidence

Show Option A for all gaps. Add the 122.9 convention note only when independent metadata indicates a non-towered/small-airport scenario, for example `hours.isTowered === false` from airport-hours/NFDC parsing and/or `getDatasetAirport(code).type === "small_airport"` / `seaplane_base`. Suppress the hint for towered, unknown, medium/large, or non-US cases.

Proposed user-facing messaging:

- Primary warning: `Frequency data could not be loaded for 4W0 from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement.`
- Conditional note: `Because this appears to be a non-towered small airport, 122.9 MHz may be the default self-announce CTAF when no CTAF/UNICOM is assigned. This is not confirmed for 4W0; verify in the Chart Supplement before use.`

Pros:

- Answers the 122.9 question in the cases where it is most relevant.
- Reduces the chance of showing a misleading hint for towered airports.
- Does not require fabricating a normal frequency row.

Cons:

- More complex: frontend/service needs a clear frequency-gap state and access to airport type/towered metadata.
- If towered/non-towered metadata is itself unavailable or stale, the hint must be suppressed.
- Still carries some safety risk because a concrete number is displayed.

## Recommendation

Recommend **Option A now**: messaging-only frequency-gap fix.

Rationale:

1. The confirmed bug is not that the app lacks a 122.9 rule; it is that the app asserts absence from incomplete data. The safe correction is to state "could not be loaded" and direct the user to the FAA Chart Supplement.
2. Aviation data must not be fabricated. 122.9 is a valid default convention for some non-towered no-assigned-frequency cases, but it is not guaranteed and must not be presented as published data for a specific airport.
3. Option A matches the established runway-gap and NOTAM-unavailable patterns: failure to load official data is not evidence of absence.
4. We can later add Option C as a deliberately designed safety-reviewed enhancement if the product needs the educational 122.9 hint. That follow-up should be visually distinct from normal frequency rows and suppressed unless non-towered/small-airport evidence is available.

## Implementation plan

Assign as a small coordinated change:

- **Mattingly (service layer):**
  - Update `src/services/frequencies.ts` so the no-data fallback is not `AIRPORT_NOT_FOUND`.
  - Use a code such as `FREQUENCY_DATA_UNAVAILABLE`, `retryable: true`, and wording that says the data could not be loaded from available sources.
  - Preserve source attribution and avoid returning inferred `Frequency` records.

- **Swigert (frontend messaging):**
  - Update `src/components/OperationsConsole.tsx` frequency empty/error copy to mirror the runway gap pattern.
  - Ensure airport-info nested frequency failures render an amber gap message, not `No published FAA frequencies`.
  - Keep normal successful-empty semantics only if the service can truly distinguish an authoritative empty result; today it cannot for this path.

- **Aaron (dataset):**
  - No immediate dataset change required for Option A.
  - Separately track OurAirports frequency incompleteness for small fields such as 4W0 and decide whether future NASR/NFDC cycle ingestion should replace or overlay `us-frequencies.json`.

- **Lovell / Rai (safety review):**
  - Review copy and tests for the safety invariant: never assert no published frequency when both live NFDC and static data are unavailable/incomplete.
  - If a later Option C hint is proposed, require explicit safety review before showing `122.9 MHz` anywhere in the UI.

Suggested validation for implementers:

- Add/adjust tests around `getFrequencies("4W0")` or a mocked dataset-missing airport so the response is `FREQUENCY_DATA_UNAVAILABLE`, not `AIRPORT_NOT_FOUND`.
- Add/adjust OperationsConsole tests asserting the frequency panel says "could not be loaded" and "not confirmation" rather than "No published FAA frequencies."

### 2026-06-24T21:44:52-07:00: Mattingly frequency-gap implementation
**By:** Mattingly (inbox merge)

_Source inbox:_ `mattingly-frequency-gap-impl.md`

# Mattingly frequency-gap implementation

**Date:** 2026-06-24T21:44:52-07:00  
**Owner:** Mattingly (Backend)  
**Status:** Implemented service-layer contract for Kranz Option C / guarded hybrid

## Response contract for Swigert

`getFrequencies(code)` and `/api/frequencies?airport=CODE` keep confirmed frequencies as the existing success contract: `ApiResponse<Frequency[]>` with `ok: true` and `data: Frequency[]`.

When no confirmed frequency records are available from the local seed, live FAA NFDC, or the static OurAirports fallback, the service returns an error envelope:

```ts
interface FrequencyDataGapResponse extends ApiErrorResponse {
  ok: false;
  data: null;
  error: {
    code: "FREQUENCY_DATA_GAP";
    message: string;
    details: "Available sources returned no confirmed frequency records. Verify CTAF/UNICOM in the official FAA Chart Supplement before use.";
    retryable: true;
    status: 503;
    frequencies: [];
    inferredCtaf?: {
      frequencyMHz: 122.9;
      unverified: true;
      basis: "FAA default CTAF for non-towered airports without an assigned frequency";
    };
  };
}
```

Guard for `error.inferredCtaf`: present only when `getDatasetAirport(code)` resolves to `type` of `small_airport`, `seaplane_base`, `heliport`, or `balloonport`. It is omitted for `medium_airport`, `large_airport`, and unknown/not-in-dataset airports.

## Safety invariant

`error.frequencies` is always `[]` on this data-gap path. `122.9` is never emitted as a confirmed `Frequency` record and must not be rendered as published or FAA-authoritative frequency data.

## Messages

Non-towered guarded hint message:

`Frequency data could not be loaded for {CODE} from our available sources. This is not confirmation that the airport has no published frequency.`

Towered/unknown no-hint message:

`Frequency data could not be loaded for {CODE} from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement.`

### 2026-06-24T21:44:52-07:00: Swigert frequency gap UI
**By:** Swigert (inbox merge)

_Source inbox:_ `swigert-frequency-gap-ui.md`

# Swigert frequency gap UI

**By:** Swigert
**When:** 2026-06-24T21:44:52-07:00

## Decision
OperationsConsole renders `FREQUENCY_DATA_GAP` as an informational frequency-panel gap state using the service-provided message verbatim. When the service includes `error.inferredCtaf`, the UI shows 122.9 MHz only in a separate unverified convention hint, never in the confirmed frequency list.

## Hint copy
Unverified convention — verify before use: 122.9 MHz is the FAA default CTAF convention for non-towered airports without an assigned frequency. This is not confirmed published data; verify CTAF/UNICOM in the FAA Chart Supplement before use.

## Rationale
The user-approved Option C contract distinguishes missing confirmed source data from an authoritative absence of a published frequency. The UI must preserve that distinction and prevent controllers from treating the default non-towered CTAF convention as published data.

### 2026-06-24T22:14:47-07:00: Lovell frequency-gap safety review
**By:** Lovell (inbox merge)

_Source inbox:_ `lovell-frequency-gap-review.md`

# Lovell frequency-gap safety review

**Date:** 2026-06-24T22:14:47-07:00
**Reviewer:** Lovell (Test & Safety)
**Verdict:** PASS

## Safety-critical assertions

1. ✓ 122.9 cannot enter the confirmed `frequencies` array.
   - The data-gap error envelope sets `frequencies: []` and carries the convention separately as `error.inferredCtaf` only when allowed (`src/services/frequencies.ts:91-92`).
   - Confirmed frequency rendering only maps `dashboardData.frequencies` (`src/components/OperationsConsole.tsx:1666-1693`), while airport-info failed frequency lookups merge as `[]` (`src/components/OperationsConsole.tsx:271`).
   - Test evidence: non-towered gap asserts `error.frequencies === []` while `inferredCtaf.frequencyMHz === 122.9` (`tests/unit/services/frequencies-service.test.ts:130-138`).

2. ✓ Every UI surface that shows 122.9 labels it unverified/verify-before-use.
   - The only UI renderer for `inferredCtaf` labels it `Unverified convention — verify before use`, says `not confirmed published data`, and requires FAA Chart Supplement verification (`src/components/OperationsConsole.tsx:150-159`).
   - Both direct frequency gaps and nested airport-info frequency gaps flow through this same renderer (`src/components/OperationsConsole.tsx:165-174`, `src/components/OperationsConsole.tsx:446`, `src/components/OperationsConsole.tsx:1692-1693`).
   - Test evidence: component test requires the unverified label, 122.9 MHz text, and not-confirmed-published-data warning together (`tests/unit/components/operations-console-autorefresh.test.tsx:696-715`).

3. ✓ Towered/unknown airports never show 122.9.
   - `inferredCtaf` is emitted only for dataset airport types `small_airport`, `seaplane_base`, `heliport`, and `balloonport`; all other/unknown types resolve to `undefined` (`src/services/frequencies.ts:26`, `src/services/frequencies.ts:78-93`).
   - Test evidence: towered/medium gap asserts no `inferredCtaf` and empty confirmed frequencies (`tests/unit/services/frequencies-service.test.ts:144-163`); unknown airport gap now asserts the same (`tests/unit/services/frequencies-service.test.ts:166-185`). UI coverage now parameterizes no-122.9/no-label for `5A8` and `ZZZZ` (`tests/unit/components/operations-console-autorefresh.test.tsx:718-737`).

4. ✓ Gap messages do not assert the airport has no frequency.
   - Service messages say `Frequency data could not be loaded... This is not confirmation that the airport has no published frequency` for both hint and no-hint branches (`src/services/frequencies.ts:80-82`).
   - UI prints the service message and, for the convention hint, separately states the value is not confirmed published data (`src/components/OperationsConsole.tsx:152`, `src/components/OperationsConsole.tsx:157-158`).
   - Test evidence: service tests assert the exact no-absence-confirmation message for non-towered, towered, and unknown gaps (`tests/unit/services/frequencies-service.test.ts:139-140`, `tests/unit/services/frequencies-service.test.ts:161-184`).

## Tests added/strengthened

- Added unknown-airport service coverage: `tests/unit/services/frequencies-service.test.ts:166-185`.
- Strengthened UI no-hint coverage to run for both towered/medium `5A8` and unknown `ZZZZ`: `tests/unit/components/operations-console-autorefresh.test.tsx:718-737`.
- Existing coverage confirmed for non-towered hint and normal frequency list unaffected: `tests/unit/services/frequencies-service.test.ts:110-140`, `tests/unit/services/frequencies-service.test.ts:188-195`, `tests/unit/components/operations-console-autorefresh.test.tsx:696-715`, `tests/unit/components/operations-console-autorefresh.test.tsx:739-758`.

## Defects found

None.

## Validation gates

- `npm run lint`: PASS, exit 0, eslint `--max-warnings=0` produced 0 warnings.
- `npm run build`: PASS, exit 0, Next.js 16.2.9 printed `✓ Compiled successfully in 3.4s`.
- `npx vitest run`: PASS, exit 0, 32 test files passed, 245 tests passed, 0 failed.

### 2026-06-24T23:43:21-07:00: Phase B Canada airport database scope
**By:** Kranz (Lead / Architect)
**Requested by:** Devin Sinha
**Source inbox:** `kranz-phase-b-canada-scope.md`

**What:** Phase B adds Canada (`iso_country === "CA"`) to the generated OurAirports fallback dataset as sibling `ca-airports.json`, `ca-runways.json`, and `ca-frequencies.json` files, merged server-side with the existing US generated data. The dataset reader must remain `server-only`; client-safe extraction stays rule-based.

**Safety:** The unverified `122.9 MHz` inferred CTAF hint is US-only: `datasetAirport?.country === "US" && NON_TOWERED_DATASET_AIRPORT_TYPES.has(datasetAirport.type)`. No Canadian ATF/MF/CTAF default is inferred in Phase B; Canadian gaps must point to official Canadian aeronautical publications / NAV CANADA, not FAA-only sources.

**Scope:** Canadian ICAO/local identifiers and city/province extraction are supported without broad client-side generated indexes. NAV CANADA CFS ingestion and Canadian inferred frequency defaults are deferred.

### 2026-06-24T23:59:00-07:00: Phase B Canada dataset foundation
**By:** Aaron (Data)
**Requested by:** Devin Sinha
**Source inbox:** `aaron-phase-b-canada-data.md`

**What:** The airport generator now emits per-country file sets for US and CA while preserving OurAirports transforms, excluded airport types, runway/frequency shapes, and `country` from `raw.iso_country`. The server-only dataset reader merges prefixes `["us", "ca"]` into the existing lookup indexes.

**Evidence:** `npm run generate:airports` produced 16,865 US airports / 17,220 runways / 12,987 frequencies and 1,933 CA airports / 1,439 runways / 1,431 frequencies. `CYVR` resolves as Vancouver International Airport with `country: "CA"` and frequency rows; `CSQ4` was used as a Canadian local-code spot check.

**Validation:** `npm run generate:airports`, lint with zero warnings, build, and Vitest passed (81 suites / 247 tests at this slice).

### 2026-06-24T23:55:00-07:00: Phase B frequency CTAF gating
**By:** Mattingly (Backend)
**Requested by:** Devin Sinha
**Source inbox:** `mattingly-phase-b-freq-gating.md`

**What:** Frequency gaps emit the unverified `122.9 MHz` CTAF convention only for known US non-towered dataset airports. Canadian and other known non-US dataset airports never receive `inferredCtaf`; Canadian frequency gaps direct users to official Canadian aeronautical publications / NAV CANADA.

**Evidence:** `CAA4` verifies the Canadian no-frequency gap path with no inferred CTAF; `CYVR` verifies confirmed Canadian OurAirports frequency rows still return normally.

### 2026-06-24T23:55:00-07:00: Phase B Canada entity extraction
**By:** Haise (AI/NLP Engineer)
**Requested by:** Devin Sinha
**Source inbox:** `haise-phase-b-canada-extraction.md`

**What:** Entity extraction now normalizes Canadian provinces/territories (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT and full names), parses city/province phrases like `Vancouver, BC`, and accepts contextual Canadian `C[A-Z0-9]{3}` airport identifiers without importing server-only generated data.

**Safety:** Extraction remains client-safe and rule-based. Stopwords including `INFO` and `NO` guard against prior overmatch classes.

**Validation:** Tests cover `CYVR weather`, `frequencies at CYXX`, `show me the airport at Vancouver, BC`, contextual `CAT4`, US city/state regression, and no `NO`/`INFO` airport overmatch.

### 2026-06-24T23:55:01-07:00: Phase B Canada UI copy guardrails
**By:** Swigert (Frontend)
**Requested by:** Devin Sinha
**Source inbox:** `swigert-phase-b-ui-copy.md`

**What:** The UI keeps the `inferredCtaf` display block but relies on Mattingly's server gate so it never appears for Canadian airports. Airport-info runway and frequency gaps now prefer server-provided messages, allowing Canadian NAV CANADA / official-publications copy while retaining FAA-specific wording for US responses.

**Coverage:** OperationsConsole verifies a Canadian frequency gap message containing NAV CANADA renders without a 122.9 hint. FacilityOverview runway gaps use server-provided copy; DiagramPanel's Chart Supplement controls were reviewed and left unchanged because they are reference links, not fallback authority text.

### 2026-06-25T00:03:54-07:00: Rai Phase B Canada RAI review resolved
**By:** Rai (RAI Reviewer)
**Requested by:** Devin Sinha
**Source inbox:** `rai-phase-b-review.md`

**What:** Rai initially rated Phase B yellow because frequency jurisdiction safeguards were sound but runway data-gap copy still risked pointing Canadian airports to the FAA Chart Supplement. The advisory required jurisdiction-aware runway gap copy: Canadian gaps use Canadian aeronautical publications / NAV CANADA, other non-US gaps use neutral jurisdiction wording, and FAA Chart Supplement remains US-only.

**Outcome:** Mattingly's runway jurisdiction gate resolved the yellow finding; no critical blocker remained.

### 2026-06-25T00:09:27-07:00: Phase B runway jurisdiction gating
**By:** Mattingly (Backend)
**Requested by:** Devin Sinha
**Source inbox:** `mattingly-phase-b-runway-jurisdiction.md`

**What:** Runway lookup resolves the generated dataset airport before FAA NFDC. Known non-US dataset airports skip FAA NFDC and use generated dataset runways directly when present; US or unknown-country airports can still use FAA NFDC.

**Jurisdiction copy:** US runway gaps keep FAA Chart Supplement wording; Canadian gaps direct users to official Canadian aeronautical publications / NAV CANADA; other known non-US gaps use neutral official-publications-for-that-jurisdiction wording; unknown airport-not-found copy no longer treats FAA as the sole database.

**Evidence:** `CYVR` returns Canadian OurAirports runways without querying FAA NFDC; `CAA4` returns Canadian/NAV CANADA gap wording with no FAA/NFDC/Chart Supplement copy; `00AA` preserves the US FAA Chart Supplement gap path.

### 2026-06-25T00:08:00-07:00: Phase B Canada safety review PASS
**By:** Lovell (Test/Safety)
**Requested by:** Devin Sinha
**Source inbox:** `lovell-phase-b-safety-review.md`

**Verdict:** PASS — 5/5 safety areas passed with no RED blocker.

**Findings:** 122.9 CTAF is gated to US non-towered dataset airports; Canadian data is direct OurAirports CSV transform with no fabricated Canadian overrides; `src/data/airport-dataset.ts` remains server-only and generated CA data was not found in the static client bundle; UI data-gap states render Canadian-safe server messages; US regressions remain covered.

**Validation:** `npm run generate:airports`, lint with zero warnings, build, targeted safety/entity tests, and full Vitest passed. Final full-suite evidence in the shipment manifest was 260 tests passing after Rai's yellow finding was resolved.

### 2026-06-25T17:10:00Z: Haise route classification fix
**By:** Haise

- Bug: clear point-to-point route requests such as `show me a direct route from KPAE to CYYJ` were being treated as ambiguous because route queries could also trigger passive `airport_info` classification.
- Fix: excluded `NAVIGATION_PATTERN` matches from airport-info candidate/collapse paths so navigation action intents win cleanly; also allowed navigation endpoint resolution for contextual ICAO codes such as CYYJ.
- Tests added: route regressions for US→Canada and US→US direct routes, alternate heading/distance phrasings, pure airport info (`show me info for KSEA`), and compound airport-info collapse (`weather and notams for KSEA`).
- Validation: shipped in commit `5070c70`; live-verified. `npm run lint` passed with 0 warnings; `npm run build` passed; `npm test` passed with 261/261 tests.

### 2026-06-25T17:10:00Z: Haise navigation reversal fix
**By:** Haise

Added a positional `X to Y` navigation endpoint extractor in `src/ai/entity-extractor.ts` that preserves typed order for alphanumeric airport identifiers such as `38W` while still resolving aliases like `pae` to `KPAE`.

The fallback airport extraction returns bucket-ordered codes, not text-ordered codes, which reversed routes like `pae to 38w route`. The guarded pattern resolves both captured endpoint tokens before returning, so ordinary English phrases containing `to` fall through to existing behavior.

Files: `src/ai/entity-extractor.ts`, `src/ai/intent-parser.test.ts`.
Validation: shipped in commit `5070c70`; live-verified. `npm run lint` passed with 0 warnings; `npm run build` passed; `npm test -- --reporter=dot` passed with 266 tests.

### 2026-06-25T17:10:00Z: Plates jurisdiction gap handling
**By:** Mattingly

Decision: Mirror the Phase B runway/frequency jurisdiction guard for FAA DTPP-backed plates. When `getDatasetAirport(code)?.country` is a non-US country, the plates service skips FAA DTPP entirely and returns `PLATES_DATA_GAP` with a jurisdiction-aware message instead of `AIRPORT_NOT_FOUND` or an empty-procedures implication.

Rationale: FAA DTPP current.xml does not enumerate Canadian airports such as CYYJ. Treating that absence as airport/procedure absence is misleading; Canadian procedures are published through NAV CANADA / Canada Air Pilot (CAP), and the app should direct users to official national publications rather than invent data.

UI plumbing: OperationsConsole extracts `PLATES_DATA_GAP` errors from direct plates queries and airport_info nested plate/SID/STAR/ODP/diagram responses, passes them as `jurisdictionNotes` to PlateViewer, and PlateViewer renders the note instead of generic empty-state copy.

Validation: shipped in commit `5070c70`; live-verified: CYYJ returns the NAV CANADA / Canada Air Pilot note.

### 2026-06-25T17:10:00Z: Mattingly navigation dataset coordinates fallback
**By:** Mattingly

Decision: Use the existing curated-airport-first, dataset-airport-fallback resolution path in the orchestrator navigation case while keeping `src/services/navigation.ts` client-safe.

Why: `getNavigationBetween` only resolved through the curated airport list, so dataset-only airports like CYYJ could not produce route coordinates. The orchestrator already owns server-only dataset fallback imports, so it is the right boundary for resolving both endpoints before computing navigation.

Files:
- `src/services/navigation.ts`: added `getNavigationBetweenReferences(from, to, speedKnots)` and kept `getNavigationBetween(...)` as the curated-only compatibility wrapper.
- `src/services/orchestrator.ts`: navigation case now resolves `from` and `to` via `findAirportReference(...) ?? findDatasetAirportReference(...)`, preserves the existing lookup-failed error, and computes from resolved references.
- `tests/unit/navigation-service.test.ts`: added reference-based math coverage, CYYJ dataset fallback coverage, and KPAE→CYYJ orchestrator coverage.

Validation: shipped in commit `f5d3260`; deployed and live-verified: KPAE→CYYJ returns trueHeading 315, magneticHeading 298, 63.8nm. `npm run lint` passed with 0 warnings; `npm run build` passed; `npm test` passed with 269 tests.

### 2026-06-25T17-29-55: Phase C Caribbean dataset aggregates multiple OurAirports iso_country codes and normalizes PR/VI to US jurisdiction
**By:** Aaron
**What:** Phase C Caribbean dataset aggregates multiple OurAirports iso_country codes and normalizes PR/VI to US jurisdiction
**References:** scripts\generate-airport-dataset.ts, src\data\airport-dataset.ts, tests\unit\data\airport-dataset.test.ts
**Why:** For ATC Companion Phase C, the generated Caribbean dataset uses a single `carib` prefix that aggregates OurAirports iso_country values AG, AI, AW, BB, BL, BQ, BS, CU, CW, DM, DO, GD, GP, HT, JM, KN, KY, LC, MF, MQ, MS, PR, SX, TC, TT, VC, VG, and VI. PR and VI records remain in the carib generated JSON files but emit `country: "US"` because Puerto Rico and the U.S. Virgin Islands are FAA-served territories; this preserves existing `country === "US"` FAA/NFDC lookup and messaging behavior without adding service-specific Caribbean branches. Other Caribbean country codes retain their raw iso_country value and therefore use the existing generic foreign-jurisdiction messaging.

### 2026-06-25T17-41-07: Recognize precise Caribbean ICAO prefixes in the local entity extractor
**By:** Haise
**What:** Recognize precise Caribbean ICAO prefixes in the local entity extractor
**References:** src\ai\entity-extractor.ts, src\ai\intent-parser.test.ts
**Why:** Added CARIBBEAN_ICAO_SHAPE using only dataset-backed T-series prefixes (TA, TB, TD, TF, TG, TI, TJ, TK, TL, TN, TQ, TR, TT, TU, TV) and M-series prefixes (MB, MD, MK, MT, MU, MW, MY). Included this shape in contextual extraction and directCodes so contextual queries like "weather at MYNN" and bare Caribbean ICAOs are treated like existing Canadian ICAOs. Added stopwords for high-collision Caribbean-shaped ordinary words (TIME, TAXI, TAKE, TALK, TASK, TIDE, TINY, TIRE, MUST, MUCH, MUTE) to protect the direct path.

### 2026-06-25T17:46:00Z: PR/VI airports keep FAA/NFDC treatment
**By:** Devin Sinha (via Copilot)
**What:** Puerto Rico (TJ*) and US Virgin Islands (TI*) airports are normalized to country="US" in the Caribbean dataset, so they retain full FAA/NFDC treatment (NFDC runway lookups, 122.9 CTAF hint, FAA plate sourcing) rather than generic non-US Caribbean handling.
**Why:** User confirmed — PR/VI are US jurisdictions and should be treated as such. This ratifies the shipped Phase C behavior; no code change required.

### 2026-06-25T17-51-09: Add conservative Canadian ICAO trailing context cues for airport intents
**By:** Haise
**What:** Add conservative Canadian ICAO trailing context cues for airport intents
**References:** src/ai/entity-extractor.ts, src/ai/intent-parser.test.ts, BUG: cyyj traffic missing airport
**Why:** Fixed the production issue where `cyyj traffic` dropped CYYJ by adding `traffic` to `AIRPORT_CONTEXT_AFTER_WORDS` in `src/ai/entity-extractor.ts`. Audited supported airport query intents and also added trailing cues that map directly to existing supported intents and read naturally after an airport code: `plates`, `approaches`, `departures?`, `arrivals?`, `sids?`, `stars`, and `hours`. These allow Canadian ICAO/local identifiers such as CYYJ/CYVR to resolve through the contextual path for traffic, plates/SID/STAR/approach-plate, and airport-hours queries without adding Canadian codes to the direct ICAO filter. I intentionally did not add `route`: although route queries are supported, `{CODE} route` is ambiguous/incomplete for navigation and `route` is broad enough to increase false positives such as ordinary C-prefix words before route. I also did not add singular `star` because it has a higher ordinary-language collision risk; `stars` is the natural procedure-list noun. I left `AIRPORT_CONTEXT_WORDS` unchanged because leading traffic phrasing (`traffic at cyyj`) is already covered by the existing `at` leading context word and is now covered by tests.

### 2026-06-25T18-09-05: Documented OurAirports and NAV CANADA source boundaries
**By:** Aaron
**What:** Documented OurAirports and NAV CANADA source boundaries
**References:** docs/data-sources.md, scripts/generate-airport-dataset.ts, src/data/airport-dataset.ts, src/services/plates.ts, src/services/runway-info.ts, src/services/frequencies.ts
**Why:** Updated docs/data-sources.md to add the OurAirports community dataset as the bundled/generated medium-reliability corpus for airport identifiers, names, coordinates, runways, and frequencies. Verified generator inputs and generated us/ca/carib JSON behavior from scripts/generate-airport-dataset.ts and src/data/airport-dataset.ts, and verified NAV CANADA jurisdiction-aware chart/runway/frequency messages from src/services/plates.ts, src/services/runway-info.ts, and src/services/frequencies.ts. No code changes or git operations were performed.

### 2026-06-25T11:07:00-07:00: Kranz product docs update
**By:** Kranz
**What:** Updated product documentation for global airport database feature
**References:** README.md, docs/FEATURES.md, docs/ARCHITECTURE.md, scripts/generate-airport-dataset.ts, src/data/airport-dataset.ts, src/ai/entity-extractor.ts, src/services/plates.ts, src/services/runway-info.ts, src/services/frequencies.ts, src/services/dataset-airport-fallback.ts
**Why:** Updated README.md, docs/FEATURES.md, and docs/ARCHITECTURE.md to document the generated OurAirports-backed global airport database (US/Canada/Caribbean), jurisdiction-aware non-US handling, NAV CANADA messaging for Canadian chart/runway/frequency gaps, PR/VI FAA treatment, and entity-extraction fixes for Canadian contextual codes, Caribbean ICAO codes, and trailing query cues. Verified against the generator, dataset, extraction, and service files.

### 2026-06-25T18-39-14: Mexico airport dataset added as its own MX-filtered segment
**By:** Aaron
**What:** Mexico airport dataset added as its own MX-filtered segment
**References:** TASK: Add Mexico to global airport dataset pipeline, scripts/generate-airport-dataset.ts, src/data/airport-dataset.ts
**Why:** Added an `mx` dataset segment to the airport generator that filters OurAirports rows by ISO country `MX`, exactly mirroring the Canada country-filter path. Mexico is loaded as a non-US/non-CA jurisdiction, preserving `country: "MX"` for downstream routing; existing PR/VI normalization remains unchanged. Regeneration produced 1,585 Mexico airports, 200 runway rows, and 153 frequency rows, and lookup samples MMMX, MMUN, MMTJ, MMGL, and MMMY all resolve with country MX.

Validation note: adding Mexico introduced an OurAirports local-code collision (`PAE` exists as Mexico local code for MX-0316 and as Paine Field's US IATA/local code). The dataset lookup now prioritizes stronger code types (ident > ICAO > GPS > IATA > local) so Mexican ICAO lookups remain available while established IATA/local lookups like PAE continue routing to the US airport.

### 2026-06-25T11:46:16-07:00
**By:** Haise
**What:** Explicit airport-code matches are ordered before fuzzy airport name matches; Canadian CY/CZ ICAO-looking tokens are admitted as explicit direct codes so typed CYNJ can outrank the Langley name match.
**Why:** User-entered ICAO codes are stronger intent signals than fuzzy place-name matches, and preserving fuzzy matches later in the dedupe keeps name-only resolution working.

### 2026-06-25T18-42-02: Recognize Mexican MM-prefixed ICAO codes in direct and contextual parser paths
**By:** Haise
**What:** Recognize Mexican MM-prefixed ICAO codes in direct and contextual parser paths
**References:** src/ai/entity-extractor.ts, src/ai/intent-parser.test.ts
**Why:** Added MEXICAN_ICAO_SHAPE as /^MM[A-Z0-9]{2}$/ for Mexican ICAO identifiers. False-positive analysis: unlike Canadian C-prefixed four-letter shapes, common English four-letter words starting with "MM" are essentially absent because "MM" is not a productive English word-initial bigram; ordinary phrases like "memo", "many", "maps", and "mm hmm" do not collide. Therefore the Mexican shape follows the Caribbean precedent and is wired into both direct extraction and contextual extraction, allowing bare codes such as MMMX and contextual/trailing-cue forms such as MMUN traffic, while still respecting stopwords and dedupe behavior.

### 2026-06-25T18-39-13: Mexico jurisdiction service messaging uses SENEAM/AFAC AIP
**By:** Mattingly
**What:** Mexico jurisdiction service messaging uses SENEAM/AFAC AIP
**References:** src/services/runway-info.ts, src/services/frequencies.ts, src/services/plates.ts
**Why:** For ATC Companion service-layer Mexico routing, airports with dataset country="MX" / ICAO prefix MM are treated as non-FAA and non-NAV CANADA. Runway and frequency services skip FAA NFDC via the existing non-US dataset-country gate and use OurAirports dataset rows when available. If data is unavailable, Mexico-specific gap copy tells users to verify in Mexico's official SENEAM/AFAC AIP publications. Plate/procedure gaps state that Mexican procedures are published in Mexico's AIP by SENEAM/AFAC, not FAA DTPP or NAV CANADA.

