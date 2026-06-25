# Mattingly — History

## 2026-06-17: Project kickoff
- Joined as Backend Dev for ATC Companion
- Responsible for API routes, external data integration, caching
- Data sources: FAA, aviationweather.gov, OpenSky Network
- Critical: all responses must include source attribution and timestamps
- YOLO mode active

## 2026-06-17: Session integration snapshot
- Implemented six live data services covering weather, NOTAM, traffic, regulatory, chart, and airport reference sources plus caching/retry support.
- Backend contracts now operationalize Aaron's registry definitions and accept Haise's parsed query intents through updated API routes.
- Response shape supports Swigert's UI attribution needs and is guarded by Lovell's safe-failure and no-fabrication tests.

## 2026-06-23: Phase 1 shipped — D-ATIS staleness fix
- Added `parseAtisIssuanceTime(datis, nowMs?)` to `src/services/datis.ts`; extended `AtisInfo` with `issuedAt / ageMinutes / stale`.
- Updated `route.ts` to expose all three new fields in API response.
- Changed `ATIS_STALE_THRESHOLD_MIN` from 60 → 30 (Aaron's recommendation).
- Added `nowMs` optional param for testability (Lovell S1).
- Build clean; 15/15 ATIS tests pass; 0 new regressions.

## 2026-06-23: Phase 2b Wave 1 — Orchestrator regulatory dispatch + facility_info 501
- **T1g — `searchAllRegulatory`:** `dispatchIntent` regulatory case now calls `searchAllRegulatory` (eCFR + ATC Order 7110.65 + AIM) instead of `searchFars` alone. Closes silent divergence between `/api/query` and `/api/regulatory?scope=all`.
- **T1h — `facility_info` 501:** `overlying`/`underlying`/`general` `FacilityInfoQuery` types now return `NOT_IMPLEMENTED` 501 instead of silently falling through to adjacent-facility data. `adjacent` and `airports` paths unchanged.
- Build clean; 0 new failures (91 passed / 6 pre-existing).
- **Cross-agent staleness field contract:** `Metar` now carries `observedAt`/`ageMinutes`/`stale` (Aaron's contract, Wave 1); `AtisInfo` carries `issuedAt`/`ageMinutes`/`stale` (Phase 1). Both fields exposed in API responses.

## 2026-06-23: Phase 2b Wave 2/3 backend robustness + dedup
- Traffic service now treats non-retryable ADSB.fi 4xx as terminal and propagates `FetcherError` codes through OpenSky fallback; ADSB.fi mock fixture branch added.
- T2b plates handling and T2d timeout audit required no changes.
- T4c dedup complete: `findFirstPairValue` canonicalized in `nfdc-html.ts`; adjacent/intent routes use route-utils search-param helpers.
- Backend targeted lint is clean; traffic tests pass.

## 2026-06-23: T2a API envelopes shipped
- `/api/atis` now returns `ApiResponse<AtisBatchData>` and `/api/adjacent` returns `ApiResponse<AdjacentFacilityResult>` including error envelopes.
- `/api/plate-proxy` success remains raw binary bytes with an explicit exemption comment; JSON errors were intentionally left unchanged.
- Shipped live in commit `b967317`; build/lint/test validation passed except one pre-existing zero-test NFDC parser suite.


## 2026-06-23: D-ATIS event-driven stale threshold corrected
- D-ATIS freshness is event-driven, not a fixed rapid-refresh feed; current information letters can persist for 60+ minutes in stable conditions.
- `ATIS_STALE_THRESHOLD_MIN` is now 75 minutes. Avoid reverting to aggressive 30-minute staleness unless backed by a source-specific freshness guarantee.
- The bug was policy, not timezone/units: UTC issuance parsing and Zulu day rollover behavior were already covered and remain validated.
- Service and route coverage now prove 60-minute ATIS is fresh, 76-minute ATIS is stale, and midnight UTC rollover remains correct; shipped in `f980f81`.

## 2026-06-24T19:00:00-07:00 — Phase A shipped live
Phase A Global Airport Database release is live at atc-companion.vercel.app via commit e7791d0. Dataset runway/frequency fallbacks, city/state resolution, and validation gates all passed; live checks confirmed 38W 08/26, 38W CTAF 122.9, and Forks WA -> S18.

