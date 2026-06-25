import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const COUNTRIES = ["US"] as const;
const EXCLUDED_TYPES = new Set(["closed", "heliport", "balloonport"]);
const AIRPORTS_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const RUNWAYS_URL = "https://davidmegginson.github.io/ourairports-data/runways.csv";
const FREQUENCIES_URL = "https://davidmegginson.github.io/ourairports-data/airport-frequencies.csv";
const OUTPUT_DIR = path.join(process.cwd(), "src", "data", "generated");
// Source data is OurAirports public-domain CSV. Keep local corrections explicit.
const RUNWAY_DESIGNATOR_OVERRIDES = new Map<string, string>([["38W:07/25", "08/26"]]);

interface RawAirport {
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  iso_country: string;
  iso_region: string;
  municipality: string;
  gps_code: string;
  iata_code: string;
  local_code: string;
  icao_code: string;
}

interface RawRunway {
  airport_ident: string;
  length_ft: string;
  width_ft: string;
  surface: string;
  lighted: string;
  le_ident: string;
  he_ident: string;
}

interface RawFrequency {
  airport_ident: string;
  type: string;
  description: string;
  frequency_mhz: string;
}

interface GeneratedAirport {
  ident: string;
  icao?: string;
  iata?: string;
  localCode?: string;
  gpsCode?: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  country: string;
  regionCode?: string;
  municipality?: string;
}

interface GeneratedRunway {
  designator: string;
  lengthFeet?: number;
  widthFeet?: number;
  surface?: string;
  lighting?: string;
  lit?: boolean;
}

interface GeneratedFrequency {
  type: string;
  description?: string;
  frequencyMHz: number;
}

const FREQUENCY_OVERRIDES = new Map<string, GeneratedFrequency[]>([
  ["38W", [{ type: "CTAF", description: "CTAF", frequencyMHz: 122.9 }]]
]);

const fetchCsv = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "atc-companion-airport-dataset-generator"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }

  return response.text();
};

const parseCsv = (csv: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows;
  if (!headers) {
    return [];
  }

  return dataRows.map((dataRow) => Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])));
};

const clean = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const parseNumber = (value: string | undefined): number | undefined => {
  const cleaned = clean(value);
  if (!cleaned) {
    return undefined;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const roundCoordinate = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid coordinate: ${value}`);
  }

  return Math.round(parsed * 100000) / 100000;
};

const buildRunwayDesignator = (runway: RawRunway): string | undefined => {
  const lowEnd = clean(runway.le_ident);
  const highEnd = clean(runway.he_ident);

  if (lowEnd && highEnd) {
    return `${lowEnd}/${highEnd}`;
  }

  return lowEnd ?? highEnd;
};

const toAirport = (raw: RawAirport): GeneratedAirport => {
  const ident = clean(raw.icao_code) ?? clean(raw.gps_code) ?? raw.ident.trim();
  const regionCode = clean(raw.iso_region)?.split("-")[1];

  return {
    ident,
    ...(clean(raw.icao_code) ? { icao: clean(raw.icao_code) } : {}),
    ...(clean(raw.iata_code) ? { iata: clean(raw.iata_code) } : {}),
    ...(clean(raw.local_code) ? { localCode: clean(raw.local_code) } : {}),
    ...(clean(raw.gps_code) ? { gpsCode: clean(raw.gps_code) } : {}),
    name: raw.name.trim(),
    type: raw.type.trim(),
    lat: roundCoordinate(raw.latitude_deg),
    lon: roundCoordinate(raw.longitude_deg),
    country: raw.iso_country.trim(),
    ...(regionCode ? { regionCode } : {}),
    ...(clean(raw.municipality) ? { municipality: clean(raw.municipality) } : {})
  };
};

const main = async (): Promise<void> => {
  const countryAllowlist = new Set<string>(COUNTRIES);
  const [airportsCsv, runwaysCsv, frequenciesCsv] = await Promise.all([
    fetchCsv(AIRPORTS_URL),
    fetchCsv(RUNWAYS_URL),
    fetchCsv(FREQUENCIES_URL)
  ]);
  const rawAirports = parseCsv(airportsCsv) as unknown as RawAirport[];
  const rawRunways = parseCsv(runwaysCsv) as unknown as RawRunway[];
  const rawFrequencies = parseCsv(frequenciesCsv) as unknown as RawFrequency[];

  const sourceIdentToGeneratedIdent = new Map<string, string>();
  const airports = rawAirports
    .filter((airport) => countryAllowlist.has(airport.iso_country))
    .filter((airport) => !EXCLUDED_TYPES.has(airport.type))
    .map((airport) => {
      const generated = toAirport(airport);
      sourceIdentToGeneratedIdent.set(airport.ident, generated.ident);
      return generated;
    })
    .sort((left, right) => left.ident.localeCompare(right.ident));
  const airportIdentSet = new Set(airports.map((airport) => airport.ident));

  const runwaysByAirport = rawRunways.reduce<Record<string, GeneratedRunway[]>>((accumulator, runway) => {
    const airportIdent = sourceIdentToGeneratedIdent.get(runway.airport_ident);
    const rawDesignator = buildRunwayDesignator(runway);
    const designator = rawDesignator
      ? RUNWAY_DESIGNATOR_OVERRIDES.get(`${runway.airport_ident}:${rawDesignator}`) ?? rawDesignator
      : undefined;

    if (!airportIdent || !designator) {
      return accumulator;
    }

    const lengthFeet = parseNumber(runway.length_ft);
    const widthFeet = parseNumber(runway.width_ft);
    const surface = clean(runway.surface);
    const lit = clean(runway.lighted) === "1";
    const generatedRunway: GeneratedRunway = {
      designator,
      ...(lengthFeet ? { lengthFeet } : {}),
      ...(widthFeet ? { widthFeet } : {}),
      ...(surface ? { surface } : {}),
      lighting: lit ? "lighted" : "unlighted",
      lit
    };

    accumulator[airportIdent] = [...(accumulator[airportIdent] ?? []), generatedRunway];
    return accumulator;
  }, {});

  const sortedRunwaysByAirport = Object.fromEntries(
    Object.entries(runwaysByAirport)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([airportIdent, runways]) => [
        airportIdent,
        runways.sort((left, right) => left.designator.localeCompare(right.designator))
      ])
  );

  const frequenciesByAirport = rawFrequencies.reduce<Record<string, GeneratedFrequency[]>>((accumulator, frequency) => {
    const airportIdent = sourceIdentToGeneratedIdent.get(frequency.airport_ident);
    const type = clean(frequency.type);
    const frequencyMHz = parseNumber(frequency.frequency_mhz);

    if (!airportIdent || !type || frequencyMHz === undefined) {
      return accumulator;
    }

    const description = clean(frequency.description);
    const generatedFrequency: GeneratedFrequency = {
      type,
      ...(description ? { description } : {}),
      frequencyMHz
    };

    accumulator[airportIdent] = [...(accumulator[airportIdent] ?? []), generatedFrequency];
    return accumulator;
  }, {});

  for (const [airportIdent, overrides] of FREQUENCY_OVERRIDES) {
    if (!airportIdentSet.has(airportIdent)) {
      continue;
    }

    const existingFrequencies = frequenciesByAirport[airportIdent] ?? [];
    const missingOverrides = overrides.filter(
      (override) =>
        !existingFrequencies.some(
          (frequency) =>
            frequency.type === override.type &&
            frequency.frequencyMHz === override.frequencyMHz &&
            frequency.description === override.description
        )
    );

    if (missingOverrides.length > 0) {
      frequenciesByAirport[airportIdent] = [...existingFrequencies, ...missingOverrides];
    }
  }

  const sortedFrequenciesByAirport = Object.fromEntries(
    Object.entries(frequenciesByAirport)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([airportIdent, frequencies]) => [
        airportIdent,
        frequencies.sort(
          (left, right) =>
            left.type.localeCompare(right.type) ||
            left.frequencyMHz - right.frequencyMHz ||
            (left.description ?? "").localeCompare(right.description ?? "")
        )
      ])
  );

  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(OUTPUT_DIR, "us-airports.json"), JSON.stringify(airports), "utf8"),
    writeFile(path.join(OUTPUT_DIR, "us-runways.json"), JSON.stringify(sortedRunwaysByAirport), "utf8"),
    writeFile(path.join(OUTPUT_DIR, "us-frequencies.json"), JSON.stringify(sortedFrequenciesByAirport), "utf8")
  ]);

  const runwayCount = Object.values(sortedRunwaysByAirport).reduce((sum, runways) => sum + runways.length, 0);
  const frequencyCount = Object.values(sortedFrequenciesByAirport).reduce((sum, frequencies) => sum + frequencies.length, 0);
  console.log(
    `Generated ${airports.length} US airports, ${runwayCount} runways, and ${frequencyCount} frequencies from OurAirports public-domain CSVs plus local corrections.`
  );
};

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
