### 2026-06-25T11:46:16-07:00
**By:** Haise
**What:** Explicit airport-code matches are ordered before fuzzy airport name matches; Canadian CY/CZ ICAO-looking tokens are admitted as explicit direct codes so typed CYNJ can outrank the Langley name match.
**Why:** User-entered ICAO codes are stronger intent signals than fuzzy place-name matches, and preserving fuzzy matches later in the dedupe keeps name-only resolution working.
