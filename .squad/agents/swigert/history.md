# Swigert — History

## 2026-06-17: Project kickoff
- Joined as Frontend Dev for ATC Companion
- Responsible for Next.js App Router UI, dark high-contrast theme, voice input
- Key: dark theme for tower environments, Web Speech API integration, aviation-style UI
- YOLO mode active

## 2026-06-17: Session integration snapshot
- Delivered the dark radar-style interface and core components including voice-enabled QueryInput, ResultCard, SourceBadge, StatusBar, WeatherDisplay, and NotamList.
- UI is explicitly shaped around Aaron's source/staleness metadata and Mattingly's attributable backend responses.
- Voice query flow now depends on Haise's NATO-aware parsing while Lovell's safety suite protects against unsafe data presentation.

## 2026-06-23: Phase 1 shipped — D-ATIS staleness fix
- Built stale/fresh ATIS UI in `src/components/AtisStrip.tsx`: amber ring + STALE badge on stale chip, role=alert in expanded panel, "Checked vs Issued" label separation.
- Fixed Lovell R2: added `toHHMMZ` helper to convert ISO-8601 `issuedAt` to `HHMMZ` display format at all three render sites.
- Build clean; 0 new regressions.

## 2026-06-23: Phase 2b Wave 1 — Frontend staleness UI + error states
- **T1a — FacilityOverview:** Deleted local `AtisEntry`; now imports canonical `AtisEntry` + `toHHMMZ` from `AtisStrip.tsx`. Airport overview cards show amber ring + STALE badge when `atis.stale === true`. Single source of truth for ATIS display contract.
- **T1b — WeatherDisplay:** METAR stale ring/badge (`⚠ METAR observation N min old`); `Observed HHMMZ` replaces old fetch-time label; `Checked HHMMZ` as secondary. Imports `toHHMMZ` — no duplication.
- **T1b — StatusBar:** `"use client"` + `setInterval(30s)` replaces frozen SSR `referenceTime`; all freshness dots now use live clock.
- **T1k — AtisStrip error state:** `fetchError` boolean state; `⚠ ATIS unavailable` render path with `role="alert"` on fetch failure; clears on recovery.
- Collateral: `demo-results.ts` Metar mock updated for Aaron's new required `ageMinutes`/`stale` fields.
- Build clean; 92/97 (5 pre-existing). `toHHMMZ` now exported and reused across 3 components.
- **Cross-agent staleness field contract:** `Metar`: `observedAt`/`ageMinutes`/`stale`; `AtisInfo`: `issuedAt`/`ageMinutes`/`stale`. UI treats both contracts identically for amber-ring signaling.

## 2026-06-23: Phase 2b NOTAM UI + frontend lint-clean state
- NOTAM UI consumes Aaron's `category`/`isCritical`/`summary` contract directly: FacilityOverview critical badge plus NotamList grouped Active/Upcoming panel with severity sorting and category chips.
- OperationsConsole now threads `dashboardData.notams` into overview cards and summaries; demo data includes a runway-closure NOTAM.
- Wave 3 a11y/promise hygiene added QueryInput aria-labels and made async fire-and-forget explicit in AtisStrip/OperationsConsole.
- Frontend lint cleanup completed: render-time Date.now refactors, stable memoization, StatusBar live clock, PlateViewer targeted deps handling, TrafficMap `void initMap()`; repo-wide lint exit 0.

## 2026-06-23: NOTAM degraded-state UI lockstep
- Updated the secondary Operations Console NOTAM summary/error render path to recognize the new `NOTAM_FEED_NOT_CONFIGURED` code as well as legacy `NOTAM_EMBEDDED_SEARCH`.
- Preserved the dedicated FAA NOTAM Search link when inline NOTAMs are unavailable because FAA credentials are not configured.
- Cross-agent finding to carry forward: no viable keyless live NOTAM source exists; UI should present missing FAA credentials as an intentional degraded state, not an empty or generic failure.

## 2026-06-23: T2a consumers + facility-summary order shipped
- `AtisStrip.tsx` and `FacilityOverview.tsx` now unwrap the ATIS `ApiResponse` envelope; `PlateViewer` and `DiagramPanel` stayed untouched.
- `OperationsConsole.tsx` now leads with selected tower airport facility overview and suppresses the duplicate lower summary; center/approach/default remain unchanged.
- Shipped live in commit `b967317`; build/lint/test validation passed except one pre-existing zero-test NFDC parser suite.

## 2026-06-23: NOTAM failure messaging safety pattern
- Operations Console NOTAM UI now uses a three-state pattern: feed unavailable, loaded-empty, and populated list.
- Feed-unavailable states must use explicit text plus amber warning treatment; never rely on color alone.
- Never conflate "NOTAM feed failed/unavailable" with "zero active NOTAMs"; only show a no-NOTAMs empty state after a successful live response with zero records.

## 2026-06-24T09:12:58-07:00 — Fresh ATIS calm-cyan state
- Fresh/non-stale ATIS should use calm cyan, not amber/yellow, so current data does not read as a warning.
- Stale/unavailable ATIS remains amber and must keep explicit non-color cues such as `STALE`, warning ring, or alert copy.

- 2026-06-24T21:33:19-07:00 — Stale facility query-state fix shipped live in commit `4cab907`; explicit airport queries now exit facility-dashboard mode and clear prior facility/query/supplemental panels.


## 2026-06-24T21:44:52-07:00 — Frequency gap UI shipped
OperationsConsole now renders frequency data gaps without asserting absence and shows 122.9 only as a distinct unverified/verify-before-use convention hint when supplied by the service; shipped live in commit `6487c7b`.

## 2026-06-25T09:40:42-07:00 — Phase B Canada shipped

Phase B Canadian airport coverage shipped live to atc-companion.vercel.app in commit `2618ee5` for Devin Sinha. Contributions recorded: Kranz scoped the Canada plan, Aaron generated/merged CA data server-side, Mattingly gated 122.9 and runway jurisdiction paths, Haise added Canadian extraction, Swigert removed hardcoded FAA-only copy, Lovell passed safety review, and Rai's yellow advisory was resolved. Unified validation: lint 0 warnings, clean build, 260 tests passed; production CYVR returns real runways with no Canadian 122.9 or FAA Chart Supplement leakage.
