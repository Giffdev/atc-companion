import {
  extractAltitudesFeet,
  extractCallsigns,
  extractEntities,
  extractFarReferences,
  extractSpeedKnots,
  extractSquawkCodes
} from "@/ai/entity-extractor";

describe("entity extraction edge cases", () => {
  it("extracts multiple airports from route-style queries", () => {
    const entities = extractEntities("NOTAMs from KSEA to KPDX");

    expect(entities.airports).toEqual(expect.arrayContaining(["KSEA", "KPDX"]));
    expect(entities.route).toEqual(["KSEA", "KPDX"]);
  });

  it("extracts flight levels from compact and spoken phrase formats", () => {
    expect(extractAltitudesFeet("maintain FL350 then descend to flight level 350")).toEqual([35000]);
  });

  it("extracts emergency squawk codes", () => {
    expect(extractSquawkCodes("lost comms squawk 7600, hijack 7500, general emergency 7700")).toEqual([
      "7600",
      "7500",
      "7700"
    ]);
  });

  it("extracts airspeeds expressed in knots and KIAS", () => {
    expect(extractSpeedKnots("maintain 250 knots, then slow to 200 KIAS")).toEqual([250, 200]);
  });

  it("extracts FAR and CFR references across common citation styles", () => {
    expect(extractFarReferences("14 CFR 91.113, FAR part 91, and part 121.135")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ part: 91, section: "113" }),
        expect.objectContaining({ part: 91 }),
        expect.objectContaining({ part: 121, section: "135" })
      ])
    );
  });

  it("extracts N-numbers and airline callsigns from mixed traffic text", () => {
    expect(extractCallsigns("N12345 following N5678Q, AAL123 ahead of UAL456")).toEqual(
      expect.arrayContaining(["N12345", "N5678Q", "AAL123", "UAL456"])
    );
  });

  it("returns speed and squawk entities in the combined bundle", () => {
    const entities = extractEntities("AAL123 squawk 7700 and maintain 250 knots");

    expect(entities.callsigns).toContain("AAL123");
    expect(entities.squawkCodes).toContain("7700");
    expect(entities.speedKnots).toContain(250);
  });
});
