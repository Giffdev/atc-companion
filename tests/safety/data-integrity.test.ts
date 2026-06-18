import { getFrequencies } from "@/services/frequencies";
import { getNotams } from "@/services/notams";
import { getPlates } from "@/services/plates";
import { getTraffic } from "@/services/traffic";
import { getWeather } from "@/services/weather";
import { beforeEach } from "vitest";
import { installAviationApiMock } from "../fixtures/mock-aviation-fetch";

const parseIcaosFromPayload = (payload: unknown): string[] =>
  JSON.stringify(payload).match(/\bK[A-Z0-9]{3}\b/g) ?? [];

describe("safety: data integrity", () => {
  beforeEach(() => {
    installAviationApiMock();
  });

  it("every operational response includes source attribution and fetchedAt provenance", async () => {
    const responses = await Promise.all([
      getWeather("KBFI"),
      getFrequencies("KBFI"),
      getNotams({ airport: "KBFI" }),
      getPlates({ airport: "KBFI" }),
      getTraffic({ airport: "KBFI" })
    ]);

    for (const response of responses) {
      expect(response.source).toBeDefined();
      expect(response.attribution.primary).toBeDefined();
      expect(response.fetchedAt).toMatch(/T/);
    }
  });

  it("never emits hallucinated airport identifiers and keeps ICAO codes in US K-prefix form", async () => {
    const [weather, notams, plates] = await Promise.all([
      getWeather("KBFI"),
      getNotams({ airport: "KBFI" }),
      getPlates({ airport: "KBFI" })
    ]);

    expect(weather.ok).toBe(true);
    expect(notams.ok).toBe(true);
    expect(plates.ok).toBe(true);

    if (!weather.ok || !notams.ok || !plates.ok) {
      return;
    }

    const weatherIcaos = parseIcaosFromPayload(weather.data);
    expect(weatherIcaos).toContain("KBFI");

    for (const notam of notams.data) {
      expect(notam.affectedFacility).toBe("KBFI");
    }

    for (const plate of plates.data) {
      expect(plate.airportIcao).toBe("KBFI");
    }

    for (const icao of [...weatherIcaos, ...notams.data.map((item) => item.affectedFacility), ...plates.data.map((item) => item.airportIcao)]) {
      expect(icao).toHaveLength(4);
      expect(icao.startsWith("K")).toBe(true);
    }

    expect(JSON.stringify({ weather: weather.data, notams: notams.data, plates: plates.data })).not.toMatch(/\bUNKNOWN\b/);
  });

  it("keeps seeded and returned frequencies inside the valid VHF aviation band", async () => {
    const response = await getFrequencies("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    for (const frequency of response.data) {
      expect(frequency.valueMHz).toBeGreaterThanOrEqual(118);
      expect(frequency.valueMHz).toBeLessThanOrEqual(136.975);
    }
  });

  it("keeps reported altitudes inside a reasonable operational range", async () => {
    const response = await getTraffic({ airport: "KBFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    for (const target of response.data) {
      expect(target.altitudeFeet).toBeGreaterThanOrEqual(0);
      expect(target.altitudeFeet).toBeLessThanOrEqual(60000);
    }
  });
});
