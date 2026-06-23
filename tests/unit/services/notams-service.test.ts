/**
 * Unit tests for the getNotams service pipeline.
 *
 * Covers:
 *   - getNotams returns NOTAMs carrying the new classification fields
 *     (category / isCritical / summary) applied at parse time.
 *   - Edge cases for mixed active + upcoming + expired filtering via
 *     isNotamActive / isNotamUpcoming helpers.
 *
 * NOTE: classifyNotam, isNotamActive, and isNotamUpcoming are already
 * exercised as pure functions in tests/unit/services/notam-classify.test.ts
 * (19 tests from Aaron).  This file adds wiring coverage — i.e., that the
 * fields actually make it through the full getNotams pipeline.
 */

import { appCache } from "@/lib/cache";
import { getNotams, isNotamActive, isNotamUpcoming } from "@/services/notams";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

// ---------------------------------------------------------------------------
// getNotams — classification field wiring
// ---------------------------------------------------------------------------

describe("getNotams — classification fields wiring", () => {
  beforeEach(() => {
    appCache.clear();
  });

  it("returns NOTAMs with category / isCritical fields populated by classifyNotam", async () => {
    installAviationApiMock();

    const response = await getNotams({ airport: "KBFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    expect(response.data.length).toBeGreaterThan(0);
    const notam = response.data[0];

    // Classification fields must be present and typed correctly
    expect(notam).toHaveProperty("category");
    expect(notam).toHaveProperty("isCritical");
    expect(typeof notam.isCritical).toBe("boolean");

    // The default fixture has "TWY C CLSD BTN C3 AND C6." — no runway/AD/nav pattern
    expect(notam.category).toBe("OTHER");
    expect(notam.isCritical).toBe(false);
  });

  it("classifies a runway-closure NOTAM that comes through the full pipeline", async () => {
    installAviationApiMock({
      notams: new Response(
        JSON.stringify({
          items: [
            {
              notamNumber: "BFI 06/099",
              icaoId: "KBFI",
              notamClass: "D",
              effectiveDate: "2026-06-18T00:00:00Z",
              endDate: "2026-06-20T00:00:00Z",
              text: "RWY 14R/32L CLSD FOR MAINTENANCE."
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    });

    const response = await getNotams({ airport: "KBFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    const rwy = response.data[0];
    expect(rwy.category).toBe("RUNWAY_CLOSURE");
    expect(rwy.isCritical).toBe(true);
    expect(rwy.summary).toBe("RWY 14R/32L CLSD");
  });

  it("classifies a TFR NOTAM with purpose through the pipeline", async () => {
    installAviationApiMock({
      notams: new Response(
        JSON.stringify({
          items: [
            {
              notamNumber: "TFR 1/2345",
              icaoId: "KSEA",
              notamClass: "TFR",
              purpose: "VIP MOVEMENT",
              effectiveDate: "2026-06-18T00:00:00Z",
              text: "TEMPORARY FLIGHT RESTRICTION IN EFFECT FOR VIP MOVEMENT."
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    });

    const response = await getNotams({ airport: "KSEA" });

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    const tfr = response.data[0];
    expect(tfr.category).toBe("TFR");
    expect(tfr.isCritical).toBe(true);
    expect(tfr.summary).toMatch(/VIP MOVEMENT/i);
  });

  it("applies type_filter via client-side filtering in the AviationAPI fallback path", async () => {
    // The AviationAPI fallback path (no FAA API key) applies the type filter
    // client-side: items.filter((item) => item.type === typeFilter).
    // Do NOT call installAviationApiMock here — that sets FAA_NOTAM_API_KEY
    // which routes to the FAA API key path that delegates filtering to the
    // upstream query param instead.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("api.aviationapi.com")) {
          return new Response(
            JSON.stringify([
              {
                notamNumber: "BFI 06/001",
                icaoId: "KBFI",
                notamClass: "D",
                effectiveDate: "2026-06-18T00:00:00Z",
                text: "TAXIWAY B LIGHTS U/S."
              },
              {
                notamNumber: "FDC 6/001",
                icaoId: "KBFI",
                notamClass: "FDC",
                effectiveDate: "2026-06-18T00:00:00Z",
                text: "ILS RWY 14R MINIMA AMENDED."
              }
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        throw new Error(`Unexpected fetch URL in test: ${url}`);
      })
    );

    const response = await getNotams({ airport: "KBFI", type_filter: "FDC" });

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    expect(response.data).toHaveLength(1);
    expect(response.data[0].type).toBe("FDC");
    expect(response.data[0].category).toBe("FDC");
    expect(response.data[0].isCritical).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mixed active / upcoming / expired NOTAM filtering
//
// Aaron's test file covers isNotamActive + isNotamUpcoming as pure functions
// (10 tests).  The cases below assert the *filtering composition* — that a
// consumer can derive the correct visible set from a mixed bag of NOTAMs.
// ---------------------------------------------------------------------------

const T = (offsetMs: number) => new Date(1_700_000_000_000 + offsetMs).toISOString();
const NOW = 1_700_000_000_000;
const HOUR = 3_600_000;

const MIXED_NOTAMS = [
  { effectiveAt: T(-2 * HOUR), expiresAt: T(HOUR), label: "active" },
  { effectiveAt: T(HOUR), label: "upcoming" },
  { effectiveAt: T(-2 * HOUR), expiresAt: T(-HOUR), label: "expired" },
  { effectiveAt: T(-3 * HOUR), label: "active-no-expiry" }
] as const;

describe("mixed active / upcoming / expired NOTAM filtering", () => {
  it("isNotamActive accepts active, rejects upcoming and expired", () => {
    expect(isNotamActive(MIXED_NOTAMS[0], NOW)).toBe(true);
    expect(isNotamActive(MIXED_NOTAMS[1], NOW)).toBe(false); // upcoming
    expect(isNotamActive(MIXED_NOTAMS[2], NOW)).toBe(false); // expired
    expect(isNotamActive(MIXED_NOTAMS[3], NOW)).toBe(true); // active, no expiry
  });

  it("isNotamUpcoming accepts upcoming, rejects active and expired", () => {
    expect(isNotamUpcoming(MIXED_NOTAMS[0], NOW)).toBe(false); // already active
    expect(isNotamUpcoming(MIXED_NOTAMS[1], NOW)).toBe(true);
    expect(isNotamUpcoming(MIXED_NOTAMS[2], NOW)).toBe(false); // expired
    expect(isNotamUpcoming(MIXED_NOTAMS[3], NOW)).toBe(false); // already active
  });

  it("filtering to active-or-upcoming drops only expired entries", () => {
    const visible = MIXED_NOTAMS.filter(
      (n) => isNotamActive(n, NOW) || isNotamUpcoming(n, NOW)
    );

    expect(visible).toHaveLength(3); // active, upcoming, active-no-expiry
    expect(visible.some((n) => n.label === "expired")).toBe(false);
    expect(visible.some((n) => n.label === "active")).toBe(true);
    expect(visible.some((n) => n.label === "upcoming")).toBe(true);
    expect(visible.some((n) => n.label === "active-no-expiry")).toBe(true);
  });

  it("filtering to only active gives the active set without upcoming", () => {
    const activeOnly = MIXED_NOTAMS.filter((n) => isNotamActive(n, NOW));

    expect(activeOnly.some((n) => n.label === "active")).toBe(true);
    expect(activeOnly.some((n) => n.label === "active-no-expiry")).toBe(true);
    expect(activeOnly.some((n) => n.label === "upcoming")).toBe(false);
    expect(activeOnly.some((n) => n.label === "expired")).toBe(false);
  });

  it("a NOTAM active-or-upcoming is never also expired", () => {
    for (const notam of MIXED_NOTAMS) {
      const active = isNotamActive(notam, NOW);
      const upcoming = isNotamUpcoming(notam, NOW);
      const expired =
        !isNotamActive(notam, NOW) && !isNotamUpcoming(notam, NOW) && notam.effectiveAt < new Date(NOW).toISOString();

      // active and upcoming are mutually exclusive
      expect(active && upcoming).toBe(false);
      // if expired it is neither active nor upcoming
      if (expired) {
        expect(active).toBe(false);
        expect(upcoming).toBe(false);
      }
    }
  });
});
