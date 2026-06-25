import { fetchAirportFromNfdc } from "@/data/airports";
import { parseAirportHoursFromHtml } from "@/services/airport-hours";
import { appCache } from "@/lib/cache";
import { parseIntent } from "@/ai/intent-parser";
import { executeQuery, type AirportInfoQueryPayload } from "@/services/orchestrator";
import { getFrequencies } from "@/services/frequencies";
import { getAirportRunways, parseRunwaysFromHtml } from "@/services/runway-info";
import { afterEach, describe, expect, it, vi } from "vitest";

type AirportFixture = {
  airportId: string;
  icao: string;
  name: string;
  timezone: string;
  tzInfo: {
    abbreviation: string;
    utcOffset: string;
    isDst: boolean;
  };
};

const fixtures: Record<string, AirportFixture> = {
  KSEA: {
    airportId: "SEA",
    icao: "KSEA",
    name: "Seattle-Tacoma Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  KGSO: {
    airportId: "GSO",
    icao: "KGSO",
    name: "Piedmont Triad Intl",
    timezone: "America/New_York",
    tzInfo: { abbreviation: "ET", utcOffset: "UTC-4", isDst: true }
  },
  KSHN: {
    airportId: "SHN",
    icao: "KSHN",
    name: "Sanderson Field",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  KMCI: {
    airportId: "MCI",
    icao: "KMCI",
    name: "Kansas City Intl",
    timezone: "America/Chicago",
    tzInfo: { abbreviation: "CT", utcOffset: "UTC-5", isDst: true }
  },
  KPAE: {
    airportId: "PAE",
    icao: "KPAE",
    name: "Seattle Paine Field Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  "0S9": {
    airportId: "0S9",
    icao: "0S9",
    name: "Jefferson County Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  }
};

const runwayHtml = `
  <html>
    <body>
      <div id="runway_05_23">
        <h3>RUNWAY 05/23</h3>
        <table>
          <tr><td>Dimensions</td><td>9,000 ft. x 150 ft.</td></tr>
          <tr><td>Surface Type</td><td>Asphalt</td></tr>
          <tr><td>Runway Edge Lights</td><td>Medium Intensity Runway Lights</td></tr>
        </table>
      </div>
      <div id="runway_14_32">
        <h3>RUNWAY 14/32</h3>
        <table>
          <tr><td>Dimensions</td><td>6,380 X 100</td></tr>
          <tr><td>Surface</td><td>Concrete</td></tr>
          <tr><td>Edge Lights</td><td>HIRL</td></tr>
        </table>
      </div>
    </body>
  </html>
`;

const paeLikeRunwayHtml = `
  <html>
    <body>
      <div id="runway_16L_34R">
        <h3>RUNWAY 16L/34R</h3>
        <table>
          <tr><td>Dimensions</td><td>3,004 ft. x 75 ft.</td></tr>
          <tr><td>Surface Type</td><td>ASPH</td></tr>
          <tr><td>Runway Edge Lights</td><td>Medium Intensity</td></tr>
        </table>
      </div>
      <div id="runway_16R_34L">
        <h3>RUNWAY 16R/34L</h3>
        <table>
          <tr><td>Dimensions</td><td>9,010 ft. x 150 ft.</td></tr>
          <tr><td>Surface Type</td><td>ASPH-CONC FIRST 1000 FT RWY 16R CONC.</td></tr>
          <tr><td>Runway Edge Lights</td><td>High Intensity</td></tr>
        </table>
      </div>
    </body>
  </html>
`;


const smallAirportNfdcHtml = `
  <html>
    <head><title>FORKS</title></head>
    <body>
      <div>FAA Identifier 38W</div>
      <div class="tab-pane active" id="summary">
        <table>
          <tr><td>Latitude/Longitude</td><td>47-56-15.786 N / 124-23-45.314 W</td></tr>
          <tr><td>From city</td><td>1 miles SW of FORKS, WA</td></tr>
        </table>
      </div>
      <a href="#runway_04_22">RWY&nbsp;04/22</a>
      <div class="tab-pane" id="runway_04_22">
        <div class="well well-sm"><span>RUNWAY 04/22</span></div>
        <table>
          <tr><td>Dimensions</td><td>2400 ft. x 75 ft.</td></tr>
          <tr><td>Surface Type</td><td>ASPH</td></tr>
          <tr><td>Runway Edge Lights</td><td>Medium Intensity</td></tr>
        </table>
      </div>
    </body>
  </html>
`;

const noRunwayAirportNfdcHtml = `
  <html>
    <head><title>Aero B Ranch Airport</title></head>
    <body>
      <div>FAA Identifier 00AA</div>
      <div class="tab-pane active" id="summary">
        <table>
          <tr><td>Latitude/Longitude</td><td>38-42-16.000 N / 101-28-23.000 W</td></tr>
          <tr><td>From city</td><td>3 miles SW of LEOTI, KS</td></tr>
        </table>
      </div>
      <div>No runway records available.</div>
    </body>
  </html>
`;

afterEach(() => {
  appCache.clear();
  vi.restoreAllMocks();
});

const airportHoursHtml = `
  <html>
    <body>
      <table>
        <tr><td>Airport Use</td><td>Public</td></tr>
        <tr><td>Attendance</td><td>Continuous</td></tr>
        <tr><td>Lighting Schedule</td><td>DUSK-DAWN</td></tr>
        <tr><td>Control Tower</td><td>ATCT</td></tr>
        <tr><td>ATCT Hours</td><td>0700-2100 LOCAL</td></tr>
      </table>
      <div id="communications">PAINE TOWER (ATCT) 120.2</div>
    </body>
  </html>
`;

describe("parseRunwaysFromHtml", () => {
  it("parses runway designators, dimensions, surfaces, and lighting from NFDC-style sections", () => {
    expect(parseRunwaysFromHtml(runwayHtml)).toEqual([
      {
        designator: "05/23",
        lengthFeet: 9000,
        widthFeet: 150,
        surface: "ASPH",
        lighting: "MIRL"
      },
      {
        designator: "14/32",
        lengthFeet: 6380,
        widthFeet: 100,
        surface: "CONC",
        lighting: "HIRL"
      }
    ]);
  });

  it("returns an empty list when no runway sections or fallback text are present", () => {
    expect(parseRunwaysFromHtml("<html><body>No runway records available.</body></html>")).toEqual([]);
    expect(parseRunwaysFromHtml("")).toEqual([]);
  });

  it("keeps all valid physical runways for PAE-like parallel runway sections", () => {
    expect(parseRunwaysFromHtml(paeLikeRunwayHtml)).toEqual([
      {
        designator: "16L/34R",
        lengthFeet: 3004,
        widthFeet: 75,
        surface: "ASPH",
        lighting: "MIRL"
      },
      {
        designator: "16R/34L",
        lengthFeet: 9010,
        widthFeet: 150,
        surface: "ASPH",
        lighting: "HIRL"
      }
    ]);
  });

  it("parses a small-airport NFDC page with local identifier runway data", () => {
    expect(parseRunwaysFromHtml(smallAirportNfdcHtml)).toEqual([
      {
        designator: "04/22",
        lengthFeet: 2400,
        widthFeet: 75,
        surface: "ASPH",
        lighting: "MIRL"
      }
    ]);
  });

  it("resolves unknown FAA local identifiers through NFDC and caches name, coordinates, and runways", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(smallAirportNfdcHtml));

    const airport = await fetchAirportFromNfdc("S18");

    expect(airport).toMatchObject({
      icao: "S18",
      faa: "S18",
      name: "FORKS",
      city: "FORKS",
      state: "WA",
      runways: ["04/22"]
    });
    expect(airport?.latitude).toBeCloseTo(47.9377, 3);
    expect(airport?.longitude).toBeCloseTo(-124.3959, 3);
  });

  it("loads runways from NFDC for static small airports missing curated runway data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(smallAirportNfdcHtml));

    const result = await getAirportRunways("38W");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.airportName).toBe("Lynden Airport");
    expect(result.data.runways.map((runway) => runway.designator)).toEqual(["04/22"]);
  });

  it("falls back to OurAirports runways for local identifiers when NFDC is unavailable", async () => {
    const result = await getAirportRunways("38W");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.source).toBe("OurAirports community dataset");
    expect(result.data.runways).toEqual([
      {
        designator: "08/26",
        lengthFeet: 2425,
        widthFeet: 40,
        surface: "ASPH-G",
        lighting: "lighted"
      }
    ]);
  });

  it("uses curated KPAE runways instead of stale OurAirports 11/29 when NFDC is unavailable", async () => {
    appCache.clear();
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("Force NFDC fallback for KPAE runway precedence");
    }));

    const result = await getAirportRunways("KPAE");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.source).toBe("Curated airport reference data");
    expect(result.source.name).toBe("Curated airport reference data");
    expect(result.data.runways.map((runway) => runway.designator)).toEqual(["16L/34R", "16R/34L"]);
    expect(result.data.runways.map((runway) => runway.designator)).not.toContain("11/29");
  });

  it("uses curated runway references generically before differing OurAirports fallback rows", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("Force NFDC fallback for curated runway precedence");
    }));

    const result = await getAirportRunways("KSEA");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.source).toBe("Curated airport reference data");
    expect(result.data.runways.map((runway) => runway.designator)).toEqual(["16C/34C", "16L/34R", "16R/34L"]);
    expect(result.data.runways.map((runway) => runway.designator)).not.toContain("lower/high");
  });

  it("keeps FAA Chart Supplement wording for a US runway data gap", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(noRunwayAirportNfdcHtml)));

    const result = await getAirportRunways("00AA");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("RUNWAY_DATA_UNAVAILABLE");
    expect(result.error.message).toBe(
      "Runway data could not be loaded for 00AA. Verify runway configuration using the official FAA Chart Supplement link."
    );
    expect(result.error.details).toBe(
      "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=00AA"
    );
  });

  it("returns Canadian OurAirports runway rows for CYVR without querying FAA NFDC", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Canadian dataset runways should not query FAA NFDC");
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAirportRunways("CYVR");

    expect(result.ok).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    if (!result.ok) return;
    expect(result.data.source).toBe("OurAirports community dataset");
    expect(result.data.runways).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ designator: "08L/26R", lengthFeet: 9940, widthFeet: 200 }),
        expect.objectContaining({ designator: "08R/26L", lengthFeet: 11500, widthFeet: 200 }),
        expect.objectContaining({ designator: "13/31", lengthFeet: 7300, widthFeet: 200 })
      ])
    );
    expect(result.error).toBeUndefined();
  });

  it("uses NAV CANADA wording for a Canadian runway data gap", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("Canadian dataset gaps should not query FAA NFDC");
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAirportRunways("CAA4");

    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    if (result.ok) return;
    expect(result.error.code).toBe("RUNWAY_DATA_UNAVAILABLE");
    expect(result.error.message).toBe(
      "Runway data could not be loaded for CAA4. Verify runway configuration in official Canadian aeronautical publications or with NAV CANADA."
    );
    expect(result.error.details).toBe(
      "Available sources returned no runway records. Verify runway configuration in official Canadian aeronautical publications or with NAV CANADA."
    );
    expect(result.error.message).not.toMatch(/FAA|NFDC|Chart Supplement/);
    expect(result.error.details).not.toMatch(/FAA|NFDC|Chart Supplement/);
    expect(result.source.id).toBe("ourairports-community-dataset");
  });
});

describe("OurAirports service fallbacks", () => {
  it("falls back to dataset frequencies for 38W", async () => {
    const result = await getFrequencies("38W");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.name).toBe("OurAirports community dataset");
    expect(result.data).toEqual([
      expect.objectContaining({
        type: "CTAF",
        valueMHz: 122.9,
        name: "CTAF"
      })
    ]);
  });

  it("does not override local FAA-seed frequencies for seeded airports", async () => {
    const result = await getFrequencies("KSEA");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.name).not.toBe("OurAirports community dataset");
    expect(result.source.id).toBe("faa-nasr");
    expect(result.data.length).toBeGreaterThan(0);
  });

  it("keeps curated airport info precedence for airports also present in the dataset", async () => {
    const result = await executeQuery({
      type: "airport_info",
      airport: "S18",
      detail: "all",
      confidence: 1,
      rawInput: "airport info S18",
      parsedAt: new Date().toISOString(),
      source: { id: "test", name: "test", url: "test://intent", reliability: "high", refresh_interval: "never" },
      entities: [],
      requiresClarification: false
    });

    expect(result.response.ok).toBe(true);
    if (!result.response.ok) return;
    const data = result.response.data as AirportInfoQueryPayload;
    expect(data.airport).toBe("S18");
    expect(data.airportName).toBe("FORKS");
    expect(data.airportName).not.toBe("Forks Airport");
  });

  it("resolves 38W and S18 airport info with fallback-backed services", async () => {
    const [lynden, forks] = await Promise.all([
      executeQuery({
        type: "airport_info",
        airport: "38W",
        detail: "all",
        confidence: 1,
        rawInput: "airport info 38W",
        parsedAt: new Date().toISOString(),
        source: { id: "test", name: "test", url: "test://intent", reliability: "high", refresh_interval: "never" },
        entities: [],
        requiresClarification: false
      }),
      executeQuery({
        type: "airport_info",
        airport: "S18",
        detail: "all",
        confidence: 1,
        rawInput: "airport info S18",
        parsedAt: new Date().toISOString(),
        source: { id: "test", name: "test", url: "test://intent", reliability: "high", refresh_interval: "never" },
        entities: [],
        requiresClarification: false
      })
    ]);

    expect(lynden.response.ok).toBe(true);
    expect(forks.response.ok).toBe(true);
    if (!lynden.response.ok || !forks.response.ok) return;
    expect((lynden.response.data as AirportInfoQueryPayload).airportName).toBe("Lynden Airport");
    expect((forks.response.data as AirportInfoQueryPayload).airportName).toBe("FORKS");
  });

  it("resolves Forks, WA city queries to S18 rather than KKLS", async () => {
    const [abbrIntent, fullIntent] = await Promise.all([
      parseIntent("Forks, WA"),
      parseIntent("Forks, Washington")
    ]);
    const [abbrResult, fullResult] = await Promise.all([
      executeQuery(abbrIntent),
      executeQuery(fullIntent)
    ]);

    expect(abbrResult.intent).toMatchObject({ type: "airport_info", airport: "S18" });
    expect(fullResult.intent).toMatchObject({ type: "airport_info", airport: "S18" });
    expect("airport" in abbrResult.intent ? abbrResult.intent.airport : undefined).not.toBe("KKLS");
    expect("airport" in fullResult.intent ? fullResult.intent.airport : undefined).not.toBe("KKLS");
  });

  it("handles bare city text gracefully when no region code is provided", async () => {
    const intent = await parseIntent("Forks");
    const result = await executeQuery(intent);

    expect(result.response.ok).toBe(false);
    if (result.response.ok) return;
    expect(result.response.error.code).toBe("CLARIFICATION_REQUIRED");
  });
});

describe("parseAirportHoursFromHtml", () => {
  it("parses tower hours, schedules, timezone metadata, and airport fields", () => {
    const fixture = fixtures.KPAE;

    expect(
      parseAirportHoursFromHtml(
        airportHoursHtml,
        fixture.icao,
        fixture.name,
        fixture.timezone,
        fixture.tzInfo
      )
    ).toMatchObject({
      airportIcao: "KPAE",
      airportName: "Seattle Paine Field Intl",
      towerHours: "0700-2100 LOCAL",
      towerSchedule: {
        openLocal: "0700",
        closeLocal: "2100",
        is24Hour: false,
        rawText: "0700-2100 LOCAL"
      },
      timezone: {
        iana: "America/Los_Angeles",
        abbreviation: "PT",
        utcOffset: "UTC-7",
        isDst: true
      },
      isTowered: true,
      airportUse: "Public",
      attendanceSchedule: "Continuous",
      lightingSchedule: "DUSK-DAWN",
      rawChartSupplement: null,
      source: "FAA NFDC Airport Display"
    });
  });

  it("gracefully returns null parser fields for empty or unstructured airport HTML", () => {
    const fixture = fixtures["0S9"];

    expect(
      parseAirportHoursFromHtml("", fixture.icao, fixture.name, fixture.timezone, fixture.tzInfo)
    ).toMatchObject({
      airportIcao: "0S9",
      airportName: "Jefferson County Intl",
      towerHours: null,
      towerSchedule: null,
      timezone: {
        iana: "America/Los_Angeles",
        abbreviation: "PT",
        utcOffset: "UTC-7",
        isDst: true
      },
      isTowered: null,
      airportUse: null,
      attendanceSchedule: null,
      lightingSchedule: null,
      rawChartSupplement: null,
      source: "FAA NFDC Airport Display"
    });
  });
});
