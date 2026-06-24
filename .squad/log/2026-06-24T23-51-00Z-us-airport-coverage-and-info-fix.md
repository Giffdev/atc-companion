# Session log — US airport coverage and INFO fix

- Time: 2026-06-24T23-51-00Z
- Aaron shipped live FAA NFDC-backed airport resolution so non-static US airports can resolve without bulk-importing NASR data.
- Runway UI now distinguishes unavailable runway data with `RUNWAY_DATA_UNAVAILABLE` rather than implying an authoritative empty result.
- A follow-up live-test regression found `INFO` over-matching before FAA LIDs in phrases like `airport info for S18`; Aaron tightened contextual four-letter ICAO recognition to require `K` unless the token is already known.
- Regression coverage now protects S18, 38W, and KSEA paths. Both decision inbox records were merged into `decisions.md` and removed from the inbox.
