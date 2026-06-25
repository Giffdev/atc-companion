# Canada city and runway fixes — Scribe log

**Timestamp:** 2026-06-25T13:05:00-07:00

Haise fixed Canada/global bare-city airport resolution so `langley` and `abbotsford` resolve through the multi-country city path while preserving Everett/PAE and explicit CYNJ behavior. Mattingly made curated runway data outrank OurAirports fallback after live FAA NFDC, removing stale KPAE `11/29` fallback and preserving honest source labels.

Coordinator shipped both in commit `f3bb6e0`, pushed `master`, deployed production (`atc-companion.vercel.app`), live-verified four scenarios, and confirmed 286 tests passing.

## Scribe health
- State backend: FSStorageProvider.
- `decisions.md` before merge: 107,323 bytes.
- Archive gate: `decisions.md` was >= 51,200 bytes, so older-than-7-days policy applied; no eligible entries were present.
- Decision inbox processed: 2 files.
- History summarization: not required; all history files remained below 15,360 bytes.
