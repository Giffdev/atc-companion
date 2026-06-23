# Lovell Audit Findings — Phase 2 Full-Codebase Safety Review

**Auditor:** Lovell (Test/Safety)  
**Date:** 2026-06-23  
**Requested by:** Devin Sinha  
**Scope:** Test coverage, safety-critical correctness, lint debt  
**Status:** READ-ONLY audit — no code changes made  

---

## 1. Failing Test Triage (6 in scope + 1 discovered)

| Test | Real bug or test bug? | Root cause | Fix owner | Recommended fix |
|------|----------------------|------------|-----------|-----------------|
| `facility-adjacency.test.ts` — "returns parent center, regional TRACONs, and covered towers for an approach query" | **Real product bug** | `KTCM` (McChord AFB) is absent from `TOWERED_AIRPORTS` set in `src/data/facilities.ts`. S46 Seattle Approach lists `KTCM` in its `airports` array; `towerIdForAirport("KTCM")` → `KTCM-TWR` is therefore generated but `getFacilityById("KTCM-TWR")` returns null. `resolveNeighborSummaries` silently drops null → `KTCM-TWR` never appears. | Data owner | Add `"KTCM"` to `TOWERED_AIRPORTS` in `src/data/facilities.ts` |
| `operations-console-autorefresh.test.tsx` — "auto-refreshes traffic queries every 15 seconds with cache bypass" | **Test bug (stale)** | OperationsConsole mount `useEffect` (line 811) fires a warmup fetch `fetch("/api/weather?station=KSEA&warmup=1", …)` that the test's `fetchMock` records but was added after the test was written. Test asserts `fetchMock.toHaveBeenCalledTimes(1)` after the first query submit, but gets 2 (warmup + query). | Test owner | Reset or filter the mock after mount: use `fetchMock.mockClear()` inside `act(async () => { /* let mount effects settle */ })` before asserting, or filter `fetchMock.mock.calls` by URL. |
| `operations-console-autorefresh.test.tsx` — "auto-refreshes weather queries every 60 seconds with cache bypass" | **Test bug (stale)** | Same warmup fetch root cause as above. | Test owner | Same fix as above. |
| `traffic-service.test.ts` — "maps upstream 404, 500, and timeout failures into explicit error codes" | **Test bug (stale) + architecture drift** | Traffic service was refactored to use ADSB.fi as primary source with OpenSky as fallback (`src/services/traffic.ts:184–254`). The `mock-aviation-fetch.ts` fixture only intercepts `opensky-network.org` (key `"opensky"`), not `opendata.adsb.fi`. When the mock receives the ADSB.fi URL it throws `"Unexpected fetch URL in test"`. ADSB.fi fails → OpenSky is tried with the injected 404/500/abort override → both sources fail → service returns `UPSTREAM_UNAVAILABLE` (503) not `UPSTREAM_NOT_FOUND` (404). Test was written for the old single-source shape. | Test owner (fixture gap) | Add `"adsbFi"` key with pattern `"opendata.adsb.fi/api/v2"` to `KEY_BY_URL` in `mock-aviation-fetch.ts`, add a default ADSB.fi payload (mirroring `AdsbFiResponse` shape), and wire override support. Tests can then inject the per-source override for error-code assertions. |
| `traffic-service.test.ts` — "uses cache metadata to avoid refetching unchanged traffic searches" | **Test bug (stale)** | Same fixture gap. Each `getTraffic()` call now makes 2 network attempts: ADSB.fi fails (not in mock → throws) then OpenSky succeeds. First call: 2 fetches. Second call: ADSB.fi no-cache-key-match (different cache key path) = 1 more fetch; OpenSky cache hit = 0 more. Total = 3 actual calls vs expected 1. | Test owner (Mattingly for backend cache aspect) | Add ADSB.fi to fixture (same fix as above). Once fixture covers ADSB.fi, ADSB.fi succeeds on first call and is cached for second → test expectation of 1 call is satisfied. |
| `traffic-service.test.ts` — "bypasses cache when explicitly requested" | **Test bug (stale)** | Same fixture gap. Expected 2 total calls (1 miss + 1 bypass), got 4 (each `getTraffic()` makes 2 fetches because ADSB.fi isn't mocked). | Test owner (Mattingly for cache bypass logic) | Same fixture fix. |
| ⚠️ `source-verification.test.ts` — "authoritative aviation responses stay inside the approved source allowlist" | **Test-data bug + real safety gap** | **Discovered — not in original scope of 6.** `AUTHORITATIVE_DOMAIN_ALLOWLIST` in `tests/fixtures/api-responses.ts:12` does not include `opendata.adsb.fi`. When both ADSB.fi and OpenSky fail (global mock throws for unrecognized URLs, neither is mocked in this file), `createApiErrorResponse` is called with `source: TRAFFIC_FALLBACK_SOURCE` (`adsbFi`, URL `opendata.adsb.fi`). That URL fails the allowlist check. | Test owner + Data owner | Add `"opendata.adsb.fi"` to `AUTHORITATIVE_DOMAIN_ALLOWLIST`. Also add ADSB.fi mock to this test's beforeEach. |

---

## 2. Coverage Gaps — Priority Test Additions

Ranked by aviation safety impact:

### P0 — Missing coverage on safety-critical paths

1. **`AtisStrip` component** (`src/components/AtisStrip.tsx`) — **No unit test.**  
   ATIS letters are the primary crew/controller handoff touchpoint. No test covers: correct staleness display, auto-refresh interval, graceful degradation when clowd.io returns non-200, silent-failure state (stuck in "Loading ATIS..."), or correct rendering of INFO letters across combined/departure/arrival types.

2. **`/api/atis` route** (`src/app/api/atis/route.ts`) — **Not covered by any integration test.**  
   The route inlines D-ATIS fetch logic (no service abstraction), performs its own staleness calculation, limits to 10 airports, and silently returns `null` on failure. None of these paths are tested.

3. **`notams.ts` service** (`src/services/notams.ts`) — **No service-level unit test** (integration test only).  
   NOTAMs are safety-critical: closure of taxiways, runways, and airspace. No test for: upstream parse errors, FAA API auth-header failures, notam `entity` field classification, or end-date filtering.

### P1 — Core service logic gaps

4. **`orchestrator.ts`** (`src/services/orchestrator.ts`) — **No unit test.**  
   Orchestrator routes intents to services. No test covers: unknown intent fallback, partial upstream failure with graceful degradation, airport_info payload assembly.

5. **`frequencies.ts` service** — **No service-level unit test** (integration only).  
   Frequency data is what controllers read on air — wrong MHz is operationally dangerous. No unit test for: NASR data parsing, VHF range enforcement (covered only by `data-integrity.test.ts`), multi-facility lookup.

6. **OperationsConsole facility-change side-effect** — **Not tested.**  
   `useEffect` at line 1068 clears all state on facility change and auto-fetches traffic/weather/plates for the new facility. No test covers this flow: stale data could persist across facility switches.

### P2 — Component and infrastructure gaps

7. **`WeatherDisplay` component** — No test. Weather is P0 for VFR/IFR decisions; rendering bugs are high-risk.
8. **`TrafficMap` component** — No test. Silent `no-floating-promises` lint error at line 144 also unguarded.
9. **`runway-info.ts` service** — No test.
10. **`airport-hours.ts` service** — No test.
11. **`/api/plate-proxy` route** — Not covered by integration tests. Proxy forwards FAA PDF URLs; a broken proxy silently fails plate loads.
12. **OperationsConsole error state rendering** — No test for when `fetchLiveQuery` rejects (network down) — `submitError` state and UI fallback are untested.

---

## 3. Safety-Critical Correctness Findings

### [HIGH] ATIS route returns no `source` or `attribution` metadata
**File:** `src/app/api/atis/route.ts:63`  
**WHAT:** Route returns `{ airports: {...}, fetchedAt: '...' }`. There is no `source`, `attribution`, or `isStale` field at the envelope level (stale is per-entry only).  
**WHY:** Every other API route returns standardized provenance (`source`, `attribution.primary`, `isStale`). The ATIS response breaks the contract, bypassing all safety tests in `source-verification.test.ts` and `data-integrity.test.ts`.  
**HOW:** If a client renders ATIS data it cannot determine whether the data came from a trustworthy source or an intercepted/degraded feed.

### [HIGH] ATIS silent failure leaves component in "Loading ATIS..." state indefinitely
**File:** `src/components/AtisStrip.tsx:38–50`, `src/components/AtisStrip.tsx:63–65`  
**WHAT:** `fetchAtis()` catch block is completely silent. When `lastFetch` is never set (first fetch fails), `activeEntries.length === 0 && lastFetch` is false, so the component renders "Loading ATIS..." forever. A controller looking at a stuck loading strip could infer "no ATIS" rather than "fetch failed."  
**WHY:** ATIS letter is used to verify crew–controller information exchange. A stuck "loading" state with no error is a silent hazard.  
**HOW:** Set `lastFetch` even on failure (e.g., `setLastFetch(new Date().toISOString())`), or surface a degraded-mode indicator after first-fetch failure.

### [HIGH] `AUTHORITATIVE_DOMAIN_ALLOWLIST` does not include `opendata.adsb.fi`
**File:** `tests/fixtures/api-responses.ts:12–17`; production impact in `src/services/traffic.ts:10–11`  
**WHAT:** `TRAFFIC_FALLBACK_SOURCE` (actually the PRIMARY source now) has `url: "https://opendata.adsb.fi/api/v2"`. `AUTHORITATIVE_DOMAIN_ALLOWLIST` only contains `opensky-network.org`. The `source-verification.test.ts` enforcement of source provenance is broken for the actual production primary path.  
**WHY:** The allowlist is the last safety backstop ensuring traffic data is attributed to a real authority. With the list out of date, a bug that routes to an internal or synthetic URL would pass the safety check.  
**HOW:** Add `"opendata.adsb.fi"` to the allowlist. Also update the integration test mock in `api-routes.test.ts:114` and `no-fabrication.test.ts:58` and `source-verification.test.ts:58` to also include ADSB.fi mocks so tests exercise the actual primary code path.

### [HIGH] KTCM (McChord AFB) missing from TOWERED_AIRPORTS — product bug
**File:** `src/data/facilities.ts:42–66`  
**WHAT:** `KTCM` does not appear in `TOWERED_AIRPORTS`. McChord Field (Joint Base Lewis-McChord) is a controlled USAF airfield covered by Seattle Approach (S46). The `approach-facilities.ts:18` lists `KTCM` in S46's `airports` array.  
**WHY:** S46's adjacentTowers silently omits KTCM-TWR. A controller querying adjacent towers for S46 will not see McChord, missing a handoff point on the south approach into SeaTac. Real-world consequence: incomplete picture of towered airports under S46's scope.  
**HOW:** Add `"KTCM"` to `TOWERED_AIRPORTS` in `facilities.ts`.

### [MEDIUM] Multiple unhandled promises in OperationsConsole — silent data staleness
**File:** `src/components/OperationsConsole.tsx:1052, 1102, 1186, 1303, 1323`  
**WHAT:** Five `no-floating-promises` lint errors — async calls (facility dashboard fetch, auto-refresh, query submit side-effects) are fire-and-forget with no error handler.  
**WHY:** If any of these fail silently, the previous result stays on screen marked as current. In an aviation context, stale traffic or weather shown with no error indicator is a hazard.  
**HOW:** Wrap each fire-and-forget in `void fetchSomething().catch(handleError)` or convert to awaited calls where possible.

### [MEDIUM] `react-hooks/exhaustive-deps` — stale closure on facility change
**File:** `src/components/OperationsConsole.tsx:1189`  
**WHAT:** The `useEffect` at line 1068–1189 lists `[selectedFacility?.id, selectedFacility?.type, fetchLiveQuery]` but ESLint warns about missing `selectedFacility`. If `selectedFacility` changes in a way that its `id` and `type` stay the same but other properties differ, the effect will not re-run and stale facility data could be used in the next `fetchLiveQuery` call.  
**WHY:** Correctness risk: wrong airport data fetched for a visually-changed facility.  
**HOW:** Include `selectedFacility` in the dependency array; if the full object inclusion causes over-firing, wrap in `useCallback` with a stable identity.

### [MEDIUM] `no-fabrication.test.ts` allowlist enforcement doesn't cover ADSB.fi primary path
**File:** `tests/safety/no-fabrication.test.ts:101–108`  
**WHAT:** No-fabrication safety test currently only passes because ADSB.fi fails in the test environment (no mock), and OpenSky also fails, resulting in `ok: false` from traffic. The assertion `expect(payload.ok).toBe(true)` at line 87 should catch this but the test passes — meaning the traffic ok check is incidentally passing. (Confirmed passing in test run but warrants investigation.)  
**WHY:** The test may be giving false confidence about the primary ADSB.fi path.  
**HOW:** Add ADSB.fi mock to `no-fabrication.test.ts` beforeEach and verify `ok: true` for traffic explicitly.

### [LOW] `FAA_TFR_SEARCH_URL` dead variable signals incomplete TFR coverage
**File:** `src/services/notams.ts:14`  
**WHAT:** `FAA_TFR_SEARCH_URL` is assigned but never used (lint error `no-unused-vars`). TFRs (Temporary Flight Restrictions) are critical for airspace safety but appear planned/unimplemented.  
**WHY:** If TFRs are silently omitted from NOTAM responses, controllers and pilots see an incomplete airspace picture.  
**HOW:** Either implement TFR search and remove the lint error, or remove the dead variable and document the TFR gap as a known limitation in the NOTAM service.

---

## 4. Lint Debt Classification

Total: **14 errors, 2 warnings** (`npx eslint src`)

### Correctness Risk (address before next release)

| Error | File | Line | Risk | Type |
|-------|------|------|------|------|
| `no-floating-promises` | `OperationsConsole.tsx` | 1052, 1102, 1186, 1303, 1323 | **HIGH** — silent failures hide stale aviation data | Correctness |
| `react-hooks/exhaustive-deps` (missing `selectedFacility`) | `OperationsConsole.tsx` | 1189 | **HIGH** — stale closure may show wrong facility data | Correctness |
| `no-floating-promises` | `TrafficMap.tsx` | 144 | **MEDIUM** — traffic map failures silently swallowed | Correctness |
| `react-hooks/set-state-in-effect` + `no-floating-promises` + `no-misused-promises` | `AtisStrip.tsx` | 53, 54 | **MEDIUM** — ATIS refresh loop risk | Correctness |
| `react-hooks/exhaustive-deps` (missing `resolveDefaultTab`) | `PlateViewer.tsx` | 167 | **MEDIUM** — wrong plate tab may display after intent change | Correctness |

### Cosmetic / Low Risk (clean up in a future lint pass)

| Error | File | Line | Risk | Type |
|-------|------|------|------|------|
| `no-unused-vars` (`AirportHours`) | `OperationsConsole.tsx` | 41 | Low | Dead import |
| `react-hooks/set-state-in-effect` (localStorage hydration) | `OperationsConsole.tsx` | 807 | Low — intentional SSR hydration pattern | Style |
| `react-hooks/set-state-in-effect` (facility-change reset) | `OperationsConsole.tsx` | 1070 | Low — intentional batch reset, no external subscription | Style |
| `react-hooks/set-state-in-effect` (tab reset on new query) | `PlateViewer.tsx` | 161 | Low — conditional, guards against re-rendering loops | Style |
| `no-unused-vars` (`FAA_TFR_SEARCH_URL`) | `notams.ts` | 14 | Low — but signals TFR gap (see safety finding above) | Dead code |

---

## 5. Additional Observations

### Integration tests mask ADSB.fi primary path
All integration tests (`api-routes.test.ts`, `no-fabrication.test.ts`, `source-verification.test.ts`) mock only `opensky-network.org`, not `opendata.adsb.fi`. In tests, ADSB.fi always fails silently and OpenSky takes over as de facto primary. **Every "traffic happy path" integration test is actually testing the fallback path, not the primary.** If ADSB.fi develops a behavioral regression (wrong data format, unexpected shape), no test will catch it.

**Recommendation:** Add ADSB.fi mock to `mock-aviation-fetch.ts` fixture with a valid `AdsbFiResponse` payload and update `KEY_BY_URL` to include the ADSB.fi URL pattern.

### OperationsConsole warmup fetch side-effect in tests
The warmup call at `OperationsConsole.tsx:811` (`fetch("/api/weather?station=KSEA&warmup=1", …).catch(() => {})`) fires on every component mount. This will trip any test that:
- Renders `OperationsConsole` and counts `fetchMock.mock.calls` without accounting for the warmup
- Uses `vi.stubGlobal("fetch", ...)` and expects controlled isolation

The current test setup doesn't exclude this fetch. Recommend either:  
a) Extracting the warmup call to a testable util and making it injectable, or  
b) Skipping the warmup when a `data-testid` or env flag signals test environment.

### `KTCM` also missing from approach-facilities test coverage
KTCM appears in `approach-facilities.ts` (S46 airports list) but the controlled tower facility is missing from `facilities.ts`. Other airports in S46's list that ARE in `TOWERED_AIRPORTS`: `KSEA`, `KBFI`, `KRNT`, `KPAE`. Airports NOT in `TOWERED_AIRPORTS`: `KOLM` (correctly included), `KPWT` (no tower), `KTIW` (correctly included as Class D), `KTCM` (should be included — military tower with civil traffic), `KAWO` (no tower), `KPLU` (no tower). So KTCM is the only substantive omission.

---

## 6. Coordination with Mattingly

Mattingly is root-causing the traffic-service **cache** failures from the backend angle. My findings on those two tests:

- **Test 5** (cache metadata refetch): The test expectation of `fetchMock.toHaveBeenCalledTimes(1)` is the wrong value given the ADSB.fi-first architecture. Even if Mattingly fixes the underlying cache behavior, the test will still fail until the fixture is updated. Test fix required by test owner.
- **Test 6** (cache bypass): Same — the `toHaveBeenCalledTimes(2)` expectation needs to become `4` (or the ADSB.fi mock needs to be added so ADSB.fi hits the cache and only 2 total fetches happen on the ADSB.fi path).

Recommend: Mattingly and test owner coordinate fixture update in the same PR to avoid re-breaking.

---

*Findings delivered to `.squad/audit/lovell-findings.md` and `.squad/decisions/inbox/lovell-failing-tests.md`*  
*All analysis is read-only. No production code or tests were modified.*
