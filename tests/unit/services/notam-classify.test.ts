import { describe, expect, it } from "vitest";
import { classifyNotam, isNotamActive, isNotamUpcoming } from "@/services/notams";

// ---------------------------------------------------------------------------
// classifyNotam
// ---------------------------------------------------------------------------

describe("classifyNotam — category and isCritical", () => {
  it("classifies a TFR NOTAM as TFR / critical with purpose in summary", () => {
    const result = classifyNotam({ type: "TFR", text: "TEMPORARY FLIGHT RESTRICTION IN EFFECT.", purpose: "VIP MOVEMENT" });
    expect(result.category).toBe("TFR");
    expect(result.isCritical).toBe(true);
    expect(result.summary).toMatch(/VIP MOVEMENT/i);
  });

  it("classifies a TFR NOTAM as TFR / critical even with no purpose", () => {
    const result = classifyNotam({ type: "TFR", text: "TFR ACTIVE 0-FL180." });
    expect(result.category).toBe("TFR");
    expect(result.isCritical).toBe(true);
    expect(result.summary).toBe("TFR");
  });

  it("classifies an airport closure NOTAM", () => {
    const result = classifyNotam({ type: "D", text: "KSEA AD CLSD TO ALL TFC 2206230800-2206231600." });
    expect(result.category).toBe("AIRPORT_CLOSURE");
    expect(result.isCritical).toBe(true);
    expect(result.summary).toBe("AD CLSD");
  });

  it("classifies AERODROME CLOSED variant", () => {
    const result = classifyNotam({ type: "D", text: "AERODROME CLOSED UNTIL FURTHER NOTICE." });
    expect(result.category).toBe("AIRPORT_CLOSURE");
    expect(result.isCritical).toBe(true);
  });

  it("classifies a runway closure NOTAM with designator in summary", () => {
    const result = classifyNotam({ type: "D", text: "KSEA RWY 16C/34C CLSD FOR MAINT." });
    expect(result.category).toBe("RUNWAY_CLOSURE");
    expect(result.isCritical).toBe(true);
    expect(result.summary).toBe("RWY 16C/34C CLSD");
  });

  it("classifies runway closure with CLOSED spelling", () => {
    const result = classifyNotam({ type: "D", text: "RWY 28L CLOSED DUE TO CONSTRUCTION." });
    expect(result.category).toBe("RUNWAY_CLOSURE");
    expect(result.isCritical).toBe(true);
    expect(result.summary).toBe("RWY 28L CLSD");
  });

  it("classifies an FDC NOTAM as FDC / not critical", () => {
    const result = classifyNotam({ type: "FDC", text: "ILS RWY 16L CAT II/III MINIMA AMENDED." });
    expect(result.category).toBe("FDC");
    expect(result.isCritical).toBe(false);
  });

  it("classifies a navaid outage", () => {
    const result = classifyNotam({ type: "D", text: "KBFI VOR/DME U/S FOR MAINT 2206230000-2206240000." });
    expect(result.category).toBe("NAV_OUTAGE");
    expect(result.isCritical).toBe(false);
  });

  it("classifies an ILS OTS NOTAM as NAV_OUTAGE", () => {
    const result = classifyNotam({ type: "D", text: "ILS RWY 34L OTS DUE TO ANTENNA WORK." });
    expect(result.category).toBe("NAV_OUTAGE");
    expect(result.isCritical).toBe(false);
  });

  it("classifies an obstacle NOTAM", () => {
    const result = classifyNotam({ type: "D", text: "OBST CRANE 1254FT MSL (250AGL) LGT." });
    expect(result.category).toBe("OBSTACLE");
    expect(result.isCritical).toBe(false);
  });

  it("classifies an unrecognised D NOTAM as OTHER / not critical", () => {
    const result = classifyNotam({ type: "D", text: "TAXIWAY B LIGHTS U/S EXCEPT NEAR RWY 16C THRESHOLD." });
    expect(result.category).toBe("OTHER");
    expect(result.isCritical).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isNotamActive / isNotamUpcoming
// ---------------------------------------------------------------------------

const T = (offsetMs: number) => new Date(1_700_000_000_000 + offsetMs).toISOString();
const NOW = 1_700_000_000_000;
const HOUR = 3_600_000;

describe("isNotamActive", () => {
  it("returns true when effectiveAt is in the past and no expiresAt", () => {
    expect(isNotamActive({ effectiveAt: T(-HOUR) }, NOW)).toBe(true);
  });

  it("returns true when effectiveAt is in the past and expiresAt is in the future", () => {
    expect(isNotamActive({ effectiveAt: T(-HOUR), expiresAt: T(HOUR) }, NOW)).toBe(true);
  });

  it("returns false when expired (expiresAt in the past)", () => {
    expect(isNotamActive({ effectiveAt: T(-2 * HOUR), expiresAt: T(-HOUR) }, NOW)).toBe(false);
  });

  it("returns false when effectiveAt is in the future (upcoming)", () => {
    expect(isNotamActive({ effectiveAt: T(HOUR) }, NOW)).toBe(false);
  });

  it("fails safe — returns true when effectiveAt is missing/unparseable", () => {
    expect(isNotamActive({ effectiveAt: "NOT-A-DATE" }, NOW)).toBe(true);
    expect(isNotamActive({ effectiveAt: "" }, NOW)).toBe(true);
  });
});

describe("isNotamUpcoming", () => {
  it("returns true when effectiveAt is in the future", () => {
    expect(isNotamUpcoming({ effectiveAt: T(HOUR) }, NOW)).toBe(true);
  });

  it("returns false when effectiveAt is in the past", () => {
    expect(isNotamUpcoming({ effectiveAt: T(-HOUR) }, NOW)).toBe(false);
  });

  it("returns false for malformed effectiveAt (fail-safe: don't surface as upcoming)", () => {
    expect(isNotamUpcoming({ effectiveAt: "GARBAGE" }, NOW)).toBe(false);
  });
});
