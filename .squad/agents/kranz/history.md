# Kranz — History

## 2026-06-17: Project kickoff
- Joined as Lead/Architect for ATC Companion
- Team: Swigert (Frontend), Mattingly (Backend), Aaron (Aviation Data), Haise (AI/NLP), Lovell (Tester/Safety)
- Stack: Next.js App Router + TypeScript, dark high-contrast UI, voice input
- Key constraint: NEVER fabricate aviation data — all sourced, all cited, all timestamped
- YOLO mode — autonomous execution from day one

## 2026-06-17: Session integration snapshot
- Scaffolded the full Next.js/Tailwind project baseline and validated install/build/test.
- Established the contract that Aaron's source metadata and staleness rules must flow through Mattingly's services into Swigert's UI.
- Confirmed Haise's LLM usage is limited to intent classification/parsing, with Lovell's safety tests enforcing the no-fabrication boundary.


## 2026-06-24T21:44:52-07:00 — Frequency gap policy resolved
Frequency-gap policy moved from options analysis into shipped Option C: no absence assertion when sources lack records, plus a guarded unverified 122.9 convention hint for eligible small/non-towered cases. Live commit: `6487c7b`.

## 2026-06-25T09:40:42-07:00 — Phase B Canada shipped

Phase B Canadian airport coverage shipped live to atc-companion.vercel.app in commit `2618ee5` for Devin Sinha. Contributions recorded: Kranz scoped the Canada plan, Aaron generated/merged CA data server-side, Mattingly gated 122.9 and runway jurisdiction paths, Haise added Canadian extraction, Swigert removed hardcoded FAA-only copy, Lovell passed safety review, and Rai's yellow advisory was resolved. Unified validation: lint 0 warnings, clean build, 260 tests passed; production CYVR returns real runways with no Canadian 122.9 or FAA Chart Supplement leakage.


## 2026-06-25T11:07:00-07:00 — Global airport DB product docs

Updated product docs (`README.md`, `docs/FEATURES.md`, `docs/ARCHITECTURE.md`) for US/Canada/Caribbean airport database coverage, jurisdiction-aware messaging, PR/VI handling, ICAO shapes, and trailing airport query cues. Decision archived in `decisions.md`.


## 2026-06-25T15:00:35-07:00 — Live runway docs refreshed
Product docs now describe the live-data runway model: FAA NFDC first, generated OurAirports active runway rows with closed=1 filtering second, inferred fallback last, plus Mexico dataset coverage and prefixes `us`, `ca`, `mx`, `carib`. Docs commit `75c7852` followed runway refactor `f592fd9`.
