import { GET as getFrequenciesRoute } from "@/app/api/frequencies/route";
import { GET as getIntentRoute } from "@/app/api/intent/route";
import { GET as getNotamsRoute } from "@/app/api/notams/route";
import { GET as getPlatesRoute } from "@/app/api/plates/route";
import { GET as getRegulatoryRoute } from "@/app/api/regulatory/route";
import { GET as getSearchRoute } from "@/app/api/search/route";
import { GET as getTrafficRoute } from "@/app/api/traffic/route";
import { GET as getWeatherRoute } from "@/app/api/weather/route";
import { isDataStale } from "@/data/staleness";
import { AUTHORITATIVE_DOMAIN_ALLOWLIST } from "../fixtures/api-responses";

const parseJson = async (response: Response) => (await response.json()) as Record<string, unknown>;

const apiResponses = [
  () => getWeatherRoute(new Request("http://localhost/api/weather?station=KJFK")),
  () => getNotamsRoute(new Request("http://localhost/api/notams?facility=KJFK")),
  () => getFrequenciesRoute(new Request("http://localhost/api/frequencies?airport=KJFK")),
  () => getPlatesRoute(new Request("http://localhost/api/plates?airport=KJFK")),
  () => getTrafficRoute(new Request("http://localhost/api/traffic?airport=KJFK")),
  () => getSearchRoute(new Request("http://localhost/api/search?q=FAR%2091.113")),
  () => getRegulatoryRoute(new Request("http://localhost/api/regulatory?q=light%20gun%20signals")),
  () => getIntentRoute(new Request("http://localhost/api/intent?q=weather%20at%20KJFK"))
] as const;

const authoritativeResponses = apiResponses.slice(0, 7);

const isValidIsoString = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(Date.parse(value)) && value.includes("T");

describe("safety: source verification", () => {
  it("every API response shape includes source attribution", async () => {
    const payloads = await Promise.all(apiResponses.map((invoke) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(payload.source).toBeDefined();
      expect(payload.attribution).toBeDefined();
      expect((payload.attribution as { primary?: unknown }).primary).toBeDefined();
    }
  });

  it("authoritative aviation responses stay inside the approved source allowlist", async () => {
    const payloads = await Promise.all(authoritativeResponses.map((invoke) => invoke().then(parseJson)));

    for (const payload of payloads) {
      const host = new URL((payload.source as { url: string }).url).hostname;
      expect(AUTHORITATIVE_DOMAIN_ALLOWLIST.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))).toBe(true);
    }
  });

  it("never emits a response without a source object", async () => {
    const payloads = await Promise.all(apiResponses.map((invoke) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(payload.source).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        url: expect.any(String)
      });
    }
  });

  it("emits fetchedAt timestamps as valid ISO-8601 strings", async () => {
    const payloads = await Promise.all(apiResponses.map((invoke) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(isValidIsoString(payload.fetchedAt)).toBe(true);
    }
  });

  it("calculates staleness according to source-specific freshness windows", () => {
    const now = Date.parse("2026-06-17T21:00:00.000Z");

    expect(isDataStale("2026-06-17T19:59:59.000Z", "metar", now)).toBe(true);
    expect(isDataStale("2026-06-17T20:59:31.000Z", "trafficTarget", now)).toBe(false);
  });
});
