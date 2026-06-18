# Aviation data sources

ATC Companion tracks both **where** aviation data came from and **how fresh** it should be. This registry is the human-readable companion to `src/data/sources.ts`.

## Source summary

| Source | Data covered | Official URL | Auth | Typical refresh |
| --- | --- | --- | --- | --- |
| NOAA Aviation Weather Center Data API | METAR, TAF, PIREP | https://aviationweather.gov/data/api/ | None | Hourly METAR / 6h TAF / near-real-time PIREP |
| FAA NOTAM Search / NMS | NOTAMs | https://notams.aim.faa.gov/notamSearch/ | Browser search is public; API onboarding required | Continuous |
| FAA DTPP | Approach plates, SIDs, STARs | https://aeronav.faa.gov/d-tpp/ | None | 28-day chart cycle |
| FAA NASR Subscription | Airport, runway, frequency master data | https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/ | None | 28-day AIRAC cycle |
| OpenSky Network | Live ADS-B traffic targets | https://openskynetwork.github.io/opensky-api/rest.html | Optional login for higher limits | Near real time |
| eCFR API | FAR / Title 14 references | https://www.ecfr.gov/api/ | None | Infrequent; re-check monthly |

## NOAA Aviation Weather Center

- Landing page: https://aviationweather.gov/data/api/
- METAR endpoint: https://aviationweather.gov/api/data/metar
- TAF endpoint: https://aviationweather.gov/api/data/taf
- PIREP endpoint: https://aviationweather.gov/api/data/pirep
- Notes:
  - Official NOAA/NWS source.
  - Supports JSON plus other machine-readable formats.
  - Intended for scoped operational queries; bulk users should prefer the published cache/download guidance.

## FAA NOTAM Search / NOTAM Management Service

- Search portal: https://notams.aim.faa.gov/notamSearch/
- NMS onboarding portal: https://nms.aim.faa.gov/
- FAA modernization FAQ: https://www.faa.gov/about/initiatives/notam/faqs
- Notes:
  - FAA is authoritative for US NOTAM content.
  - Public browser search is straightforward.
  - Programmatic integration is more controlled and should be treated as credentialed/onboarded access.

## FAA Digital Terminal Procedures Publication (DTPP)

- Chart directory: https://aeronav.faa.gov/d-tpp/
- FAA digital products page: https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/
- Notes:
  - Official FAA chart distribution.
  - Organized by 28-day chart cycle.
  - Source of approach plate, SID, and STAR PDFs referenced by the domain models.

## FAA NASR Subscription

- FAA landing page: https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/
- Direct subscriber directory: https://nfdc.faa.gov/webContent/28DaySub/
- Notes:
  - Official FAA facility dataset.
  - Used for airports, runways, and radio frequencies.
  - Publication cadence follows the 28-day AIRAC cycle.

## OpenSky Network

- REST documentation: https://openskynetwork.github.io/opensky-api/rest.html
- API root: https://opensky-network.org/api
- Live state vectors: https://opensky-network.org/api/states/all
- Notes:
  - Strong operational utility for live traffic displays.
  - Coverage and latency depend on receiver density.
  - Anonymous access is more heavily rate limited than authenticated usage.

## eCFR API

- API root: https://www.ecfr.gov/api/
- Title metadata: https://www.ecfr.gov/api/versioner/v1/titles.json
- API docs: https://www.ecfr.gov/developers/documentation/api/v1
- Notes:
  - Official federal regulatory source.
  - Best fit for FAR citations and reference text.
  - Refresh needs are lower than operational feeds, but effective dates still matter.
