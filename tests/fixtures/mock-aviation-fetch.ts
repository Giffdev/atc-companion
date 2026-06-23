import { vi } from "vitest";

type MockKey = "metar" | "taf" | "pirep" | "notams" | "dtpp" | "opensky" | "ecfr" | "adsb-fi";
type MockOverride = Response | Error | (() => Response | Promise<Response>);

const jsonResponse = (payload: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });

const xmlResponse = (payload: string, init?: ResponseInit) =>
  new Response(payload, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
    ...init
  });

export const SAMPLE_METAR_PAYLOAD = [
  {
    icaoId: "KBFI",
    reportTime: "2026-06-18T05:00:00Z",
    rawOb: "METAR KBFI 180500Z 14006KT 10SM SCT020 BKN035 18/12 A2998 RMK AO2",
    wdir: 140,
    wspd: 6,
    visib: "10+",
    clouds: [
      { cover: "SCT", base: 2000 },
      { cover: "BKN", base: 3500 }
    ],
    temp: 18,
    dewp: 12,
    altim: 1015.2,
    fltCat: "VFR"
  }
];

export const SAMPLE_TAF_PAYLOAD = [
  {
    icaoId: "KBFI",
    issueTime: "2026-06-18T04:20:00Z",
    rawTAF: "TAF KBFI 180420Z 1806/1906 14007KT P6SM SCT025 BKN040 FM181800 18012KT P6SM SCT040",
    validTimeFrom: 1781762400,
    validTimeTo: 1781848800,
    fcsts: [
      {
        timeFrom: 1781762400,
        timeTo: 1781805600,
        wdir: 140,
        wspd: 7,
        visib: "6+",
        clouds: [
          { cover: "SCT", base: 2500 },
          { cover: "BKN", base: 4000 }
        ]
      },
      {
        timeFrom: 1781805600,
        timeTo: 1781848800,
        fcstChange: "FM",
        wdir: 180,
        wspd: 12,
        visib: "6+",
        clouds: [{ cover: "SCT", base: 4000 }]
      }
    ]
  }
];

export const SAMPLE_PIREP_PAYLOAD = [
  {
    receiptTime: "2026-06-18T04:42:00Z",
    icaoId: "KBFI",
    acType: "B738",
    lat: 47.58,
    lon: -122.33,
    fltLvl: 45,
    rawOb: "SEA UA /OV BFI/TM 0442/FL045/TP B738/SK SCT035/TB NEG/RM SMOOTH",
    wxString: "HZ",
    clouds: [{ cover: "SCT", base: 3500, top: 5000 }]
  }
];

export const SAMPLE_DTPP_XML = `<?xml version="1.0" encoding="utf-8"?>
<digital_tpp cycle="2607">
  <state_code ID="WA">
    <city_name ID="SEATTLE">
      <airport_name ID="BOEING FIELD/KING COUNTY INTL" apt_ident="BFI" icao_ident="KBFI">
        <record><chart_code>APD</chart_code><chart_name>AIRPORT DIAGRAM</chart_name><pdf_name>BFI_APD.PDF</pdf_name></record>
        <record><chart_code>IAP</chart_code><chart_name>ILS RWY 14R</chart_name><pdf_name>BFI_IAP_ILS14R.PDF</pdf_name></record>
        <record><chart_code>IAP</chart_code><chart_name>RNAV (GPS) RWY 32L</chart_name><pdf_name>BFI_IAP_RNAV32L.PDF</pdf_name></record>
        <record><chart_code>DP</chart_code><chart_name>HAROB SIX</chart_name><pdf_name>BFI_DP_HAROB6.PDF</pdf_name><faanfd18>HAROB.HAROB6</faanfd18></record>
      </airport_name>
    </city_name>
  </state_code>
  <state_code ID="NY">
    <city_name ID="NEW YORK">
      <airport_name ID="JOHN F KENNEDY INTL" apt_ident="JFK" icao_ident="KJFK">
        <record><chart_code>IAP</chart_code><chart_name>ILS OR LOC RWY 04L</chart_name><pdf_name>JFK_IAP_ILS04L.PDF</pdf_name></record>
      </airport_name>
    </city_name>
  </state_code>
</digital_tpp>`;

export const SAMPLE_OPENSKY_PAYLOAD = {
  time: 1781758441,
  states: [
    ["a4b294", "ASA123 ", "United States", 1781758248, 1781758248, -122.302, 47.533, null, false, 61.73, 141.2, 0, null, 914.4, "1200", false, 0],
    ["a80811", "DAL456 ", "United States", 1781758249, 1781758249, -122.295, 47.518, null, true, 15.43, 320.6, 0, null, 304.8, "4331", false, 0]
  ]
};

export const SAMPLE_ADSB_FI_PAYLOAD = {
  ac: [
    { hex: "a4b294", flight: "ASA123 ", lat: 47.533, lon: -122.302, alt_baro: 3000, gs: 120, track: 141, baro_rate: 0 },
    { hex: "a80811", flight: "DAL456 ", lat: 47.518, lon: -122.295, alt_baro: "ground", gs: 8, track: 321, baro_rate: 0 }
  ]
};

export const SAMPLE_NOTAMS_PAYLOAD = {
  items: [
    {
      notamNumber: "BFI 06/021",
      icaoId: "KBFI",
      notamClass: "D",
      effectiveDate: "2026-06-18T00:00:00Z",
      endDate: "2026-06-19T00:00:00Z",
      text: "TWY C CLSD BTN C3 AND C6.",
      entity: "TWY"
    }
  ]
};

export const SAMPLE_ECFR_PAYLOAD = {
  results: [
    {
      starts_on: "2016-12-30",
      hierarchy: { title: "14", part: "91", section: "91.113" },
      hierarchy_headings: { section: "§ 91.113" },
      full_text_excerpt: "Right-of-way rules apply."
    }
  ]
};

const buildDefaultResponse = (key: MockKey): Response => {
  switch (key) {
    case "metar":
      return jsonResponse(SAMPLE_METAR_PAYLOAD);
    case "taf":
      return jsonResponse(SAMPLE_TAF_PAYLOAD);
    case "pirep":
      return jsonResponse(SAMPLE_PIREP_PAYLOAD);
    case "notams":
      return jsonResponse(SAMPLE_NOTAMS_PAYLOAD);
    case "dtpp":
      return xmlResponse(SAMPLE_DTPP_XML);
    case "adsb-fi":
      return jsonResponse(SAMPLE_ADSB_FI_PAYLOAD);
    case "opensky":
      return jsonResponse(SAMPLE_OPENSKY_PAYLOAD);
    case "ecfr":
      return jsonResponse(SAMPLE_ECFR_PAYLOAD);
  }
};

const withRequestedStation = (url: string, payload: typeof SAMPLE_METAR_PAYLOAD[number]) => {
  const requestedStation = new URL(url).searchParams.get("ids") ?? new URL(url).searchParams.get("id");
  const stationIcao = requestedStation?.toUpperCase() ?? payload.icaoId;

  return {
    ...payload,
    icaoId: stationIcao,
    rawOb: payload.rawOb.replace(/\bKBFI\b/g, stationIcao)
  };
};

const withRequestedTafStation = (url: string, payload: typeof SAMPLE_TAF_PAYLOAD[number]) => {
  const requestedStation = new URL(url).searchParams.get("ids");
  const stationIcao = requestedStation?.toUpperCase() ?? payload.icaoId;

  return {
    ...payload,
    icaoId: stationIcao,
    rawTAF: payload.rawTAF.replace(/\bKBFI\b/g, stationIcao)
  };
};

const withRequestedPirepStation = (url: string, payload: typeof SAMPLE_PIREP_PAYLOAD[number]) => {
  const requestedStation = new URL(url).searchParams.get("id");
  const stationIcao = requestedStation?.toUpperCase() ?? payload.icaoId;

  return {
    ...payload,
    icaoId: stationIcao,
    rawOb: payload.rawOb.replace(/\bBFI\b/g, stationIcao.replace(/^K/, ""))
  };
};

const withRequestedNotamStation = (url: string) => {
  const requestedStation = new URL(url).searchParams.get("icaoId")?.toUpperCase() ?? "KBFI";
  return {
    items: SAMPLE_NOTAMS_PAYLOAD.items.map((item) => ({
      ...item,
      icaoId: requestedStation,
      notamNumber: `${requestedStation.replace(/^K/, "")} 06/021`,
      text: item.text.replace(/\bBFI\b/g, requestedStation.replace(/^K/, ""))
    }))
  };
};

const KEY_BY_URL: Array<[MockKey, string]> = [
  ["metar", "/api/data/metar"],
  ["taf", "/api/data/taf"],
  ["pirep", "/api/data/pirep"],
  ["notams", "external-api.faa.gov/notamapi/v1/notams"],
  ["dtpp", "nfdc.faa.gov/webContent/dtpp/current.xml"],
  ["adsb-fi", "opendata.adsb.fi/api/v2"],
  ["opensky", "opensky-network.org/api/states/all"],
  ["ecfr", "ecfr.gov/api/search/v1/results"]
];

export const installAviationApiMock = (overrides: Partial<Record<MockKey, MockOverride>> = {}) => {
  process.env.FAA_NOTAM_API_KEY = process.env.FAA_NOTAM_API_KEY ?? "test-notam-key";

  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const match = KEY_BY_URL.find(([, needle]) => url.includes(needle));

    if (!match) {
      throw new Error(`Unexpected fetch URL in test: ${url}`);
    }

    const [key] = match;
    const override = overrides[key];

    if (override instanceof Error) {
      throw override;
    }

    if (typeof override === "function") {
      return await override();
    }

    if (override) {
      return override;
    }

    if (key === "metar") {
      return jsonResponse([withRequestedStation(url, SAMPLE_METAR_PAYLOAD[0])]);
    }

    if (key === "taf") {
      return jsonResponse([withRequestedTafStation(url, SAMPLE_TAF_PAYLOAD[0])]);
    }

    if (key === "pirep") {
      return jsonResponse([withRequestedPirepStation(url, SAMPLE_PIREP_PAYLOAD[0])]);
    }

    if (key === "notams") {
      return jsonResponse(withRequestedNotamStation(url));
    }

    return buildDefaultResponse(key);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};
