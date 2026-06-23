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
