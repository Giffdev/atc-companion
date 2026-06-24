# D-ATIS Source Notes

**Owner:** Aaron (Aviation Data Specialist)  
**Last updated:** 2026-06-23  
**Related service:** `src/services/datis.ts`  
**Related staleness config:** `src/data/staleness.ts`

---

## Source: clowd.io D-ATIS

| Field | Value |
|---|---|
| Endpoint | `https://datis.clowd.io/api/{icao}` (ICAO in any case; API lowercases) |
| Format | JSON array of `{ airport, type, code, datis }` objects |
| Auth | None required for current usage |
| Reliability | **Medium** — can lag the authoritative FAA D-ATIS by one or more letters |
| Refresh behavior | clowd.io polls FAA D-ATIS at an undisclosed interval. Observed latency: at KSEA, clowd.io returned INFO J while the actual FAA D-ATIS was at INFO M (≥2 letters behind). This is not an edge case; treat any clowd.io response as potentially stale at the time of fetch. |
| Coverage | US towered airports with D-ATIS capability |

### Reliability note

clowd.io is a third-party mirror, not the authoritative FAA D-ATIS feed.  
**Always surface the ATIS `issuedAt` timestamp and ATIS letter to the user. Never present clowd.io data currency as authoritative.**  
The UI should always show the ATIS issuance time so operators can cross-check against the letter they copied off the radio or received from ACARS.

---

## Recommended Staleness Threshold

**Recommended `ATIS_STALE_THRESHOLD_MIN`: 75 minutes**  
(Backend default is currently `ATIS_STALE_THRESHOLD_MIN = 75` in `src/services/datis.ts`.)

### Rationale

D-ATIS is event-driven, not clock-driven. ATIS is reissued whenever operationally significant conditions change — wind shift, altimeter change, runway configuration, approach type, ceiling/visibility changes that affect flight category — and may additionally be re-recorded periodically at controller discretion or per local SOPs. In practice:

- At a busy airport during active weather, letters can advance several times per hour.
- At a quiet airport in stable conditions, a single letter may persist for 60–90 minutes.
- There is no FAA-mandated fixed interval; FAA Order JO 7110.65 requires ATIS to reflect current conditions, which drives event-based updates.

A 30-minute threshold is too aggressive for stable conditions: it warns on a current ATIS simply because no operationally significant condition has changed. That creates alert fatigue and matches the user report that D-ATIS appears "always stale."

**75 minutes** is recommended because:

1. It covers normal stable-weather ATIS persistence of roughly 60 minutes plus modest source/cache latency.
2. It still warns when the issuance is genuinely old, rather than suppressing stale data entirely.
3. It keeps the UI focused on the actual ATIS `issuedAt` age; users can still cross-check the visible letter/time when conditions are changing quickly.
4. It avoids making a third-party source-lag guess look like a definite stale-data finding. Without an authoritative newer letter, age alone should warn only after a generous operational window.

This threshold applies to the `ageMinutes` computed from the ATIS `issuedAt` field (the timestamp of the ATIS issuance as reported by clowd.io), not to the age of our local API cache entry.

---

## Alternate / More Authoritative D-ATIS Sources

### FAA SWIM (System Wide Information Management)

- **What it is:** The FAA's authoritative internal ATIS data pipeline. D-ATIS is distributed via SWIM as near-real-time message queue feeds (AMQP / JMS), not as a public REST API.
- **Freshness:** Near-real-time; authoritative by definition (it is the source clowd.io and other mirrors ultimately derive from).
- **Feasibility for ATC Companion:** Low without a formal FAA relationship.
  - Requires executing a SWIM User Agreement (SUA) and formal FAA application.
  - Requires connectivity through the NAS Enterprise Security Gateway (NASG) or equivalent — not just an HTTPS endpoint.
  - Intended for airlines, avionics vendors, certified aviation service providers. Informal/developer access is not currently available.
  - Reference: https://www.faa.gov/air_traffic/technology/swim/
- **Verdict:** Worth pursuing only if the project establishes a formal FAA data services relationship. Not a near-term substitute.

### nasstatus.com

- **What it is:** A web interface that displays D-ATIS text for select US airports, sourced from SWIM or a similar FAA feed.
- **Freshness:** Likely closer to authoritative than clowd.io, but unverified. No public API; data would require screen scraping.
- **Feasibility:** Scraping violates most sites' ToS and introduces fragile parsing. Not recommended.

### AviationWeather.gov (NOAA AWC)

- **What it is:** NOAA Aviation Weather Center REST API — already used in this project for METAR/TAF/PIREP.
- **Does it provide D-ATIS?** No. NOAA AWC does not distribute D-ATIS. METAR observations overlap in content (wind, altimeter, visibility) but are not ATIS and do not carry the ATIS letter/code.
- **Verdict:** Not a substitute for D-ATIS; already the authoritative source for weather observations.

### VATSIM / IVAO (Virtual ATC Networks)

- **What it is:** Virtual ATC networks distribute ATIS-like text feeds for simulation.
- **Freshness / Accuracy:** Not real-world data. Do not use.

### Summary Recommendation

| Source | Freshness | Auth | Feasibility |
|---|---|---|---|
| FAA SWIM (D-ATIS) | Authoritative / real-time | SWIM SUA + NASG gateway | Low — formal FAA application required |
| clowd.io *(current)* | Medium — known lag of ≥1 letter | None | In use; document and surface age |
| nasstatus.com | Likely better than clowd.io | None (scrape) | Fragile; ToS risk |
| NOAA AWC | N/A — no ATIS | None | Already used; different data type |

**Recommendation:** Retain clowd.io as the current source with a 75-minute staleness threshold and clear age disclosure in the UI. Pursue FAA SWIM access only if the project formally engages as an aviation data services partner — at which point clowd.io should be deprecated in favor of SWIM. There is no currently available public REST source that is both authoritative and fresher than clowd.io.

---

## Integration Checklist for Backend (Mattingly)

- [x] `ATIS_STALE_THRESHOLD_MIN` → set to **`75`** in `src/services/datis.ts`
- [ ] Expose `issuedAt` and `ageMinutes` fields in the `AtisInfo` response (already planned per handoff)
- [x] Populate `stale` flag using the 75-minute threshold
- [ ] Surface `issuedAt` and `stale` in the UI layer (coordinate with front-end)
- [ ] Add a data-source note in the ATIS response that clowd.io may lag FAA D-ATIS

---

*Decision record also written to `.squad/decisions/inbox/aaron-datis-source.md`.*
