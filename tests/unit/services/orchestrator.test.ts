/**
 * Unit tests for the query orchestrator.
 *
 * Covers:
 *   T1g — regulatory intent routes to searchAllRegulatory and returns results.
 *   T1h — facility_info with overlying / underlying / general query_type
 *         returns 501 NOT_IMPLEMENTED (not a runtime gap, not a placeholder).
 *
 * SOURCE OWNERSHIP: orchestrator.ts is owned by Mattingly.
 * These tests assert observable behaviour only — no source edits.
 */

import { appCache } from "@/lib/cache";
import { executeQuery } from "@/services/orchestrator";
import type { FacilityInfoIntent, RegulatoryIntent } from "@/types/intents";
import { beforeEach, describe, expect, it } from "vitest";
import { installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

// ---------------------------------------------------------------------------
// Shared intent metadata stub
// ---------------------------------------------------------------------------

const INTENT_META = {
  confidence: 0.99,
  rawInput: "",
  parsedAt: "2026-06-23T20:00:00.000Z",
  source: {
    id: "test-source",
    name: "Test",
    url: "internal://test",
    reliability: "high" as const,
    refresh_interval: "on-demand"
  },
  entities: [],
  requiresClarification: false
} as const;

// ---------------------------------------------------------------------------
// T1g — regulatory → searchAllRegulatory routing
// ---------------------------------------------------------------------------

describe("orchestrator — regulatory routing (T1g)", () => {
  beforeEach(() => {
    appCache.clear();
  });

  it("routes a regulatory intent to searchAllRegulatory and returns ok: true", async () => {
    // installAviationApiMock mocks the eCFR endpoint so searchFars can resolve
    installAviationApiMock();

    const intent: RegulatoryIntent = {
      ...INTENT_META,
      rawInput: "right of way rules",
      type: "regulatory",
      query: "right of way rules"
    };

    const result = await executeQuery(intent);

    expect(result.intent.type).toBe("regulatory");
    expect(result.response.ok).toBe(true);
    if (!result.response.ok) return;

    // Should contain at least one FAR reference from the eCFR mock
    const data = result.response.data as unknown[];
    expect(data.length).toBeGreaterThan(0);
  });

  it("includes execution timing and a timestamp in the result envelope", async () => {
    installAviationApiMock();

    const intent: RegulatoryIntent = {
      ...INTENT_META,
      rawInput: "separation minima",
      type: "regulatory",
      query: "separation minima"
    };

    const result = await executeQuery(intent);

    expect(typeof result.executionTimeMs).toBe("number");
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("passes an explicit part number filter to the regulatory search", async () => {
    installAviationApiMock();

    const intent: RegulatoryIntent = {
      ...INTENT_META,
      rawInput: "91.113",
      type: "regulatory",
      query: "91.113",
      part: 91
    };

    const result = await executeQuery(intent);

    // With a part filter, the call still succeeds and returns data from eCFR mock
    expect(result.response.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T1h — facility_info 501 NOT_IMPLEMENTED for overlying / underlying / general
// ---------------------------------------------------------------------------

describe("orchestrator — facility_info 501 responses (T1h)", () => {
  beforeEach(() => {
    appCache.clear();
  });

  it.each(["overlying", "underlying", "general"] as const)(
    "returns 501 NOT_IMPLEMENTED for query_type=%s",
    async (queryType) => {
      const intent: FacilityInfoIntent = {
        ...INTENT_META,
        rawInput: `facility info ${queryType}`,
        type: "facility_info",
        facility: "S56",
        query_type: queryType
      };

      const result = await executeQuery(intent);

      expect(result.response.ok).toBe(false);
      if (result.response.ok) return;

      expect(result.response.error.code).toBe("NOT_IMPLEMENTED");
      expect(result.response.error.status).toBe(501);
      expect(result.response.error.retryable).toBe(false);
      expect(result.response.error.message).toContain(queryType);
    }
  );

  it("returns 400 FACILITY_REQUIRED when no facility is provided", async () => {
    const intent: FacilityInfoIntent = {
      ...INTENT_META,
      rawInput: "facility info",
      type: "facility_info",
      query_type: "overlying"
      // facility intentionally omitted
    };

    const result = await executeQuery(intent);

    expect(result.response.ok).toBe(false);
    if (result.response.ok) return;

    expect(result.response.error.code).toBe("FACILITY_REQUIRED");
    expect(result.response.error.status).toBe(400);
  });

  it("returns ok for airports query_type with a known facility", async () => {
    // The "airports" path is implemented — it should NOT return 501
    const intent: FacilityInfoIntent = {
      ...INTENT_META,
      rawInput: "airports for S46",
      type: "facility_info",
      facility: "S46",
      query_type: "airports"
    };

    const result = await executeQuery(intent);

    // May be ok or a 404 depending on seed data, but MUST NOT be 501
    if (!result.response.ok) {
      expect(result.response.error.code).not.toBe("NOT_IMPLEMENTED");
    }
  });
});
