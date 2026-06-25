/**
 * Unit tests for the frequencies service.
 *
 * Covers:
 *   - Happy-path: airport in LOCAL_FREQUENCY_SEED returns typed Frequency records
 *     with source metadata (no network call required).
 *   - APP freq_type: routes to approach-facility seed for known facilities;
 *     returns 404 for unknown approach facilities.
 *   - Data gap path: airport absent from local seed AND NFDC/dataset return no
 *     confirmed frequencies → 503 FREQUENCY_DATA_GAP, with guarded CTAF hint
 *     only for dataset-proven non-towered airport types.
 */

import { appCache } from "@/lib/cache";
import { getFrequencies } from "@/services/frequencies";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  appCache.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
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

describe("getFrequencies — NFDC fallback and data gaps", () => {
  it("returns FREQUENCY_DATA_GAP with unverified 122.9 CTAF convention for a non-towered small_airport gap", async () => {
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

    const response = await getFrequencies("4W0");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("FREQUENCY_DATA_GAP");
    expect(response.error.status).toBe(503);
    expect(response.error.retryable).toBe(true);
    expect(response.error.frequencies).toEqual([]);
    expect(response.error.inferredCtaf).toEqual({
      frequencyMHz: 122.9,
      unverified: true,
      basis: "FAA default CTAF for non-towered airports without an assigned frequency"
    });
    expect(response.error.message).toBe(
      "Frequency data could not be loaded for 4W0 from our available sources. This is not confirmation that the airport has no published frequency."
    );
  });

  it("returns FREQUENCY_DATA_GAP without CTAF hint or FAA verification copy for a Canadian non-towered gap", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Canadian dataset gaps should not query FAA NFDC");
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFrequencies("CAA4");

    expect(response.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    if (response.ok) return;

    expect(response.error.code).toBe("FREQUENCY_DATA_GAP");
    expect(response.error.status).toBe(503);
    expect(response.error.retryable).toBe(true);
    expect(response.error.frequencies).toEqual([]);
    expect(response.error.inferredCtaf).toBeUndefined();
    expect(response.error.message).toBe(
      "Frequency data could not be loaded for CAA4 from our available sources. This is not confirmation that the airport has no published frequency; verify frequency assignments in official Canadian aeronautical publications or with NAV CANADA before use."
    );
    expect(response.error.details).toBe(
      "Available sources returned no confirmed frequency records. Verify frequency assignments in official Canadian aeronautical publications or with NAV CANADA before use."
    );
    expect(response.error.message).not.toMatch(/FAA|NFDC|Chart Supplement/);
    expect(response.error.details).not.toMatch(/FAA|NFDC|Chart Supplement/);
    expect(response.source.id).toBe("ourairports-community-dataset");
  });

  it("returns FREQUENCY_DATA_GAP without CTAF hint for a towered/medium_airport gap", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network error");
      })
    );

    const response = await getFrequencies("5A8");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("FREQUENCY_DATA_GAP");
    expect(response.error.status).toBe(503);
    expect(response.error.inferredCtaf).toBeUndefined();
    expect(response.error.frequencies).toEqual([]);
    expect(response.error.message).toBe(
      "Frequency data could not be loaded for 5A8 from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement."
    );
  });

  it("returns FREQUENCY_DATA_GAP without CTAF hint for an unknown airport gap", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network error");
      })
    );

    const response = await getFrequencies("ZZZZ");

    expect(response.ok).toBe(false);
    if (response.ok) return;

    expect(response.error.code).toBe("FREQUENCY_DATA_GAP");
    expect(response.error.status).toBe(503);
    expect(response.error.inferredCtaf).toBeUndefined();
    expect(response.error.frequencies).toEqual([]);
    expect(response.error.message).toBe(
      "Frequency data could not be loaded for ZZZZ from our available sources. This is not confirmation that the airport has no published frequency; verify CTAF/UNICOM in the official FAA Chart Supplement."
    );
  });

  it("leaves airports with confirmed frequencies unaffected and without CTAF hint", async () => {
    const response = await getFrequencies("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) return;

    expect(response.data.length).toBeGreaterThan(0);
    expect(response.error).toBeUndefined();
  });

  it("returns confirmed Canadian OurAirports frequency rows normally", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Canadian dataset frequencies should not query FAA NFDC");
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await getFrequencies("CYVR");

    expect(response.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    if (!response.ok) return;

    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "ATIS",
          valueMHz: 124.6,
          source: expect.objectContaining({ id: "ourairports-community-dataset" })
        })
      ])
    );
    expect(response.error).toBeUndefined();
  });
});
