# Aaron — History

## 2026-06-17: Project kickoff
- Joined as Aviation Data Specialist for ATC Companion
- Responsible for FAA data schemas, source documentation, domain models
- Key sources: aviationweather.gov, FAA NASR, DTPP, NOTAM API, OpenSky, eCFR
- Critical: define staleness thresholds, source attribution for every data type
- YOLO mode active

## 2026-06-17: Session integration snapshot
- Expanded aviation types across METAR, TAF, PIREP, NOTAM, ADS-B, and related entities.
- Published source registry details that Mattingly consumed for live service integrations and that Swigert exposed via source/status UI.
- Freshness thresholds and attribution rules now anchor Lovell's verification coverage and Kranz's safety architecture.

## 2026-06-23: Phase 1 shipped — D-ATIS staleness fix
- Recommended and confirmed `ATIS_STALE_THRESHOLD_MIN = 30` (down from 60). Rationale: clowd.io can lag FAA D-ATIS by ≥1 letter; earlier signal compensates for unknown upstream lag.
- clowd.io rated reliability: medium; documented in `docs/data-sources/datis.md`.
- Alternate source assessment complete: no better public REST source available; FAA SWIM deferred pending formal engagement.
- `issuedAt` and `stale` fields now surfaced in API and UI.

## 2026-06-23: Phase 2b Wave 1 — Data correctness fixes shipped
- **Staleness field contract established:** `Metar` now carries `observedAt` / `ageMinutes` / `stale` (mirrors ATIS contract). Threshold 60→45 min. `parseMetar` computes these from `observedAt`, not `fetchedAt`.
- **`formatTimestamp` UTC fix:** `timeZone:"UTC"` added — all aviation times now render Zulu everywhere.
- **`toIsoTimestamp` Z-normalization:** ISO strings without tz designator get `Z` appended in `_shared.ts`.
- **NOTAM cache TTL decoupled:** cache TTL 12h→15 min (`cache.ts`); staleness warn 2h TFR/FDC, 6h D-type.
- **KTCM added** to `TOWERED_AIRPORTS` — fixes S46 adjacency test.
- **`opendata.adsb.fi`** added to `AUTHORITATIVE_DOMAIN_ALLOWLIST`.
- Build clean; facility-adjacency ✅ source-verification ✅ all safety tests ✅; 92/97 overall (5 pre-existing).

## 2026-06-23: Phase 2b NOTAM classifier + lint-clean state
- Established the NOTAM data contract for UI consumers: `NotamCategory`, `category`, `isCritical`, optional `summary`, plus `isNotamActive()` / `isNotamUpcoming()` helpers.
- Critical NOTAM categories are airport closure, runway closure, and TFR; unparseable effective time is fail-safe active.
- Added classifier coverage (19 tests) and later removed dead `FAA_TFR_SEARCH_URL`; service lint/test state reported clean.
- Swigert consumes this contract directly; UI must not re-classify NOTAM criticality.

## 2026-06-23: NOTAM keyless outage resolved
- Root-caused the live inline NOTAM outage to the dead `api.aviationapi.com` keyless dependency and removed that path entirely.
- Corrected the FAA NOTAM/NMS keyed path to use `client_id` / `client_secret`, `icaoLocation`, and `responseFormat=geoJson`; added robust nested GeoJSON parsing.
- Replaced broken fallback behavior with an honest `NOTAM_FEED_NOT_CONFIGURED` state and FAA NOTAM Search link.
- Key finding for future work: no viable keyless live NOTAM source exists; inline NOTAMs require FAA credentials (`FAA_NOTAM_CLIENT_ID` / `FAA_NOTAM_CLIENT_SECRET`, aliases `FAA_NMS_CLIENT_ID` / `FAA_NMS_CLIENT_SECRET`).
