import { extractRunways, normalizeAviationText } from "@/ai/entity-extractor";
import { findAirportReference, findAirportReferencesInText, hasRunwayAtAirport, toIcaoCode } from "@/data/airports";
import { appCache } from "@/lib/cache";
import { getPlates } from "@/services/plates";
import { getFrequencies } from "@/services/frequencies";
import { beforeEach } from "vitest";
import { installAviationApiMock } from "../fixtures/mock-aviation-fetch";

describe("aviation accuracy", () => {
  beforeEach(() => {
    appCache.clear();
    installAviationApiMock();
  });

  it("normalizes FAA and ICAO identifiers to canonical ICAO codes", () => {
    expect(toIcaoCode("BFI")).toBe("KBFI");
    expect(toIcaoCode("SEA")).toBe("KSEA");
    expect(toIcaoCode("KJFK")).toBe("KJFK");
  });

  it("resolves expanded airport names to the expected airport references", () => {
    expect(toIcaoCode("Boeing Field")).toBe("KBFI");
    expect(toIcaoCode("Bremerton")).toBe("KPWT");
    expect(findAirportReference("Whidbey Approach")?.icao).toBe("KNUW");
    expect(toIcaoCode("SeaTac")).toBe("KSEA");
    expect(toIcaoCode("Denver International")).toBe("KDEN");
  });

  it("matches partial airport names and city-led phrases in free text", () => {
    expect(findAirportReferencesInText("show me plates for kansas city international").map((airport) => airport.icao)).toContain("KMCI");
    expect(findAirportReferencesInText("traffic around roche harbor on the field").map((airport) => airport.icao)).toContain("W39");
  });

  it("keeps seeded FAA frequency data inside the published VHF aviation band", async () => {
    const response = await getFrequencies("KBFI");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    const towerFrequencies = response.data.filter((record) => record.type === "TWR").map((record) => record.valueMHz);
    expect(towerFrequencies.length).toBeGreaterThan(0);
    expect(towerFrequencies.some((value) => value >= 118 && value <= 136)).toBe(true);

    for (const frequency of response.data) {
      expect(frequency.valueMHz).toBeGreaterThanOrEqual(118);
      expect(frequency.valueMHz).toBeLessThanOrEqual(136.975);
    }
  });

  it("returns TRACON sector frequencies for approach-control lookups", async () => {
    const response = await getFrequencies("Seattle", "APP");

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "APP", valueMHz: 119.2, name: expect.stringContaining("Seattle Approach") }),
        expect.objectContaining({ type: "APP", valueMHz: 127.1, name: expect.stringContaining("Bremerton") })
      ])
    );
  });

  it("parses and validates Boeing Field runway identifiers", () => {
    expect(extractRunways("14R")).toContain("14R");
    expect(normalizeAviationText("runway one four right")).toContain("runway 14R");
    expect(extractRunways("runway one four right")).toContain("14R");
    expect(hasRunwayAtAirport("KBFI", "14R")).toBe(true);
  });

  it("infers approach types and runway designators from real-world chart names", async () => {
    const response = await getPlates({ airport: "KBFI" });

    expect(response.ok).toBe(true);
    if (!response.ok) {
      return;
    }

    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          airportIcao: "KBFI",
          procedureName: "ILS RWY 14R",
          procedureType: "ILS",
          runway: "14R"
        }),
        expect.objectContaining({
          airportIcao: "KBFI",
          procedureName: "RNAV (GPS) RWY 32L",
          procedureType: "RNAV",
          runway: "32L"
        })
      ])
    );
  });
});
