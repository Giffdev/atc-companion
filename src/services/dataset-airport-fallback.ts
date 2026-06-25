import "server-only";

import {
  findDatasetAirportsByCity,
  getDatasetAirport,
  type DatasetAirport
} from "@/data/airport-dataset";
import type { AirportReference } from "@/data/airports";
import type { DataSource } from "@/types/api";

export const OURAIRPORTS_SOURCE: DataSource = {
  id: "ourairports-community-dataset",
  name: "OurAirports community dataset",
  url: "https://ourairports.com/data/",
  reliability: "medium",
  refresh_interval: "Generated from OurAirports public-domain CSV snapshots"
};

const TOWERED_TYPES = new Set(["large_airport", "medium_airport"]);

export const toAirportReferenceFromDataset = (airport: DatasetAirport): AirportReference => {
  const preferredCode = airport.gpsCode ?? airport.icao ?? airport.localCode ?? airport.ident;

  return {
    icao: preferredCode,
    faa: airport.localCode ?? airport.gpsCode ?? airport.ident,
    iata: airport.iata,
    name: airport.name,
    city: airport.municipality ?? "",
    state: airport.regionCode ?? "",
    latitude: airport.lat,
    longitude: airport.lon,
    runways: airport.runways.map((runway) => runway.designator)
  };
};

export const findDatasetAirportReference = (code: string): AirportReference | null => {
  const airport = getDatasetAirport(code);
  return airport ? toAirportReferenceFromDataset(airport) : null;
};

export const resolveDatasetAirportByCity = (city: string, regionCode?: string): AirportReference | null => {
  const matches = findDatasetAirportsByCity(city, regionCode);
  if (matches.length === 0) {
    return null;
  }

  const sorted = [...matches].sort((left, right) => {
    const regionDelta = Number(right.regionCode === regionCode) - Number(left.regionCode === regionCode);
    if (regionDelta !== 0) return regionDelta;

    const toweredDelta = Number(TOWERED_TYPES.has(right.type)) - Number(TOWERED_TYPES.has(left.type));
    if (toweredDelta !== 0) return toweredDelta;

    return (left.localCode ?? left.gpsCode ?? left.ident).localeCompare(right.localCode ?? right.gpsCode ?? right.ident);
  });

  return toAirportReferenceFromDataset(sorted[0]);
};
