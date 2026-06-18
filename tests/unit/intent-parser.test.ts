import { parseIntent } from "@/ai/intent-parser";

describe("parseIntent", () => {
  it("parses common ATC weather queries with a high-confidence airport match", async () => {
    await expect(parseIntent("Need the latest METAR for KJFK")).resolves.toMatchObject({
      type: "weather",
      airport: "KJFK",
      subtype: "metar",
      requiresClarification: false
    });
  });

  it("parses NOTAM, frequency, and regulatory queries into the expected intent families", async () => {
    const [notam, frequency, regulatory, atcRegulatory] = await Promise.all([
      parseIntent("NOTAMs for KLAX"),
      parseIntent("tower frequency for LAX"),
      parseIntent("14 CFR 91.113"),
      parseIntent("what does squawk 7600 mean")
    ]);

    expect(notam).toMatchObject({ type: "notam", airport: "KLAX" });
    expect(frequency).toMatchObject({ type: "frequency", facility: "LAX", freq_type: "TWR" });
    expect(regulatory).toMatchObject({ type: "regulatory", part: 91, section: "113" });
    expect(atcRegulatory).toMatchObject({ type: "regulatory", requiresClarification: false });
  });

  it("extracts ICAO and IATA airport codes from parsed entities", async () => {
    const [icaoIntent, iataIntent] = await Promise.all([parseIntent("weather at KSEA"), parseIntent("weather for LAX")]);

    expect(icaoIntent.entities).toEqual(expect.arrayContaining([expect.objectContaining({ label: "airport", value: "KSEA" })]));
    expect(iataIntent.entities).toEqual(expect.arrayContaining([expect.objectContaining({ label: "airport", value: "LAX" })]));
  });

  it("assigns high confidence to explicit single-intent aviation requests", async () => {
    const intent = await parseIntent("ATIS frequency for KSFO");

    expect(intent.type).toBe("frequency");
    expect(intent.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("drops to clarification mode for low-confidence requests", async () => {
    const intent = await parseIntent("help maybe");

    expect(intent).toMatchObject({
      type: "unknown",
      requiresClarification: true,
      clarificationReason: "ambiguous"
    });
    expect(intent.confidence).toBeLessThan(0.7);
  });

  it("asks for missing airport details instead of guessing", async () => {
    const intent = await parseIntent("what's the weather");

    expect(intent).toMatchObject({
      type: "unknown",
      requiresClarification: true,
      clarificationReason: "missing-entity"
    });
    expect(intent.clarificationPrompt).toContain("Which airport");
  });

  it("treats empty input as a clarification flow", async () => {
    const intent = await parseIntent("   ");

    expect(intent).toMatchObject({
      type: "unknown",
      confidence: 0,
      clarificationReason: "empty-input",
      requiresClarification: true
    });
  });

  it("treats gibberish as ambiguous instead of inventing a data request", async () => {
    const intent = await parseIntent("blargle snorf 123");

    expect(intent).toMatchObject({
      type: "unknown",
      clarificationReason: "ambiguous",
      requiresClarification: true
    });
  });

  it("collapses compound requests into airport_info when multiple data types are mentioned", async () => {
    const intent = await parseIntent("Give me the METAR and NOTAMs for KDEN");

    expect(intent).toMatchObject({
      type: "airport_info",
      requiresClarification: false
    });
    expect(intent.airport).toBeTruthy();
  });
});
