import { GET as getAdjacentRoute } from "@/app/api/adjacent/route";
import { GET as getFrequenciesRoute } from "@/app/api/frequencies/route";
import { GET as getIntentRoute, POST as postIntentRoute } from "@/app/api/intent/route";
import { GET as getNotamsRoute } from "@/app/api/notams/route";
import { GET as getPlatesRoute } from "@/app/api/plates/route";
import { POST as postQueryRoute } from "@/app/api/query/route";
import { GET as getRegulatoryRoute } from "@/app/api/regulatory/route";
import { GET as getSearchRoute } from "@/app/api/search/route";
import { GET as getTrafficRoute } from "@/app/api/traffic/route";
import { GET as getWeatherRoute } from "@/app/api/weather/route";
import { beforeEach, vi } from "vitest";

const parseJson = async (response: Response) => (await response.json()) as Record<string, unknown>;

const mockExternalFetch = () => {
  process.env.FAA_NOTAM_CLIENT_ID = "test-notam-client-id";
  process.env.FAA_NOTAM_CLIENT_SECRET = "test-notam-client-secret";

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/data/metar")) {
        return new Response(
          JSON.stringify([
            {
              icaoId: "KJFK",
              reportTime: "2026-06-18T05:00:00Z",
              rawOb: "METAR KJFK 180451Z 20006KT 10SM BKN011 BKN050 OVC100 20/18 A2981 RMK AO2",
              wdir: 200,
              wspd: 6,
              visib: "10+",
              clouds: [
                { cover: "BKN", base: 1100 },
                { cover: "BKN", base: 5000 },
                { cover: "OVC", base: 10000 }
              ],
              temp: 20,
              dewp: 18.3,
              altim: 1009.6,
              fltCat: "MVFR"
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("/api/data/taf")) {
        return new Response(
          JSON.stringify([
            {
              icaoId: "KJFK",
              issueTime: "2026-06-18T04:15:00Z",
              rawTAF: "TAF KJFK 180415Z 1804/1906 16009KT P6SM BKN015 FM181200 18015G25KT P6SM VCSH BKN060",
              validTimeFrom: 1781755200,
              validTimeTo: 1781848800,
              fcsts: [
                {
                  timeFrom: 1781755200,
                  timeTo: 1781784000,
                  wdir: 160,
                  wspd: 9,
                  visib: "6+",
                  clouds: [{ cover: "BKN", base: 1500 }]
                },
                {
                  timeFrom: 1781784000,
                  timeTo: 1781794800,
                  fcstChange: "FM",
                  wdir: 180,
                  wspd: 15,
                  wgst: 25,
                  visib: "6+",
                  wxString: "VCSH",
                  clouds: [{ cover: "BKN", base: 6000 }]
                }
              ]
            }
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("/api/data/pirep")) {
        return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      if (url.includes("external-api.faa.gov/notamapi/v1/notams")) {
        return new Response(
          JSON.stringify({
            items: [
              {
                notamNumber: "FDC 4/2156",
                icaoId: "KJFK",
                notamClass: "FDC",
                effectiveDate: "2026-06-18T00:00:00Z",
                endDate: "2026-06-19T00:00:00Z",
                text: "ILS OR LOC RWY 04L amended.",
                reference: "ILS OR LOC RWY 04L"
              }
            ]
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("nfdc.faa.gov/webContent/dtpp/current.xml")) {
        return new Response(
          `<?xml version="1.0" encoding="utf-8"?><digital_tpp cycle="2607"><state_code ID="NY"><city_name ID="NEW YORK"><airport_name ID="JOHN F KENNEDY INTL" apt_ident="JFK" icao_ident="KJFK"><record><chart_code>IAP</chart_code><chart_name>ILS OR LOC RWY 04L</chart_name><pdf_name>00001IAP.PDF</pdf_name></record><record><chart_code>DP</chart_code><chart_name>DEEZZ FIVE</chart_name><pdf_name>00001DP.PDF</pdf_name><faanfd18>DEEZZ.DEEZZ5</faanfd18></record><record><chart_code>STR</chart_code><chart_name>CAMRN FIVE</chart_name><pdf_name>00001STR.PDF</pdf_name><faanfd18>CAMRN.CAMRN5</faanfd18></record></airport_name></city_name></state_code></digital_tpp>`,
          { status: 200, headers: { "Content-Type": "application/xml" } }
        );
      }

      if (url.includes("opensky-network.org/api/states/all")) {
        return new Response(
          JSON.stringify({
            time: 1781758441,
            states: [["a4b294", "RPA4660 ", "United States", 1781758248, 1781758248, -73.8705, 40.7754, null, true, 2.06, 210.94, null, null, null, "3636", false, 0]]
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("ecfr.gov/api/search/v1/results")) {
        return new Response(
          JSON.stringify({
            results: [
              {
                starts_on: "2016-12-30",
                hierarchy: { title: "14", part: "91", section: "91.113" },
                hierarchy_headings: { section: "§ 91.113" },
                full_text_excerpt: "The aircraft to the other's <strong>right</strong> has the right-of-way."
              }
            ]
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Unexpected fetch URL in integration test: ${url}`);
    })
  );
};

beforeEach(() => {
  mockExternalFetch();
});

describe("API route integration", () => {
  it("returns typed API envelopes for every GET route", async () => {
    const responses = await Promise.all([
      getWeatherRoute(new Request("http://localhost/api/weather?station=KJFK")),
      getNotamsRoute(new Request("http://localhost/api/notams?facility=KJFK")),
      getFrequenciesRoute(new Request("http://localhost/api/frequencies?airport=KJFK")),
      getPlatesRoute(new Request("http://localhost/api/plates?airport=KJFK")),
      getTrafficRoute(new Request("http://localhost/api/traffic?airport=KJFK")),
      getSearchRoute(new Request("http://localhost/api/search?q=FAR%2091.113")),
      getRegulatoryRoute(new Request("http://localhost/api/regulatory?q=squawk%207600")),
      getIntentRoute(new Request("http://localhost/api/intent?q=METAR%20KJFK")),
      postQueryRoute(
        new Request("http://localhost/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: "METAR KJFK" })
        })
      )
    ]);
    const payloads = await Promise.all(responses.map(parseJson));
    const standardPayloads = payloads.slice(0, 8);

    for (const payload of standardPayloads) {
      expect(payload).toHaveProperty("ok");
      expect(payload).toHaveProperty("source");
      expect(payload).toHaveProperty("attribution");
      expect(payload).toHaveProperty("fetchedAt");
      expect(payload).toHaveProperty("isStale");
    }

    expect(payloads[7]).toMatchObject({
      ok: true,
      data: expect.objectContaining({
        type: "weather",
        airport: "KJFK"
      })
    });

    expect(payloads[8]).toMatchObject({
      intent: expect.objectContaining({
        type: "weather",
        airport: "KJFK"
      }),
      response: expect.objectContaining({
        ok: true
      })
    });
  });

  it("returns adjacency data for center, approach, and tower facilities", async () => {
    const [centerResponse, approachResponse, towerResponse] = await Promise.all([
      getAdjacentRoute(new Request("http://localhost/api/adjacent?facility=ZSE")),
      getAdjacentRoute(new Request("http://localhost/api/adjacent?facility=S46")),
      getAdjacentRoute(new Request("http://localhost/api/adjacent?facility=KSEA-TWR"))
    ]);

    expect(centerResponse.status).toBe(200);
    const centerPayload = await parseJson(centerResponse);
    expect(centerPayload.ok).toBe(true);
    expect(centerPayload.data).toMatchObject({
      facility: { id: "ZSE", type: "center" },
      adjacentCenters: expect.arrayContaining([expect.objectContaining({ id: "ZOA" })])
    });

    expect(approachResponse.status).toBe(200);
    const approachPayload = await parseJson(approachResponse);
    expect(approachPayload.ok).toBe(true);
    expect(approachPayload.data).toMatchObject({
      facility: { id: "S46", type: "approach" },
      overlying: { id: "ZSE", type: "center" },
      adjacentApproach: expect.arrayContaining([expect.objectContaining({ id: "P80" })]),
      adjacentTowers: expect.arrayContaining([expect.objectContaining({ id: "KSEA-TWR" })])
    });

    expect(towerResponse.status).toBe(200);
    const towerPayload = await parseJson(towerResponse);
    expect(towerPayload.ok).toBe(true);
    expect(towerPayload.data).toMatchObject({
      facility: { id: "KSEA-TWR", type: "tower" },
      overlying: { id: "S46", type: "approach" },
      adjacentCenters: expect.arrayContaining([expect.objectContaining({ id: "ZSE" })]),
      adjacentApproach: [{ id: "S46", name: "Seattle Approach" }]
    });
  });

  it("returns a 404 envelope for unknown adjacent facilities", async () => {
    const response = await getAdjacentRoute(new Request("http://localhost/api/adjacent?facility=NOPE"));

    expect(response.status).toBe(404);
    await expect(parseJson(response)).resolves.toMatchObject({
      ok: false,
      data: null,
      error: expect.objectContaining({ code: "NOT_FOUND" })
    });
  });

  it("returns 400 errors when required query parameters are missing", async () => {
    const [adjacent, weather, notams, frequencies, plates, traffic, search, regulatory, intentGet, intentPost, queryPost] =
      await Promise.all([
      getAdjacentRoute(new Request("http://localhost/api/adjacent")),
      getWeatherRoute(new Request("http://localhost/api/weather")),
      getNotamsRoute(new Request("http://localhost/api/notams")),
      getFrequenciesRoute(new Request("http://localhost/api/frequencies")),
      getPlatesRoute(new Request("http://localhost/api/plates")),
      getTrafficRoute(new Request("http://localhost/api/traffic")),
      getSearchRoute(new Request("http://localhost/api/search")),
      getRegulatoryRoute(new Request("http://localhost/api/regulatory")),
      getIntentRoute(new Request("http://localhost/api/intent")),
      postIntentRoute(
        new Request("http://localhost/api/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        })
      ),
      postQueryRoute(
        new Request("http://localhost/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        })
      )
      ]);

    expect(adjacent.status).toBe(400);
    await expect(parseJson(adjacent)).resolves.toMatchObject({
      ok: false,
      data: null,
      error: expect.objectContaining({ code: "MISSING_REQUIRED_PARAMETER" })
    });

    for (const response of [weather, notams, frequencies, plates, traffic, search, regulatory, intentGet, intentPost]) {
      expect(response.status).toBe(400);
      const expectedCode = response === traffic ? "INVALID_PARAMETER" : "MISSING_REQUIRED_PARAMETER";
      await expect(parseJson(response)).resolves.toMatchObject({
        ok: false,
        error: expect.objectContaining({ code: expectedCode })
      });
    }

    expect(queryPost.status).toBe(400);
    await expect(parseJson(queryPost)).resolves.toMatchObject({
      response: {
        ok: false,
        error: expect.objectContaining({ code: "MISSING_REQUIRED_PARAMETER" })
      }
    });
  });

  it("adds rate limiting headers to every route response", async () => {
    const responses = await Promise.all([
      getWeatherRoute(new Request("http://localhost/api/weather?station=KJFK")),
      getIntentRoute(new Request("http://localhost/api/intent?q=METAR%20KJFK"))
    ]);

    for (const response of responses) {
      expect(response.headers.get("RateLimit-Limit")).toBe("60");
      expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
    }
  });

  it("includes source attribution for live traffic responses", async () => {
    const response = await getTrafficRoute(new Request("http://localhost/api/traffic?airport=KJFK"));
    const payload = await parseJson(response);

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      source: expect.objectContaining({
        url: expect.stringContaining("opensky-network.org")
      }),
      attribution: {
        primary: expect.objectContaining({
          url: expect.stringContaining("opensky-network.org")
        })
      }
    });
  });
});
