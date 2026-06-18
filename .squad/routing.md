# ATC Companion — Routing

## Routing Rules

| Signal Pattern | Route To | Mode |
|---------------|----------|------|
| Architecture, system design, scope decisions | Kranz | sync |
| UI, components, pages, styling, voice input UI, dark mode | Swigert | background |
| API routes, data fetching, caching, server-side, integrations | Mattingly | background |
| FAA data, METARs, TAFs, NOTAMs, frequencies, approach plates, FARs, ADS-B | Aaron | background |
| Intent parsing, NLP, voice-to-text, query understanding, LLM prompts | Haise | background |
| Tests, safety verification, source validation, data accuracy | Lovell | background |
| Multi-domain / "team" requests | Kranz (coordinate) + relevant specialists | sync + background |
| Code review | Kranz (lead review) + Lovell (safety review) | sync |

## Domain Boundaries

- **Kranz** owns: project structure, tech decisions, code review, architecture
- **Swigert** owns: `src/app/`, `src/components/`, `src/styles/`, `public/`, UI/UX
- **Mattingly** owns: `src/app/api/`, `src/lib/`, `src/services/`, caching, data layer
- **Aaron** owns: `src/data/`, FAA data schemas, data source documentation, aviation domain models
- **Haise** owns: `src/ai/`, `src/intents/`, NLP pipeline, intent schemas, prompt engineering
- **Lovell** owns: `tests/`, `__tests__/`, test fixtures, safety validation scripts
