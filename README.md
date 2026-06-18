# ATC Companion

ATC Companion is a Next.js application for aviation-aware lookup and decision support. The scaffold favors typed data contracts, source attribution, and thin API routes that proxy authoritative aviation sources.

## Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS with a dark, aviation-themed design system
- Vitest + Testing Library
- Playwright for end-to-end testing
- ESLint + Prettier

## Core Architecture

- **Dark-only UI**: the root layout always renders in dark mode.
- **Typed source attribution**: every API response uses `ApiResponse<T>` and includes `source` plus `fetchedAt`.
- **Traceable aviation entities**: domain records carry `source` and `timestamp` fields through `SourceTracked`.
- **Thin route handlers**: `src/app/api/*` routes delegate to services and return normalized envelopes.
- **Extensible boundaries**:
  - `src/services/*` owns authoritative fetch logic.
  - `src/types/*` defines stable contracts for Aaron and Haise to extend.
  - `src/ai/*` isolates intent parsing concerns.
  - `src/data/*` centralizes source metadata.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `FAA_NOTAM_API_KEY` — FAA NOTAM API key for live NOTAM fetches
- `OPENAI_API_KEY` — used by the intent classification path
- `OPENSKY_USERNAME` / `OPENSKY_PASSWORD` — optional OpenSky credentials for higher traffic API limits

## Scripts

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint checks
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright end-to-end tests

## Layout

```text
src/
  ai/           Intent parsing entry points
  app/          App Router pages, layout, route handlers, styles
  components/   Reusable UI shells
  data/         Source metadata and registry
  lib/          Shared constants and utilities
  services/     Authoritative fetch proxies
  types/        Stable API and domain contracts
```

## Design Decisions

- The scaffold ships with placeholder services and route handlers so the team can wire real data providers without reworking contracts.
- Query results and domain objects are structured around provenance from day one.
- Tailwind theme tokens are aviation-specific to make future UI styling consistent.
