# NOTAM keyless resolution

**Timestamp:** 2026-06-23T15:23:00Z

Aaron root-caused the inline NOTAM outage and removed the dead keyless AviationAPI dependency. The service now uses the FAA NOTAM/NMS keyed path with `client_id` / `client_secret`, `icaoLocation`, `responseFormat=geoJson`, and a nested GeoJSON parser. When credentials are absent, it returns `NOTAM_FEED_NOT_CONFIGURED` with an FAA NOTAM Search link instead of pretending a keyless live feed exists.

Swigert completed the frontend lockstep fix so both the primary and secondary Operations Console NOTAM render paths recognize `NOTAM_FEED_NOT_CONFIGURED` while remaining tolerant of legacy `NOTAM_EMBEDDED_SEARCH` responses.

Validation reported by agents: build passed, lint passed, and 153 tests passed. Key decision: no viable keyless live NOTAM source exists; inline NOTAMs require FAA credentials (`FAA_NOTAM_CLIENT_ID` / `FAA_NOTAM_CLIENT_SECRET`, aliases `FAA_NMS_CLIENT_ID` / `FAA_NMS_CLIENT_SECRET`).
