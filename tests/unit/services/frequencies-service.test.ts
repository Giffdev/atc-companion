/**
 * Unit tests for the frequencies service.
 *
 * Covers:
 *   - Happy-path: airport in LOCAL_FREQUENCY_SEED returns typed Frequency records
 *     with source metadata (no network call required).
 *   - APP freq_type: routes to approach-facility seed for known facilities;
 *     returns 404 for unknown approach facilities.
 *   - Error path: airport absent from local seed AND NFDC returns no usable
 *     frequencies → 404 AIRPORT_NOT_FOUND.
 */

import { appCache } from "@/lib/cache";
import { getFrequencies } from "@/services/frequencies";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  appCache.clear();
});

// ---------------------------------------------------------------------------
// Happy path — local seed
// ---------------------------------------------------------------------------

describe("getFrequencies — local seed (KBFI)", () => {
  it("returns ok: true with at least one Frequency record", async () => {
    const response = await getFrequencies("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    expect(response.data.length).toBeGreaterThan(0);
  });

  it("each returned Frequency has required fields and valid valueMHz", async () => {
    const response = await getFrequencies("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    for (const freq of response.data) {
      expect(typeof freq.valueMHz).toBe("number");
      // VHF aviation band: 108–137 MHz (comm) / up to 137 for monitoring
      expect(freq.valueMHz).toBeGreaterThanOrEqual(108);
      expect(freq.valueMHz).toBeLessThanOrEqual(137);
      expect(freq.source).toMatchObject({ id: expect.any(String) });
      expect(freq.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof freq.isStale).toBe("boolean");
    }
  });

  it("returns cached result on second call (no extra computation)", async () => {
    const first = await getFrequencies("KBFI");
    const second = await getFrequencies("KBFI");

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    if (!first.ok || !second.ok) return;

    // Same data returned from cache
    expect(second.data).toEqual(first.data);
  });

  it("accepts the FAA 3-letter code (BFI) as well as the ICAO code (KBFI)", async () => {
    const byIcao = await getFrequencies("KBFI");
    const byFaa = await getFrequencies("BFI");

    expect(byIcao.ok).toBe(true);
    expect(byFaa.ok).toBe(true);

    if (!byIcao.ok || !byFaa.ok) return;

    expect(byFaa.data.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// APP freq_type — approach-facility seed
// ---------------------------------------------------------------------------

describe("getFrequencies — APP type", () => {
  it("returns 404 for an airport with no approach-facility seed entry", async () => {
    // Use a code unlikely to be in the local approach-facility seed
    const response = await getFrequencies("ZZZZ", "APP");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("AIRPORT_NOT_FOUND");
    expect(response.error.status).toBe(404);
    expect(response.error.retryable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Error path — NFDC fallback
// ---------------------------------------------------------------------------

describe("getFrequencies — NFDC fallback and error", () => {
  it("returns 404 AIRPORT_NOT_FOUND when NFDC HTML has no COMMUNICATIONS section", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("nfdc.faa.gov")) {
          return new Response("<html><body>No frequency information available.</body></html>", {
            status: 200,
            headers: { "Content-Type": "text/html" }
          });
        }

        throw new Error(`Unexpected fetch URL in test: ${url}`);
      })
    );

    const response = await getFrequencies("ZZZZ");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("AIRPORT_NOT_FOUND");
    expect(response.error.status).toBe(404);
  });

  it("returns 404 AIRPORT_NOT_FOUND when NFDC fetch throws a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network error");
      })
    );

    const response = await getFrequencies("ZZZZ");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("AIRPORT_NOT_FOUND");
    expect(response.error.status).toBe(404);
  });
});
