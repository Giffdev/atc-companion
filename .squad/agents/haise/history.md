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
