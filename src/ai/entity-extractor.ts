import { findAirportReference, findAirportReferencesInText, toIcaoCode } from "@/data/airports";
import type {
  AirportInfoDetail,
  FrequencyQueryType,
  IntentEntity,
  NotamTypeFilter,
  ProcedureType
} from "@/types/intents";

const NATO_PHONETIC_MAP: Record<string, string> = {
  alpha: "A",
  bravo: "B",
  charlie: "C",
  delta: "D",
  echo: "E",
  foxtrot: "F",
  golf: "G",
  hotel: "H",
  india: "I",
  juliet: "J",
  kilo: "K",
  lima: "L",
  mike: "M",
  november: "N",
  oscar: "O",
  papa: "P",
  quebec: "Q",
  romeo: "R",
  sierra: "S",
  tango: "T",
  uniform: "U",
  victor: "V",
  whiskey: "W",
  xray: "X",
  "x-ray": "X",
  yankee: "Y",
  zulu: "Z"
};

const SPOKEN_NUMBER_MAP: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  tree: "3",
  four: "4",
  fower: "4",
  five: "5",
  fife: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  nine: "9",
  niner: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20"
};

const RUNWAY_SIDE_MAP: Record<string, string> = {
  left: "L",
  right: "R",
  center: "C",
  centre: "C"
};

const AIRPORT_CONTEXT_WORDS = /\b(?:at|for|near|nearest|into|from|to|airport|field|station)\s+([A-Za-z0-9]{2,4})\b/g;
const AIRPORT_CONTEXT_AFTER_WORDS =
  /\b([A-Za-z0-9]{2,4})\s+(?:airport|field|runways?|diagram|weather|metar|taf|notams?|frequenc(?:y|ies)|tower|ground|atis|ctaf)\b/gi;
const ICAO_PATTERN = /\b([A-Z][A-Z0-9]{2,3})\b/g;
const FAA_LID_PATTERN = /\b([A-Z0-9]{3,4})\b/gi;
const IATA_PATTERN = /\b([A-Z]{3})\b/g;
const FREQUENCY_PATTERN = /\b(1(?:1[8-9]|2\d|3[0-6])(?:\.\d{1,3})?)\b/g;
const ALTITUDE_FEET_PATTERN = /\b(\d{3,5})\s*(?:feet|foot|ft)\b/gi;
const FLIGHT_LEVEL_PATTERN = /\bFL\s?(\d{2,3})\b/gi;
const FLIGHT_LEVEL_WORD_PATTERN = /\bflight level\s+(\d{2,3})\b/gi;
const RUNWAY_PREFIX_PATTERN = /\b(?:runway|rwy)\s*(\d{1,2})\s*(left|right|center|centre|[LRC])?\b/gi;
const RUNWAY_BARE_PATTERN = /\b(\d{1,2})([LRC])\b/gi;
const RUNWAY_AFTER_PROCEDURE_PATTERN = /\b(?:rnav|ils|vor|gps|lda|loc|ndb)\s+(\d{1,2})\s*([LRC])?\b/gi;
const FAR_PATTERN = /\b(?:(?:14\s*CFR|CFR|FAR)\s+)?(?:part\s+)?(\d+)(?:\.(\d+))?\b/gi;
const N_NUMBER_PATTERN = /\bN\d{1,5}[A-Z]{0,2}\b/gi;
const AIRLINE_CALLSIGN_PATTERN = /\b[A-Z]{2,3}\s?\d{1,4}[A-Z]?\b/g;
const AIRCRAFT_TYPE_PATTERN = /\b(?:A\d{3}|B\d{3,4}|C\d{3}|SR\d{2}|PA-\d{2,2}|E\d{3}|CRJ\d{3}|ERJ\d{3}|B7\d{2}|A3\d{2})\b/gi;
const SQUAWK_PATTERN = /\b(?:squawk\s+)?(7500|7600|7700)\b/gi;
const SPEED_PATTERN = /\b(\d{2,3})\s*(?:knots?|kias|kt|kts)\b/gi;
const AIRPORT_CODE_STOPWORDS = new Set(["THE", "AND", "FOR", "WITH", "ILS", "VOR", "SID", "STAR", "TAF", "APP", "INFO", "NO"]);
const FAA_LID_SHAPE = /^(?=.{3,4}$)(?=.*[A-Z])(?=.*\d)[A-Z0-9]+$/;
const CANADIAN_ICAO_SHAPE = /^C(?=.*[A-Z])[A-Z0-9]{3}$/;

const REGULATORY_CUE_WORDS = /\b(?:far|cfr|part|section|regulation|rule)\b/i;

export interface FarReferenceEntity {
  raw: string;
  part?: number;
  section?: string;
}

export interface CityRegionEntity {
  city: string;
  regionCode?: string;
}

export interface ExtractedEntities {
  airports: string[];
  cityLocations: CityRegionEntity[];
  frequencies: string[];
  altitudesFeet: number[];
  speedKnots: number[];
  squawkCodes: string[];
  callsigns: string[];
  aircraftTypes: string[];
  runways: string[];
  farReferences: FarReferenceEntity[];
  radiusNm?: number;
  route: string[];
  navigationFromAirport?: string;
  navigationToAirport?: string;
  notamTypeFilter?: NotamTypeFilter;
  frequencyType?: FrequencyQueryType;
  procedureType?: ProcedureType;
  procedureName?: string;
  airportInfoDetail?: AirportInfoDetail;
}

const dedupe = <T>(values: T[]): T[] => Array.from(new Set(values));

const isAllSingleLetters = (value: string): boolean => /^[A-Z](?:\s+[A-Z])+$/.test(value);

const US_STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY"
};
const US_STATE_CODES = new Set(Object.values(US_STATE_NAME_TO_CODE));
const CANADIAN_PROVINCE_TERRITORY_NAME_TO_CODE: Record<string, string> = {
  alberta: "AB",
  "british columbia": "BC",
  manitoba: "MB",
  "new brunswick": "NB",
  "newfoundland and labrador": "NL",
  "northwest territories": "NT",
  "nova scotia": "NS",
  nunavut: "NU",
  ontario: "ON",
  "prince edward island": "PE",
  quebec: "QC",
  saskatchewan: "SK",
  yukon: "YT"
};
const CANADIAN_PROVINCE_TERRITORY_CODES = new Set(Object.values(CANADIAN_PROVINCE_TERRITORY_NAME_TO_CODE));
const REGION_NAME_TO_CODE: Record<string, string> = {
  ...US_STATE_NAME_TO_CODE,
  ...CANADIAN_PROVINCE_TERRITORY_NAME_TO_CODE
};
const REGION_CODES = new Set([...US_STATE_CODES, ...CANADIAN_PROVINCE_TERRITORY_CODES]);
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const REGION_NAME_PATTERN = Object.keys(REGION_NAME_TO_CODE)
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join("|");
const CITY_REGION_PATTERN = new RegExp(`,\\s*(${REGION_NAME_PATTERN}|[A-Za-z]{2})(?=\\b)`, "gi");

const collapseSpacedLetters = (input: string): string =>
  input.replace(/\b(?:[A-Z]\s+){2,}[A-Z]\b/g, (match) => match.replace(/\s+/g, ""));

const tokensToNumber = (tokens: string[]): string | null => {
  const numericTokens = tokens.filter((token) => token !== "point" && token !== "decimal");

  if (numericTokens.length === 0) {
    return null;
  }

  if (!numericTokens.every((token) => token in SPOKEN_NUMBER_MAP)) {
    return null;
  }

  const pointIndex = tokens.findIndex((token) => token === "point" || token === "decimal");

  if (pointIndex === -1) {
    return numericTokens.map((token) => SPOKEN_NUMBER_MAP[token]).join("");
  }

  const whole = tokens.slice(0, pointIndex).map((token) => SPOKEN_NUMBER_MAP[token]).join("");
  const fraction = tokens.slice(pointIndex + 1).map((token) => SPOKEN_NUMBER_MAP[token]).join("");

  if (!whole || !fraction) {
    return null;
  }

  return `${whole}.${fraction}`;
};

export const convertPhoneticAlphabetToText = (input: string): string => {
  const converted = input.replace(/\b([A-Za-z-]+)\b/g, (match) => NATO_PHONETIC_MAP[match.toLowerCase()] ?? match);
  return collapseSpacedLetters(converted);
};

export const convertSpokenNumbersToDigits = (input: string): string => {
  const tokens = input.split(/\s+/);
  const rebuilt: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) {
      return;
    }

    const converted = tokensToNumber(buffer);
    rebuilt.push(converted ?? buffer.join(" "));
    buffer = [];
  };

  for (const token of tokens) {
    const cleaned = token.toLowerCase().replace(/[^a-z-]/g, "");
    if (cleaned in SPOKEN_NUMBER_MAP || cleaned === "point" || cleaned === "decimal") {
      buffer.push(cleaned);
      continue;
    }

    flush();
    rebuilt.push(token);
  }

  flush();

  return rebuilt.join(" ");
};

export const normalizeRunwayPhrases = (input: string): string =>
  input.replace(/\brunway\s+(\d{1,2})\s+(left|right|center|centre)\b/gi, (_, runway: string, side: string) => {
    return `runway ${runway}${RUNWAY_SIDE_MAP[side.toLowerCase()]}`;
  });

/** Split procedure abbreviations glued to runway numbers: "rnav20" → "rnav 20", "ils14R" → "ils 14R" */
const splitProcedureRunway = (input: string): string =>
  input.replace(/\b(rnav|ils|vor|gps|lda|loc|ndb)(\d{1,2}[LRC]?)\b/gi, "$1 $2");

export const normalizeAviationText = (input: string): string => {
  const phoneticNormalized = convertPhoneticAlphabetToText(input);
  const numberNormalized = convertSpokenNumbersToDigits(phoneticNormalized);
  const procedureSplit = splitProcedureRunway(numberNormalized);
  return normalizeRunwayPhrases(procedureSplit).replace(/\s+/g, " ").trim();
};

const collectMatches = (pattern: RegExp, input: string): string[] => {
  const matches: string[] = [];

  for (const match of input.matchAll(pattern)) {
    if (match[1]) {
      matches.push(match[1].toUpperCase());
    }
  }

  return matches;
};

const normalizeRegionCode = (region: string): string | undefined => {
  const normalized = region.toLowerCase().replace(/\s+/g, " ").trim();

  if (/^[a-z]{2}$/.test(normalized)) {
    const regionCode = normalized.toUpperCase();
    return REGION_CODES.has(regionCode) ? regionCode : undefined;
  }

  return REGION_NAME_TO_CODE[normalized];
};

const normalizeCityCandidate = (candidate: string): string | undefined => {
  const normalized = candidate
    .toLowerCase()
    .replace(/[^a-z0-9.' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:the\s+)?(?:airport|field)\s+(?:at|in|for)\s+/, "")
    .trim();

  return normalized && /[a-z0-9]/.test(normalized) ? normalized : undefined;
};

const extractCityBeforeComma = (prefix: string): string | undefined => {
  const trimmedPrefix = prefix.replace(/[;:!?]+$/g, "").trim();
  const locatorMatch = /\b(?:at|for|near|nearest|in|around|into|from|to)\s+([^,]+)$/i.exec(trimmedPrefix);
  const candidate = locatorMatch?.[1] ?? trimmedPrefix.split(/[.!?;]/).pop() ?? "";
  const normalized = normalizeCityCandidate(candidate);

  if (!normalized) {
    return undefined;
  }

  const wordCount = normalized.split(/\s+/).length;
  return locatorMatch || wordCount <= 5 ? normalized : undefined;
};

export const extractCityRegions = (input: string): CityRegionEntity[] => {
  const normalized = normalizeAviationText(input);
  const matches: CityRegionEntity[] = [];

  for (const match of normalized.matchAll(CITY_REGION_PATTERN)) {
    const regionCode = match[1] ? normalizeRegionCode(match[1]) : undefined;
    const city = extractCityBeforeComma(normalized.slice(0, match.index));

    if (city && regionCode) {
      matches.push({ city, regionCode });
    }
  }

  return dedupe(matches.map((value) => JSON.stringify(value))).map((value) => JSON.parse(value) as CityRegionEntity);
};

const isFaaLocalIdentifier = (code: string): boolean => FAA_LID_SHAPE.test(code);
const isCanadianIcaoIdentifier = (code: string): boolean => CANADIAN_ICAO_SHAPE.test(code);

const isContextualAirportCode = (code: string): boolean => {
  if (AIRPORT_CODE_STOPWORDS.has(code)) {
    return false;
  }

  return (
    Boolean(findAirportReference(code)) ||
    (/^[A-Z]{4}$/.test(code) && code.startsWith("K")) ||
    isCanadianIcaoIdentifier(code) ||
    isFaaLocalIdentifier(code)
  );
};

export const extractAirportCodes = (input: string): string[] => {
  const normalized = normalizeAviationText(input);
  const uppercased = normalized.toUpperCase();
  const cityRegions = extractCityRegions(normalized);
  const directCodes = collectMatches(ICAO_PATTERN, uppercased).filter(
    (code) => /^[A-Z]{4}$/.test(code) && (code.startsWith("K") || Boolean(findAirportReference(code)))
  );
  const contextualCodes = [
    ...Array.from(normalized.matchAll(AIRPORT_CONTEXT_WORDS)),
    ...Array.from(normalized.matchAll(AIRPORT_CONTEXT_AFTER_WORDS))
  ]
    .map((match) => match[1]?.toUpperCase())
    .filter((code): code is string => Boolean(code) && isContextualAirportCode(code));
  const faaLidCodes = collectMatches(FAA_LID_PATTERN, uppercased).filter(
    (code) => isFaaLocalIdentifier(code) && Boolean(findAirportReference(code))
  );
  const iataCodes = collectMatches(IATA_PATTERN, uppercased).filter(
    (code) => /^[A-Z]{3}$/.test(code) && !AIRPORT_CODE_STOPWORDS.has(code) && Boolean(findAirportReference(code))
  );
  const namedAirportCodes =
    cityRegions.length > 0 ? [] : findAirportReferencesInText(normalized).map((airport) => toIcaoCode(airport.icao));

  return dedupe([...namedAirportCodes, ...directCodes, ...contextualCodes, ...faaLidCodes, ...iataCodes]).filter(
    (code) => !REGULATORY_CUE_WORDS.test(code)
  );
};

export const extractFrequencies = (input: string): string[] => {
  const normalized = normalizeAviationText(input);
  const matches = Array.from(normalized.matchAll(FREQUENCY_PATTERN)).map((match) => match[1]);

  return dedupe(matches);
};

export const extractAltitudesFeet = (input: string): number[] => {
  const normalized = normalizeAviationText(input);
  const fromFeet = Array.from(normalized.matchAll(ALTITUDE_FEET_PATTERN)).map((match) => Number(match[1]));
  const fromFlightLevel = [
    ...Array.from(normalized.matchAll(FLIGHT_LEVEL_PATTERN)).map((match) => Number(match[1]) * 100),
    ...Array.from(normalized.matchAll(FLIGHT_LEVEL_WORD_PATTERN)).map((match) => Number(match[1]) * 100)
  ];

  return dedupe([...fromFeet, ...fromFlightLevel]).filter((value) => Number.isFinite(value));
};

export const extractSpeedKnots = (input: string): number[] => {
  const normalized = normalizeAviationText(input);
  return dedupe(
    Array.from(normalized.matchAll(SPEED_PATTERN))
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value))
  );
};

export const extractSquawkCodes = (input: string): string[] => {
  const normalized = normalizeAviationText(input);
  return dedupe(Array.from(normalized.matchAll(SQUAWK_PATTERN)).map((match) => match[1]));
};

export const extractRunways = (input: string): string[] => {
  const normalized = normalizeAviationText(input);
  const prefixedMatches = Array.from(normalized.matchAll(RUNWAY_PREFIX_PATTERN))
    .map((match) => {
      const runwayNumber = match[1]?.padStart(2, "0");
      const side = match[2] ? RUNWAY_SIDE_MAP[match[2].toLowerCase()] ?? match[2].toUpperCase() : "";

      if (!runwayNumber) {
        return null;
      }

      return `${runwayNumber}${side}`;
    })
    .filter((value): value is string => Boolean(value));
  const bareMatches = Array.from(normalized.matchAll(RUNWAY_BARE_PATTERN))
    .map((match) => {
      const runwayNumber = match[1]?.padStart(2, "0");
      const side = match[2]?.toUpperCase();

      if (!runwayNumber || !side) {
        return null;
      }

      return `${runwayNumber}${side}`;
    })
    .filter((value): value is string => Boolean(value));
  const procedureContextMatches = Array.from(normalized.matchAll(RUNWAY_AFTER_PROCEDURE_PATTERN))
    .map((match) => {
      const runwayNumber = match[1]?.padStart(2, "0");
      const side = match[2]?.toUpperCase() ?? "";

      if (!runwayNumber) {
        return null;
      }

      return `${runwayNumber}${side}`;
    })
    .filter((value): value is string => Boolean(value));

  return dedupe([...prefixedMatches, ...procedureContextMatches, ...bareMatches]);
};

export const extractFarReferences = (input: string): FarReferenceEntity[] => {
  const normalized = normalizeAviationText(input);
  const results = Array.from(normalized.matchAll(FAR_PATTERN))
    .map((match): FarReferenceEntity | null => {
      const part = match[1] ? Number(match[1]) : undefined;
      const section = match[2] ?? undefined;
      const raw = match[0].trim();

      if (!raw || (!REGULATORY_CUE_WORDS.test(raw) && !section)) {
        return null;
      }

      return { raw, part, section };
    })
    .filter((value): value is FarReferenceEntity => value !== null);

  return dedupe(results.map((value) => JSON.stringify(value))).map((value) => JSON.parse(value) as FarReferenceEntity);
};

export const extractCallsigns = (input: string): string[] => {
  const normalized = normalizeAviationText(input).toUpperCase();
  const tailNumbers = Array.from(normalized.matchAll(N_NUMBER_PATTERN)).map((match) => match[0].toUpperCase());
  const airlineFlights = Array.from(normalized.matchAll(AIRLINE_CALLSIGN_PATTERN))
    .map((match) => match[0].replace(/\s+/g, "").toUpperCase())
    .filter((value) => /\d/.test(value));

  return dedupe([...tailNumbers, ...airlineFlights]);
};

export const extractAircraftTypes = (input: string): string[] => {
  const normalized = normalizeAviationText(input).toUpperCase();
  const types = Array.from(normalized.matchAll(AIRCRAFT_TYPE_PATTERN)).map((match) => match[0].toUpperCase());

  return dedupe(types);
};

export const detectFrequencyType = (input: string): FrequencyQueryType | undefined => {
  const normalized = normalizeAviationText(input).toLowerCase();

  if (/\b(tower|twr)\b/.test(normalized)) {
    return "TWR";
  }
  if (/\b(approach|app|departure|dep)\b/.test(normalized)) {
    return "APP";
  }
  if (/\b(ground|gnd)\b/.test(normalized)) {
    return "GND";
  }
  if (/\b(clearance|delivery|del)\b/.test(normalized)) {
    return "DEL";
  }
  if (/\b(atis|awos|asos)\b/.test(normalized)) {
    return "ATIS";
  }
  if (/\b(ctaf|unicom)\b/.test(normalized)) {
    return "CTAF";
  }

  return undefined;
};

export const detectProcedureType = (input: string): ProcedureType | undefined => {
  const normalized = normalizeAviationText(input).toUpperCase();
  const hasFrequencyContext = /\b(?:DEPARTURE\s+(?:FREQUENCY|FREQUENCIES|CONTROL|CONTROLLER)|APPROACH\s+(?:FREQUENCY|FREQUENCIES|CONTROL|CONTROLLER)|CLEARANCE\s+DELIVERY)\b/.test(normalized);
  const hasOdpContext =
    /\b(?:ODPS?|OBSTACLE\s+(?:DEPARTURE(?:\s+PROCEDURES?)?|DP)|DEPARTURE\s+OBSTACLES?|TAKEOFF\s+(?:MINIMUMS?|MINS?)|NON[-\s]?STANDARD\s+TAKEOFF\s+MINIMUMS?|DIVERSE\s+VECTOR\s+AREA|DVA|REQUIRED\s+CLIMB\s+GRADIENT|CLIMB\s+GRADIENT)\b/.test(
      normalized
    );
  const hasNamedDeparture = /\b[A-Z][A-Z0-9]{2,7}(?:\s+\d{1,2})?\s+DEPARTURE\b/.test(normalized);
  const hasNamedArrival = /\b[A-Z][A-Z0-9]{2,7}(?:\s+\d{1,2})?\s+ARRIVAL\b/.test(normalized);

  if (hasOdpContext) {
    return "ODP";
  }

  if (
    !hasFrequencyContext &&
    (/\b(?:SIDS?|DP|STANDARD\s+INSTRUMENT\s+DEPARTURES?|CLIMB\s+VIA\s+SID|DEPARTURE\s+(?:PROCEDURES?|ROUTES?|TRANSITIONS?|CHARTS?)|FILED\s+DEPARTURE|ASSIGNED\s+DEPARTURE)\b/.test(
      normalized
    ) ||
      hasNamedDeparture ||
      /\bDEPARTURES?\b/.test(normalized))
  ) {
    return "SID";
  }

  if (
    /\b(?:STARS?|STANDARD\s+(?:TERMINAL\s+)?ARRIVALS?|STANDARD\s+ARRIVAL\s+ROUTES?|DESCEND\s+VIA\s+STAR|ARRIVAL\s+(?:PROCEDURES?|ROUTES?|TRANSITIONS?))\b/.test(
      normalized
    ) ||
    hasNamedArrival ||
    /\b(?:EXPECT\s+(?:THE\s+)?.*\s+ARRIVAL|ARRIVALS?)\b/.test(normalized)
  ) {
    return "STAR";
  }

  if (/\b(?:ILS|LOCALIZER|LOC|LDA|SDF|PAR)\b/.test(normalized) || /\bPRECISION\s+APPROACH\b/.test(normalized)) {
    return "ILS";
  }
  if (/\bRNAV\b/.test(normalized) || /RNAV\s*\d/i.test(normalized) || /\b(?:GPS|RNP|LNAV(?:\/VNAV)?|VNAV|LPV|LP)\b/.test(normalized)) {
    return "RNAV";
  }
  if (/\b(?:VOR(?:\/DME)?|VORTAC)\b/.test(normalized)) {
    return "VOR";
  }
  if (/\b(?:VISUAL|CONTACT\s+APPROACH|CIRCLING\s+APPROACH|CIRCLE\s+TO\s+LAND)\b/.test(normalized)) {
    return "VISUAL";
  }

  return undefined;
};

export const detectNotamTypeFilter = (input: string): NotamTypeFilter | undefined => {
  const normalized = normalizeAviationText(input).toUpperCase();

  if (/\bTFR\b/.test(normalized)) {
    return "TFR";
  }
  if (/\bFDC\b/.test(normalized)) {
    return "FDC";
  }
  if (/\b(?:NOTAM\s+D|D\s+NOTAM)\b/.test(normalized)) {
    return "D";
  }

  return undefined;
};

export const detectProcedureName = (input: string): string | undefined => {
  const normalized = normalizeAviationText(input).toUpperCase();
  // Match "the NRVNA departure", "BANGR ONE arrival", "SUMMA TWO departure"
  const namedMatch = normalized.match(/\b(?:THE\s+)?([A-Z][A-Z0-9]{2,12}(?:\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|\d{1,2}))?)\s+(?:DEPARTURE|ARRIVAL|SID|STAR|TRANSITION|PROCEDURE|APPROACH)\b/);
  if (namedMatch) {
    return namedMatch[1].trim();
  }
  // Match "show me the NRVNA from KBFI" (implicit departure/approach)
  const implicitMatch = normalized.match(/\b(?:SHOW|DISPLAY|PULL\s+UP|FIND)\s+(?:ME\s+)?(?:THE\s+)?([A-Z][A-Z0-9]{2,12}(?:\s+(?:ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|\d{1,2}))?)\s+(?:FROM|FOR|AT|INTO)\b/);
  if (implicitMatch) {
    // Exclude common non-procedure words
    const candidate = implicitMatch[1].trim();
    const excluded = new Set(["METAR", "TAF", "WEATHER", "NOTAM", "NOTAMS", "TRAFFIC", "FREQUENCIES", "FREQ", "ATIS", "PLATES", "CHARTS", "DIAGRAM", "INFO", "AIRPORT", "RUNWAY", "RUNWAYS", "STARS", "SIDS", "APPROACHES"]);
    if (!excluded.has(candidate)) return candidate;
  }
  return undefined;
};

export const detectAirportInfoDetail = (input: string): AirportInfoDetail | undefined => {
  const normalized = normalizeAviationText(input).toLowerCase();

  if (/\bchart\s+supplement\b/.test(normalized)) {
    return "supplement";
  }
  if (/\b(?:runways?|airport diagram|field layout)\b/.test(normalized)) {
    return "runways";
  }
  if (/\bfrequenc(?:y|ies)|tower|ground|atis|ctaf/.test(normalized) && !/\b(?:hours|open|close|operat)/i.test(normalized)) {
    return "frequencies";
  }
  if (/\b(?:hours|open|close|closing|operat|schedule|24.?hour|staffed|manned|unmanned|part.?time)\b/.test(normalized)) {
    return "hours";
  }
  if (/\bairport info|airport information|details|facility overview|all\s+(?:data|info)|everything|all\b/.test(normalized)) {
    return "all";
  }
  if (/\bshow\s+me\b/.test(normalized) && !/\b(?:metar|taf|pirep|weather|notam|plate|charts?|freq|traffic|approach(?:es)?|ils|localizer|loc|lda|sdf|par|asr|rnav|vor|gps|rnp|lnav|vnav|lpv|lp|visual|sids?|stars?|odps?|dp|departures?|arrivals?|takeoff\s+(?:minimums?|mins?)|dva|climb\s+gradient|procedures?)\b/.test(normalized)) {
    return "all";
  }

  return undefined;
};

export const extractRadiusNm = (input: string): number | undefined => {
  const normalized = normalizeAviationText(input);
  const match = /\bwithin\s+(\d{1,3})\s*(?:nm|nautical miles?)\b/i.exec(normalized);

  return match ? Number(match[1]) : undefined;
};

export const extractRouteAirports = (input: string): string[] => {
  const normalized = normalizeAviationText(input);
  const routeMatch = /\b(?:route|from)\s+([A-Za-z]{3,4})(?:\s+(?:to|-)\s+([A-Za-z]{3,4}))(?:\s+(?:to|-)\s+([A-Za-z]{3,4}))?/i.exec(
    normalized
  );

  if (!routeMatch) {
    return [];
  }

  return dedupe(routeMatch.slice(1).filter((value): value is string => Boolean(value)).map((value) => value.toUpperCase()));
};

const resolveNavigationAirportToken = (token: string | undefined, defaultFromAirport?: string): string | undefined => {
  if (!token) {
    return undefined;
  }

  if (token.toLowerCase() === "my airport") {
    return defaultFromAirport;
  }

  const normalizedToken = token.toUpperCase();
  return findAirportReference(normalizedToken)?.icao ?? (isContextualAirportCode(normalizedToken) ? normalizedToken : undefined);
};

export const extractNavigationAirports = (
  input: string,
  defaultFromAirport?: string
): { from?: string; to?: string } => {
  const normalized = normalizeAviationText(input);
  const explicitRouteMatch =
    /\b(?:route|direct|vector|heading|bearing|distance)\s+from\s+([A-Za-z]{3,4}|my airport)\s+(?:direct\s+)?to\s+([A-Za-z]{3,4}|my airport)\b/i.exec(
      normalized
    ) ?? /\bfrom\s+([A-Za-z]{3,4}|my airport)\s+(?:direct\s+)?to\s+([A-Za-z]{3,4}|my airport)\b/i.exec(normalized);

  if (explicitRouteMatch) {
    return {
      from: resolveNavigationAirportToken(explicitRouteMatch[1], defaultFromAirport),
      to: resolveNavigationAirportToken(explicitRouteMatch[2], defaultFromAirport)
    };
  }

  const positionalRouteMatch = /\b(?:(?:route|direct|vector|heading|bearing|distance)\s+)?([A-Za-z0-9]{3,4}|my airport)\s+(?:direct\s+)?to\s+([A-Za-z0-9]{3,4}|my airport)\b(?:\s+(?:route|direct|vector|heading|bearing|distance))?/i.exec(
    normalized
  );

  if (positionalRouteMatch) {
    const fromToken = positionalRouteMatch[1];
    const toToken = positionalRouteMatch[2];
    const from = resolveNavigationAirportToken(fromToken, defaultFromAirport);
    const to = resolveNavigationAirportToken(toToken, defaultFromAirport);
    const fromAccepted = Boolean(from) || fromToken.toLowerCase() === "my airport";
    const toAccepted = Boolean(to) || toToken.toLowerCase() === "my airport";

    if (fromAccepted && toAccepted) {
      return { from, to };
    }
  }

  const airports = extractAirportCodes(normalized).filter((code) => !isAllSingleLetters(code));
  const mentionsMyAirport = /\bmy airport\b/i.test(normalized);

  if (airports.length >= 2) {
    return {
      from: mentionsMyAirport ? defaultFromAirport : airports[0],
      to: airports[airports.length - 1]
    };
  }

  if (airports.length === 1) {
    return {
      from: defaultFromAirport,
      to: airports[0]
    };
  }

  return {
    from: mentionsMyAirport ? defaultFromAirport : undefined,
    to: undefined
  };
};

export const toIntentEntities = (entities: ExtractedEntities): IntentEntity[] => {
  const result: IntentEntity[] = [];

  for (const airport of entities.airports) {
    result.push({ label: "airport", value: airport });
  }
  for (const location of entities.cityLocations) {
    result.push({
      label: "city",
      value: location.city,
      city: location.city,
      regionCode: location.regionCode
    });
  }
  for (const frequency of entities.frequencies) {
    result.push({ label: "frequency", value: frequency });
  }
  for (const altitude of entities.altitudesFeet) {
    result.push({ label: "altitude_feet", value: altitude.toString() });
  }
  for (const speed of entities.speedKnots) {
    result.push({ label: "speed_knots", value: speed.toString() });
  }
  for (const squawk of entities.squawkCodes) {
    result.push({ label: "squawk", value: squawk });
  }
  for (const runway of entities.runways) {
    result.push({ label: "runway", value: runway });
  }
  for (const callsign of entities.callsigns) {
    result.push({ label: "callsign", value: callsign });
  }
  for (const aircraftType of entities.aircraftTypes) {
    result.push({ label: "aircraft_type", value: aircraftType });
  }
  for (const farReference of entities.farReferences) {
    result.push({
      label: "far_reference",
      value: farReference.raw,
      normalized: farReference.part
        ? `${farReference.part}${farReference.section ? `.${farReference.section}` : ""}`
        : farReference.raw
    });
  }
  if (entities.navigationFromAirport) {
    result.push({ label: "navigation_from", value: entities.navigationFromAirport });
  }
  if (entities.navigationToAirport) {
    result.push({ label: "navigation_to", value: entities.navigationToAirport });
  }

  return result;
};

export const extractEntities = (input: string, options: { defaultFromAirport?: string } = {}): ExtractedEntities => {
  const airports = extractAirportCodes(input).filter((code) => !isAllSingleLetters(code));
  const navigation = extractNavigationAirports(input, options.defaultFromAirport);
  const procedureName = detectProcedureName(input);

  // If user says "my location", "my airport", "here", "my field" etc., inject the facility airport
  const facilityAirportMentioned =
    options.defaultFromAirport &&
    /\b(?:my\s+(?:airport|location|field|facility|tower|position)|(?:at|around|near)\s+(?:here|me))\b/i.test(input);

  let resolvedAirports =
    facilityAirportMentioned && !airports.includes(options.defaultFromAirport!)
      ? [options.defaultFromAirport!, ...airports]
      : airports;

  // If a procedure name was detected and it looks like an airport code,
  // remove it from the airport list so it isn't used as the target airport
  if (procedureName && resolvedAirports.length > 1) {
    const procUpper = procedureName.split(/\s+/)[0].toUpperCase();
    const filtered = resolvedAirports.filter((a) => a.toUpperCase() !== procUpper);
    if (filtered.length > 0) {
      resolvedAirports = filtered;
    }
  }

  return {
    airports: resolvedAirports,
    cityLocations: extractCityRegions(input),
    frequencies: extractFrequencies(input),
    altitudesFeet: extractAltitudesFeet(input),
    speedKnots: extractSpeedKnots(input),
    squawkCodes: extractSquawkCodes(input),
    callsigns: extractCallsigns(input),
    aircraftTypes: extractAircraftTypes(input),
    runways: extractRunways(input),
    farReferences: extractFarReferences(input),
    radiusNm: extractRadiusNm(input),
    route: extractRouteAirports(input),
    navigationFromAirport: navigation.from,
    navigationToAirport: navigation.to,
    notamTypeFilter: detectNotamTypeFilter(input),
    frequencyType: detectFrequencyType(input),
    procedureType: detectProcedureType(input),
    procedureName,
    airportInfoDetail: detectAirportInfoDetail(input)
  };
};
