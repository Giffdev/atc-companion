import { extractEntities, extractNavigationAirports, normalizeAviationText } from "@/ai/entity-extractor";
import { parseIntent } from "@/ai/intent-parser";

describe("normalizeAviationText", () => {
  it("normalizes NATO phonetics and spoken numbers", () => {
    expect(normalizeAviationText("kilo juliet foxtrot kilo one eighteen point seven")).toBe("KJFK 118.7");
  });
});

describe("extractEntities", () => {
  it("extracts FAR references and runways", () => {
    const entities = extractEntities("FAR 91.113 and runway 28 left");

    expect(entities.farReferences[0]).toMatchObject({ part: 91, section: "113" });
    expect(entities.runways).toContain("28L");
  });

  it("extracts Canadian city and province entities", () => {
    const entities = extractEntities("show me the airport at Vancouver, BC");

    expect(entities.cityLocations).toContainEqual({ city: "vancouver", regionCode: "BC" });
  });

  it("keeps US city and state extraction working", () => {
    const entities = extractEntities("weather near Seattle, Washington");

    expect(entities.cityLocations).toContainEqual({ city: "seattle", regionCode: "WA" });
  });

  it("does not over-match NO or INFO as airport identifiers", () => {
    const entities = extractEntities("no airport info");

    expect(entities.airports).toEqual([]);
  });

  it("does not over-match Caribbean-shaped ordinary words as airport identifiers", () => {
    const entities = extractEntities("we must taxi at this time before takeoff");

    expect(entities.airports).toEqual([]);
  });

  it("does not over-match ordinary words near Mexican-shaped airport cues", () => {
    const entities = extractEntities("memo says many maps mention mm hmm traffic");

    expect(entities.airports).toEqual([]);
  });

  it("does not extract stopwords before trailing airport intent cues", () => {
    const entities = extractEntities("no traffic");

    expect(entities.airports).toEqual([]);
  });

  it("extracts positional navigation endpoints in typed order", () => {
    expect(extractNavigationAirports("pae to 38w route")).toEqual({ from: "KPAE", to: "38W" });
    expect(extractNavigationAirports("38w to pae route")).toEqual({ from: "38W", to: "KPAE" });
    expect(extractNavigationAirports("pae to cyyj")).toEqual({ from: "KPAE", to: "CYYJ" });
  });
});

describe("parseIntent", () => {
  it("parses weather queries with a fast path", async () => {
    const intent = await parseIntent("METAR KLAX");

    expect(intent).toMatchObject({
      type: "weather",
      subtype: "metar",
      airport: "KLAX",
      requiresClarification: false
    });
    expect(intent.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("parses NOTAM requests", async () => {
    const intent = await parseIntent("NOTAMs for KORD");

    expect(intent).toMatchObject({
      type: "notam",
      airport: "KORD",
      requiresClarification: false
    });
  });

  it("parses frequency requests", async () => {
    const intent = await parseIntent("tower frequency KSFO");

    expect(intent).toMatchObject({
      type: "frequency",
      facility: "KSFO",
      freq_type: "TWR",
      requiresClarification: false
    });
  });

  it("parses Canadian ICAO weather requests with airport context", async () => {
    const intent = await parseIntent("CYVR weather");

    expect(intent).toMatchObject({
      type: "weather",
      airport: "CYVR",
      requiresClarification: false
    });
  });

  it("parses Canadian ICAO frequency requests with airport context", async () => {
    const intent = await parseIntent("frequencies at CYXX");

    expect(intent).toMatchObject({
      type: "frequency",
      facility: "CYXX",
      requiresClarification: false
    });
  });

  it("parses Caribbean ICAO airport info, frequency, and weather requests", async () => {
    const [runwayIntent, frequencyIntent, weatherIntent] = await Promise.all([
      parseIntent("runway configuration at MKJS"),
      parseIntent("frequencies for TJSJ"),
      parseIntent("weather at MYNN")
    ]);

    expect(runwayIntent).toMatchObject({
      type: "airport_info",
      airport: "MKJS",
      detail: "runways",
      requiresClarification: false
    });
    expect(frequencyIntent).toMatchObject({
      type: "frequency",
      facility: "TJSJ",
      requiresClarification: false
    });
    expect(weatherIntent).toMatchObject({
      type: "weather",
      airport: "MYNN",
      requiresClarification: false
    });
  });

  it("parses Mexican ICAO weather, traffic, runway, and frequency requests", async () => {
    const [weatherIntent, trafficIntent, runwayIntent, frequencyIntent] = await Promise.all([
      parseIntent("MMMX weather"),
      parseIntent("MMUN traffic"),
      parseIntent("MMTJ runways"),
      parseIntent("frequencies at MMGL")
    ]);

    expect(weatherIntent).toMatchObject({
      type: "weather",
      airport: "MMMX",
      requiresClarification: false
    });
    expect(trafficIntent).toMatchObject({
      type: "traffic",
      airport: "MMUN",
      requiresClarification: false
    });
    expect(runwayIntent).toMatchObject({
      type: "airport_info",
      airport: "MMTJ",
      detail: "runways",
      requiresClarification: false
    });
    expect(frequencyIntent).toMatchObject({
      type: "frequency",
      facility: "MMGL",
      requiresClarification: false
    });
  });

  it("parses Mexican ICAO codes after leading airport context cues", async () => {
    const intent = await parseIntent("traffic near MMUN");

    expect(intent).toMatchObject({
      type: "traffic",
      airport: "MMUN",
      requiresClarification: false
    });
    expect(intent.entities).toContainEqual({ label: "airport", value: "MMUN" });
  });

  it("parses Mexican ICAO trailing airport context cues", async () => {
    const [
      trafficIntent,
      platesIntent,
      approachesIntent,
      departureIntent,
      arrivalIntent,
      sidIntent,
      starIntent,
      hoursIntent
    ] = await Promise.all([
      parseIntent("mmun traffic"),
      parseIntent("mmmx plates"),
      parseIntent("mmgl approaches"),
      parseIntent("mmtj departures"),
      parseIntent("mmmy arrivals"),
      parseIntent("mmmx sids"),
      parseIntent("mmun stars"),
      parseIntent("mmgl hours")
    ]);

    expect(trafficIntent).toMatchObject({
      type: "traffic",
      airport: "MMUN",
      requiresClarification: false
    });
    expect(platesIntent).toMatchObject({
      type: "plates",
      airport: "MMMX",
      requiresClarification: false
    });
    expect(approachesIntent).toMatchObject({
      type: "plates",
      airport: "MMGL",
      requiresClarification: false
    });
    expect(departureIntent).toMatchObject({
      type: "plates",
      airport: "MMTJ",
      procedure_type: "SID",
      requiresClarification: false
    });
    expect(arrivalIntent).toMatchObject({
      type: "plates",
      airport: "MMMY",
      procedure_type: "STAR",
      requiresClarification: false
    });
    expect(sidIntent).toMatchObject({
      type: "plates",
      airport: "MMMX",
      procedure_type: "SID",
      requiresClarification: false
    });
    expect(starIntent).toMatchObject({
      type: "plates",
      airport: "MMUN",
      procedure_type: "STAR",
      requiresClarification: false
    });
    expect(hoursIntent).toMatchObject({
      type: "airport_info",
      airport: "MMGL",
      detail: "hours",
      requiresClarification: false
    });
  });

  it("parses contextual Canadian local identifiers", async () => {
    const intent = await parseIntent("weather at CAT4");

    expect(intent).toMatchObject({
      type: "weather",
      airport: "CAT4",
      requiresClarification: false
    });
  });

  it("parses plate requests", async () => {
    const intent = await parseIntent("ILS 28R KJFK");

    expect(intent).toMatchObject({
      type: "plates",
      airport: "KJFK",
      procedure_type: "ILS",
      runway: "28R",
      requiresClarification: false
    });
  });

  it("parses SID, STAR, and ODP phrasing while keeping departure frequency as frequency", async () => {
    const [sidIntent, starIntent, odpIntent, frequencyIntent] = await Promise.all([
      parseIntent("show me the SIDs for KBFI"),
      parseIntent("what arrivals are available at KSEA"),
      parseIntent("takeoff minimums for KBFI"),
      parseIntent("departure frequency for KSEA")
    ]);

    expect(sidIntent).toMatchObject({
      type: "plates",
      airport: "KBFI",
      procedure_type: "SID",
      requiresClarification: false
    });
    expect(starIntent).toMatchObject({
      type: "plates",
      airport: "KSEA",
      procedure_type: "STAR",
      requiresClarification: false
    });
    expect(odpIntent).toMatchObject({
      type: "plates",
      airport: "KBFI",
      procedure_type: "ODP",
      requiresClarification: false
    });
    expect(frequencyIntent).toMatchObject({
      type: "frequency",
      facility: "KSEA",
      freq_type: "APP",
      requiresClarification: false
    });
  });

  it("parses traffic requests", async () => {
    const intent = await parseIntent("traffic near KLAX between FL180 and FL240");

    expect(intent).toMatchObject({
      type: "traffic",
      airport: "KLAX",
      altitude_range: [18000, 24000],
      requiresClarification: false
    });
  });

  it("parses Canadian ICAO trailing traffic requests", async () => {
    const [victoriaIntent, vancouverIntent, leadingIntent] = await Promise.all([
      parseIntent("cyyj traffic"),
      parseIntent("cyvr traffic"),
      parseIntent("traffic at cyyj")
    ]);

    expect(victoriaIntent).toMatchObject({
      type: "traffic",
      airport: "CYYJ",
      requiresClarification: false
    });
    expect(victoriaIntent.entities).toContainEqual({ label: "airport", value: "CYYJ" });
    expect(vancouverIntent).toMatchObject({
      type: "traffic",
      airport: "CYVR",
      requiresClarification: false
    });
    expect(vancouverIntent.entities).toContainEqual({ label: "airport", value: "CYVR" });
    expect(leadingIntent).toMatchObject({
      type: "traffic",
      airport: "CYYJ",
      requiresClarification: false
    });
  });

  it("parses Canadian ICAO trailing plate cues", async () => {
    const [platesIntent, approachesIntent, departureIntent, arrivalIntent, sidIntent, starIntent] = await Promise.all([
      parseIntent("cyyj plates"),
      parseIntent("cyyj approaches"),
      parseIntent("cyyj departures"),
      parseIntent("cyyj arrivals"),
      parseIntent("cyyj sids"),
      parseIntent("cyyj stars")
    ]);

    expect(platesIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      requiresClarification: false
    });
    expect(approachesIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      requiresClarification: false
    });
    expect(departureIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      procedure_type: "SID",
      requiresClarification: false
    });
    expect(arrivalIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      procedure_type: "STAR",
      requiresClarification: false
    });
    expect(sidIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      procedure_type: "SID",
      requiresClarification: false
    });
    expect(starIntent).toMatchObject({
      type: "plates",
      airport: "CYYJ",
      procedure_type: "STAR",
      requiresClarification: false
    });
  });

  it("parses Canadian ICAO trailing hours requests", async () => {
    const intent = await parseIntent("cyyj hours");

    expect(intent).toMatchObject({
      type: "airport_info",
      airport: "CYYJ",
      detail: "hours",
      requiresClarification: false
    });
  });

  it("parses traffic altitude ceilings and floors", async () => {
    const [belowIntent, aboveIntent, underIntent, overIntent] = await Promise.all([
      parseIntent("traffic near KSEA below 12,000 ft"),
      parseIntent("traffic near KSEA above 5000"),
      parseIntent("traffic near KSEA under 12000 feet"),
      parseIntent("traffic near KSEA over FL240")
    ]);

    expect(belowIntent).toMatchObject({
      type: "traffic",
      airport: "KSEA",
      altitude_range: [0, 12000],
      requiresClarification: false
    });
    expect(aboveIntent).toMatchObject({
      type: "traffic",
      airport: "KSEA",
      altitude_range: [5000, 99999],
      requiresClarification: false
    });
    expect(underIntent).toMatchObject({
      type: "traffic",
      airport: "KSEA",
      altitude_range: [0, 12000],
      requiresClarification: false
    });
    expect(overIntent).toMatchObject({
      type: "traffic",
      airport: "KSEA",
      altitude_range: [24000, 99999],
      requiresClarification: false
    });
  });

  it("parses navigation requests with facility context", async () => {
    const intent = await parseIntent("what is the direct heading vector from my airport to KORD", {
      facilityId: "KSEA-TWR"
    });

    expect(intent).toMatchObject({
      type: "navigation",
      from: "KSEA",
      to: "KORD",
      requiresClarification: false
    });
  });

  it("parses explicit point-to-point route requests as navigation", async () => {
    const routeCases = [
      ["show me a direct route from KPAE to CYYJ", "KPAE", "CYYJ"],
      ["from KPAE to KSEA", "KPAE", "KSEA"],
      ["direct route from KPAE to KSEA", "KPAE", "KSEA"],
      ["pae to 38w route", "KPAE", "38W"],
      ["38w to pae route", "38W", "KPAE"],
      ["heading from KPAE to KSEA", "KPAE", "KSEA"],
      ["distance from KPAE to KSEA", "KPAE", "KSEA"]
    ] as const;

    const intents = await Promise.all(routeCases.map(([query]) => parseIntent(query)));

    intents.forEach((intent, index) => {
      const [, from, to] = routeCases[index];

      expect(intent).toMatchObject({
        type: "navigation",
        from,
        to,
        requiresClarification: false
      });
      expect(intent.entities).toContainEqual({ label: "navigation_from", value: from });
      expect(intent.entities).toContainEqual({ label: "navigation_to", value: to });
    });
  });

  it("does not treat ordinary airport-info phrasing with to as navigation", async () => {
    await expect(parseIntent("airport info for PAE to review")).resolves.toMatchObject({
      type: "airport_info",
      requiresClarification: false
    });
  });

  it("parses runway configuration and airport diagram requests as airport info", async () => {
    const [runwayIntent, diagramIntent, genericInfoIntent, compoundInfoIntent] = await Promise.all([
      parseIntent("what is the runway configuration at KSEA"),
      parseIntent("show me the airport diagram for KSEA"),
      parseIntent("show me info for KSEA"),
      parseIntent("weather and notams for KSEA")
    ]);

    expect(runwayIntent).toMatchObject({
      type: "airport_info",
      airport: "KSEA",
      detail: "runways",
      requiresClarification: false
    });
    expect(diagramIntent).toMatchObject({
      type: "airport_info",
      airport: "KSEA",
      detail: "runways",
      requiresClarification: false
    });
    expect(genericInfoIntent).toMatchObject({
      type: "airport_info",
      airport: "KSEA",
      requiresClarification: false
    });
    expect(compoundInfoIntent).toMatchObject({
      type: "airport_info",
      airport: "KSEA",
      detail: "all",
      requiresClarification: false
    });
  });

  it("parses regulatory requests", async () => {
    const [intent, atcIntent] = await Promise.all([
      parseIntent("FAR 91.113"),
      parseIntent("what is the wake turbulence separation behind a heavy")
    ]);

    expect(intent).toMatchObject({
      type: "regulatory",
      part: 91,
      section: "113",
      requiresClarification: false
    });
    expect(atcIntent).toMatchObject({
      type: "regulatory",
      requiresClarification: false
    });
  });

  it("asks for clarification on low-confidence input", async () => {
    const intent = await parseIntent("need help");

    expect(intent).toMatchObject({
      type: "unknown",
      requiresClarification: true
    });
    expect(intent.confidence).toBeLessThan(0.7);
  });
});
