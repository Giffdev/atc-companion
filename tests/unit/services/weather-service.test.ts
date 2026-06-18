import { appCache } from "@/lib/cache";
import * as utils from "@/lib/utils";
import { getMetar, getTaf, getWeather } from "@/services/weather";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_METAR_PAYLOAD, installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

describe("weather service", () => {
  beforeEach(() => {
    appCache.clear();
  });

  it("parses realistic Aviation Weather payloads into typed METAR and TAF objects", async () => {
    installAviationApiMock();

    const [metarResponse, tafResponse] = await Promise.all([getMetar("KBFI"), getTaf("KBFI")]);

    expect(metarResponse.ok).toBe(true);
    expect(tafResponse.ok).toBe(true);

    if (!metarResponse.ok || !tafResponse.ok) {
      return;
    }

    expect(metarResponse.data).toMatchObject({
      stationIcao: "KBFI",
      rawText: SAMPLE_METAR_PAYLOAD[0].rawOb,
      flightCategory: "VFR",
      wind: expect.objectContaining({ directionDegrees: 140, speedKnots: 6 })
    });
    expect(tafResponse.data.forecastGroups[0]).toMatchObject({
      groupType: "INITIAL",
      wind: expect.objectContaining({ directionDegrees: 140, speedKnots: 7 })
    });
  });

  it("builds a weather bundle with supporting sources", async () => {
    installAviationApiMock();

    const response = await getWeather("BFI");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data.stationIcao).toBe("KBFI");
    expect(response.data.metar?.stationIcao).toBe("KBFI");
    expect(response.data.taf?.stationIcao).toBe("KBFI");
    expect(response.data.pireps).toHaveLength(1);
    expect(response.attribution.supporting?.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a 404 error when the upstream METAR feed has no data for a station", async () => {
    installAviationApiMock({
      metar: new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
    });

    await expect(getMetar("KPWK")).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "METAR_NOT_FOUND", status: 404 })
    });
  });

  it("maps upstream 500 and timeout failures into safe error envelopes", async () => {
    installAviationApiMock({
      taf: new Response("server down", { status: 500 }),
      metar: (() => {
        const error = new Error("timed out");
        error.name = "AbortError";
        throw error;
      }) as () => Response
    });

    const [serverError, timeoutError] = await Promise.all([getTaf("KBFI"), getMetar("KBFI")]);

    expect(serverError).toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_SERVER_ERROR", status: 500 })
    });
    expect(timeoutError).toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_TIMEOUT", status: 504 })
    });
  });

  it("uses cache metadata to avoid repeat upstream fetches for the same station", async () => {
    const fetchMock = installAviationApiMock();

    const first = await getMetar("KBFI");
    const second = await getMetar("KBFI");

    expect(first.cache?.status).toBe("miss");
    expect(second.cache?.status).toBe("hit");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("flags stale weather responses when fetchedAt falls outside the freshness window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-18T08:00:00.000Z"));
    vi.spyOn(utils, "toIsoNow").mockReturnValue("2026-06-18T05:00:00.000Z");
    installAviationApiMock();

    const response = await getMetar("KBFI");

    expect(response.isStale).toBe(true);
    expect(response.stalenessWarning).toContain("older than");
    vi.useRealTimers();
  });
});
