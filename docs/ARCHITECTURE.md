# Architecture

## System intent

ATC Assist is a reference console, not a control-decision engine. The architecture reflects that constraint:

- upstream data is fetched from authoritative or clearly labeled sources
- responses are wrapped with provenance and freshness metadata
- the UI favors scanability and explicit source visibility
- ambiguous user input is clarified instead of guessed

## High-level flow

```text
User query / voice input
  -> QueryInput
  -> /api/intent (preview) or /api/query (submit)
  -> parseIntent()
       1. entity extraction + regex/pattern match
       2. optional LLM fallback
  -> executeQuery()
  -> service calls in src/services/*
  -> ApiResponse<T> envelope(s)
  -> OperationsConsole state merge
  -> ResultCard / panel components
```

## Intent parsing pipeline

Primary files:

- `src/ai/intent-parser.ts`
- `src/ai/patterns.ts`
- `src/ai/entity-extractor.ts`
- `src/ai/llm-classifier.ts`
- `src/ai/voice-input.ts`

### Phase 0: input normalization

`normalizeAviationText()` in `entity-extractor.ts` cleans the input before classification:

- NATO phonetics to letters (`kilo juliet foxtrot kilo` -> `KJFK`)
- spoken numbers to digits (`one eighteen point seven` -> `118.7`)
- runway phrase normalization (`runway 28 left` -> `runway 28L`)
- procedure/runway token splitting (`rnav20` -> `rnav 20`)

This same normalization is used by the voice path, so text and speech are parsed consistently.

### Phase 1: entity extraction

`extractEntities()` identifies structured aviation entities such as:

- airports
- runways
- frequencies
- route airports
- altitudes / flight levels
- speeds
- squawk codes
- callsigns
- aircraft types
- FAR references
- NOTAM type hints
- procedure type hints
- airport-info detail hints

Airport code extraction is jurisdiction-aware:

- U.S. ICAO and known local/IATA identifiers continue through the existing reference lookup path.
- Canadian ICAO-shaped identifiers (`CANADIAN_ICAO_SHAPE`) are accepted only in contextual airport-code paths, including leading cues ("for CYYJ") and trailing cues ("CYYJ traffic"), to avoid treating ordinary four-letter C-words as airports.
- Caribbean ICAO-shaped identifiers (`CARIBBEAN_ICAO_SHAPE`) use precise T*/M* location-indicator prefixes and are accepted in both contextual and bare-code paths, with airport-code stopwords filtering common English collisions.
- Trailing query cues include traffic, plates, approaches, departures, arrivals, SIDs, STARs, and hours so phrases such as "CYYJ traffic" resolve as airport queries.

### Phase 2: regex/pattern classification

`patterns.ts` contains the fast-path matcher for:

- weather
- notam
- frequency
- plates
- traffic
- navigation
- regulatory
- airport_info

This path is deterministic, fast, and preferred when confidence is high.

### Compound query detection

The parser explicitly checks for compound airport requests. If a single airport query appears to request multiple data types (for example weather + plates + frequencies), the parser collapses the request into `airport_info` with `detail: "all"`.

That is important because the UI wants coordinated panels, not a single winner-take-all intent.

### Clarification behavior

If the parser detects:

- missing required entities
- multiple conflicting intent candidates
- empty input
- low-confidence interpretation

it returns an `unknown` intent with:

- `requiresClarification: true`
- `clarificationReason`
- `clarificationPrompt`

### Phase 3: LLM fallback

If the pattern path is ambiguous or under threshold, `classifyIntentWithLlm()` is called.

Properties of the LLM path:

- disabled unless `OPENAI_API_KEY` is configured
- temperature `0`
- strict JSON-only prompt
- classifier is forbidden from answering the query itself
- still feeds back into the same typed `ParsedIntent` model

## Query orchestration

Primary file:

- `src/services/orchestrator.ts`

`executeQuery()` dispatches a `ParsedIntent` to the correct service. The orchestrator is responsible for:

- route-to-service mapping
- `airport_info` fan-out across multiple services
- clarification-required error responses
- selected-facility context for navigation
- merging supporting sources into one response envelope

### Special case: airport_info

`airport_info` is the broadest intent and can call several services in parallel:

- `getWeather()`
- `getFrequencies()`
- `getPlates()`
- `getAirportDiagram()`
- `getAirportHours()`
- `getAirportRunways()`

It returns a composite payload (`AirportInfoQueryPayload`) instead of a single domain type.

## Service layer design

Primary files:

- `src/lib/fetcher.ts`
- `src/lib/cache.ts`
- `src/lib/utils.ts`
- `src/services/_shared.ts`
- service implementations in `src/services/*.ts`

### fetchWithRetry

`fetchWithRetry()` standardizes upstream calls with:

- query construction
- timeout handling
- retry/backoff behavior
- `Retry-After` support
- network vs upstream error classification
- optional transform step
- optional TTL caching integration

When upstream access fails, the fetcher throws `FetcherError`, which preserves:

- `code`
- `status`
- `retryable`
- `source`
- `fetchedAt`
- short `details`

### Caching

`src/lib/cache.ts` implements an in-memory TTL cache with:

- stable cache keys
- namespace-based TTL policies
- prefix invalidation
- small LRU-style eviction behavior
- cache metadata returned with every response

Key TTL behavior is driven by `src/data/staleness.ts`.

Examples:

- traffic: ~30 seconds
- METAR: 1 hour
- TAF: 6 hours
- NOTAM: 12 hours
- FAA chart/frequency/reference data: 28 days or more

### ApiResponse envelope

Every service returns `ApiResponse<T>`.

Success responses include:

- typed `data`
- `source`
- `attribution.primary`
- optional `attribution.supporting`
- `fetchedAt`
- `isStale`
- `stalenessWarning`
- `cache`

Error responses preserve the same outer shape, which keeps the UI simple and traceable.

### Source attribution

`src/data/sources.ts` is the central source registry. Services call `getDataSource()` so both API routes and UI components can present the same source identity.

## Implemented services

### `weather.ts`

Fetches and normalizes:

- METAR
- TAF
- PIREP
- combined weather bundle

Upstream: NOAA Aviation Weather Center.

### `traffic.ts`

Fetches traffic state vectors around:

- an airport-derived bounding box, or
- explicit bounds

Upstream: ADSB.fi (primary, no auth required), OpenSky Network (fallback).

### `TrafficMap.tsx`

SVG-based radar display:

- Airport always at center (`MAP_CENTER_X/Y`)
- `normalizeTraffic()` positions targets relative to airport, scales to fit within range rings
- Directional arrow glyphs (pointing in heading direction)
- Three concentric range rings with NM distance labels
- `defaultRangeNm` prop: 10 for airports, 30 for approach/center
- Hover/tap tooltip system showing callsign, altitude, speed
- Targets outside visible range filtered out

### `plates.ts`

Reads FAA DTPP `current.xml`, extracts airport records, and exposes:

- approach plates
- SIDs
- STARs
- airport diagrams
- plate manifest lookup
- cache prewarming support

Also supports FAA PDF proxying through `/api/plate-proxy` for inline viewing.

Before querying FAA DTPP, plate/diagram/SID/STAR/ODP lookups check the generated airport dataset. Non-U.S. airports return a jurisdiction gap response instead of an FAA miss; Canadian airports specifically point users to NAV CANADA / Canada Air Pilot publications, while Puerto Rico and U.S. Virgin Islands airports remain U.S. in the dataset and continue through FAA behavior.

### `frequencies.ts`

Returns:

- airport-local frequency data from a NASR-backed seed dataset
- approach/TRACON frequency sectors for mapped facilities
- OurAirports fallback frequencies when available for generated-dataset airports

For non-U.S. generated-dataset airports, FAA NFDC frequency lookup is skipped. Canadian data gaps tell users to verify official Canadian aeronautical publications or NAV CANADA; other non-U.S. gaps point to that airport jurisdiction's official publications. Puerto Rico and U.S. Virgin Islands records are normalized to `country: "US"` by the dataset generator, so they keep FAA/NFDC behavior.

### `notams.ts`

Calls the FAA NOTAM API, normalizes records, and infers:

- D NOTAM
- FDC NOTAM
- TFR

### `regulatory.ts`

Combines three search paths:

- live FAR results from eCFR
- local JO 7110.65 reference search
- local AIM reference search

### `navigation.ts`

Pure local computation using airport reference coordinates:

- great-circle distance
- true heading
- magnetic heading estimate
- optional enroute time

### `airport-hours.ts`

Fetches FAA airport display HTML and attempts to parse:

- tower hours
- local vs Zulu schedule
- timezone/DST
- airport-use metadata
- lighting / attendance hints

Falls back to inference for major airports when the FAA page is unavailable.

### `runway-info.ts`

Parses runway characteristics from FAA airport display HTML:

- Extracts runway sections by div ID (`runway_16_34`) or heading regex
- Parses dimensions, surface type, lighting from table cell pairs
- Fallback chain:
  1. **FAA NFDC HTML parsing** — full details (length, width, surface, lighting)
  2. **Generated OurAirports runway records** — used when present, and used first for non-U.S. generated-dataset airports
  3. **Static airport-reference runway data** — bundled designators for a few major airports, paired into physical runways

For generated-dataset airports outside the U.S., runway lookup skips FAA NFDC and uses OurAirports runway records when present. If no runway records are available, Canadian gaps mention official Canadian publications / NAV CANADA and other non-U.S. gaps point to the relevant jurisdiction's official aeronautical publications.

### `datis.ts`

Fetches D-ATIS entries for single or multiple airports. In practice, the UI bulk path uses `/api/atis`, while the service exposes a typed helper for direct usage.

## Airport Name Resolution

Primary files:

- `src/data/airports.ts`
- `src/data/airport-dataset.ts`
- `scripts/generate-airport-dataset.ts`

`scripts/generate-airport-dataset.ts` builds generated JSON from OurAirports public-domain CSV snapshots. `src/data/airport-dataset.ts` is server-only and loads the generated `us`, `ca`, and `carib` JSON prefixes (`DATASET_PREFIXES = ["us", "ca", "carib"]`) into code, runway, frequency, and city indexes. The Caribbean generation includes Puerto Rico and the U.S. Virgin Islands, but normalizes those records to `country: "US"` so FAA-served territory behavior remains in place.

### Key generation (`createAirportSearchKeys`)

For each airport, generates search keys from:

- Full name (exact match)
- Stripped name (without "Airport", "International", etc.)
- 2-3 word sub-phrases from name (≥8 chars)
- Single distinctive words from name (≥6 chars, not in stopword list)
- City name (as a partial key)

### Matching (`findAirportReferencesInText`)

Matches input text against all airport keys with:

- Word-boundary-aware regex matching
- Relaxed end-boundary for keys ≥8 chars
- Sorting by: position → full-match vs partial → key length → city context

### City context disambiguation (`hasCityContextMatch`)

Checks if the input contains location hints that match an airport:

- Direct city name (e.g., "kansas city" → KMKC)
- City abbreviation map (KC, LA, SF, PDX, SEA, NYC, etc.)
- State code pattern ("in MO", "in NY")

### Ambiguity detection (`detectAirportAmbiguity`)

Flags when multiple airports share the same name-derived key without disambiguation:

- Only checks name-word keys (not city keys — cities naturally have multiple airports)
- Returns candidate list for clarification prompt
- Returns null when city context resolves the ambiguity

## API route pattern

Primary files:

- `src/app/api/route-utils.ts`
- individual route handlers under `src/app/api/*`

Typical route responsibilities:

1. validate request params/body
2. optionally clear relevant cache namespaces on `refresh=true`
3. call a service
4. return JSON via `jsonWithStandardHeaders()`

`jsonWithStandardHeaders()` also adds helpful metadata headers such as:

- `X-Source-Url`
- `X-Fetched-At`
- `X-Cache`
- `Age`

## Facility model

Primary files:

- `src/types/facility.ts`
- `src/data/facilities.ts`
- `src/data/approach-facilities.ts`
- `src/data/center-airports.ts`

### Facility types

The main UX currently centers on three operational facility types:

- **tower** — single-airport local tower context
- **approach** — TRACON / RAPCON style multi-airport context
- **center** — ARTCC context with mapped airport sets

The type union also includes `ground`, `clearance`, and `flight_service`, but the current selector/UI filters to tower/approach/center.

### ControllerFacility model

```ts
interface ControllerFacility {
  id: string;
  name: string;
  type: FacilityType;
  primaryAirport?: string;
  position: { latitude: number; longitude: number };
  artcc?: string;
}
```

### Behavior by facility type

- **tower:** dashboard auto-loads weather, NOTAMs, traffic, frequencies, plates, and airport stats for the primary airport
- **approach / center:** dashboard shows a multi-airport overview first; selecting an airport drills into airport info

## Data models

Primary files:

- `src/types/api.ts`
- `src/types/aviation.ts`
- `src/types/intents.ts`
- `src/types/facility.ts`

Notable model groups:

- weather: `Metar`, `Taf`, `Pirep`, `WeatherBundle`
- traffic: `TrafficTarget`
- charts/procedures: `ApproachPlate`, `Sid`, `Star`
- airport ops: `Frequency`, `AirportInfo`, runway/hour payloads
- regulation: `FarReference`, `AtcProcedureReference`
- parsing: `ParsedIntent` and per-intent subtypes

Most aviation types extend the same conceptual shape:

- source tracked
- fetch timestamped
- freshness aware

## Component hierarchy

### Top-level page

- `src/app/page.tsx`
  - renders `OperationsConsole`

### Main dashboard shell

- `OperationsConsole`
  - `FacilitySelector`
  - `QueryInput`
  - query summary / envelope panel
  - optional `FacilityOverview`
  - one or more `ResultCard`s
  - `StatusBar`

### Result-card content components

- `WeatherDisplay`
- `AtisStrip`
- `TrafficMap`
- `NavigationDisplay`
- `PlateViewer`
- `NotamList`
- inline frequency list
- inline regulatory list

### Reusable UI helpers

- `SourceBadge`
- `ResultCard`

## UI state flow

`OperationsConsole.tsx` is the main client orchestrator.

It manages:

- selected facility persistence (`localStorage`)
- intent preview state
- live submitted result state
- multi-panel visibility
- facility baseline data vs explicit query overrides
- loading indicators
- weather/traffic auto-refresh intervals
- warning aggregation
- airport-stats card rendering

A useful mental model:

- **facility baseline** populates default panels for a selected tower
- **submitted query result** can override one or more panels
- **airport_info** can light up several panels at once

## Key files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/components/OperationsConsole.tsx` | Main client state machine and dashboard composition |
| `src/components/FacilityOverview.tsx` | Multi-airport approach/center overview cards |
| `src/components/QueryInput.tsx` | Text input, voice input, intent preview, suggestion chips |
| `src/ai/intent-parser.ts` | High-level parse pipeline and clarification logic |
| `src/ai/patterns.ts` | Regex candidate detection and compound-query routing |
| `src/ai/entity-extractor.ts` | Structured aviation entity extraction and normalization |
| `src/ai/llm-classifier.ts` | Optional LLM fallback classifier |
| `src/services/orchestrator.ts` | Dispatch parsed intents to services |
| `src/lib/fetcher.ts` | Shared retry/timeout/fetch abstraction |
| `src/lib/cache.ts` | In-memory TTL cache with metadata |
| `src/lib/utils.ts` | ApiResponse builders, timestamp formatting, helper utilities |
| `src/data/sources.ts` | Canonical source registry |
| `src/data/staleness.ts` | Freshness windows by data category |
| `src/app/api/query/route.ts` | Full parse-and-execute endpoint |
| `src/app/api/intent/route.ts` | Intent-preview endpoint |
| `src/app/api/plate-proxy/route.ts` | FAA PDF proxy for iframe-safe plate viewing |

## Testing and verification notes

From `package.json`, the repo supports:

- `npm run test` — Vitest
- `npm run test:e2e` — Playwright
- `npm run lint` — ESLint
- `npm run build` — Next.js production build

At the time of this documentation update, Vitest passes and ESLint reports pre-existing issues in UI components unrelated to these docs.
