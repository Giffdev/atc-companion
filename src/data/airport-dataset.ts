import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

// Generated at build/dev time from OurAirports public-domain CSVs; not FAA-authoritative.
export interface DatasetRunway {
  designator: string;
  lengthFeet?: number;
  widthFeet?: number;
  surface?: string;
  lighting?: string;
  lit?: boolean;
}

export interface DatasetFrequency {
  type: string;
  description?: string;
  frequencyMHz: number;
}

export interface DatasetAirport {
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
  runways: DatasetRunway[];
}

type AirportRecord = Omit<DatasetAirport, "runways">;
type RunwayRecord = Record<string, DatasetRunway[]>;
type FrequencyRecord = Record<string, DatasetFrequency[]>;
type AirportCodeKind = "ident" | "icao" | "gpsCode" | "iata" | "localCode";

const GENERATED_DATA_DIR = path.join(process.cwd(), "src", "data", "generated");
const DATASET_PREFIXES = ["us", "ca", "mx", "carib"] as const;
const AIRPORT_CODE_PRIORITY: Record<AirportCodeKind, number> = {
  localCode: 1,
  iata: 2,
  gpsCode: 3,
  icao: 4,
  ident: 5
};

const readGeneratedJson = <T>(fileName: string): T => {
  const filePath = path.join(GENERATED_DATA_DIR, fileName);
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
};

const normalizeCode = (code: string): string => code.trim().replace(/\s+/g, "").toUpperCase();
const normalizeCity = (city: string): string => city.trim().replace(/\s+/g, " ").toLowerCase();
const normalizeRegionCode = (regionCode: string): string => regionCode.trim().toUpperCase();
const cityRegionKey = (city: string, regionCode: string): string => `${normalizeCity(city)}|${normalizeRegionCode(regionCode)}`;

const airportRecords = DATASET_PREFIXES.flatMap((prefix) => readGeneratedJson<AirportRecord[]>(`${prefix}-airports.json`));
const runwayRecords = DATASET_PREFIXES.reduce<RunwayRecord>(
  (records, prefix) => ({ ...records, ...readGeneratedJson<RunwayRecord>(`${prefix}-runways.json`) }),
  {}
);
const frequencyRecords = DATASET_PREFIXES.reduce<FrequencyRecord>(
  (records, prefix) => ({ ...records, ...readGeneratedJson<FrequencyRecord>(`${prefix}-frequencies.json`) }),
  {}
);

const airports = airportRecords.map<DatasetAirport>((airport) => ({
  ...airport,
  runways: runwayRecords[airport.ident] ?? []
}));

const airportByIdent = new Map<string, DatasetAirport>();
const airportByCode = new Map<string, DatasetAirport>();
const airportCodePriority = new Map<string, number>();
const frequenciesByCode = new Map<string, DatasetFrequency[]>();
const frequencyCodePriority = new Map<string, number>();
const airportIdentsByCity = new Map<string, string[]>();

const addAirportCode = (code: string | undefined, airport: DatasetAirport, kind: AirportCodeKind): void => {
  if (!code) {
    return;
  }

  const normalizedCode = normalizeCode(code);
  const priority = AIRPORT_CODE_PRIORITY[kind];
  const existingPriority = airportCodePriority.get(normalizedCode) ?? 0;

  if (priority >= existingPriority) {
    airportByCode.set(normalizedCode, airport);
    airportCodePriority.set(normalizedCode, priority);
  }
};

const addFrequencyCode = (code: string | undefined, airport: DatasetAirport, kind: AirportCodeKind): void => {
  if (!code) {
    return;
  }

  const normalizedCode = normalizeCode(code);
  const priority = AIRPORT_CODE_PRIORITY[kind];
  const existingPriority = frequencyCodePriority.get(normalizedCode) ?? 0;

  if (priority >= existingPriority) {
    frequenciesByCode.set(normalizedCode, frequencyRecords[airport.ident] ?? []);
    frequencyCodePriority.set(normalizedCode, priority);
  }
};

const addCityIndex = (key: string, airportIdent: string): void => {
  airportIdentsByCity.set(key, [...(airportIdentsByCity.get(key) ?? []), airportIdent]);
};

for (const airport of airports) {
  airportByIdent.set(airport.ident, airport);
  addAirportCode(airport.ident, airport, "ident");
  addAirportCode(airport.icao, airport, "icao");
  addAirportCode(airport.gpsCode, airport, "gpsCode");
  addAirportCode(airport.iata, airport, "iata");
  addAirportCode(airport.localCode, airport, "localCode");
  addFrequencyCode(airport.ident, airport, "ident");
  addFrequencyCode(airport.icao, airport, "icao");
  addFrequencyCode(airport.gpsCode, airport, "gpsCode");
  addFrequencyCode(airport.iata, airport, "iata");
  addFrequencyCode(airport.localCode, airport, "localCode");

  if (airport.municipality) {
    const cityKey = normalizeCity(airport.municipality);
    addCityIndex(cityKey, airport.ident);

    if (airport.regionCode) {
      addCityIndex(cityRegionKey(airport.municipality, airport.regionCode), airport.ident);
    }
  }
}

const cloneRunways = (runways: DatasetRunway[]): DatasetRunway[] => runways.map((runway) => ({ ...runway }));
const cloneFrequencies = (frequencies: DatasetFrequency[]): DatasetFrequency[] =>
  frequencies.map((frequency) => ({ ...frequency }));

const cloneAirport = (airport: DatasetAirport): DatasetAirport => ({
  ...airport,
  runways: cloneRunways(airport.runways)
});

export function getDatasetAirport(code: string): DatasetAirport | null {
  const normalizedCode = normalizeCode(code);
  const airport = airportByCode.get(normalizedCode);
  return airport ? cloneAirport(airport) : null;
}

export function getDatasetRunways(code: string): DatasetRunway[] {
  return cloneRunways(airportByCode.get(normalizeCode(code))?.runways ?? []);
}

export function getDatasetFrequencies(code: string): DatasetFrequency[] {
  return cloneFrequencies(frequenciesByCode.get(normalizeCode(code)) ?? []);
}

export function findDatasetAirportsByCity(city: string, regionCode?: string): DatasetAirport[] {
  const key = regionCode ? cityRegionKey(city, regionCode) : normalizeCity(city);
  const idents = airportIdentsByCity.get(key) ?? [];

  return idents
    .map((ident) => airportByIdent.get(ident))
    .filter((airport): airport is DatasetAirport => Boolean(airport))
    .map(cloneAirport);
}
