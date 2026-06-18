# ATC Companion — Decisions

## Decision Log

### 2026-06-17: Team formed — Apollo 13 cast
**By:** Devin Sinha
**What:** Team assembled with Kranz (Lead), Swigert (Frontend), Mattingly (Backend), Aaron (Aviation Data), Haise (AI/NLP), Lovell (Tester/Safety). Universe: Apollo 13.
**Why:** Project kickoff. YOLO mode — autonomous execution, no approval gates.

### 2026-06-17: Core architecture — Next.js full-stack
**By:** Devin Sinha
**What:** Next.js App Router with TypeScript. Server-side API routes proxy all external data sources. Web Speech API for voice input with Whisper fallback. Dark high-contrast UI optimized for tower environments.
**Why:** User requirement. Single deployable app, SSR for performance, API routes for secure key management.

### 2026-06-17: Data integrity policy — NEVER fabricate
**By:** Devin Sinha
**What:** Aviation data must NEVER be fabricated or hallucinated. All data must come from authoritative sources (FAA, aviationweather.gov, OpenSky). Every data point must include source attribution and timestamp. Stale data must be flagged. AI/LLM is used ONLY for intent parsing, never for generating aviation data.
**Why:** Safety-critical application. Incorrect aviation data can endanger lives.
