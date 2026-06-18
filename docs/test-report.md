# ATC Companion Query Test Report

Date: 2026-06-18

## Summary

- Total queries tested: 28
- Pass: 28
- Fail: 0
- Source attribution: Present on every response, including the expected 404 for Roche Harbor approaches.
- Freshness: All responses returned `isStale: false` with current `fetchedAt` timestamps during the test run.

## Validation commands

- `npm run test` ✅
- `npm run build` ✅
- `npm run lint` ⚠️ pre-existing unrelated failure in `src\\components\\OperationsConsole.tsx:519` (`@typescript-eslint/no-misused-promises`)

## Query results

| # | Query | Status | HTTP | Intent | Notes |
| - | - | - | - | - | - |
| 1 | what's the current weather at SeaTac | PASS | 200 | weather | Fixed alias resolution for SeaTac → KSEA. Weather intent parsed correctly; NOAA source and fresh fetchedAt present. |
| 2 | METAR KORD | PASS | 200 | weather | Direct METAR lookup parsed correctly as weather/metar for KORD. Response included NOAA attribution and fresh fetchedAt. |
| 3 | give me the TAF for Denver International | PASS | 200 | weather | Fixed airport-name resolution so Denver International maps to KDEN, not Denver-area relievers. NOAA TAF returned with attribution and fresh fetchedAt. |
| 4 | weather at Boeing Field | PASS | 200 | weather | Weather intent resolved to KBFI. Bundle returned METAR/TAF/PIREPs with source attribution and fresh fetchedAt. |
| 5 | METAR for KPWK | PASS | 200 | weather | Parsed correctly as METAR for KPWK. NOAA attribution and fresh fetchedAt present. |
| 6 | show me the ILS runway 14R approach into Boeing Field | PASS | 200 | plates | Fixed plates-vs-frequency ambiguity. Parsed as plates for KBFI/ILS/14R and returned FAA DTPP charts including ILS/LOC RWY 14R. |
| 7 | what approach plates are available for KSEA | PASS | 200 | plates | Fixed approach-phrase ambiguity. Parsed as plates for KSEA and returned FAA DTPP approach list with attribution. |
| 8 | is there an instrument approach at Friday Harbor | PASS | 200 | plates | Fixed instrument-approach parsing. Parsed as plates for KFHR and returned live FAA DTPP procedures. |
| 9 | RNAV approaches at KDEN | PASS | 200 | plates | Parsed correctly as RNAV plates for KDEN. FAA DTPP source and fresh fetchedAt present. |
| 10 | what are the tower and ground frequencies at KBFI | PASS | 200 | frequency | Parsed as frequency for KBFI and returned both tower and ground entries from FAA NASR. Intent freq_type still collapses to TWR, but the returned data was complete/useful. |
| 11 | approach control frequencies for Seattle | PASS | 200 | frequency | Fixed approach-control handling to return Seattle Approach sector frequencies instead of airport-local frequencies. FAA NASR attribution and fresh fetchedAt present. |
| 12 | what frequency is ATIS at JFK | PASS | 200 | frequency | Parsed correctly as frequency/ATIS for JFK and returned FAA NASR data with attribution and fresh fetchedAt. |
| 13 | Whidbey approach frequency | PASS | 200 | frequency | Approach-control query returned Whidbey Approach sector frequencies from seeded facility data with FAA NASR attribution. |
| 14 | what traffic is around KSEA right now | PASS | 200 | traffic | Parsed correctly as traffic for KSEA. OpenSky source attribution and fresh fetchedAt present. |
| 15 | how many planes near Boeing Field | PASS | 200 | traffic | Fixed traffic-count phrasing so plane-near-airport queries route to traffic intent. OpenSky data returned with attribution and fresh fetchedAt. |
| 16 | traffic in the pattern at Bremerton | PASS | 200 | traffic | Parsed correctly as traffic for KPWT. OpenSky attribution and fresh fetchedAt present. |
| 17 | what is the speed limit below 10000 feet | PASS | 200 | regulatory | Fixed regulatory cue detection for speed-limit phrasing. Returned regulatory lookup with attribution and fresh fetchedAt. |
| 18 | wake turbulence separation behind a heavy | PASS | 200 | regulatory | Parsed correctly as regulatory. Returned regulatory reference data with attribution and fresh fetchedAt. |
| 19 | what does squawk 7700 mean | PASS | 200 | regulatory | Parsed correctly as regulatory emergency-squawk lookup. Attribution and fresh fetchedAt present. |
| 20 | light gun signals for NORDO aircraft | PASS | 200 | regulatory | Parsed correctly as regulatory lookup. Attribution and fresh fetchedAt present. |
| 21 | what are the VFR weather minimums in Class D airspace | PASS | 200 | regulatory | Fixed weather-minimums phrasing so it routes to regulatory instead of weather ambiguity. Attribution and fresh fetchedAt present. |
| 22 | runway configuration at KSEA | PASS | 200 | airport_info | Parsed correctly as airport_info/runways. Returned KSEA runway set and airport diagram with supporting source attribution. |
| 23 | tell me about KBFI | PASS | 200 | airport_info | Fixed generic airport-info phrasing. Returned aggregate airport info for KBFI with weather, frequency, and plate supporting sources. |
| 24 | airport diagram for KJFK | PASS | 200 | airport_info | Parsed correctly as airport_info/runways and returned the FAA airport diagram for KJFK with supporting attribution. |
| 25 | kcos traffic | PASS | 200 | traffic | Lowercase ICAO handled correctly; parsed as traffic for KCOS with OpenSky attribution. |
| 26 | weather at kansas city international | PASS | 200 | weather | Partial airport-name match resolved to KMCI. NOAA attribution and fresh fetchedAt present. |
| 27 | roche harbor approaches | PASS | 404 | plates | Fixed non-K-prefix named-airport parsing for W39. Response was an appropriate FAA DTPP 404 because the current cycle XML has no W39 records; attribution and fresh fetchedAt were still present. |
| 28 | metar kilo sierra echo alpha | PASS | 200 | weather | NATO phonetic airport parsing worked and resolved to KSEA. NOAA attribution and fresh fetchedAt present. |

## Bugs found and fixed

- Added missing airport aliases for **SeaTac** and **Denver International** so named-airport weather queries resolve to KSEA and KDEN.
- Tightened intent-pattern disambiguation so **approach plates / instrument approach / approaches** queries route to plates instead of frequency, and so **weather minimums** stay regulatory instead of weather.
- Added handling for **traffic-count phrasing** like "how many planes near..." so those queries map to traffic intent.
- Added **generic airport-info phrasing** support for queries like "tell me about KBFI".
- Wired **approach-control facility frequency responses** to seeded TRACON data, so Seattle/Whidbey approach requests return sector frequencies instead of airport-local frequencies.
- Added regression tests covering the new aliases, intent disambiguation, and approach-frequency behavior.
