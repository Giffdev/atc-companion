import { executeQuery } from "@/services/orchestrator";
import { findDatasetAirportReference } from "@/services/dataset-airport-fallback";
import { calculateNavigation, getNavigationBetween, getNavigationBetweenReferences } from "@/services/navigation";
import type { ParsedIntent } from "@/types/intents";

describe("navigation service", () => {
  it("calculates great-circle distance and bearing", () => {
    const result = calculateNavigation({ latitude: 47.449, longitude: -122.3093 }, { latitude: 41.9742, longitude: -87.9073 });

    expect(result.distanceNm).toBeGreaterThan(1450);
    expect(result.distanceNm).toBeLessThan(1550);
    expect(result.trueBearing).toBeGreaterThan(80);
    expect(result.trueBearing).toBeLessThan(110);
  });

  it("builds a full navigation result from bundled airport references", () => {
    const result = getNavigationBetween("KSEA", "KORD", 250);

    expect(result).toMatchObject({
      from: { icao: "KSEA" },
      to: { icao: "KORD" }
    });
    expect(result?.magneticHeading).toBeGreaterThanOrEqual(1);
    expect(result?.distanceNm).toBeGreaterThan(1450);
    expect(result?.estimatedTimeMinutes).toBeGreaterThan(300);
  });

  it("builds a full navigation result from resolved airport references", () => {
    const result = getNavigationBetweenReferences(
      {
        icao: "KPAE",
        faa: "PAE",
        name: "Paine Field",
        city: "Everett",
        state: "WA",
        latitude: 47.9063,
        longitude: -122.2816
      },
      {
        icao: "CYYJ",
        faa: "CYYJ",
        name: "Victoria International Airport",
        city: "Victoria",
        state: "BC",
        latitude: 48.6469,
        longitude: -123.4258
      },
      120
    );

    expect(result.from.icao).toBe("KPAE");
    expect(result.to.icao).toBe("CYYJ");
    expect(result.distanceNm).toBeGreaterThan(40);
    expect(result.distanceNm).toBeLessThan(80);
    expect(result.trueHeading).toBeGreaterThan(290);
    expect(result.trueHeading).toBeLessThan(340);
    expect(result.estimatedTimeMinutes).toBeGreaterThan(20);
  });

  it("resolves CYYJ from the dataset fallback for navigation", () => {
    const cyyj = findDatasetAirportReference("CYYJ");

    expect(cyyj).toMatchObject({
      icao: "CYYJ",
      name: "Victoria International Airport"
    });
    expect(Number.isFinite(cyyj?.latitude)).toBe(true);
    expect(Number.isFinite(cyyj?.longitude)).toBe(true);
  });

  it("computes KPAE to CYYJ navigation through the orchestrator dataset fallback", async () => {
    const source = {
      id: "unit-test",
      name: "Unit test",
      url: "test://navigation-service",
      reliability: "high" as const,
      refresh_interval: "test"
    };
    const intent: ParsedIntent = {
      type: "navigation",
      from: "KPAE",
      to: "CYYJ",
      confidence: 1,
      rawInput: "direct route from kpae to cyyj",
      parsedAt: new Date(0).toISOString(),
      source,
      entities: [],
      requiresClarification: false
    };

    const result = await executeQuery(intent);

    if (!result.response.ok) {
      throw new Error(result.response.error.code);
    }

    expect(result.response.data).toMatchObject({
      from: { icao: "KPAE" },
      to: { icao: "CYYJ" }
    });
    expect(result.response.data.distanceNm).toBeGreaterThan(40);
    expect(result.response.data.distanceNm).toBeLessThan(80);
  });
});
