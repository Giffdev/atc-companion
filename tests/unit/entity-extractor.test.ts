import {
  extractAircraftTypes,
  extractAirportCodes,
  extractAltitudesFeet,
  extractCallsigns,
  extractEntities,
  extractFarReferences,
  extractFrequencies,
  extractNavigationAirports,
  extractRunways
} from "@/ai/entity-extractor";

describe("entity extraction", () => {
  it("extracts ICAO and IATA airport identifiers, including K-prefixed ICAO codes", () => {
    expect(extractAirportCodes("weather at KJFK then taxi to LAX")).toEqual(expect.arrayContaining(["KJFK", "LAX"]));
  });

  it("recognizes contextual FAA local identifiers without over-matching ordinary words or numbers", () => {
    expect(extractAirportCodes("runway configuration at S18")).toContain("S18");
    expect(extractAirportCodes("airport info for 38W")).toContain("38W");
    expect(extractAirportCodes("show me airport 1A1 weather")).toContain("1A1");
    expect(extractAirportCodes("review item 123 and APP notes")).toEqual([]);
  });

  it("does not extract the internal airport info wording as a four-letter airport code", () => {
    expect(extractAirportCodes("airport info for S18")).toEqual(["S18"]);
    expect(extractAirportCodes("airport info for 38W")).toEqual(expect.arrayContaining(["38W"]));
    expect(extractAirportCodes("airport info for 38W")).not.toContain("INFO");
    expect(extractAirportCodes("airport info for KSEA")).toEqual(expect.arrayContaining(["KSEA"]));
    expect(extractAirportCodes("airport info for KSEA")).not.toContain("INFO");
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

  it("extracts navigation endpoints with optional facility context", () => {
    expect(extractNavigationAirports("route from KSEA to KORD")).toEqual({ from: "KSEA", to: "KORD" });
    expect(extractNavigationAirports("heading vector from my airport to KORD", "KSEA")).toEqual({ from: "KSEA", to: "KORD" });
  });
});
