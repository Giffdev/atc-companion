# Features

## Weather & ATIS

### Weather briefing

ATC Assist can retrieve and present:

- current **METAR**
- current **TAF**
- nearby **PIREPs**
- a combined airport weather bundle

The weather panel emphasizes:

- flight category (VFR / MVFR / IFR / LIFR)
- wind direction, speed, and gusts
- visibility
- ceiling
- temperature / dewpoint
- raw METAR text
- top TAF forecast groups

### D-ATIS display

The app includes a compact **ATIS strip** that:

- shows current ATIS letters for supported airports
- supports multiple airports at once for approach/center views
- expands to show full D-ATIS text
- auto-refreshes on a short interval

### Weather auto-refresh

Weather queries can stay live with automatic refresh so the dashboard keeps a current view without retyping the request.

## Navigation & Procedures

### FAA terminal procedures

The procedures workflow supports:

- **Approach plates** (ILS, RNAV, VOR, NDB, LOC, etc.)
- **SIDs** (Standard Instrument Departures)
- **STARs** (Standard Terminal Arrival Routes)
- **ODPs** (Obstacle Departure Procedures)
- **Airport diagrams** (when published by FAA)
- **Chart Supplement** (embedded NFDC view)
- Inline PDF viewing inside the app
- Opening the original chart in a new tab (mobile fallback)

### Tabbed plate viewer

The PlateViewer organizes charts into tabs:

- Approaches, SIDs, STARs, ODPs, Diagram, Supplement
- Tabs only appear when data exists for that category
- All tabs remain accessible even when a specific chart type was queried
- Layout-stable: embedded PDFs don't reload during panel re-renders (`contain: layout`)

### Best-match plate selection

When a query includes a procedure type, runway, or named procedure, the viewer automatically:

- selects the best matching plate by procedure type and runway
- finds named procedures by partial or abbreviated name (e.g., "NRVNA departure" → NRVANA SID)
- defaults to the diagram tab for "runway" or "diagram" queries

### Navigation calculations

ATC Assist can calculate:

- direct true bearing
- estimated magnetic heading
- great-circle distance in NM and SM
- simple enroute time estimates

The navigation panel visualizes the route with a schematic and compass rose.

## Traffic

### Live traffic radar

The traffic feature provides a radar-style display with:

- live aircraft targets from **ADSB.fi** (primary) or **OpenSky Network** (fallback)
- **Directional arrow glyphs** pointing in each aircraft's heading
- Altitude-based color coding
- **Range rings** with NM distance labels
- Airport reference marker at center
- Target list below the radar display

### Hover/tap tooltips

Mousing over (desktop) or tapping (mobile) a traffic target reveals:

- Callsign / flight number
- Altitude and groundspeed
- Aircraft type (when available)

### Adaptive range

- **10 NM** default range for individual airports
- **30 NM** default range for approach/center facilities
- Targets outside visible range are filtered out

### Traffic auto-refresh

Traffic queries auto-refresh on a short interval to maintain a live terminal picture.

## Facility Management

### Facility selector

Users can set their working context to:

- **Tower**
- **Approach / TRACON**
- **Center / ARTCC**

This context helps interpret phrases like "my airport", "weather at my facility", or navigation requests without an explicit origin airport.

### Tower dashboard baseline

Selecting a tower facility auto-loads a baseline operational dashboard with:

- weather
- NOTAMs
- traffic
- frequencies
- plates
- airport statistics

### Multi-airport facility overview

Selecting an approach or center facility shows a multi-airport overview with:

- weather snapshot cards for each mapped airport
- flight category at a glance
- wind and visibility snapshot
- ATIS letter when available
- one-click drill-in to airport details

### Facility overview panel

The compact facility overview panel displays:

- **Airport identity** with towered/non-towered badge and airport-use type
- **Tower hours** — always shown when available:
  - Structured schedule (open/close in local + Zulu)
  - 24-hour indication
  - Non-towered label with Chart Supplement link
- **Timezone** with UTC offset and DST indicator
- **Runway configuration** — individual runways with:
  - Designator (e.g., 16/34)
  - Dimensions (length × width in feet)
  - Surface type (ASPH, CONC, etc.)
  - Lighting type (HIRL, MIRL, etc.)
  - Falls back to inference from approach plate names when NFDC data unavailable
- **Overlying frequencies** displayed as color-coded pills (APP, CENTER, etc.)
- **Quick links** to procedures and frequencies panels

### Cross-airport data isolation

When querying about a different airport than the selected facility, supplementary procedures from the facility don't bleed into the query results.

## Airport Name Matching & Disambiguation

### Flexible name matching

The parser understands airports by:

- **ICAO code** (KSEA, KFHR, KTTD)
- **FAA LID** (SEA, FHR, TTD)
- **IATA code** (SEA)
- **Full name** ("Seattle-Tacoma International")
- **Partial name** ("Boeing Field", "Troutdale")
- **Single distinctive word** (≥6 chars, e.g., "troutdale" → KTTD)
- **City name** ("seattle" → KSEA)

### City/state context disambiguation

When multiple airports share a name word, the parser uses location hints:

- **City abbreviations**: KC → Kansas City, LA → Los Angeles, SF → San Francisco, PDX → Portland, SEA → Seattle, NYC → New York, etc.
- **State codes**: "in MO", "in NY", "in WA"
- **Full city names**: "in Kansas City"

Example: "wheeler airport in kc" → KMKC (Charles B. Wheeler Downtown Airport, Kansas City MO)

### Ambiguity detection and clarification

When an airport name is ambiguous and no location hint is provided, the system:

- Detects multiple airports sharing the same name-derived key
- Presents a clarification prompt listing candidates with cities/states
- Asks the user to specify (e.g., add city, state, or ICAO code)

Example: "wheeler airport" → prompts with KGTB (Fort Drum NY), KMKC (Kansas City MO), PHHI (Wahiawa HI)

### Stopword filtering

Generic aviation terms are excluded from airport name matching to prevent false matches:

- FACILITY, LANDING, LAUNCH, SERVICE, FLIGHT, AIRWAYS, HELIPORT
- WEATHER, TRAFFIC, DEPARTURE, ARRIVAL, PLATES, INSTRUMENT, OVERVIEW
- INTERNATIONAL, REGIONAL, MUNICIPAL, AIRPORT, FIELD, etc.

## Regulatory

### FAR references

The app can search official **Title 14 / eCFR** content and display FAR excerpts for operational questions.

### FAA procedural reference search

The regulatory workflow also searches bundled FAA reference material derived from:

- **FAA Order JO 7110.65**
- **FAA AIM**

This makes the regulatory panel useful for both legal/regulatory and operational phraseology lookups.

## Query Capabilities

### Natural-language input

Queries do not need to follow a rigid command syntax. The parser understands direct phrases such as:

- "METAR KSEA"
- "show me the ILS 14R approach into Boeing Field"
- "approach control frequencies for Whidbey approach"
- "how many planes in the traffic pattern at Bremerton"
- "tower frequency KSFO"
- "facility overview for troutdale"
- "what charts are around KGSO"
- "runways at friday harbor airport"
- "what is FAR 91.113"

### Intent types recognized

| Intent | Example phrases |
|--------|----------------|
| weather | "metar", "taf", "weather at", "pireps near" |
| plates | "approach plate", "ILS", "SID", "STAR", "ODP", "charts at" |
| airport_info | "facility overview", "airport info", "details for", "runways at" |
| traffic | "traffic at", "planes near", "traffic pattern" |
| frequency | "tower frequency", "approach freq", "frequencies at" |
| notam | "notams for", "tfrs at" |
| regulatory | "FAR 91", "what regulation", "7110.65" |
| navigation | "bearing from X to Y", "distance between", "how far" |

### Voice input

The query bar supports browser speech recognition with aviation-aware normalization:

- NATO phonetic airport spelling
- spoken-number conversion
- automatic query insertion
- automatic submit after successful capture

### Intent preview

Before a query is submitted, the UI previews:

- detected intent type
- confidence level
- extracted summary
- clarification prompt when ambiguous

### Compound airport queries

If a query asks for multiple airport data types at once (e.g., "details for KSEA"), the parser routes it into an airport overview flow showing weather, frequencies, plates, and facility info simultaneously.

### Clarification-first behavior

When the system is unsure, it prefers to request clarification instead of inventing a result:

- Ambiguous airport names → lists candidates
- Multiple intent types detected → asks user to narrow down
- Missing required entity → asks which airport/procedure/etc.

## Cross-cutting UX Features

### Source attribution everywhere

Every major panel shows:

- the data source name
- relative freshness ("2 min ago", "stale")
- access to the original upstream URL when possible

### Staleness indicators

The UI distinguishes between:

- fresh data (green indicators)
- degraded / stale data (amber warnings)
- unavailable data (error states with retry guidance)

### Raw response visibility

Most result cards allow the user to reveal the raw response payload for inspection and debugging.

### Dark aviation-themed UI

The entire app is designed around a dark, radar-console-style interface optimized for scan speed and low visual clutter. Colors are chosen for readability under low-ambient-light conditions typical of radar rooms.

### Responsive layout

- Multi-panel grid on desktop (12-column CSS grid)
- Active card gets priority sizing (full-width when it's the focus)
- Single-column stack on mobile with external links for PDFs

## Deployment

- Hosted on **Vercel** with serverless functions
- Live at: https://atc-companion.vercel.app
- Source: https://github.com/Giffdev/atc-companion
- Auto-deploys from `master` branch
