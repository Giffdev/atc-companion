# Aaron — Data Correctness Audit (Phase 2)

**Author:** Aaron (Aviation Data Specialist)  
**Date:** 2026-06-23  
**Scope:** Full codebase audit — UTC/timezone handling, staleness signaling, unit conversions, parsing edge cases, source reliability  
**Audit mode:** Read-only. No code changes made.

---

## Summary

12 findings: 4 HIGH · 4 MED · 4 LOW

The most critical issue is **all aviation timestamps displayed in the UI use the browser/server local timezone** (`Intl.DateTimeFormat` without a `timeZone: "UTC"` override). Every METAR observation time, TAF issue time, TAF forecast group, and NOTAM effective/expiry is shown in local time to the user — a direct safety hazard for ATC tooling where all times must be Zulu. The second critical issue is that **staleness checks compare `fetchedAt` (when we pulled data) rather than `observedAt`/`issuedAt` (when the aviation product was actually produced)**, meaning a 59-minute-old METAR is never flagged stale.

---

## Findings

---

### [SEVERITY: HIGH] F-01 — All aviation timestamps displayed in local timezone, not UTC/Zulu

**File:** `src/lib/utils.ts:93-104`, consumed at `src/components/WeatherDisplay.tsx:45,115,124`, `src/components/NotamList.tsx:42,47`, `src/components/OperationsConsole.tsx:136`, `src/components/SourceBadge.tsx:39,54`

**What:** `formatTimestamp()` uses `Intl.DateTimeFormat` with no `timeZone` option, defaulting to the runtime's local timezone. METAR `observedAt`, TAF `issuedAt`, TAF forecast `validFrom`, NOTAM `effectiveAt`, and NOTAM `expiresAt` are all rendered in local time.

```ts
// src/lib/utils.ts:93
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    // ... no timeZone: "UTC" ← BUG
    timeZoneName: "short"   // shows local TZ name e.g. "PDT"
  }).format(date);
};
```

**Why it matters:** Aviation is all Zulu. A METAR observed at 1853Z will display as "10:53 AM PDT" to a Pacific Time user. Controllers working with times in the display would need to mentally convert, introducing error potential. NOTAMs showing local effective times are outright dangerous.

**How to fix:** Add `timeZone: "UTC"` to the `Intl.DateTimeFormat` options and change `timeZoneName: "short"` to always show "Z" suffix:
```ts
new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
  timeZoneName: "short"   // will show "UTC" suffix
})
```
Or use a simpler ISO-based formatter that always appends "Z".

---

### [SEVERITY: HIGH] F-02 — `isDataStale` checks `fetchedAt` (fetch time), not `observedAt` (observation time)

**File:** `src/data/staleness.ts:25-29`, `src/lib/utils.ts:23`, `src/services/weather.ts:417-419`

**What:** `createApiResponse` passes `fetchedAt` (the timestamp of when we fetched from the network) to `isDataStale`. The cache TTL and the staleness threshold are **both** 60 minutes for METAR. Since the cache auto-expires at 60 min and we re-fetch, `fetchedAt` is always fresh from the cache perspective, so `isStale` is effectively **never true** for METARs in normal operation.

```ts
// src/lib/utils.ts:23
const stale = options.stalenessCategory ? isDataStale(fetchedAt, options.stalenessCategory) : false;
//                                                    ^^^^^^^^^ should be observedAt for METAR
```

The real question is: "Is this METAR observation old?" A METAR observed at T=0, fetched at T=55min, cached for 60min — at T=60min the cache expires. New fetch returns the same or newer obs. But if the METAR update was late and the obs is still from T=0, at T=115 that's a 115-min-old observation with `isStale=false` for the full 60 min after the fresh fetch.

**Why it matters:** Controllers could see a 59-min-old METAR (nearly 2 cycles old if a SPECI was missed) with no staleness warning. For ATC safety, freshness of the actual observation matters, not when we last polled.

**How to fix:** For METAR, compute staleness as `isDataStale(metar.observedAt, "metar")` after parsing. For TAF, use `taf.issuedAt`. For NOTAM, `notam.effectiveAt` is less useful; instead cap NOTAM cache TTL at a shorter interval (see F-06).

---

### [SEVERITY: HIGH] F-03 — `toIsoTimestamp` parses timezone-ambiguous NOTAM date strings as local time

**File:** `src/services/_shared.ts:43-56`

**What:** `Date.parse(value)` is called on date strings from upstream NOTAM APIs (FAA external API, AviationAPI). Many APIs return timestamps like `"2024-01-15T14:30:00"` or `"2024-01-15 14:30:00"` without a trailing `Z` or UTC offset. JavaScript's `Date.parse()` treats these as **local time** on non-UTC machines/environments (confirmed by live test: on UTC-7 machine, `Date.parse("2024-01-15T14:30:00")` → `22:30:00Z`, a 8-hour offset from intended 14:30Z).

```ts
// src/services/_shared.ts:49
const parsed = Date.parse(value);   // ← treats "2024-01-15T14:30:00" as LOCAL time
```

**Why it matters:** On a non-UTC development machine, NOTAM effective/expiry times are off by the local UTC offset (e.g., 7-8 hours for Pacific Time). A NOTAM effective at 14:00Z would appear effective at 21:00Z in the UI — 7 hours late — and staleness/expiry logic would be completely wrong. The Vercel production deploy likely runs UTC and may not exhibit this, making it a silent development-time hazard.

**How to fix:** Before calling `Date.parse`, normalize ambiguous strings by appending `Z` if no timezone designator is present:
```ts
const normalized = value.trim().replace(/(\d{2}:\d{2}:\d{2})$/, "$1Z");
// or use a more robust check: if no 'Z'/'+'/'-offset' at end, append 'Z'
```

---

### [SEVERITY: HIGH] F-04 — NOTAM cache TTL equals staleness threshold (12h) — TFR NOTAMs served from 12h-old cache

**File:** `src/data/staleness.ts:9`, `src/lib/cache.ts:35-38`

**What:** `getCacheTtlMs("notam")` returns 12 hours (same as `STALENESS_THRESHOLDS_MS.notam`). The app will serve NOTAM data from a 12-hour-old cache hit without ever re-fetching. A TFR NOTAM issued 11 hours after the last cache population would be invisible to users until the cache expires.

```ts
// src/data/staleness.ts:9
notam: 12 * 60 * 60 * 1000,   // cache TTL *and* staleness threshold — same value
```

**Why it matters:** TFR NOTAMs have immediate safety implications (VIP protection, disaster areas, special events). Serving 12-hour-old NOTAM data without warning is a direct safety risk. The FAA source registry comment says "re-check at least every 12 hours" — this was intended as a staleness warning threshold, not a cache TTL.

**How to fix:** Decouple the cache TTL from the staleness threshold. Recommended: cache NOTAMs for 15-30 minutes (force re-fetch frequently), keep staleness warning threshold at 12h (or reduce it — see Staleness Threshold Table below).

---

### [SEVERITY: MED] F-05 — OpenSky altitude uses geometric (GPS) altitude as primary, baro altitude as fallback

**File:** `src/services/traffic.ts:90`

**What:**
```ts
altitudeFeet: metersToFeet(state[13] ?? state[7]),
//                         ^^^^^^^^  state[13] = geo_altitude (GPS geometric)
//                                             state[7] = baro_altitude (pressure)
```
The OpenSky states array: `state[7]` = barometric altitude (meters), `state[13]` = geometric/GPS altitude (meters). The code prefers geometric altitude (`state[13]`) over barometric.

**Why it matters:** ATC separation is predicated on barometric altitude — all aircraft altimeters read pressure altitude corrected for local altimeter setting. GPS geometric altitude can differ from baro by hundreds of feet (depends on geoid model, pressure altitude corrections, etc.) and is NOT what controllers or pilots use for separation. Displaying geometric altitude as primary is misleading for ATC use.

**How to fix:** Swap: `altitudeFeet: metersToFeet(state[7] ?? state[13])` — prefer baro, fall back to geometric.

---

### [SEVERITY: MED] F-06 — METAR staleness threshold 60 min too lenient; no staleness UI for METAR/TAF/NOTAM

**File:** `src/data/staleness.ts:6`, `src/components/WeatherDisplay.tsx` (no staleness UI)

**What:** `STALENESS_THRESHOLDS_MS.metar = 60 * 60 * 1000` (60 minutes). Hourly METARs (scheduled at :50-:53 past the hour) plus SPECIs (unscheduled, any time) mean an observation can be up to ~65 minutes old before the next routine METAR. The 60-min threshold effectively never triggers (see F-02 interaction). More importantly, `WeatherDisplay.tsx`, `NotamList.tsx` show NO staleness badge or warning — only the `SourceBadge` (used in `ResultCard` / `PlatesList`) exposes `isStale`. METARs and NOTAMs have no visible freshness signal in the UI.

**Why it matters:** A 55-minute-old METAR from a field where conditions are rapidly changing (convective activity) is shown identically to a fresh one. Controllers need to know observation age.

**How to fix:** (1) Add `isStale`/`ageMinutes` display to `WeatherDisplay` and `NotamList`. (2) Reduce METAR staleness threshold to 45 min (see table below). (3) Display observation age in minutes next to the "Obs" timestamp in `WeatherDisplay`.

---

### [SEVERITY: MED] F-07 — PIREP staleness threshold 2 hours too lenient for hazard warnings

**File:** `src/data/staleness.ts:8`

**What:** `STALENESS_THRESHOLDS_MS.pirep = 2 * 60 * 60 * 1000` (2 hours). PIREPs are used primarily for icing, turbulence, and airspace hazard reports. FAA guidance (AIM 7-1-22) notes PIREPs "should be used with caution" beyond 1 hour, and hazard-specific PIREPs (UUA — Urgent Pilot Reports) have immediate operational significance.

**Why it matters:** A 1.5-hour-old severe turbulence or icing PIREP shown without any staleness warning could lead to clearances through hazardous conditions. UUA PIREPs in particular should be treated as time-critical.

**How to fix:** Reduce `pirep` staleness threshold to 60 minutes (routine PIREPs). Consider a separate `urgentPirep` category at 30 minutes, or at minimum flag UUA PIREPs differently in the UI.

---

### [SEVERITY: MED] F-08 — `formatRelativeTime` used for source freshness but lacks Zulu context

**File:** `src/components/StatusBar.tsx:38`, `src/components/SourceBadge.tsx:41`

**What:** `formatRelativeTime` shows "3 minutes ago" etc. relative to `referenceTime`. This is correct for recency, but the `StatusBar` tooltip uses `formatTimestamp(source.fetchedAt)` (local time — see F-01). Controllers reading the tooltip on a source badge see local time, not Zulu.

**Why it matters:** Part of the same local-time contamination as F-01, but specifically on the operational console's source timestamps that define data currency for the shift.

**How to fix:** Apply `timeZone: "UTC"` fix from F-01. Optionally add explicit "Z" suffix to relative-time display (e.g., "3 min ago (fetched 1853Z)").

---

### [SEVERITY: LOW] F-09 — OpenSky traffic `fetchedAt` reflects request time, not OpenSky data timestamp

**File:** `src/services/traffic.ts:78-99`

**What:** `mapOpenSkyTraffic` passes `fetchedAt` (the moment of our API call) as the `TrafficTarget.fetchedAt`, ignoring `response.time` (the Unix epoch when OpenSky last updated its data). Anonymous OpenSky users receive data delayed by up to 30 seconds; the individual state vector `state[3]` (time_position) is when the position was last observed.

**Why it matters:** Traffic targets can display `fetchedAt` as now even if position data is 30 seconds old. For ATC purposes, position age is operationally relevant — a 30s-old position at 250kt = 2.1 NM of position uncertainty. Not fatal since the 30s cache TTL implicitly caps this, but it understates actual data age.

**How to fix:** Use `response.time * 1000` (if present) as the canonical data timestamp for the batch. Optionally derive per-target `fetchedAt` from `state[3] * 1000` when state[3] is non-null.

---

### [SEVERITY: LOW] F-10 — ATIS API route (`/api/atis/route.ts`) bypasses app-level cache, duplicates service logic

**File:** `src/app/api/atis/route.ts:25-64`

**What:** The ATIS API route fetches clowd.io directly using `next: { revalidate: 90 }` (Next.js fetch cache), completely bypassing `getAtis()` / `getOrPopulateCache()`. This means:
1. Any app-level cache state managed by `getAtis()` is ignored.
2. The ATIS parsing logic (including `parseAtisIssuanceTime`) is duplicated inline.
3. If `parseAtisIssuanceTime` is updated, the route may not pick it up (it does import the function, so this is OK, but the ageMinutes calculation is done independently in the route).
4. `ageMinutes` in the route is computed at fetch time and then frozen in the Next.js cache for 90s; by the time the cached response is served, the age is 90s stale.

**How to fix:** The route should call `getAtis(icao)` and return its result. Remove the inline clowd.io fetch from the route.

---

### [SEVERITY: LOW] F-11 — `adsbFi` source `refresh_interval` claims "~10 seconds" but cache TTL is 30 seconds

**File:** `src/data/sources.ts:192`, `src/data/staleness.ts:17`

**What:** `adsbFi.refresh_interval = "~10 seconds"` but `STALENESS_THRESHOLDS_MS.trafficTarget = 30 * 1000` (30 seconds). Traffic is cached for 30 seconds. The source description says the upstream updates every 10 seconds, but we cache for 30 — so displayed data could be up to 30s old even though the source refreshes every 10s.

**Why it matters:** Minor mismatch in documentation vs. behavior. The 30s cache is reasonable (ADS-B positional data doesn't need <10s refresh in a UI context), but the source description misleads about effective freshness.

**How to fix:** Either reduce `trafficTarget` cache TTL to 10-15s (higher upstream load) or update `adsbFi.refresh_interval` to "30s (application cache)" to reflect reality.

---

### [SEVERITY: LOW] F-12 — NOTAM text field parsed via overly broad fallback chain; may pick wrong field

**File:** `src/services/notams.ts:81`

**What:**
```ts
const text = String(raw.text ?? raw.notam ?? raw.notam_text ?? raw.body
  ?? raw.remarks ?? raw.description ?? raw.message ?? "");
```
This fallback chain reaches `raw.message`, a generic field name present in many JSON APIs. If an upstream error response contains `{ "message": "Not found" }`, the NOTAM's text would be set to `"Not found"` rather than an empty string or an error. The `resolveNotamItems` guard checks for object type but not for error-shape responses.

**Why it matters:** A NOTAM with `text = "Not found"` would be silently included in the NOTAM list with the appearance of a real operational notice. Low probability but non-zero.

**How to fix:** Check for known error shapes before parsing (e.g., if `raw.message && !raw.notamNumber && !raw.icaoId`, treat as parse failure). Or move `raw.message` to the end after all domain-specific fields and add a minimum length check.

---

## Recommended Staleness Thresholds Per Feed

Consistent with the ATIS 30-minute precedent (set to give early warning before data is certifiably wrong). "Cache TTL" = how long to serve from cache before re-fetching. "Warn threshold" = when to show a staleness warning to the user.

| Feed | Current Warn | Recommended Warn | Recommended Cache TTL | Rationale |
|------|-------------|-----------------|----------------------|-----------|
| **ATIS** | 30 min ✅ | **30 min** (keep) | 90 s (keep) | ATIS is event-driven; clowd.io lags by ≥1 letter. 30 min precedent confirmed by KSEA live case. |
| **METAR** | 60 min | **45 min** | 10 min | METARs issue at ~:50 past the hour; 45 min gives a buffer before the next expected obs. SPECIs can arrive any time — consider showing obs age in minutes rather than a binary flag. |
| **TAF** | 6 h | **6 h** (keep) | 60 min | TAFs are issued every 6h for most airports; 6h warn is appropriate, but cache TTL should be ≤60 min so missed issuances don't sit for 6h. |
| **PIREP** | 2 h | **60 min** | 15 min | FAA guidance cautions against PIREPs >1h. UUA (urgent) PIREPs should warn at 30 min. |
| **NOTAM** | 12 h | **2 h** for TFR/FDC, **6 h** for D | **15 min** | TFRs have immediate safety impact. Cache must be short so new TFRs appear promptly. Separate thresholds per type is ideal. |
| **Traffic (ADS-B)** | 30 s ✅ | **30 s** (keep) | 30 s (keep) | ADS-B positions go stale rapidly; 30s is appropriate. |
| **PIREP (UUA)** | (not separate) | **30 min** | 10 min | Urgent pilot reports; treat as a separate high-priority feed. |

---

## Quick-Reference Fix Priority

| Finding | Severity | Owner action | Effort |
|---------|----------|-------------|--------|
| F-01 UTC display | HIGH | Add `timeZone: "UTC"` to `formatTimestamp` | Low |
| F-02 `fetchedAt` vs `observedAt` staleness | HIGH | Pass `observedAt` to staleness check | Med |
| F-03 `toIsoTimestamp` TZ ambiguity | HIGH | Normalize tz-less strings before `Date.parse` | Low |
| F-04 NOTAM cache = staleness (12h) | HIGH | Decouple cache TTL (15 min) from warn threshold | Low |
| F-05 OpenSky geo vs baro altitude | MED | Swap `state[7] ?? state[13]` | Trivial |
| F-06 No staleness UI for METAR/NOTAM | MED | Add age display + badge to `WeatherDisplay`/`NotamList` | Med |
| F-07 PIREP 2h threshold | MED | Reduce to 60 min in `staleness.ts` | Trivial |
| F-08 `formatRelativeTime` tooltip local time | MED | UTC fix from F-01 | Low |
| F-09 OpenSky `fetchedAt` vs data age | LOW | Use `response.time` for batch timestamp | Low |
| F-10 ATIS route bypasses app cache | LOW | Route calls `getAtis()`, no inline fetch | Med |
| F-11 ADSB.fi refresh_interval mismatch | LOW | Update source description | Trivial |
| F-12 NOTAM text fallback picks error messages | LOW | Add error-shape guard in `parseNotam` | Low |

---

*Aaron — 2026-06-23 | Audit only. No code modified.*
