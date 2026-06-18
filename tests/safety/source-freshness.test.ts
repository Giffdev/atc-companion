import { createApiResponse } from "@/lib/utils";
import { getDataSource } from "@/data/sources";

describe("safety: source freshness", () => {
  const weatherSource = getDataSource("aviationWeather");
  const plateSource = getDataSource("faaDtpp");
  const trafficSource = getDataSource("openSkyNetwork");

  it("flags METARs older than two hours as stale", () => {
    const response = createApiResponse({ stationIcao: "KBFI" }, weatherSource, {
      fetchedAt: "2026-06-18T00:00:00.000Z",
      stalenessCategory: "metar"
    });

    expect(response.isStale).toBe(true);
  });

  it("flags TAFs older than eight hours as stale", () => {
    const response = createApiResponse({ stationIcao: "KBFI" }, weatherSource, {
      fetchedAt: "2026-06-17T16:00:00.000Z",
      stalenessCategory: "taf"
    });

    expect(response.isStale).toBe(true);
  });

  it("flags ADS-B data older than thirty seconds as stale", () => {
    const response = createApiResponse([{ icao24: "a4b294" }], trafficSource, {
      fetchedAt: new Date(Date.now() - 31_000).toISOString(),
      stalenessCategory: "trafficTarget"
    });

    expect(response.isStale).toBe(true);
  });

  it("flags approach plates carried over from a previous AIRAC cycle as stale", () => {
    const response = createApiResponse([{ airportIcao: "KBFI", procedureName: "ILS RWY 14R" }], plateSource, {
      fetchedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      stalenessCategory: "approachPlate"
    });

    expect(response.isStale).toBe(true);
  });
});
