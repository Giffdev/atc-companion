import assert from "node:assert/strict";

import { parseRunwaysFromHtml } from "../src/services/runway-info";

const AIRPORT_IDS = ["MCI", "SEA", "BFI", "SHN", "GSO"] as const;
const RATE_LIMIT_MESSAGE = "This page is limited to 1 request per second";
const REQUEST_DELAY_MS = 1250;

let lastFetchMs = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAirportHtml = async (airportId: string): Promise<string> => {
  const elapsed = Date.now() - lastFetchMs;
  if (elapsed < REQUEST_DELAY_MS) {
    await sleep(REQUEST_DELAY_MS - elapsed);
  }

  const response = await fetch(
    `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${airportId}`,
    {
      headers: {
        "user-agent": "atc-companion-runway-parser-check"
      }
    }
  );

  const html = await response.text();
  lastFetchMs = Date.now();

  if (html.includes(RATE_LIMIT_MESSAGE)) {
    await sleep(REQUEST_DELAY_MS);
    return fetchAirportHtml(airportId);
  }

  assert.equal(response.ok, true, `FAA NFDC fetch failed for ${airportId}: HTTP ${response.status}`);
  return html;
};

const run = async () => {
  for (const airportId of AIRPORT_IDS) {
    const html = await fetchAirportHtml(airportId);
    const runways = parseRunwaysFromHtml(html);

    console.log(
      `${airportId}: ${runways.length} runway(s) -> ${runways.map((runway) => (
        `${runway.designator} ${runway.lengthFeet ?? "?"}x${runway.widthFeet ?? "?"} ${runway.surface ?? "?"} ${runway.lighting ?? "?"}`
      )).join(" | ")}`
    );

    assert.ok(runways.length >= 1, `${airportId} should parse at least one runway`);
  }

  console.log("Runway parser live check passed.");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
