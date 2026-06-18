export interface ApproachFacility {
  name: string;
  icao: string;
  frequencies: { valueMHz: number; sector?: string }[];
  airports: string[];
}

export const APPROACH_FACILITIES: ApproachFacility[] = [
  {
    name: "Seattle Approach",
    icao: "S46",
    frequencies: [
      { valueMHz: 119.2, sector: "South / Boeing Field / Renton" },
      { valueMHz: 120.1, sector: "Tacoma Narrows" },
      { valueMHz: 121.1, sector: "Olympia" },
      { valueMHz: 124.2, sector: "North satellite" },
      { valueMHz: 126.5, sector: "McChord AFB" },
      { valueMHz: 127.1, sector: "Bremerton" }
    ],
    airports: ["KSEA", "KBFI", "KRNT", "KPAE", "KOLM", "KPWT", "KTIW", "KTCM", "KAWO", "KPLU"]
  },
  {
    name: "Whidbey Approach",
    icao: "NUW",
    frequencies: [
      { valueMHz: 118.2, sector: "West" },
      { valueMHz: 120.7, sector: "East" }
    ],
    airports: ["KNUW"]
  },
  {
    name: "Portland Approach",
    icao: "P80",
    frequencies: [
      { valueMHz: 118.1, sector: "Primary" },
      { valueMHz: 124.35, sector: "East / Northeast" },
      { valueMHz: 126, sector: "North" },
      { valueMHz: 126.9, sector: "Final" },
      { valueMHz: 127.85, sector: "West" }
    ],
    airports: ["KPDX", "KHIO", "KTTD", "KVUO", "KSPB", "KUAO", "KSLE"]
  },
  {
    name: "Boise Approach",
    icao: "BOI",
    frequencies: [{ valueMHz: 119.1 }],
    airports: ["KBOI", "KEUL", "KMAN"]
  },
  {
    name: "Spokane Approach",
    icao: "GEG",
    frequencies: [{ valueMHz: 119.2 }],
    airports: ["KGEG", "KSFF", "KSKA", "KDEW"]
  },
  {
    name: "NorCal Approach",
    icao: "NCT",
    frequencies: [
      { valueMHz: 120.9, sector: "Departure" },
      { valueMHz: 125.35, sector: "Oakland / East Bay" },
      { valueMHz: 128.325, sector: "San Francisco" },
      { valueMHz: 133.95, sector: "Secondary" },
      { valueMHz: 134.5, sector: "Initial Contact" }
    ],
    airports: ["KSFO", "KOAK", "KSJC", "KPAO", "KHWD", "KCCR", "KLVK", "KSQL"]
  },
  {
    name: "SoCal Approach",
    icao: "SCT",
    frequencies: [
      { valueMHz: 119.65, sector: "Ontario" },
      { valueMHz: 120.4, sector: "Burbank / Van Nuys" },
      { valueMHz: 124.3, sector: "Los Angeles" },
      { valueMHz: 125.2, sector: "Orange County" },
      { valueMHz: 127, sector: "Inland Empire" }
    ],
    airports: ["KLAX", "KBUR", "KVNY", "KONT", "KSNA", "KFUL", "KPOC", "KTOA", "KSMO", "KSEE"]
  },
  {
    name: "Potomac Approach",
    icao: "PCT",
    frequencies: [
      { valueMHz: 118.95, sector: "National Departure" },
      { valueMHz: 119, sector: "Baltimore" },
      { valueMHz: 119.85, sector: "National Approach" },
      { valueMHz: 120.45, sector: "Dulles Approach" },
      { valueMHz: 124.2, sector: "National Final" },
      { valueMHz: 125.05, sector: "Dulles Departure" }
    ],
    airports: ["KDCA", "KIAD", "KBWI", "KHEF", "KJYO", "KGAI"]
  },
  {
    name: "New York Approach",
    icao: "N90",
    frequencies: [
      { valueMHz: 125.7, sector: "JFK ROBER" },
      { valueMHz: 127.4, sector: "JFK CAMRN" },
      { valueMHz: 132.4, sector: "JFK Final" }
    ],
    airports: ["KJFK", "KLGA", "KEWR", "KTEB", "KHPN", "KFRG", "KISP"]
  },
  {
    name: "Chicago Approach",
    icao: "C90",
    frequencies: [
      { valueMHz: 118.4, sector: "Midway" },
      { valueMHz: 119, sector: "O’Hare" },
      { valueMHz: 120.55, sector: "Chicago Executive" },
      { valueMHz: 125, sector: "Departure" }
    ],
    airports: ["KORD", "KMDW", "KPWK", "KDPA", "KARR", "KUGN"]
  },
  {
    name: "Atlanta Approach",
    icao: "A80",
    frequencies: [
      { valueMHz: 119.65, sector: "ATIS / common handoff" },
      { valueMHz: 127.9, sector: "West" },
      { valueMHz: 128, sector: "Primary" },
      { valueMHz: 133.475, sector: "East" }
    ],
    airports: ["KATL", "KPDK", "KFTY", "KAHN"]
  },
  {
    name: "Denver Approach",
    icao: "D01",
    frequencies: [
      { valueMHz: 119.3, sector: "Approach" },
      { valueMHz: 120.35, sector: "Common Sector" },
      { valueMHz: 126.1, sector: "Departure" }
    ],
    airports: ["KDEN", "KAPA", "KBJC", "KEIK"]
  },
  {
    name: "Dallas Approach",
    icao: "D10",
    frequencies: [
      { valueMHz: 118.55, sector: "Departure" },
      { valueMHz: 119.875, sector: "DFW Regional Approach" },
      { valueMHz: 124.3, sector: "Love Field / Addison" },
      { valueMHz: 126.55, sector: "North Metroplex" }
    ],
    airports: ["KDFW", "KDAL", "KADS", "KRBD", "KGKY", "KDWH"]
  },
  {
    name: "Boston Approach",
    icao: "A90",
    frequencies: [
      { valueMHz: 118.25, sector: "North" },
      { valueMHz: 120.6, sector: "West" },
      { valueMHz: 124.4, sector: "Primary" },
      { valueMHz: 125.05, sector: "South" },
      { valueMHz: 127.2, sector: "South Final" }
    ],
    airports: ["KBOS", "KBED", "KBVY", "KOWD", "KORH"]
  },
  {
    name: "Phoenix Approach",
    icao: "P50",
    frequencies: [
      { valueMHz: 119.2, sector: "Northwest High" },
      { valueMHz: 120.7, sector: "Northwest Low" },
      { valueMHz: 123.7, sector: "South" },
      { valueMHz: 124.1, sector: "West" },
      { valueMHz: 126.8, sector: "East / High" },
      { valueMHz: 128.65, sector: "Initial Contact" }
    ],
    airports: ["KPHX", "KSDL", "KDVT", "KFFZ", "KGYR"]
  },
  {
    name: "Las Vegas Approach",
    icao: "L30",
    frequencies: [
      { valueMHz: 119.4, sector: "South Arrival / Departure" },
      { valueMHz: 120.5, sector: "East Arrival" },
      { valueMHz: 125.025, sector: "Primary" },
      { valueMHz: 125.9, sector: "North Arrival / Departure" },
      { valueMHz: 133.95, sector: "West Arrival" }
    ],
    airports: ["KLAS", "KHND", "KVGT"]
  },
  {
    name: "Greensboro Approach",
    icao: "GSO",
    frequencies: [{ valueMHz: 124.35 }],
    airports: ["KGSO", "KINT", "KBUY", "KEXX"]
  },
  {
    name: "Charlotte Approach",
    icao: "CLT",
    frequencies: [{ valueMHz: 125.3 }],
    airports: ["KCLT", "KJQF", "KRUQ", "KAKH", "KIPJ"]
  },
  {
    name: "Raleigh-Durham Approach",
    icao: "RDU",
    frequencies: [{ valueMHz: 124.85 }],
    airports: ["KRDU", "KFAY", "KLHZ", "KSOP"]
  },
  {
    name: "Nashville Approach",
    icao: "BNA",
    frequencies: [{ valueMHz: 125.45 }],
    airports: ["KBNA", "KMQY", "KJWN"]
  },
  {
    name: "Memphis Approach",
    icao: "MEM",
    frequencies: [{ valueMHz: 124.15 }],
    airports: ["KMEM", "KNQA", "KOLV"]
  },
  {
    name: "St. Louis Approach",
    icao: "STL",
    frequencies: [{ valueMHz: 124.7 }],
    airports: ["KSTL", "KCPS", "KSUS", "KALN", "KBLV", "KSET"]
  },
  {
    name: "Salt Lake City Approach",
    icao: "SLC",
    frequencies: [{ valueMHz: 124.3 }],
    airports: ["KSLC", "KOGD", "KPVU", "KHIF"]
  },
  {
    name: "Tampa Approach",
    icao: "TPA",
    frequencies: [{ valueMHz: 119.9 }],
    airports: ["KTPA", "KPIE", "KMCF", "KVDF", "KZPH"]
  },
  {
    name: "Orlando Approach",
    icao: "MCO",
    frequencies: [{ valueMHz: 124.8 }],
    airports: ["KMCO", "KSFB", "KORL", "KISM"]
  },
  {
    name: "Minneapolis Approach",
    icao: "MSP",
    frequencies: [{ valueMHz: 124.7 }],
    airports: ["KMSP", "KSTP", "KFCM", "KANE", "KMIC"]
  },
  {
    name: "Indianapolis Approach",
    icao: "IND",
    frequencies: [{ valueMHz: 124.05 }],
    airports: ["KIND", "KEYE", "KMQJ"]
  },
  {
    name: "Cincinnati Approach",
    icao: "CVG",
    frequencies: [{ valueMHz: 119.7 }],
    airports: ["KCVG", "KLUK", "KHAO"]
  },
  {
    name: "Pittsburgh Approach",
    icao: "PIT",
    frequencies: [{ valueMHz: 124.75 }],
    airports: ["KPIT", "KAGC", "KBTP"]
  },
  {
    name: "Kansas City Approach",
    icao: "MCI",
    frequencies: [{ valueMHz: 124.3 }],
    airports: ["KMCI", "KIXD", "KOJC", "KMKC"]
  },
  {
    name: "San Antonio Approach",
    icao: "SAT",
    frequencies: [{ valueMHz: 119.55 }],
    airports: ["KSAT", "KSKF", "KSSF", "KRND"]
  },
  {
    name: "Austin Approach",
    icao: "AUS",
    frequencies: [{ valueMHz: 119 }],
    airports: ["KAUS", "KGTU", "KEDC", "KHYI"]
  },
  {
    name: "Honolulu Approach",
    icao: "HCF",
    frequencies: [{ valueMHz: 118.3 }],
    airports: ["PHNL", "PHNG", "PHHI", "PHJH"]
  },
  {
    name: "San Diego Approach",
    icao: "NKX",
    frequencies: [{ valueMHz: 119.6 }],
    airports: ["KSAN", "KNKX", "KNZY", "KMYF", "KSEE", "KSDM", "KRNM", "KCRQ"]
  },
  {
    name: "Detroit Approach",
    icao: "DTW",
    frequencies: [{ valueMHz: 124.2 }],
    airports: ["KDTW", "KYIP", "KPTK", "KDET"]
  },
  {
    name: "Milwaukee Approach",
    icao: "MKE",
    frequencies: [{ valueMHz: 124.35 }],
    airports: ["KMKE", "KMWC", "KUES", "KRAC"]
  },
  {
    name: "Cleveland Approach",
    icao: "CLE",
    frequencies: [{ valueMHz: 124 }],
    airports: ["KCLE", "KCGF", "KBKL", "KLPR"]
  },
  {
    name: "Baltimore Approach",
    icao: "BWI",
    frequencies: [{ valueMHz: 124.45 }],
    airports: ["KBWI", "KMTN", "KANP"]
  },
  {
    name: "Jacksonville Approach",
    icao: "JAX",
    frequencies: [{ valueMHz: 118 }],
    airports: ["KJAX", "KNIP", "KCRG", "KVQQ", "KSGJ"]
  }
];

const APPROACH_FACILITY_INDEX = new Map<string, ApproachFacility>();

for (const facility of APPROACH_FACILITIES) {
  APPROACH_FACILITY_INDEX.set(facility.name.toUpperCase(), facility);
  APPROACH_FACILITY_INDEX.set(facility.icao.toUpperCase(), facility);
}

export const findApproachFacility = (nameOrCode: string): ApproachFacility | null =>
  APPROACH_FACILITY_INDEX.get(nameOrCode.trim().toUpperCase()) ?? null;

export const findApproachFacilityByAirport = (airportIcao: string): ApproachFacility | null =>
  APPROACH_FACILITIES.find((facility) => facility.airports.includes(airportIcao.trim().toUpperCase())) ?? null;
