import { getDataSource } from "@/data/sources";
import { createApiResponse } from "@/lib/utils";
import { GET as getFrequenciesRoute } from "@/app/api/frequencies/route";
import { GET as getNotamsRoute } from "@/app/api/notams/route";
import { GET as getPlatesRoute } from "@/app/api/plates/route";
import { GET as getRegulatoryRoute } from "@/app/api/regulatory/route";
import { GET as getSearchRoute } from "@/app/api/search/route";
import { GET as getTrafficRoute } from "@/app/api/traffic/route";
import { GET as getWeatherRoute } from "@/app/api/weather/route";
import { beforeEach, vi } from "vitest";
import { AUTHORITATIVE_DOMAIN_ALLOWLIST } from "../fixtures/api-responses";

const aviationRoutes = [
  ["weather", () => getWeatherRoute(new Request("http://localhost/api/weather?station=KJFK"))],
  ["notams", () => getNotamsRoute(new Request("http://localhost/api/notams?facility=KJFK"))],
  ["frequencies", () => getFrequenciesRoute(new Request("http://localhost/api/frequencies?airport=KJFK"))],
  ["plates", () => getPlatesRoute(new Request("http://localhost/api/plates?airport=KJFK"))],
  ["traffic", () => getTrafficRoute(new Request("http://localhost/api/traffic?airport=KJFK"))],
  ["search", () => getSearchRoute(new Request("http://localhost/api/search?q=FAR%2091.113"))],
  ["regulatory", () => getRegulatoryRoute(new Request("http://localhost/api/regulatory?q=light%20gun%20signals"))]
] as const;

const parseJson = async (response: Response) => (await response.json()) as Record<string, unknown>;

const isAllowedAuthoritativeHost = (url: string): boolean => {
  const host = new URL(url).hostname;
  return AUTHORITATIVE_DOMAIN_ALLOWLIST.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
};

beforeEach(() => {
  process.env.FAA_NOTAM_API_KEY = "test-notam-key";

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/data/metar")) {
        return new Response(JSON.stringify([{ icaoId: "KJFK", reportTime: "2026-06-18T05:00:00Z", rawOb: "METAR KJFK 180451Z 20006KT 10SM BKN011 OVC100 20/18 A2981 RMK AO2", wdir: 200, wspd: 6, visib: "10+", clouds: [{ cover: "BKN", base: 1100 }, { cover: "OVC", base: 10000 }], temp: 20, dewp: 18, altim: 1009.6, fltCat: "MVFR" }]), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("/api/data/taf")) {
        return new Response(JSON.stringify([{ icaoId: "KJFK", issueTime: "2026-06-18T04:15:00Z", rawTAF: "TAF KJFK 180415Z 1804/1906 16009KT P6SM BKN015", validTimeFrom: 1781755200, validTimeTo: 1781848800, fcsts: [{ timeFrom: 1781755200, timeTo: 1781784000, wdir: 160, wspd: 9, visib: "6+", clouds: [{ cover: "BKN", base: 1500 }] }] }]), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("/api/data/pirep")) {
        return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("external-api.faa.gov/notamapi/v1/notams")) {
        return new Response(JSON.stringify({ items: [{ notamNumber: "JFK 06/141", icaoId: "KJFK", notamClass: "D", effectiveDate: "2026-06-18T00:00:00Z", endDate: "2026-06-19T00:00:00Z", text: "TWY B closed.", entity: "TWY" }] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("nfdc.faa.gov/webContent/dtpp/current.xml")) {
        return new Response(`<?xml version="1.0" encoding="utf-8"?><digital_tpp cycle="2607"><state_code ID="NY"><city_name ID="NEW YORK"><airport_name ID="JOHN F KENNEDY INTL" apt_ident="JFK" icao_ident="KJFK"><record><chart_code>IAP</chart_code><chart_name>ILS OR LOC RWY 04L</chart_name><pdf_name>00001IAP.PDF</pdf_name></record></airport_name></city_name></state_code></digital_tpp>`, { status: 200, headers: { "Content-Type": "application/xml" } });
      }

      if (url.includes("opensky-network.org/api/states/all")) {
        return new Response(JSON.stringify({ time: 1781758441, states: [["a4b294", "RPA4660 ", "United States", 1781758248, 1781758248, -73.8705, 40.7754, null, true, 2.06, 210.94, null, null, null, "3636", false, 0]] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("ecfr.gov/api/search/v1/results")) {
        return new Response(JSON.stringify({ results: [{ starts_on: "2016-12-30", hierarchy: { title: "14", part: "91", section: "91.113" }, hierarchy_headings: { section: "§ 91.113" }, full_text_excerpt: "Right-of-way rules apply." }] }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      throw new Error(`Unexpected fetch URL in safety test: ${url}`);
    })
  );
});

describe("safety: no fabricated operational aviation data", () => {
  it("every aviation API response includes explicit source metadata and a fetched timestamp", async () => {
    // WHY: source + time are the minimum provenance signals needed to decide whether a result can be trusted operationally.
    const payloads = await Promise.all(aviationRoutes.map(([, invoke]) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(payload).toHaveProperty("source");
      expect(payload).toHaveProperty("fetchedAt");
    }
  });

  it("returns authoritative or locally seeded content without placeholder fabrications", async () => {
    // WHY: operational answers must either come from a real source or a clearly scoped authoritative seed, never from invented placeholder text.
    const payloads = await Promise.all(aviationRoutes.map(([, invoke]) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(payload.ok).toBe(true);
      expect(JSON.stringify(payload)).not.toMatch(/stub|placeholder|AUTO 00000KT|a1b2c3/i);
    }
  });

  it("never leaks internal LLM-classifier artifacts into aviation data responses", async () => {
    // WHY: intent-classifier metadata is not authoritative aviation data and must never masquerade as one.
    const payloads = await Promise.all(aviationRoutes.map(([, invoke]) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(JSON.stringify(payload.data)).not.toMatch(/llm-intent-classifier|internal:\/\/|Internal Intent Pattern Matcher/i);
    }
  });

  it("uses only real authoritative aviation domains for aviation response sources", async () => {
    // WHY: provenance is only meaningful when it points to a verifiable authority instead of an arbitrary or synthetic endpoint.
    const payloads = await Promise.all(aviationRoutes.map(([, invoke]) => invoke().then(parseJson)));

    for (const payload of payloads) {
      expect(isAllowedAuthoritativeHost((payload.source as { url: string }).url)).toBe(true);
    }
  });

  it("adds a staleness warning whenever a payload crosses its freshness threshold", () => {
    // WHY: stale operational data can be hazardous if the UI does not make the age explicit to the pilot or controller.
    const source = getDataSource("aviationWeather");
    const staleResponse = createApiResponse(
      {
        stationIcao: "KJFK",
        rawText: "fixture-only",
        source,
        fetchedAt: "2026-06-17T19:00:00.000Z",
        isStale: true
      },
      source,
      {
        fetchedAt: "2026-06-17T19:00:00.000Z",
        stalenessCategory: "metar"
      }
    );

    expect(staleResponse.isStale).toBe(true);
    expect(staleResponse.stalenessWarning).toContain("older than");
  });
});
