# ATC Assist — AI-Powered Air Traffic Control Companion

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Vitest](https://img.shields.io/badge/Vitest-2.x-6E9F18)
![Playwright](https://img.shields.io/badge/Playwright-E2E-45BA63)

ATC Assist is a web-based companion app for air traffic controllers. It is **not** an automation tool, separation tool, or advisory engine. It does **not** direct traffic or make control suggestions. Its job is to surface visual and referential aids from approved FAA/government sources, live aviation feeds, and official regulatory references.

## What this application does

ATC Assist gives a controller a single dark-theme console for:

- querying aviation data in natural language
- previewing parsed intent before dispatch
- viewing weather, traffic, plates, frequencies, NOTAMs, airport stats, and regulations side by side
- keeping source attribution and freshness visible at all times

## Core capabilities discovered in the codebase

- **Natural-language query input** by keyboard or **browser voice input**
- **Intent preview** before submission, including confidence and clarification prompts
- **Two-stage intent parsing**: regex/entity extraction first, LLM fallback second
- **Compound query detection** that collapses multi-data airport requests into a single airport overview workflow
- **Real-time weather** via METAR, TAF, and nearby PIREPs from `aviationweather.gov`
- **D-ATIS strip** for one or many airports, including facility-wide airport groups
- **Live traffic map** with zoom, pan, altitude color coding, and callsign labels
- **FAA approach plates** plus **SIDs**, **STARs**, and **airport diagrams**
- **Inline plate viewer** with best-match selection by procedure type and runway
- **Airport frequencies** from FAA/NASR-backed seed data, including approach/TRACON sectors for major facilities
- **NOTAM lookup** with D / FDC / TFR handling (**requires `FAA_NOTAM_API_KEY`**)
- **Airport statistics** such as tower hours, runway layout, lighting/surface hints, timezone, and airport-use metadata
- **FAR / eCFR lookups** plus locally searchable FAA **JO 7110.65** and **AIM** reference content
- **Navigation/bearing calculations** with great-circle distance, magnetic heading estimate, and enroute time
- **Facility selector** for **tower**, **approach/TRACON**, and **center/ARTCC** contexts
- **Multi-airport overview** cards for approach and center facilities
- **Auto-refresh** for live weather and traffic queries
- **Source badges, freshness indicators, staleness warnings, and raw response reveal panels**

## What is implemented vs. planned

Traffic in this repository is currently implemented with **OpenSky Network** (`src/services/traffic.ts`). The codebase does **not** currently contain an ADS-B Exchange client, so documentation below describes the traffic feature as implemented today rather than as a roadmap promise.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript** with strict typing
- **Tailwind CSS** for the dark aviation UI
- **Vitest** for unit tests
- **Playwright** for end-to-end tests
- **ESLint** for static analysis

## Data sources used

### Live / upstream sources

| Source | Used for | Where in code |
| --- | --- | --- |
| **NOAA Aviation Weather Center** (`aviationweather.gov`) | METAR, TAF, PIREP | `src/services/weather.ts` |
| **FAA DTPP** (`aeronav.faa.gov`, `nfdc.faa.gov`) | approach plates, SIDs, STARs, airport diagrams | `src/services/plates.ts` |
| **FAA NFDC / NASR / Airport Display** | airport reference info, runway details, tower hours, frequencies | `src/services/frequencies.ts`, `src/services/airport-hours.ts`, `src/services/runway-info.ts` |
| **FAA NOTAM API** | NOTAMs (D/FDC/TFR) | `src/services/notams.ts` |
| **FAA D-ATIS feed via `datis.clowd.io`** | digital ATIS letters and text | `src/services/datis.ts`, `src/app/api/atis/route.ts` |
| **OpenSky Network** | live traffic targets | `src/services/traffic.ts` |
| **eCFR API** | FAR / Title 14 references | `src/services/regulatory.ts` |

### Official reference corpora bundled locally

| Source | Used for | Where in code |
| --- | --- | --- |
| **FAA Order JO 7110.65** | ATC phraseology / procedural references | `src/data/atc-references.ts` |
| **FAA AIM** | operational guidance lookups | `src/data/aim-references.ts` |

## Architecture overview

### API route pattern

Most routes in `src/app/api/*` follow the same pattern:

1. read and validate query/body params
2. optionally invalidate cache on `refresh=true`
3. delegate to a service in `src/services/*`
4. return a normalized `ApiResponse<T>` envelope via `jsonWithStandardHeaders`

Common routes include:

- `/api/query` — parse + execute full user query
- `/api/intent` — parse only
- `/api/weather`
- `/api/traffic`
- `/api/plates`
- `/api/frequencies`
- `/api/notams`
- `/api/regulatory`
- `/api/atis`
- `/api/plate-proxy`

### Service layer

The service layer owns:

- upstream fetch logic
- retries/timeouts via `fetchWithRetry`
- in-memory TTL caching
- normalization into typed domain models
- source attribution and freshness metadata
- graceful error envelopes instead of raw upstream failures

### Intent parsing

Intent parsing is intentionally conservative:

- **Phase 1:** regex/pattern matching + entity extraction
- **Phase 2:** optional LLM classification when the fast path is low-confidence or ambiguous
- compound airport queries are promoted to `airport_info` so the UI can show multiple coordinated panels

### Standard response envelope

Every API/service response is wrapped in `ApiResponse<T>` from `src/types/api.ts`, including:

- `ok`
- `data`
- `source`
- `attribution.primary` and optional supporting sources
- `fetchedAt`
- `isStale`
- `stalenessWarning`
- `cache`
- structured `error` details on failure

## Setup

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

Copy `.env.example` to `.env.local` and set what you need:

```bash
FAA_NOTAM_API_KEY=
OPENAI_API_KEY=
OPENSKY_USERNAME=
OPENSKY_PASSWORD=
```

#### Variable notes

- `FAA_NOTAM_API_KEY` — required for live NOTAM calls
- `OPENAI_API_KEY` — enables LLM intent fallback
- `OPENSKY_USERNAME` / `OPENSKY_PASSWORD` — optional; improves OpenSky rate limits

If keys are missing:

- NOTAMs degrade gracefully with a helpful error message
- LLM parsing falls back to regex/entity parsing only
- traffic still works anonymously, subject to stricter rate limiting

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:e2e
```

## Project structure

```text
src/
  ai/          Intent parsing, entity extraction, voice input, optional LLM fallback
  app/         Next.js App Router pages and API routes
  components/  Operations console UI, cards, maps, viewers, selectors
  data/        Source registry, airport/facility datasets, regulatory reference corpora
  lib/         Cache, fetcher, constants, shared response utilities
  services/    Upstream integrations and orchestration
  types/       API envelopes and domain models
```

### Key folders

- `src/app` — page shell plus API endpoints
- `src/components` — main dashboard UI; `OperationsConsole.tsx` is the top-level client orchestrator
- `src/services` — authoritative data-fetching and aggregation logic
- `src/data` — airport/facility catalogs, source metadata, staleness policies, local FAA reference data
- `src/ai` — parsing pipeline and browser speech-recognition helper
- `src/types` — stable contracts for responses, intents, aviation entities, and facilities
- `src/lib` — cache, fetch retry helper, utility formatters, and envelope builders

## Design principles

- **Never fabricate data.** If a source is unavailable, return a traceable error instead of inventing an answer.
- **Always attribute sources.** Every meaningful result carries provider metadata and fetch timestamps.
- **Show freshness clearly.** Staleness is part of the product, not hidden implementation detail.
- **Optimize for controller scan speed.** Dark, high-contrast, aviation-themed UI with concise labels.
- **Prefer official references.** FAA/NOAA/government sources come first; non-government live traffic is labeled as such.
- **Keep routes thin and services typed.** Domain logic lives in `src/services`, not in route handlers.

## Notes for future developers and AI agents

- Start with `src/components/OperationsConsole.tsx` to understand the end-to-end UI behavior.
- Then read `src/ai/intent-parser.ts` and `src/services/orchestrator.ts` for the main query pipeline.
- Use `src/data/sources.ts` and `src/data/staleness.ts` to understand provenance and freshness rules.
- Use `docs/ARCHITECTURE.md` for a deeper technical walkthrough.
- Use `docs/FEATURES.md` for the user-facing capability inventory.
