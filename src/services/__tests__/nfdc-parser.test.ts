import { parseAirportHoursFromHtml } from "@/services/airport-hours";
import { parseRunwaysFromHtml } from "@/services/runway-info";

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

const requestedOrder = ["KSEA", "KGSO", "KSHN", "KMCI", "KPAE", "0S9"] as const;
const failures: string[] = [];
let lastFetchMs = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const assertCondition = (condition: unknown, message: string) => {
  if (condition) {
    console.log(`PASS ${message}`);
    return;
  }

  console.error(`FAIL ${message}`);
  failures.push(message);
};

const fetchNfdcHtml = async (airportId: string): Promise<string> => {
  const elapsed = Date.now() - lastFetchMs;
  if (elapsed < 1250) {
    await sleep(1250 - elapsed);
  }

  const url = `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${airportId}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "atc-companion-parser-test"
    }
  });

  const html = await response.text();
  lastFetchMs = Date.now();

  if (html.includes("This page is limited to 1 request per second")) {
    await sleep(1500);
    return fetchNfdcHtml(airportId);
  }

  if (!response.ok || !html.includes("RUNWAY")) {
    throw new Error(`FAA NFDC fetch failed for ${airportId}: HTTP ${response.status}`);
  }

  return html;
};

const htmlByAirport = new Map<string, string>();

const run = async () => {
  for (const code of requestedOrder) {
    const fixture = fixtures[code];
    console.log(`Fetching ${code} (${fixture.airportId})...`);
    htmlByAirport.set(code, await fetchNfdcHtml(fixture.airportId));
  }

  const gsoRunways = parseRunwaysFromHtml(htmlByAirport.get("KGSO") ?? "");
  assertCondition(gsoRunways.length === 3, "KGSO returns exactly 3 runways");
  assertCondition(
    [9000, 10001, 6380].every((length) => gsoRunways.some((runway) => runway.lengthFeet === length)),
    "KGSO includes runway lengths 9000, 10001, and 6380"
  );
  assertCondition(
    gsoRunways.every((runway) => runway.widthFeet !== null && runway.surface !== null && runway.lighting !== null),
    "KGSO runways include width, surface, and lighting"
  );

  const seaRunways = parseRunwaysFromHtml(htmlByAirport.get("KSEA") ?? "");
  assertCondition(
    ["16L/34R", "16C/34C", "16R/34L"].every((designator) => seaRunways.some((runway) => runway.designator === designator)),
    "KSEA includes runways 16L/34R, 16C/34C, and 16R/34L"
  );

  const shnRunways = parseRunwaysFromHtml(htmlByAirport.get("KSHN") ?? "");
  assertCondition(shnRunways.length >= 1, "KSHN returns at least one runway");

  const kmciFixture = fixtures.KMCI;
  const kmciHours = parseAirportHoursFromHtml(
    htmlByAirport.get("KMCI") ?? "",
    kmciFixture.icao,
    kmciFixture.name,
    kmciFixture.timezone,
    kmciFixture.tzInfo
  );
  assertCondition(kmciHours.isTowered === true, "KMCI is detected as towered");
  assertCondition(/24\s*hours?/i.test(kmciHours.towerHours ?? ""), "KMCI tower hours indicate 24-hour operation");

  const kpaeFixture = fixtures.KPAE;
  const kpaeHours = parseAirportHoursFromHtml(
    htmlByAirport.get("KPAE") ?? "",
    kpaeFixture.icao,
    kpaeFixture.name,
    kpaeFixture.timezone,
    kpaeFixture.tzInfo
  );
  assertCondition(kpaeHours.isTowered === true, "KPAE is detected as towered");
  assertCondition(/0700\s*[-–]\s*2100/i.test(kpaeHours.towerHours ?? ""), "KPAE tower hours include 0700-2100");

  const zeroS9Fixture = fixtures["0S9"];
  const zeroS9Hours = parseAirportHoursFromHtml(
    htmlByAirport.get("0S9") ?? "",
    zeroS9Fixture.icao,
    zeroS9Fixture.name,
    zeroS9Fixture.timezone,
    zeroS9Fixture.tzInfo
  );
  assertCondition(zeroS9Hours.isTowered === false, "0S9 is detected as non-towered");

  if (failures.length > 0) {
    console.error(`\n${failures.length} assertion(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll NFDC parser checks passed.");
};

run().catch((error) => {
  console.error("NFDC parser test failed:", error);
  process.exitCode = 1;
});
