### 2026-06-25T18-39-14: Mexico airport dataset added as its own MX-filtered segment
**By:** Aaron
**What:** Mexico airport dataset added as its own MX-filtered segment
**References:** TASK: Add Mexico to global airport dataset pipeline, scripts/generate-airport-dataset.ts, src/data/airport-dataset.ts
**Why:** Added an `mx` dataset segment to the airport generator that filters OurAirports rows by ISO country `MX`, exactly mirroring the Canada country-filter path. Mexico is loaded as a non-US/non-CA jurisdiction, preserving `country: "MX"` for downstream routing; existing PR/VI normalization remains unchanged. Regeneration produced 1,585 Mexico airports, 200 runway rows, and 153 frequency rows, and lookup samples MMMX, MMUN, MMTJ, MMGL, and MMMY all resolve with country MX.

Validation note: adding Mexico introduced an OurAirports local-code collision (`PAE` exists as Mexico local code for MX-0316 and as Paine Field's US IATA/local code). The dataset lookup now prioritizes stronger code types (ident > ICAO > GPS > IATA > local) so Mexican ICAO lookups remain available while established IATA/local lookups like PAE continue routing to the US airport.
