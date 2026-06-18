import { appCache } from "@/lib/cache";
import * as utils from "@/lib/utils";
import { getAirportDiagram, getPlates } from "@/services/plates";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_DTPP_XML, installAviationApiMock } from "../../fixtures/mock-aviation-fetch";

describe("plates service", () => {
  beforeEach(() => {
    appCache.clear();
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
