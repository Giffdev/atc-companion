import { AIRPORT_REFERENCES, findAirportReference, type AirportReference } from "@/data/airports";
import { APPROACH_FACILITIES } from "@/data/approach-facilities";
import { CENTER_AIRPORTS } from "@/data/center-airports";
import type { ControllerFacility, FacilityType } from "@/types/facility";

const normalize = (value: string): string => value.trim().toLowerCase();

const averagePosition = (airports: AirportReference[]): ControllerFacility["position"] => {
  if (!airports.length) {
    return { latitude: 39.8283, longitude: -98.5795 };
  }

  const totals = airports.reduce(
    (accumulator, airport) => ({
      latitude: accumulator.latitude + airport.latitude,
      longitude: accumulator.longitude + airport.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: Number((totals.latitude / airports.length).toFixed(6)),
    longitude: Number((totals.longitude / airports.length).toFixed(6))
  };
};

const compactAirportName = (airport: AirportReference): string => {
  const sanitized = airport.name
    .replace(/\bInternational Airport\b/gi, "")
    .replace(/\bInternational\b/gi, "")
    .replace(/\bIntl\b/gi, "")
    .replace(/\bRegional Airport\b/gi, "")
    .replace(/\bMunicipal Airport\b/gi, "")
    .replace(/\bAirport\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return sanitized || airport.city || airport.icao;
};

const TOWER_FACILITIES: ControllerFacility[] = AIRPORT_REFERENCES.map((airport) => ({
  id: `${airport.icao}-TWR`,
  name: `${compactAirportName(airport)} Tower`,
  type: "tower",
  primaryAirport: airport.icao,
  location: `${airport.city}, ${airport.state}`,
  position: {
    latitude: airport.latitude,
    longitude: airport.longitude
  }
}));

const APPROACH_CONTROLLER_FACILITIES: ControllerFacility[] = APPROACH_FACILITIES.map((facility) => {
  const airportReferences = facility.airports
    .map((airport) => findAirportReference(airport))
    .filter((airport): airport is AirportReference => Boolean(airport));

  const primaryRef = findAirportReference(facility.airports[0]);

  return {
    id: facility.icao,
    name: facility.name,
    type: "approach",
    primaryAirport: facility.airports[0],
    location: primaryRef ? `${primaryRef.city}, ${primaryRef.state}` : undefined,
    position: averagePosition(airportReferences),
    artcc: undefined
  };
});

const ARTCC_FACILITY_DEFINITIONS: ControllerFacility[] = [
  { id: "ZAB", name: "Albuquerque Center", type: "center", location: "Albuquerque, NM", position: { latitude: 35.0402, longitude: -106.609 }, artcc: "ZAB" },
  { id: "ZAU", name: "Chicago Center", type: "center", location: "Aurora, IL", position: { latitude: 41.995, longitude: -88.101 }, artcc: "ZAU" },
  { id: "ZAN", name: "Anchorage Center", type: "center", location: "Anchorage, AK", position: { latitude: 61.1744, longitude: -149.9964 }, artcc: "ZAN" },
  { id: "ZBW", name: "Boston Center", type: "center", location: "Nashua, NH", position: { latitude: 42.3643, longitude: -71.0052 }, artcc: "ZBW" },
  { id: "ZDC", name: "Washington Center", type: "center", location: "Leesburg, VA", position: { latitude: 38.8521, longitude: -77.0377 }, artcc: "ZDC" },
  { id: "ZDV", name: "Denver Center", type: "center", location: "Longmont, CO", position: { latitude: 39.8617, longitude: -104.6731 }, artcc: "ZDV" },
  { id: "ZFW", name: "Fort Worth Center", type: "center", location: "Fort Worth, TX", position: { latitude: 32.8998, longitude: -97.0403 }, artcc: "ZFW" },
  { id: "ZHU", name: "Houston Center", type: "center", location: "Houston, TX", position: { latitude: 29.6454, longitude: -95.2789 }, artcc: "ZHU" },
  { id: "ZID", name: "Indianapolis Center", type: "center", location: "Indianapolis, IN", position: { latitude: 39.7173, longitude: -86.2944 }, artcc: "ZID" },
  { id: "ZJX", name: "Jacksonville Center", type: "center", location: "Jacksonville, FL", position: { latitude: 30.4941, longitude: -81.6879 }, artcc: "ZJX" },
  { id: "ZKC", name: "Kansas City Center", type: "center", location: "Olathe, KS", position: { latitude: 39.2976, longitude: -94.7139 }, artcc: "ZKC" },
  { id: "ZLA", name: "Los Angeles Center", type: "center", location: "Palmdale, CA", position: { latitude: 34.0551, longitude: -117.6012 }, artcc: "ZLA" },
  { id: "ZLC", name: "Salt Lake City Center", type: "center", location: "Salt Lake City, UT", position: { latitude: 40.7884, longitude: -111.9778 }, artcc: "ZLC" },
  { id: "ZMA", name: "Miami Center", type: "center", location: "Miami, FL", position: { latitude: 25.7933, longitude: -80.2906 }, artcc: "ZMA" },
  { id: "ZME", name: "Memphis Center", type: "center", location: "Memphis, TN", position: { latitude: 35.0425, longitude: -89.9767 }, artcc: "ZME" },
  { id: "ZMP", name: "Minneapolis Center", type: "center", location: "Farmington, MN", position: { latitude: 44.8819, longitude: -93.2218 }, artcc: "ZMP" },
  { id: "ZNY", name: "New York Center", type: "center", location: "Ronkonkoma, NY", position: { latitude: 40.7891, longitude: -73.1002 }, artcc: "ZNY" },
  { id: "ZOA", name: "Oakland Center", type: "center", location: "Fremont, CA", position: { latitude: 37.7006, longitude: -122.2196 }, artcc: "ZOA" },
  { id: "ZOB", name: "Cleveland Center", type: "center", location: "Oberlin, OH", position: { latitude: 41.4117, longitude: -81.8498 }, artcc: "ZOB" },
  { id: "ZSE", name: "Seattle Center", type: "center", location: "Auburn, WA", position: { latitude: 47.449, longitude: -122.3093 }, artcc: "ZSE" },
  { id: "ZTL", name: "Atlanta Center", type: "center", location: "Hampton, GA", position: { latitude: 33.6407, longitude: -84.4277 }, artcc: "ZTL" },
  { id: "ZHN", name: "Honolulu Control Facility", type: "center", location: "Honolulu, HI", position: { latitude: 21.3245, longitude: -157.9251 }, artcc: "ZHN" }
];

const ARTCC_FACILITIES: ControllerFacility[] = ARTCC_FACILITY_DEFINITIONS.map((facility) => ({
  ...facility,
  primaryAirport: CENTER_AIRPORTS[facility.id]?.[0]
}));

export const CONTROLLER_FACILITIES: ControllerFacility[] = [
  ...TOWER_FACILITIES,
  ...APPROACH_CONTROLLER_FACILITIES,
  ...ARTCC_FACILITIES
];

const FACILITY_INDEX = new Map(CONTROLLER_FACILITIES.map((facility) => [facility.id.toUpperCase(), facility]));

const FACILITY_SEARCH_KEYS = CONTROLLER_FACILITIES.map((facility) => {
  const airport = facility.primaryAirport ? findAirportReference(facility.primaryAirport) : null;
  const searchKeys = [
    facility.id,
    facility.name,
    facility.type,
    facility.primaryAirport,
    facility.artcc,
    airport?.icao,
    airport?.faa,
    airport?.iata,
    airport?.city,
    airport?.state,
    airport?.name
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalize);

  return {
    facility,
    searchKeys
  };
});

const FACILITY_TYPE_ORDER: FacilityType[] = ["tower", "approach", "center", "ground", "clearance", "flight_service"];

const scoreFacility = (query: string, facility: ControllerFacility, searchKeys: string[]): number => {
  if (!query) {
    return 1;
  }

  let score = 0;
  const tokens = query.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    for (const key of searchKeys) {
      if (key === token) {
        score += 140;
      } else if (key.startsWith(token)) {
        score += 60;
      } else if (key.includes(token)) {
        score += 28;
      }
    }
  }

  if (normalize(facility.id) === query || normalize(facility.primaryAirport ?? "") === query) {
    score += 220;
  }

  return score;
};

export const getFacilityById = (facilityId: string): ControllerFacility | null =>
  FACILITY_INDEX.get(facilityId.trim().toUpperCase()) ?? null;

/**
 * Get the list of airports associated with a facility.
 * For approach facilities, returns all airports in their airspace.
 * For towers, returns just the primary airport.
 */
export const getFacilityAirports = (facilityId: string): string[] => {
  const id = facilityId.trim().toUpperCase();

  // Check approach facilities first (they have multiple airports)
  const approach = APPROACH_FACILITIES.find(
    (f) => f.icao.toUpperCase() === id || f.name.toUpperCase() === id
  );
  if (approach) return approach.airports;

  const facility = FACILITY_INDEX.get(id);
  if (facility?.type === "center") {
    return CENTER_AIRPORTS[facility.id] ?? [];
  }

  // For tower facilities, just the primary airport
  if (facility?.primaryAirport) return [facility.primaryAirport];

  return [];
};

export const searchFacilities = (query: string): ControllerFacility[] => {
  const normalizedQuery = normalize(query);

  return FACILITY_SEARCH_KEYS.map(({ facility, searchKeys }) => ({
    facility,
    score: scoreFacility(normalizedQuery, facility, searchKeys)
  }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const typeDelta = FACILITY_TYPE_ORDER.indexOf(left.facility.type) - FACILITY_TYPE_ORDER.indexOf(right.facility.type);
      if (typeDelta !== 0) {
        return typeDelta;
      }

      return left.facility.name.localeCompare(right.facility.name);
    })
    .map(({ facility }) => facility);
};
