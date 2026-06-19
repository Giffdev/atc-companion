import { parseAirportHoursFromHtml } from "@/services/airport-hours";

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

const fixtures: AirportFixture[] = [
  {
    airportId: "ABR",
    icao: "KABR",
    name: "Aberdeen Regional Airport",
    timezone: "America/Chicago",
    tzInfo: { abbreviation: "CT", utcOffset: "UTC-5", isDst: true }
  },
  {
    airportId: "SEA",
    icao: "KSEA",
    name: "Seattle-Tacoma Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  {
    airportId: "MCI",
    icao: "KMCI",
    name: "Kansas City Intl",
    timezone: "America/Chicago",
    tzInfo: { abbreviation: "CT", utcOffset: "UTC-5", isDst: true }
  },
  {
    airportId: "PAE",
    icao: "KPAE",
    name: "Seattle Paine Field Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  {
    airportId: "0S9",
    icao: "0S9",
    name: "Jefferson County Intl",
    timezone: "America/Los_Angeles",
    tzInfo: { abbreviation: "PT", utcOffset: "UTC-7", isDst: true }
  },
  {
    airportId: "GSO",
    icao: "KGSO",
    name: "Piedmont Triad Intl",
    timezone: "America/New_York",
    tzInfo: { abbreviation: "ET", utcOffset: "UTC-4", isDst: true }
  }
];

const INVALID_TOWER_HOURS_WORDS = /\b(?:Apch|App|Approach|Dep|Departure|GND|Ground|DEL|Delivery|ATIS|CTAF)\b/i;
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
      "user-agent": "atc-companion-hours-parser-check"
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

const run = async () => {
  for (const fixture of fixtures) {
    console.log(`Fetching ${fixture.icao} (${fixture.airportId})...`);
    const html = await fetchNfdcHtml(fixture.airportId);
    const hours = parseAirportHoursFromHtml(html, fixture.icao, fixture.name, fixture.timezone, fixture.tzInfo);
    const schedule = hours.towerSchedule
      ? `${hours.towerSchedule.openLocal}-${hours.towerSchedule.closeLocal} local / ${hours.towerSchedule.openZulu}-${hours.towerSchedule.closeZulu} zulu`
      : "null";

    console.log(`${fixture.icao}: towered=${String(hours.isTowered)} towerHours=${hours.towerHours ?? "null"} schedule=${schedule}`);

    assertCondition(
      !hours.towerHours || !INVALID_TOWER_HOURS_WORDS.test(hours.towerHours),
      `${fixture.icao} tower hours do not contain frequency labels`
    );

    if (fixture.icao === "KABR") {
      assertCondition(hours.isTowered === true, "KABR is detected as towered");
    }

    if (fixture.icao === "KSEA") {
      assertCondition(hours.isTowered === true, "KSEA is detected as towered");
    }

    if (fixture.icao === "KMCI") {
      assertCondition(hours.isTowered === true, "KMCI is detected as towered");
    }

    if (fixture.icao === "0S9") {
      assertCondition(hours.isTowered === false, "0S9 is detected as non-towered");
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} assertion(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll hours parser checks passed.");
};

run().catch((error) => {
  console.error("Hours parser check failed:", error);
  process.exitCode = 1;
});
