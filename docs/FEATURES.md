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

- approach plates
- SIDs
- STARs
- airport diagrams
- inline PDF viewing inside the app
- opening the original chart in a new tab

### Best-match plate selection

When a query includes a procedure type or runway, the viewer automatically prefers the best matching plate.

Examples:

- ILS for a specific runway
- RNAV procedures at an airport
- airport diagram requests

### Navigation calculations

ATC Assist can calculate:

- direct true bearing
- estimated magnetic heading
- great-circle distance in NM and SM
- simple enroute time estimates

The navigation panel also visualizes the route with a schematic and compass rose.

## Traffic

### Live traffic picture

The traffic feature provides:

- live aircraft targets near an airport or within bounds
- callsign labels
- altitude, groundspeed, track, and on-ground state
- altitude-based color coding

### Traffic map interactions

The map supports:

- zoom in / out
- drag-to-pan
- airport reference marker
- range-ring style display
- target list below the map

### Traffic auto-refresh

Traffic queries can auto-refresh on a short interval to preserve a live terminal picture.

## Facility Management

### Facility selector

Users can set their working context to:

- **tower**
- **approach / TRACON**
- **center / ARTCC**

This context helps interpret phrases like:

- “my airport”
- “weather at my facility”
- navigation requests without an explicit origin airport

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

### Airport statistics

Airport detail views can include:

- towered / non-towered status
- tower hours
- local and Zulu schedule display
- timezone / DST information
- airport-use metadata
- runway list with surface/lighting hints
- airport diagram link

## Regulatory

### FAR references

The app can search official **Title 14 / eCFR** content and display FAR excerpts for operational questions.

### FAA procedural reference search

The regulatory workflow also searches bundled FAA reference material derived from:

- **FAA Order JO 7110.65**
- **FAA AIM**

This makes the regulatory panel useful for both legal/regulatory and operational phraseology lookups.

## Query capabilities

### Natural-language input

Queries do not need to follow a rigid command syntax. The parser understands direct phrases such as:

- “METAR KSEA”
- “show TFRs for KJFK”
- “tower frequency KSFO”
- “runway configuration at KSEA”
- “what is FAR 91.113”

### Voice input

The query bar supports browser speech recognition with aviation-aware normalization, including:

- NATO phonetic airport spelling
- spoken-number conversion
- automatic query insertion
- automatic submit after successful capture

### Intent preview

Before a query is sent, the UI can preview:

- detected intent type
- confidence
- extracted summary
- clarification prompt when needed

### Compound airport queries

If a query asks for multiple airport data types at once, the parser can route it into an airport overview flow rather than forcing a single-result interpretation.

### Clarification-first behavior

When the system is unsure, it prefers to request clarification instead of inventing a result.

## Cross-cutting UX features

### Source attribution everywhere

Every major panel shows:

- the source name
- relative freshness
- access to the original upstream URL when possible

### Staleness indicators

The UI distinguishes between:

- fresh data
- degraded / stale data
- unavailable data

### Raw response visibility

Most result cards allow the user to reveal the raw response payload for inspection and debugging.

### Dark aviation-themed UI

The entire app is designed around a dark, radar-console-style interface optimized for scan speed and low visual clutter.
