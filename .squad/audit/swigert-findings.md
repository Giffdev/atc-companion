# Swigert UX/Accessibility Audit Findings
**Auditor:** Swigert (Frontend / UX+A11y domain)
**Audit date:** 2026-06-23
**Scope:** UX data bugs, fetch-time-vs-data-time traps, missing states, accessibility, stale-data signaling consistency
**Status:** READ-ONLY. No code modified. Findings for triage.

---

## CRITICAL CLASS: Fetch-time-vs-data-time Traps (Same Bug as ATIS)

### [SEVERITY: HIGH] F1 — SourceBadge/WeatherBundle: badge shows fetch time, not observation time
**File:** `src/components/SourceBadge.tsx:28-57` | Used via `src/components/OperationsConsole.tsx:1338-1344`

**WHAT:** `SourceBadge` receives `fetchedAt` (the API call timestamp on `WeatherBundle`, set server-side by `createApiResponse`) and renders "X min ago" + freshness dot. `WeatherBundle.fetchedAt` is the moment *we* called the upstream API, not when the METAR was actually observed. A METAR observation can be 20–60 min older than the bundle's `fetchedAt`.

**WHY:** User sees a green dot + "2 min ago" badge while the actual observation inside is 45 min old — the opposite of what ATIS now does correctly. The METAR panel already shows "Obs HHMMZ" inline (WeatherDisplay.tsx:115), but the ResultCard's prominent badge overrides that impression with falsely fresh-looking data.

**HOW TO FIX:** Pass `metar.observedAt` (or the older of `observedAt` / `fetchedAt`) to `ResultCard.fetchedAt` for weather cards. Add a secondary "fetched X ago" if needed. Match the ATIS pattern: show data-issuance time, not fetch time.

---

### [SEVERITY: HIGH] F2 — FacilityOverview: ATIS staleness fix not present — same pre-fix ATIS bug
**File:** `src/components/FacilityOverview.tsx:16-22, 123-133`

**WHAT:** `FacilityOverview` defines its own local `AtisEntry` interface (line 16-22) that is missing the `issuedAt`, `ageMinutes`, and `stale` fields added to the canonical `AtisEntry` in `AtisStrip.tsx` during Phase 1. The airport overview cards display an ATIS letter badge (line 123-133) with **no staleness ring, no STALE badge, no age display** — the exact bug that was just fixed in `AtisStrip`.

**WHY:** The fix in `AtisStrip` did not propagate to `FacilityOverview`, which makes its own `/api/atis` call with a separate local type (line 216-223). A user looking at the facility overview sees ATIS "P" with no indication it could be an hour old.

**HOW TO FIX:**
1. Delete the local `AtisEntry` interface in `FacilityOverview.tsx` and import the canonical one from `AtisStrip.tsx` (or move to a shared types file).
2. Add staleness ring + STALE badge to `AirportOverviewCard` using the same pattern as `AtisStrip`.

---

### [SEVERITY: HIGH] F3 — StatusBar + SourceBadge: `referenceTime` frozen at SSR timestamp
**File:** `src/components/StatusBar.tsx:38` | `src/components/OperationsConsole.tsx:1284,1599`

**WHAT:** `initialNow` is a server-side timestamp baked in at page load (passed as `referenceTime` to `StatusBar` and all `ResultCard` / `SourceBadge` instances). All `formatRelativeTime(fetchedAt, referenceTime)` and `getFreshnessTone(fetchedAt, referenceTime)` calls compare against this frozen reference point, not the browser's current time. After 10 minutes of use, every "X min ago" label is 10 min too young, and freshness dots **never turn amber** even as data ages past the 15-minute threshold.

**WHY:** Systemic temporal display bug. The `isStale` flag (server-computed) is accurate, but the visual freshness indicators shown to the user grow less accurate over time in a long-running session.

**HOW TO FIX:** Use `Date.now()` (or a `useNow()` hook ticking every 60 s) as `referenceTime` in client components. `initialNow` is appropriate as an SSR hydration anchor but must not drive freshness rendering in long-lived sessions.

---

## Missing / Misleading States

### [SEVERITY: MED] F4 — TAF `validTo` not checked — expired TAF silently displayed
**File:** `src/components/WeatherDisplay.tsx:120-132`

**WHAT:** `WeatherDisplay` renders TAF forecast groups without checking `taf.validTo` against the current time. A TAF that has expired (past `validTo`) is displayed with no warning or indication it's no longer operationally current. The issued time is shown (`taf.issuedAt`) but not the validity window end.

**WHY:** TAF validity window is typically 24–30 hours. A user hitting the page with a cached/stale TAF past `validTo` sees forecast data that is no longer valid.

**HOW TO FIX:** Add a check: if `Date.now() > new Date(taf.validTo).getTime()`, show an amber "TAF EXPIRED" banner above the forecast groups. Display `Valid {issuedAt} – {validTo}` in the TAF section header.

---

### [SEVERITY: HIGH] F5 — AtisStrip: stuck "Loading ATIS..." forever on fetch failure
**File:** `src/components/AtisStrip.tsx:38-50, 63-73`

**WHAT:** The `fetchAtis` function silently swallows all errors (line 47-49: `// Silent failure — ATIS is supplemental info`). When the initial fetch fails, neither `lastFetch` nor `atisData` is set. The component renders "Loading ATIS..." (line 68-73) indefinitely because `activeEntries.length === 0 && !lastFetch`. There is no timeout, error message, or recovery path.

**WHY:** A network hiccup on load leaves the ATIS strip in permanent loading-limbo. The user has no way to know the fetch failed versus is still in flight.

**HOW TO FIX:** Add an error state: `const [fetchError, setFetchError] = useState(false)`. On catch, `setFetchError(true)` and `setLastFetch(new Date().toISOString())` to exit the loading state. Render a brief "ATIS unavailable" note instead of a permanent spinner.

---

### [SEVERITY: HIGH] F6 — METAR staleness not visually highlighted in WeatherDisplay
**File:** `src/components/WeatherDisplay.tsx:108-118` | `src/components/OperationsConsole.tsx:1344-1346`

**WHAT:** METAR age is not highlighted when the observation is old. The `ResultCard` staleness warning (OperationsConsole line 1345) is set to `source.refresh_interval` (a string like `"20 minutes"`) — not a user-intelligible message. There is no amber ring, age badge, or inline warning inside `WeatherDisplay` for stale observations, unlike ATIS which now has all three.

**WHY:** METARs are among the most operationally critical data. A METAR from 55 min ago is near the 60-min staleness threshold (staleness.ts:6) and should surface prominently. The existing staleness infrastructure exists but the warning message is opaque.

**HOW TO FIX:**
1. Fix staleness warning text: replace `source.refresh_interval` string with `"METAR observation is {ageMinutes} min old — verify against live source."`.
2. Inside `WeatherDisplay`, add an age/STALE indicator next to the "Obs HHMMZ" badge (like the ATIS pattern), driven by computing age from `metar.observedAt`.

---

### [SEVERITY: MED] F7 — OperationsConsole: per-panel fetch failures are silent
**File:** `src/components/OperationsConsole.tsx:1125-1183`

**WHAT:** During facility dashboard auto-load, each data fetch is wrapped in `try/catch` that only clears `loadingPanels` on error — no per-panel error state is set. A failed panel shows the same blank/empty-state message as a genuinely empty result (e.g., "No frequencies returned for the active live query.").

**WHY:** A network failure on NOTAMs or traffic silently looks like "there are no NOTAMs" or "no targets in range" — operationally misleading and potentially dangerous.

**HOW TO FIX:** Add `panelErrors: Map<DashboardResultType, string>` state. On catch, store a per-panel error message. Each panel's render should check `panelErrors.has(cardType)` and render a visible error state rather than an empty-data message.

---

### [SEVERITY: MED] F8 — NOTAM currency: expired/near-expiry NOTAMs not highlighted
**File:** `src/components/NotamList.tsx:25-58`

**WHAT:** `NotamList` displays `expiresAt` for each NOTAM but does not highlight NOTAMs that are expired (past `expiresAt`) or expiring soon (within 1 hour). An expired NOTAM is visually indistinguishable from an active one.

**WHY:** Expired NOTAMs cluttering the active list create operational confusion. Controllers need to know at a glance if a NOTAM is still valid.

**HOW TO FIX:** Add expiry logic: if `expiresAt && new Date(expiresAt) < new Date()` show a "EXPIRED" badge (same visual as ATIS STALE); if expiring within 1 hour show "EXPIRING SOON" in amber. Consider filtering expired NOTAMs by default with a "show expired" toggle.

---

## Accessibility Findings

### [SEVERITY: HIGH] F9 — QueryInput: text field has no accessible label
**File:** `src/components/QueryInput.tsx:260-274`

**WHAT:** The main query `<input>` element has no `<label>` association and no `aria-label` / `aria-labelledby` attribute. Only a `placeholder` attribute is present.

**WHY:** Placeholder text is not a label substitute (WCAG 2.1 SC 1.3.1). For a voice-centric ATC tool, this is particularly problematic.

**HOW TO FIX:** Add `aria-label="ATC query"` to the input. Alternatively, associate it with the existing "Query Console" label text via `aria-labelledby` (give that element an `id`).

---

### [SEVERITY: HIGH] F10 — QueryInput: voice toggle button has no accessible label on mobile
**File:** `src/components/QueryInput.tsx:276-303`

**WHAT:** The voice toggle button has no `aria-label`. The visible text ("Voice" / "Listening...") is inside `<span className="hidden sm:inline">` — invisible on mobile. At narrow viewport the button is icon-only with no accessible name. Screen reader announces only "button".

**WHY:** WCAG 2.4.6 and 4.1.2 require interactive controls to have accessible names.

**HOW TO FIX:** Add `aria-label={isListening ? "Stop voice input" : "Start voice input"}` and `aria-pressed={isListening}` to the button.

---

### [SEVERITY: MED] F11 — TrafficMap: altitude tier is color-only in list cards
**File:** `src/components/TrafficMap.tsx:231`

**WHAT:** Traffic target list cards use a colored dot as the sole altitude tier indicator with no text label or `title`. The altitude value itself is present but the band grouping (<3k / 3–6k / 6–10k / >10k) is communicated only through color.

**WHY:** WCAG 1.4.1 (Use of Color) — information must not be conveyed by color alone. Colorblind users lose the altitude tier signal.

**HOW TO FIX:** Add `title` with band label (e.g., `title="Below 3,000 ft"`) or a screen-reader-only `<span className="sr-only">` with the band text.

---

### [SEVERITY: MED] F12 — TrafficMap: selected-target close button has no aria-label or adequate hit target
**File:** `src/components/TrafficMap.tsx:203-207`

**WHAT:** Close button in the selected-target detail panel renders only `✕` with no `aria-label`. Also missing `min-h-[44px] min-w-[44px]` hit target (unlike the ATIS close button which correctly has it).

**HOW TO FIX:** Add `aria-label="Close target details"` and `className="min-h-[44px] min-w-[44px] ..."`.

---

### [SEVERITY: MED] F13 — AtisStrip: loading state missing aria-live region
**File:** `src/components/AtisStrip.tsx:68-73`

**WHAT:** The "Loading ATIS..." state renders a plain `<span>` with no `role="status"` or `aria-live="polite"`. When ATIS loads and the strip transitions to showing data, screen readers are not notified.

**HOW TO FIX:** Wrap the loading state in `<div role="status" aria-live="polite">`. Add an `aria-live="polite"` region to the outer ATIS container so entry/update is announced.

---

### [SEVERITY: LOW] F14 — FacilitySelector: custom dropdown missing ARIA listbox pattern
**File:** `src/components/FacilitySelector.tsx:94-117`

**WHAT:** Trigger button has `aria-expanded` but is missing `aria-haspopup="listbox"`. The dropdown panel has no `role="listbox"`. Individual facility option buttons have no `role="option"` or `aria-selected`.

**HOW TO FIX:** Add `aria-haspopup="listbox"` to trigger. Add `role="listbox"` to panel. Add `role="option"` + `aria-selected="false"` to each facility button.

---

### [SEVERITY: LOW] F15 — QueryInput: auto-submit via DOM `.click()` — imperative anti-pattern
**File:** `src/components/QueryInput.tsx:95-97`

**WHAT:** After voice recognition completes, auto-submit is triggered by `document.getElementById("atc-query-submit")?.click()`. This bypasses React's synthetic event system, is fragile (breaks if ID changes), and can surprise screen readers with unexpected focus jumps.

**HOW TO FIX:** Use `useRef<HTMLButtonElement>` on the submit button and call `ref.current?.click()` — or better, call `handleSubmit()` directly in the `onEnd` callback after verifying the query state via a ref.

---

### [SEVERITY: LOW] F16 — WeatherDisplay: no semantic heading structure inside panel
**File:** `src/components/WeatherDisplay.tsx:70-134`

**WHAT:** Section labels (Surface Wind, Flight Category, Visibility, Ceiling, Latest METAR, TAF Trend) use `<p className="data-label">` but no `<h3>` / `<h4>` elements or heading roles. Assistive technology users cannot jump between weather sections.

**HOW TO FIX:** Promote primary labels to appropriate heading levels within the `<article>` structure provided by `ResultCard`.

---

## Lint Error Categorization

From `npx eslint src/` — 16 errors, 2 warnings (~18 total). **DO NOT FIX YET** — audit only.

| # | File | Line | Rule | Real Bug? | Notes |
|---|------|------|------|-----------|-------|
| 1 | AtisStrip.tsx | 53 | `react-hooks/set-state-in-effect` | **YES** | fetchAtis() directly in effect body → cascading renders |
| 2 | AtisStrip.tsx | 53 | `no-floating-promises` | **YES** | fetchAtis() promise unhandled |
| 3 | AtisStrip.tsx | 54 | `no-misused-promises` | **YES** | setInterval callback returns Promise |
| 4 | OperationsConsole.tsx | 41 | `no-unused-vars` | Style | Stale `AirportHours` import; low priority |
| 5 | OperationsConsole.tsx | 807 | `set-state-in-effect` | Borderline | localStorage hydration pattern; triggers an extra render cycle |
| 6 | OperationsConsole.tsx | 1052 | `no-floating-promises` | **YES** | fetchAllProcedureTypes() unawaited |
| 7 | OperationsConsole.tsx | 1070 | `set-state-in-effect` | **YES** | 7 setState calls at facility-change effect start → cascading renders, likely causes visible flicker |
| 8 | OperationsConsole.tsx | 1102 | `no-floating-promises` | **YES** | |
| 9 | OperationsConsole.tsx | 1186 | `no-floating-promises` | **YES** | |
| 10 | OperationsConsole.tsx | 1189 | `react-hooks/exhaustive-deps` | **YES** | Missing `selectedFacility` dep; stale closure risk if facility object re-creates without `.id` change |
| 11 | OperationsConsole.tsx | 1303 | `no-floating-promises` | **YES** | |
| 12 | OperationsConsole.tsx | 1323 | `no-floating-promises` | **YES** | |
| 13 | PlateViewer.tsx | 161 | `set-state-in-effect` | **YES** | setState in effect for tab sync → can cause double-render on query change |
| 14 | PlateViewer.tsx | 167 | `react-hooks/exhaustive-deps` | **YES** | Missing `resolveDefaultTab` dep |

**Summary:** 12 real bugs, 1 borderline, 1 style-only.

The `no-floating-promises` cluster (7 errors) directly enables the silent-failure UX issue (F7): unhandled rejections produce no user-visible error. The `set-state-in-effect` pattern (4 errors) contributes to cascading renders that can cause UI flicker or duplicate loading states. Both warrant a dedicated fix pass.

---

## Summary Table

| # | Severity | Component | Type | One-liner |
|---|----------|-----------|------|-----------|
| F1 | **HIGH** | WeatherDisplay / SourceBadge | Fetch-vs-data time | Badge shows API fetch time, not METAR observation time |
| F2 | **HIGH** | FacilityOverview | Fetch-vs-data time (ATIS) | Phase 1 ATIS fix absent — same class bug |
| F3 | **HIGH** | StatusBar / SourceBadge | Temporal display | `referenceTime` frozen at SSR; freshness indicators drift indefinitely |
| F4 | MED | WeatherDisplay | Missing state | Expired TAF rendered without warning |
| F5 | **HIGH** | AtisStrip | Missing state | Fetch failure → stuck "Loading ATIS..." forever |
| F6 | **HIGH** | WeatherDisplay | Stale-data signaling | No METAR age badge / STALE warning for old observations |
| F7 | MED | OperationsConsole | Missing error state | Panel fetch failures silent; look like empty data |
| F8 | MED | NotamList | Stale-data signaling | Expired/near-expiry NOTAMs not highlighted |
| F9 | **HIGH** | QueryInput | Accessibility | Text input has no aria-label / associated label |
| F10 | **HIGH** | QueryInput | Accessibility | Voice button has no accessible label on mobile |
| F11 | MED | TrafficMap | Accessibility | Altitude color-only in list cards (WCAG 1.4.1) |
| F12 | MED | TrafficMap | Accessibility | Close button no aria-label; undersized hit target |
| F13 | MED | AtisStrip | Accessibility | Loading state missing aria-live region |
| F14 | LOW | FacilitySelector | Accessibility | Custom dropdown missing ARIA listbox pattern |
| F15 | LOW | QueryInput | Accessibility | Auto-submit via DOM `.click()` — imperative anti-pattern |
| F16 | LOW | WeatherDisplay | Accessibility | No semantic heading structure in weather panel |
