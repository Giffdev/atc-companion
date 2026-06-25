# Haise — History

## 2026-06-17: Project kickoff
- Joined as AI/NLP Engineer for ATC Companion
- Responsible for intent parsing pipeline, voice-to-text, query understanding
- LLM is for intent classification ONLY — never for generating aviation data
- Intent categories: WEATHER, NOTAM, FREQUENCY, PLATES, TRAFFIC, REGULATORY, AIRPORT_INFO
- YOLO mode active

## 2026-06-17: Session integration snapshot
- Implemented intent taxonomy, pattern-first parsing, fallback LLM classification, entity extraction, and NATO-aware voice handling.
- Wired parsed user intent into the API route contract that Mattingly backs with source-attributed responses.
- Safety boundary is now shared with Lovell: AI assists query understanding only, never data generation for Swigert's aviation displays.

## 2026-06-24T19:00:00-07:00 — Phase A shipped live
Phase A Global Airport Database release is live at atc-companion.vercel.app via commit e7791d0. Dataset runway/frequency fallbacks, city/state resolution, and validation gates all passed; live checks confirmed 38W 08/26, 38W CTAF 122.9, and Forks WA -> S18.


## 2026-06-25T09:40:42-07:00 — Phase B Canada shipped

Phase B Canadian airport coverage shipped live to atc-companion.vercel.app in commit `2618ee5` for Devin Sinha. Contributions recorded: Kranz scoped the Canada plan, Aaron generated/merged CA data server-side, Mattingly gated 122.9 and runway jurisdiction paths, Haise added Canadian extraction, Swigert removed hardcoded FAA-only copy, Lovell passed safety review, and Rai's yellow advisory was resolved. Unified validation: lint 0 warnings, clean build, 260 tests passed; production CYVR returns real runways with no Canadian 122.9 or FAA Chart Supplement leakage.

## 2026-06-25T17:10:00Z — Navigation parsing fixes shipped

Haise shipped two Canadian navigation parsing fixes in commit `5070c70`: route-classification now lets `NAVIGATION_PATTERN` queries win without passive `airport_info` dual-classification, and guarded positional `X to Y` extraction preserves typed order for routes such as `pae to 38w`. Live verification confirmed navigation requests no longer reverse or collapse into airport-info ambiguity.
