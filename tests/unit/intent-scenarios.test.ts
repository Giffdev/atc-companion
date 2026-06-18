import { extractAirportCodes, extractRunways, normalizeAviationText } from "@/ai/entity-extractor";
import { parseIntent } from "@/ai/intent-parser";

describe("intent parser scenarios", () => {
  describe("user example queries", () => {
    test("show me the approach plate for the ILS 14R approach into Boeing Field", async () => {
      const intent = await parseIntent("show me the approach plate for the ILS 14R approach into Boeing Field");

      expect(intent.type).toBe("plates");
      expect(intent.airport).toContain("BFI");
      expect(intent.procedure_type).toBe("ILS");
      expect(intent.runway).toBe("14R");
    });

    test("tell me the latest METAR for KPWK airport", async () => {
      const intent = await parseIntent("tell me the latest METAR for KPWK airport");

      expect(intent.type).toBe("weather");
      expect(intent.subtype).toBe("metar");
      expect(intent.airport).toBe("KPWK");
    });

    test("what is the approach control frequencies for Whidbey approach", async () => {
      const intent = await parseIntent("what is the approach control frequencies for Whidbey approach");

      expect(intent.type).toBe("frequency");
      expect(intent.freq_type).toBe("APP");
      expect(intent.facility).toBe("KNUW");
    });

    test("how many planes appear to be in the traffic pattern at bremerton international airport", async () => {
      const intent = await parseIntent(
        "how many planes appear to be in the traffic pattern at bremerton international airport"
      );

      expect(intent.type).toBe("traffic");
      expect(intent.airport).toBe("KPWT");
    });
  });

  it("converts NATO phonetic spellings into airport identifiers", () => {
    expect(normalizeAviationText("kilo bravo foxtrot india")).toBe("KBFI");
    expect(extractAirportCodes("kilo bravo foxtrot india")).toContain("KBFI");
  });

  it("converts spoken runway numbers into canonical runway identifiers", () => {
    expect(normalizeAviationText("runway one four right")).toBe("runway 14R");
    expect(extractRunways("runway one four right")).toContain("14R");
  });

  it("handles mixed phonetic and intent cues for a weather request", async () => {
    const intent = await parseIntent("metar for kilo sierra echo alpha");

    expect(intent).toMatchObject({
      type: "weather",
      subtype: "metar",
      airport: "KSEA",
      requiresClarification: false
    });
  });

  it("resolves named-airport aliases and generic airport-info phrasing used in live query testing", async () => {
    await expect(parseIntent("what's the current weather at SeaTac")).resolves.toMatchObject({
      type: "weather",
      airport: "KSEA",
      requiresClarification: false
    });

    await expect(parseIntent("give me the TAF for Denver International")).resolves.toMatchObject({
      type: "weather",
      subtype: "taf",
      airport: "KDEN",
      requiresClarification: false
    });

    await expect(parseIntent("tell me about KBFI")).resolves.toMatchObject({
      type: "airport_info",
      airport: "KBFI",
      requiresClarification: false
    });
  });

  it("keeps approach-procedure, traffic-count, and regulatory phrases out of the wrong intent buckets", async () => {
    await expect(parseIntent("show me the ILS runway 14R approach into Boeing Field")).resolves.toMatchObject({
      type: "plates",
      airport: "KBFI",
      procedure_type: "ILS",
      runway: "14R",
      requiresClarification: false
    });

    await expect(parseIntent("what approach plates are available for KSEA")).resolves.toMatchObject({
      type: "plates",
      airport: "KSEA",
      requiresClarification: false
    });

    await expect(parseIntent("is there an instrument approach at Friday Harbor")).resolves.toMatchObject({
      type: "plates",
      airport: "KFHR",
      requiresClarification: false
    });

    await expect(parseIntent("how many planes near Boeing Field")).resolves.toMatchObject({
      type: "traffic",
      airport: "KBFI",
      requiresClarification: false
    });

    await expect(parseIntent("what is the speed limit below 10000 feet")).resolves.toMatchObject({
      type: "regulatory",
      requiresClarification: false
    });

    await expect(parseIntent("what are the VFR weather minimums in Class D airspace")).resolves.toMatchObject({
      type: "regulatory",
      requiresClarification: false
    });

    await expect(parseIntent("roche harbor approaches")).resolves.toMatchObject({
      type: "plates",
      airport: "W39",
      requiresClarification: false
    });
  });

  it("treats empty input as a clarification flow", async () => {
    await expect(parseIntent("   ")).resolves.toMatchObject({
      type: "unknown",
      clarificationReason: "empty-input",
      requiresClarification: true
    });
  });

  it("treats gibberish as ambiguous instead of inventing an aviation task", async () => {
    await expect(parseIntent("snorfle wobble zed nine")).resolves.toMatchObject({
      type: "unknown",
      clarificationReason: "ambiguous",
      requiresClarification: true
    });
  });

  it("rejects non-aviation queries instead of forcing a live data lookup", async () => {
    await expect(parseIntent("write me a pizza recipe")).resolves.toMatchObject({
      type: "unknown",
      requiresClarification: true
    });
  });
});
