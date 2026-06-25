import {
  detectAirportInfoDetail,
  detectFrequencyType,
  detectProcedureType,
  extractEntities,
  extractNavigationAirports
} from "@/ai/entity-extractor";
import { getDatasetAirport } from "@/data/airport-dataset";
import { findAirportReference } from "@/data/airports";
import type {
  AirportInfoDetail,
  BoundingBox,
  FacilityInfoQuery,
  FrequencyQueryType,
  NavigationIntent,
  NotamTypeFilter,
  ProcedureType,
  WeatherSubtype
} from "@/types/intents";

export type IntentPatternMatch =
  | {
      type: "weather";
      confidence: number;
      subtype: WeatherSubtype;
      airport?: string;
      radius?: number;
    }
  | {
      type: "notam";
      confidence: number;
      airport?: string;
      route?: string[];
      type_filter?: NotamTypeFilter;
    }
  | {
      type: "frequency";
      confidence: number;
      facility?: string;
      freq_type?: FrequencyQueryType;
    }
  | {
      type: "plates";
      confidence: number;
      airport?: string;
      procedure_type?: ProcedureType;
      runway?: string;
    }
  | {
      type: "traffic";
      confidence: number;
      airport?: string;
      bounds?: BoundingBox;
      altitude_range?: [number, number];
    }
  | {
      type: "navigation";
      confidence: number;
      from?: NavigationIntent["from"];
      to?: NavigationIntent["to"];
      speed_knots?: NavigationIntent["speed_knots"];
    }
  | {
      type: "regulatory";
      confidence: number;
      query: string;
      part?: number;
      section?: string;
    }
  | {
      type: "airport_info";
      confidence: number;
      airport?: string;
      detail?: AirportInfoDetail;
    }
  | {
      type: "facility_info";
      confidence: number;
      facility?: string;
      query_type: FacilityInfoQuery;
    };

const WEATHER_PATTERN =
  /\b(?:weather|metar|taf|pirep|wx)\b|\b(?:metar|taf|pirep)\s+[A-Za-z]{3,4}\b|\bweather\s+(?:at|for|near)\s+[A-Za-z]{3,4}\b/i;
const NOTAM_PATTERN = /\b(?:notam|notams|fdc|tfr)\b/i;
const FREQUENCY_PATTERN = /\b(?:frequency|frequencies|tower|twr|ground|gnd|approach|app|departure|delivery|del|atis|ctaf)\b/i;
const CHART_SUPPLEMENT_PATTERN = /\bchart\s+supplement\b/i;
const PLATES_PATTERN =
  /\b(?:plate|plates|chart(?!\s+supplement)|charts(?!\s+supplement)|approach plates?|instrument approach(?:es)?|approach procedure(?:s)?|approaches|sids?|stars?|odps?|dp|ils|localizer|loc|lda|sdf|rnav|gps|rnp|lnav(?:\/vnav)?|vnav|lpv|lp|vor(?:\/dme)?|vortac|ndb|visual(?:\s+approach)?|contact approach|circling approach|circle(?:\s+to\s+land)?|precision approach|non[-\s]?precision approach|par|asr|climb via sid|descend via star|standard instrument departures?|standard (?:terminal )?arrivals?|standard arrival routes?|departure procedures?|departure routes?|filed departures?|assigned departures?|departures?(?!\s+(?:frequency|frequencies|control|controller|clearance|delivery))|arrival procedures?|arrival routes?|arrival transitions?|arrivals?(?!\s+(?:frequency|frequencies|control))|obstacle (?:departure procedures?|departures?|dp)|takeoff minimums?|takeoff mins?|non[-\s]?standard takeoff minimums?|diverse vector area|dva|departure obstacles?|required climb gradient|climb gradient)\b/i;
const TRAFFIC_PATTERN = /\b(?:traffic|ads-b|adsb|targets|planes?\s+(?:near|around)|aircraft\s+(?:near|around)|in the pattern)\b/i;
const NAVIGATION_PATTERN =
  /\b(?:heading(?:\s+vector)?|vector|direct|distance|bearing|route)\b|\bhow far is\b|\bfrom\s+(?:my airport|[A-Za-z]{3,4})\s+to\s+(?:my airport|[A-Za-z]{3,4})\b/i;
const REGULATORY_PATTERN =
  /\b(?:far|cfr|aim|regulation|regulatory|part|section|7110(?:\.65)?|wake turbulence|light gun|nordo|squawk|speed restrictions?|speed limits?|weather minimums?|vfr minimums?|class [bcdeg]|line up and wait|position and hold|hold short|go around|cleared to land|special vfr|airspace class)\b/i;
const AIRPORT_INFO_PATTERN =
  /\b(?:airport info|airport information|airport details|facility overview|runway configuration|runway layout|runways? (?:at|for)|how many runways|airport diagram|field layout|chart supplement|hours of operation|(?:how long|when) (?:is|does|are).*(?:open|close|operat|staffed)|(?:how many|what|which) runways?)\b/i;
const HOURS_CONTEXT_PATTERN = /\b(?:hours|open|close|closing|operat|schedule|staffed|manned|unmanned|part.?time|24.?hour)\b/i;
const GENERIC_AIRPORT_INFO_PATTERN = /\b(?:tell me about|information (?:for|on)|details (?:for|on)|info (?:for|on)|show me (?:everything|all|all data)|everything (?:for|on|about|at)|all (?:data|info) (?:for|on|about|at)|give me (?:everything|all))\b/i;
const WEATHER_MINIMUMS_PATTERN = /\b(?:vfr\s+)?weather minimums?\b|\bvfr minimums?\b/i;
const APPROACH_PROCEDURE_CONTEXT_PATTERN =
  /\b(?:approach\s+(?:plate|plates|chart|charts|procedure|procedures)|instrument approach(?:es)?|(?:plate|plates|chart|charts|procedure|procedures).*\bapproach(?:es)?|\bapproaches?\s+(?:at|for|into))\b/i;
const FACILITY_INFO_PATTERN =
  /\b(?:(?:which|what)\s+(?:facilit(?:y|ies)|centers?|tracons?|approach(?:es)?)\s+(?:border|neighbor|adjacent|surround|next to|around|near)|\b(?:border|neighbor|adjacent|surrounding|adjoining)\s+(?:facilit(?:y|ies)|centers?|tracons?|approach(?:es)?)|\bwho\s+(?:borders?|neighbors?|is (?:adjacent|next)))\b/i;

const FACILITY_AIRPORTS_PATTERN =
  /(?:(?:airports?|fields?)\s+(?:under|in|within|at|for|covered by|served by|part of|does)\b.*\b(?:approach|center|tracon|artcc|cover)\b|\b(?:approach|center|tracon|artcc)\s+(?:cover|have|include|serve)|\b(?:list|show|what|which|give|display)\b.*\bairports?\b.*\b(?:under|in|within|at|for|part of)\b.*\b(?:approach|center|tracon|artcc)\b)/i;

const AIRPORT_IDENTIFIER_TOKEN_PATTERN = /\b[A-Za-z0-9]{2,4}\b/g;
const TRIVIAL_AIRPORT_IDENTIFIER_REMAINDER_PATTERN = /^[\s,.;:!?()[\]{}'"`/\\&+-]*(?:and[\s,.;:!?()[\]{}'"`/\\&+-]*)*$/i;

const resolveExactAirportIdentifierToken = (token: string, airports: string[]): string | undefined => {
  const normalizedToken = token.toUpperCase();
  const airportSet = new Set(airports.map((airport) => airport.toUpperCase()));
  const reference = findAirportReference(normalizedToken);

  if (reference) {
    const referenceCodes = [reference.icao, reference.faa, reference.iata]
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toUpperCase());

    if (
      referenceCodes.includes(normalizedToken) &&
      (airportSet.size === 0 || referenceCodes.some((code) => airportSet.has(code)))
    ) {
      return reference.icao;
    }
  }

  const datasetAirport = getDatasetAirport(normalizedToken);
  if (datasetAirport) {
    const datasetCodes = [
      datasetAirport.ident,
      datasetAirport.icao,
      datasetAirport.gpsCode,
      datasetAirport.iata,
      datasetAirport.localCode
    ]
      .filter((code): code is string => Boolean(code))
      .map((code) => code.toUpperCase());

    if (
      datasetCodes.includes(normalizedToken) &&
      (airportSet.size === 0 || datasetCodes.some((code) => airportSet.has(code)))
    ) {
      return normalizedToken;
    }
  }

  return undefined;
};

const detectBareAirportIdentifierQueryAirports = (input: string, airports: string[]): string[] => {
  const detectedAirports: string[] = [];
  const remainder = input.replace(AIRPORT_IDENTIFIER_TOKEN_PATTERN, (token) => {
    const airport = resolveExactAirportIdentifierToken(token, airports);
    if (!airport) {
      return token;
    }

    detectedAirports.push(airport);
    return " ";
  });

  return detectedAirports.length > 0 && TRIVIAL_AIRPORT_IDENTIFIER_REMAINDER_PATTERN.test(remainder)
    ? detectedAirports
    : [];
};

const detectWeatherSubtype = (input: string): WeatherSubtype => {
  const normalized = input.toLowerCase();
  const requestedSubtypes = ["metar", "taf", "pirep"].filter((subtype) => normalized.includes(subtype));

  if (requestedSubtypes.length !== 1) {
    return "all";
  }

  return requestedSubtypes[0] as WeatherSubtype;
};

const extractAltitudeRange = (input: string): [number, number] | undefined => {
  const normalized = input.toLowerCase();
  const altitudeValuePattern = "(?:fl\\s*\\d{2,3}|\\d{1,3}(?:,\\d{3})+|\\d{3,5})(?:\\s*(?:ft|feet|foot|'))?";

  const toFeet = (value: string): number => {
    const normalizedValue = value
      .trim()
      .replace(/(?:ft|feet|foot|')$/i, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "");

    if (/^fl/i.test(normalizedValue)) {
      return Number(normalizedValue.replace(/^fl/i, "")) * 100;
    }

    return Number(normalizedValue);
  };

  const betweenMatch = new RegExp(
    `\\bbetween\\s+(${altitudeValuePattern})\\s*(?:and|-)\\s*(${altitudeValuePattern})`,
    "i"
  ).exec(normalized);

  if (betweenMatch) {
    const minAltitude = toFeet(betweenMatch[1]);
    const maxAltitude = toFeet(betweenMatch[2]);
    return minAltitude <= maxAltitude ? [minAltitude, maxAltitude] : [maxAltitude, minAltitude];
  }

  const belowMatch = new RegExp(`\\b(?:below|under)\\s+(${altitudeValuePattern})`, "i").exec(normalized);
  if (belowMatch) {
    return [0, toFeet(belowMatch[1])];
  }

  const aboveMatch = new RegExp(`\\b(?:above|over)\\s+(${altitudeValuePattern})`, "i").exec(normalized);
  if (aboveMatch) {
    return [toFeet(aboveMatch[1]), 99999];
  }

  return undefined;
};

const extractBounds = (input: string): BoundingBox | undefined => {
  const match =
    /\bbounds\s+(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\b/i.exec(input);

  if (!match) {
    return undefined;
  }

  return {
    north: Number(match[1]),
    south: Number(match[2]),
    east: Number(match[3]),
    west: Number(match[4])
  };
};

export const detectIntentPatternCandidates = (input: string): IntentPatternMatch["type"][] => {
  const entities = extractEntities(input);
  const candidates: IntentPatternMatch["type"][] = [];
  const airportInfoDetail = detectAirportInfoDetail(input);
  const isWeatherMinimumsQuery = WEATHER_MINIMUMS_PATTERN.test(input);

  if (WEATHER_PATTERN.test(input) && !isWeatherMinimumsQuery) {
    candidates.push("weather");
  }
  if (NOTAM_PATTERN.test(input)) {
    candidates.push("notam");
  }
  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input) && !PLATES_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input) && !TRAFFIC_PATTERN.test(input)) {
    candidates.push("frequency");
  }
  if (PLATES_PATTERN.test(input)) {
    candidates.push("plates");
  }
  if (TRAFFIC_PATTERN.test(input)) {
    candidates.push("traffic");
  }
  if (NAVIGATION_PATTERN.test(input)) {
    candidates.push("navigation");
  }
  if (REGULATORY_PATTERN.test(input)) {
    candidates.push("regulatory");
  }
  const isHoursQuery = HOURS_CONTEXT_PATTERN.test(input);
  if (
    (AIRPORT_INFO_PATTERN.test(input) ||
      (GENERIC_AIRPORT_INFO_PATTERN.test(input) && entities.airports.length > 0) ||
      (airportInfoDetail &&
        airportInfoDetail !== "frequencies" &&
        entities.airports.length > 0 &&
        !FREQUENCY_PATTERN.test(input) &&
        !PLATES_PATTERN.test(input)) ||
      (isHoursQuery && entities.airports.length > 0)) &&
    (!FREQUENCY_PATTERN.test(input) || isHoursQuery) &&
    !PLATES_PATTERN.test(input) &&
    !WEATHER_PATTERN.test(input) &&
    !TRAFFIC_PATTERN.test(input) &&
    !NAVIGATION_PATTERN.test(input)
  ) {
    candidates.push("airport_info");
  }

  if (FACILITY_INFO_PATTERN.test(input)) {
    candidates.push("facility_info");
  }

  if (FACILITY_AIRPORTS_PATTERN.test(input)) {
    candidates.push("facility_info");
  }

  // Compound query detection: if 2+ data-type intents are detected,
  // collapse into airport_info so all panels show
  const dataTypeCandidates = candidates.filter(
    (c) => c !== "navigation" && c !== "regulatory" && c !== "airport_info"
  );
  if (dataTypeCandidates.length >= 2 && entities.airports.length > 0) {
    return ["airport_info"];
  }

  if (
    !candidates.includes("airport_info") &&
    detectBareAirportIdentifierQueryAirports(input, entities.airports).length > 0
  ) {
    candidates.push("airport_info");
  }

  return candidates;
};

export const matchIntentPattern = (input: string, options: { defaultFromAirport?: string } = {}): IntentPatternMatch | null => {
  const entities = extractEntities(input, options);
  const airportInfoDetail = detectAirportInfoDetail(input);
  const isWeatherMinimumsQuery = WEATHER_MINIMUMS_PATTERN.test(input);

  // Facility airport listing queries (list airports under X approach)
  // Test BEFORE adjacency since "under" can appear in both contexts
  if (FACILITY_AIRPORTS_PATTERN.test(input)) {
    const facility = entities.airports[0];
    return {
      type: "facility_info",
      confidence: 0.92,
      facility,
      query_type: "airports"
    };
  }

  // Facility info queries (bordering, adjacent, neighboring facilities)
  if (FACILITY_INFO_PATTERN.test(input)) {
    const facility = entities.airports[0];
    const queryType: FacilityInfoQuery =
      /\b(?:overlying|above|over)\b/i.test(input) ? "overlying"
        : /\b(?:underlying|below|under)\b/i.test(input) ? "underlying"
          : "adjacent";
    return {
      type: "facility_info",
      confidence: 0.92,
      facility,
      query_type: queryType
    };
  }

  // Compound query detection: if 2+ data types are mentioned with an airport,
  // treat as a broad airport_info request instead of picking just one
  if (entities.airports.length > 0 && !NAVIGATION_PATTERN.test(input)) {
    const hasPlates = PLATES_PATTERN.test(input);
    const hasApproachProcedureContext = APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input);
    const hasTraffic = TRAFFIC_PATTERN.test(input);
    const matchCount = [
      FREQUENCY_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input) && !hasPlates && !hasApproachProcedureContext && !hasTraffic,
      hasPlates,
      WEATHER_PATTERN.test(input) && !isWeatherMinimumsQuery,
      NOTAM_PATTERN.test(input),
      hasTraffic
    ].filter(Boolean).length;

    if (matchCount >= 2 || airportInfoDetail === "all") {
      return {
        type: "airport_info",
        confidence: 0.91,
        airport: entities.airports[0],
        detail: "all"
      };
    }
  }

  if (WEATHER_PATTERN.test(input) && !isWeatherMinimumsQuery) {
    return {
      type: "weather",
      confidence: entities.airports.length > 0 ? 0.95 : 0.68,
      subtype: detectWeatherSubtype(input),
      airport: entities.airports[0],
      radius: entities.radiusNm
    };
  }

  if (NOTAM_PATTERN.test(input)) {
    return {
      type: "notam",
      confidence: 0.93,
      airport: entities.airports[0],
      route: entities.route.length > 0 ? entities.route : undefined,
      type_filter: entities.notamTypeFilter
    };
  }

  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input) && !PLATES_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input) && !TRAFFIC_PATTERN.test(input)) {
    return {
      type: "frequency",
      confidence: entities.airports.length > 0 ? 0.94 : 0.69,
      facility: entities.airports[0],
      freq_type: detectFrequencyType(input)
    };
  }

  if (CHART_SUPPLEMENT_PATTERN.test(input)) {
    return {
      type: "airport_info",
      confidence: 0.95,
      airport: entities.airports[0],
      detail: "supplement" as AirportInfoDetail
    };
  }

  if (PLATES_PATTERN.test(input)) {
    return {
      type: "plates",
      confidence: entities.airports.length > 0 ? 0.95 : 0.67,
      airport: entities.airports[0],
      procedure_type: detectProcedureType(input),
      runway: entities.runways[0]
    };
  }

  if (TRAFFIC_PATTERN.test(input)) {
    return {
      type: "traffic",
      confidence: 0.9,
      airport: entities.airports[0],
      bounds: extractBounds(input),
      altitude_range: extractAltitudeRange(input)
    };
  }

  if (NAVIGATION_PATTERN.test(input)) {
    const navigation = extractNavigationAirports(input, options.defaultFromAirport);

    return {
      type: "navigation",
      confidence: navigation.to ? (navigation.from ? 0.95 : 0.72) : 0.46,
      from: navigation.from,
      to: navigation.to,
      speed_knots: entities.speedKnots[0]
    };
  }

  if (REGULATORY_PATTERN.test(input)) {
    const farReference = entities.farReferences[0];

    return {
      type: "regulatory",
      confidence: farReference ? 0.96 : 0.84,
      query: input.trim(),
      part: farReference?.part,
      section: farReference?.section
    };
  }

  if (
    (AIRPORT_INFO_PATTERN.test(input) || (GENERIC_AIRPORT_INFO_PATTERN.test(input) && entities.airports.length > 0)) ||
    (airportInfoDetail && airportInfoDetail !== "frequencies" && entities.airports.length > 0)
  ) {
    return {
      type: "airport_info",
      confidence: entities.airports.length > 0 ? 0.91 : 0.68,
      airport: entities.airports[0],
      detail: airportInfoDetail
    };
  }

  const bareAirportIdentifierAirports = detectBareAirportIdentifierQueryAirports(input, entities.airports);
  if (bareAirportIdentifierAirports.length > 0) {
    return {
      type: "airport_info",
      confidence: 0.9,
      airport: entities.airports[0] ?? bareAirportIdentifierAirports[0],
      detail: "all"
    };
  }

  return null;
};
