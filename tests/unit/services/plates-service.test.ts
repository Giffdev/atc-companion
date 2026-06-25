import { appCache } from "@/lib/cache";
import * as utils from "@/lib/utils";
import { getAirportDiagram, getOdps, getPlates, getSids, getStars } from "@/services/plates";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_DTPP_XML, installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

describe("plates service", () => {
  beforeEach(() => {
    appCache.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses FAA DTPP XML into typed approach plates", async () => {
    installAviationApiMock();

    const response = await getPlates({ airport: "BFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ airportIcao: "KBFI", procedureType: "ILS", runway: "14R" }),
        expect.objectContaining({ airportIcao: "KBFI", procedureType: "RNAV", runway: "32L" })
      ])
    );
    expect(response.data[0].chartUrl).toContain("/2607/");
  });

  it("supports filtering plates by approach type", async () => {
    installAviationApiMock();

    const response = await getPlates({ airport: "KBFI", type: "RNAV" });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({ procedureType: "RNAV", runway: "32L" });
  });

  it("returns the airport diagram when an APD chart exists", async () => {
    installAviationApiMock();

    const response = await getAirportDiagram("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toMatchObject({
      airportIcao: "KBFI",
      procedureName: "AIRPORT DIAGRAM",
      chartUrl: expect.stringContaining("BFI_APD.PDF")
    });
  });

  it("returns Canadian jurisdiction gaps for CYYJ procedures without querying FAA DTPP", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Canadian procedure gaps should not query FAA DTPP");
    });
    vi.stubGlobal("fetch", fetchMock);

    const responses = await Promise.all([
      getPlates({ airport: "CYYJ" }),
      getSids("CYYJ"),
      getStars("CYYJ"),
      getOdps("CYYJ"),
      getAirportDiagram("CYYJ")
    ]);

    expect(fetchMock).not.toHaveBeenCalled();
    for (const response of responses) {
      expect(response.ok).toBe(false);
      if (response.ok) continue;

      expect(response.error).toMatchObject({
        code: "PLATES_DATA_GAP",
        status: 503,
        retryable: true
      });
      expect(response.source.id).toBe("ourairports-community-dataset");
      expect(response.error.message).toContain("CYYJ");
      expect(response.error.message).toContain("NAV CANADA");
      expect(response.error.message).toContain("Canada Air Pilot (CAP)");
      expect(response.error.message).not.toMatch(/No .*available|no procedures|AIRPORT_NOT_FOUND|122\.9|Chart Supplement/i);
      expect(response.error.details).not.toMatch(/No .*available|no procedures|AIRPORT_NOT_FOUND|122\.9|Chart Supplement/i);
    }
  });

  it("returns a 404 envelope when the requested airport is absent from the current cycle XML", async () => {
    installAviationApiMock({
      dtpp: new Response(SAMPLE_DTPP_XML.replace(/apt_ident="BFI"[\s\S]*?<\/airport_name>/, ""), {
        status: 200,
        headers: { "Content-Type": "application/xml" }
      })
    });

    await expect(getPlates({ airport: "KBFI" })).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "AIRPORT_NOT_FOUND", status: 404 })
    });
  });

  it("maps upstream 500 and timeout failures into safe error responses", async () => {
    installAviationApiMock({
      dtpp: (() => new Response("upstream failure", { status: 500 })) as () => Response
    });

    const serverError = await getPlates({ airport: "KBFI" });

    expect(serverError).toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_SERVER_ERROR", status: 500 })
    });

    installAviationApiMock({
      dtpp: (() => {
        const error = new Error("timed out");
        error.name = "AbortError";
        throw error;
      }) as () => Response
    });

    await expect(getPlates({ airport: "KBFI" })).resolves.toMatchObject({
      ok: false,
      error: expect.objectContaining({ code: "UPSTREAM_TIMEOUT", status: 504 })
    });
  });

  it("reuses the cached DTPP XML between identical requests", async () => {
    const fetchMock = installAviationApiMock();

    const first = await getPlates({ airport: "KBFI" });
    const second = await getPlates({ airport: "KBFI" });

    expect(first.cache?.status).toBe("miss");
    expect(second.cache?.status).toBe("hit");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps US DTPP-backed procedures unchanged", async () => {
    const fetchMock = installAviationApiMock();

    const plates = await getPlates({ airport: "KBFI" });
    const sids = await getSids("KBFI");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(plates.ok).toBe(true);
    expect(sids.ok).toBe(true);
    if (!plates.ok || !sids.ok) return;

    expect(plates.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ airportIcao: "KBFI", procedureName: "ILS RWY 14R" })
      ])
    );
    expect(sids.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ airportIcao: "KBFI", procedureName: "HAROB SIX" })
      ])
    );
  });

  it("flags stale plate responses when the fetched cycle is older than the AIRAC window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T00:00:00.000Z"));
    vi.spyOn(utils, "toIsoNow").mockReturnValue("2026-06-18T00:00:00.000Z");
    installAviationApiMock();

    const response = await getPlates({ airport: "KBFI" });

    expect(response.isStale).toBe(true);
    vi.useRealTimers();
  });
});
