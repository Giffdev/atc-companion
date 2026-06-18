import {
  extractAircraftTypes,
  extractAirportCodes,
  extractAltitudesFeet,
  extractCallsigns,
  extractEntities,
  extractFarReferences,
  extractFrequencies,
  extractRunways
} from "@/ai/entity-extractor";

describe("entity extraction", () => {
  it("extracts ICAO and IATA airport identifiers, including K-prefixed ICAO codes", () => {
    expect(extractAirportCodes("weather at KJFK then taxi to LAX")).toEqual(expect.arrayContaining(["KJFK", "LAX"]));
  });

  it("extracts numeric and spoken radio frequencies", () => {
    expect(extractFrequencies("contact tower on 118.7, that's one eighteen point seven")).toEqual(["118.7"]);
  });

  it("extracts altitude phrases across feet and flight levels", () => {
    expect(extractAltitudesFeet("maintain FL350, expect flight level 240, then descend to 3500ft")).toEqual(
      expect.arrayContaining([35000, 24000, 3500])
    );
  });

  it("extracts runway designators without mistaking FAR sections for runways", () => {
    expect(extractRunways("runway 28L, runway 28R, runway 09, runway 36 center, FAR 91.113")).toEqual([
      "28L",
      "28R",
      "09",
      "36C"
    ]);
  });

  it("extracts FAR and CFR references with normalized parts and sections", () => {
    expect(extractFarReferences("Review 14 CFR 91.113, FAR 91.113, and part 91")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ part: 91, section: "113" }),
        expect.objectContaining({ raw: "part 91", part: 91 })
      ])
    );
  });

  it("extracts callsigns and aircraft types from mixed traffic text", () => {
    expect(extractCallsigns("DAL123 in trail with N123AB")).toEqual(expect.arrayContaining(["DAL123", "N123AB"]));
    expect(extractAircraftTypes("Equipment includes A320, B738, and SR22")).toEqual(
      expect.arrayContaining(["A320", "B738", "SR22"])
    );
  });

  it("returns a combined entity bundle for downstream intent parsing", () => {
    const entities = extractEntities("American 123 inbound runway 28R at FL180 for KJFK on one eighteen point seven");

    expect(entities.airports).toContain("KJFK");
    expect(entities.frequencies).toContain("118.7");
    expect(entities.altitudesFeet).toContain(18000);
    expect(entities.runways).toContain("28R");
  });
});
