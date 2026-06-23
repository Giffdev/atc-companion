import { appCache } from "@/lib/cache";
import * as utils from "@/lib/utils";
import { getTraffic } from "@/services/traffic";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

describe("traffic service", () => {
  beforeEach(() => {
    appCache.clear();
  });

  it("parses OpenSky state vectors into typed traffic targets", async () => {
    installAviationApiMock();

    const response = await getTraffic({ airport: "KBFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          icao24: "a4b294",
          callsign: "ASA123",
          groundspeedKnots: expect.any(Number),
          altitudeFeet: expect.any(Number)
        })
      ])
    );
  });

  it("returns 400 when neither airport nor bounds are provided", async () => {
    installAviationApiMock();

    await expect(getTraffic({})).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "MISSING_REQUIRED_PARAMETER", status: 400 })
    });
  });

  it("maps upstream 404, 500, and timeout failures into explicit error codes", async () => {
    // 404 from ADSB.fi (primary) — non-retryable, T2c guard surfaces it directly without OpenSky fallback
    installAviationApiMock({
      "adsb-fi": new Response("not found", { status: 404 })
    });

    await expect(getTraffic({ airport: "KBFI" })).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_NOT_FOUND", status: 404 })
    });

    // 500 from ADSB.fi — retryable, falls through to OpenSky; OpenSky also 500s
    installAviationApiMock({
      "adsb-fi": new Response("server down", { status: 500 }),
      opensky: new Response("server down", { status: 500 })
    });

    await expect(getTraffic({ airport: "KBFI" })).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_SERVER_ERROR", status: 500 })
    });

    const timeoutFn = (() => {
      const error = new Error("timed out");
      error.name = "AbortError";
      throw error;
    }) as () => Response;

    // Timeout from ADSB.fi — retryable, falls through to OpenSky; OpenSky also times out
    installAviationApiMock({
      "adsb-fi": timeoutFn,
      opensky: timeoutFn
    });

    await expect(getTraffic({ airport: "KBFI" })).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_TIMEOUT", status: 504 })
    });
  });

  it("uses cache metadata to avoid refetching unchanged traffic searches", async () => {
    const fetchMock = installAviationApiMock();

    const first = await getTraffic({ airport: "KBFI" });
    const second = await getTraffic({ airport: "KBFI" });

    expect(first.cache?.status).toBe("miss");
    expect(second.cache?.status).toBe("hit");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("bypasses cache when explicitly requested", async () => {
    const fetchMock = installAviationApiMock();

    const first = await getTraffic({ airport: "KBFI" });
    const second = await getTraffic({ airport: "KBFI", bypassCache: true });

    expect(first.cache?.status).toBe("miss");
    expect(second.cache?.status).toBe("bypass");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("flags stale ADS-B results once the freshness window is exceeded", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T05:00:45.000Z"));
    vi.spyOn(utils, "toIsoNow").mockReturnValue("2026-06-18T05:00:00.000Z");
    installAviationApiMock();

    const response = await getTraffic({ airport: "KBFI" });

    expect(response.isStale).toBe(true);
    vi.useRealTimers();
  });
});
