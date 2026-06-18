import { calculateNavigation, getNavigationBetween } from "@/services/navigation";

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
});
