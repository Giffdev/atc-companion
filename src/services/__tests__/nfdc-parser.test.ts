import { parseAirportHoursFromHtml } from "@/services/airport-hours";
import { parseRunwaysFromHtml } from "@/services/runway-info";
import { describe, expect, it } from "vitest";

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
