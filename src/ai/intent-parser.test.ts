import { extractEntities, normalizeAviationText } from "@/ai/entity-extractor";
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

  it("parses runway configuration and airport diagram requests as airport info", async () => {
    const [runwayIntent, diagramIntent] = await Promise.all([
      parseIntent("what is the runway configuration at KSEA"),
      parseIntent("show me the airport diagram for KSEA")
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
