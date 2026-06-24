/**
 * Unit tests for D-ATIS issuance-time parsing and staleness logic.
 *
 * Contract under test (src/services/datis.ts):
 *   - export function parseAtisIssuanceTime(datis: string, nowMs?: number): string | null
 *       Returns an ISO 8601 UTC timestamp derived from the HHMM Z token in the ATIS
 *       text, handling day-rollover (HHMM > 5 min in the future → previous UTC day).
 *       Returns null when no HHMMZ token is present.
 *       nowMs defaults to Date.now(); pass an explicit value for deterministic tests.
 *   - export const ATIS_STALE_THRESHOLD_MIN: number   (= 75)
 *   - AtisInfo.stale = ageMinutes > ATIS_STALE_THRESHOLD_MIN
 *
 * NOTE: parseAtisIssuanceTime accepts an optional nowMs param, so tests can pass
 * an explicit epoch value instead of relying solely on fake timers.
 */

import { ATIS_STALE_THRESHOLD_MIN, parseAtisIssuanceTime } from "@/services/datis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Anchor: 2026-06-23 21:00:00 UTC (mid-evening, well within one day) */
const ANCHOR_UTC = "2026-06-23T21:00:00.000Z";

function setFakeNow(isoString: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoString));
}

// ---------------------------------------------------------------------------
// parseAtisIssuanceTime — time-token extraction
// ---------------------------------------------------------------------------

describe("parseAtisIssuanceTime — time-token extraction", () => {
  beforeEach(() => setFakeNow(ANCHOR_UTC));
  afterEach(() => vi.useRealTimers());

  it("parses a standard combined-ATIS INFO letter + HHMMZ token", () => {
    const text =
      "KSEA SEATTLE-TACOMA INTL ATIS INFO J 1853Z. WIND 170 AT 6. VIS 10. SKY CLR. TEMP 18. DEW 10. ALTM 3012.";
    const result = parseAtisIssuanceTime(text);
    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-23T18:53:00.000Z");
  });

  it("parses an ARRIVAL (ARR) ATIS variant with a HHMMZ token", () => {
    const text =
      "KSEA ARRIVAL INFORMATION K 2015Z. EXPECT ILS RWY 16R. WIND 190 AT 8. ALTM 2998.";
    const result = parseAtisIssuanceTime(text);
    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-23T20:15:00.000Z");
  });

  it("parses a DEPARTURE (DEP) ATIS variant with a HHMMZ token", () => {
    const text =
      "KSEA DEPARTURE INFORMATION L 2042Z. DEPARTING RWY 16L/16C. WIND 160 AT 5. ALTM 2999.";
    const result = parseAtisIssuanceTime(text);
    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-23T20:42:00.000Z");
  });

  it("returns null when no HHMMZ token is present", () => {
    expect(parseAtisIssuanceTime("ATIS INFO J — NO TIME GIVEN.")).toBeNull();
    expect(parseAtisIssuanceTime("")).toBeNull();
    expect(parseAtisIssuanceTime("SOME RANDOM TEXT WITHOUT A ZULU TIME")).toBeNull();
  });

  it("does not treat a 4-digit non-time number as a time token (no Z suffix)", () => {
    // "1853" without Z should NOT match the /\b(\d{2})(\d{2})Z\b/ regex
    const textWithoutZ = "KSEA ATIS INFO J 1853. WIND 170 AT 6.";
    expect(parseAtisIssuanceTime(textWithoutZ)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseAtisIssuanceTime — 00Z day-rollover edge case
// ---------------------------------------------------------------------------

describe("parseAtisIssuanceTime — 00Z day-rollover", () => {
  afterEach(() => vi.useRealTimers());

  it("rolls an HHMM > 5 min in the future back to the previous UTC day", () => {
    // Scenario: clock just ticked past midnight to 00:30Z June 23.
    // The ATIS still says 0045Z — that's 15 min in the future on this calendar day.
    // The parser must attribute it to June 22 (the previous UTC day).
    setFakeNow("2026-06-23T00:30:00.000Z");

    const text = "KJFK ATIS INFO M 0045Z. WIND 280 AT 12. VIS 10. CLR. ALTM 3002.";
    const result = parseAtisIssuanceTime(text);

    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-22T00:45:00.000Z");
  });

  it("does NOT roll back when HHMM is within 5 minutes of now (clock-skew tolerance)", () => {
    // now = 00:30Z; ATIS = 0033Z — only 3 min in the future → within skew window → same day
    setFakeNow("2026-06-23T00:30:00.000Z");

    const text = "KBFI ATIS INFO A 0033Z. WIND 140 AT 6.";
    const result = parseAtisIssuanceTime(text);

    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-23T00:33:00.000Z");
  });

  it("handles the boundary exactly at 5 minutes ahead (not > 5 min, no rollback)", () => {
    // now = 00:30:00Z; ATIS = 0035Z → exactly 5 min ahead → NOT > 5 min → same day
    setFakeNow("2026-06-23T00:30:00.000Z");

    const text = "KBFI ATIS INFO B 0035Z. WIND 140 AT 6.";
    const result = parseAtisIssuanceTime(text);

    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-23T00:35:00.000Z");
  });

  it("rolls back an ATIS just after midnight when the clock was recently before midnight", () => {
    // More realistic scenario: now = 00:05Z June 23; ATIS = 2353Z (issued ~12 min ago, prev day).
    // candidate = June 23 23:53Z, which is ~23h48m in the future → roll back to June 22.
    setFakeNow("2026-06-23T00:05:00.000Z");

    const text = "KSEA ATIS INFO Z 2353Z. WIND 090 AT 4.";
    const result = parseAtisIssuanceTime(text);

    expect(result).not.toBeNull();
    expect(new Date(result!).toISOString()).toBe("2026-06-22T23:53:00.000Z");
  });
});

// ---------------------------------------------------------------------------
// ATIS staleness boundary
// ---------------------------------------------------------------------------

describe("ATIS staleness boundary (ATIS_STALE_THRESHOLD_MIN = 75)", () => {
  afterEach(() => vi.useRealTimers());

  it("exports ATIS_STALE_THRESHOLD_MIN as 75", () => {
    expect(ATIS_STALE_THRESHOLD_MIN).toBe(75);
  });

  it("flags an ATIS issued exactly 75 minutes ago as NOT stale (boundary is exclusive)", () => {
    // now = 21:00Z; ATIS = 19:45Z → exactly 75 min → not stale
    setFakeNow("2026-06-23T21:00:00.000Z");

    const text = "KSEA ATIS INFO G 1945Z. WIND 160 AT 5.";
    const issuedAt = parseAtisIssuanceTime(text)!;
    expect(issuedAt).not.toBeNull();

    const ageMinutes = Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000);
    const stale = ageMinutes > ATIS_STALE_THRESHOLD_MIN;

    expect(ageMinutes).toBe(75);
    expect(stale).toBe(false);
  });

  it("flags an ATIS issued 76 minutes ago as stale", () => {
    // now = 21:00Z; ATIS = 19:44Z → 76 min → stale
    setFakeNow("2026-06-23T21:00:00.000Z");

    const text = "KSEA ATIS INFO F 1944Z. WIND 170 AT 7.";
    const issuedAt = parseAtisIssuanceTime(text)!;
    expect(issuedAt).not.toBeNull();

    const ageMinutes = Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000);
    const stale = ageMinutes > ATIS_STALE_THRESHOLD_MIN;

    expect(ageMinutes).toBe(76);
    expect(stale).toBe(true);
  });

  it("flags an ATIS issued 60 minutes ago as NOT stale", () => {
    // now = 21:00Z; ATIS = 20:00Z → 60 min → not stale
    setFakeNow("2026-06-23T21:00:00.000Z");

    const text = "KSEA ATIS INFO H 2000Z. WIND 160 AT 4.";
    const issuedAt = parseAtisIssuanceTime(text)!;
    expect(issuedAt).not.toBeNull();

    const ageMinutes = Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000);
    const stale = ageMinutes > ATIS_STALE_THRESHOLD_MIN;

    expect(ageMinutes).toBe(60);
    expect(stale).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AtisInfo contract shape (documents the agreed API response fields)
// ---------------------------------------------------------------------------

describe("AtisInfo contract — issuedAt/ageMinutes/stale field types", () => {
  it("issuedAt is an ISO string or null (validated via parseAtisIssuanceTime)", () => {
    setFakeNow(ANCHOR_UTC);

    const withTime = parseAtisIssuanceTime("KSEA ATIS INFO J 1853Z.");
    const withoutTime = parseAtisIssuanceTime("KSEA ATIS INFO J — NO TIME.");

    expect(withTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(withoutTime).toBeNull();

    vi.useRealTimers();
  });

  it("ageMinutes is a non-negative integer when issuedAt is not null", () => {
    setFakeNow(ANCHOR_UTC);

    const issuedAt = parseAtisIssuanceTime("KSEA ATIS INFO J 1853Z.")!;
    const ageMinutes = Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000);

    expect(ageMinutes).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(ageMinutes)).toBe(true);

    vi.useRealTimers();
  });
});
