import {
  detectAirportInfoDetail,
  detectFrequencyType,
  detectProcedureType,
  extractEntities,
  extractNavigationAirports
} from "@/ai/entity-extractor";
import type {
  AirportInfoDetail,
  BoundingBox,
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
    };

const WEATHER_PATTERN =
  /\b(?:weather|metar|taf|pirep|wx)\b|\b(?:metar|taf|pirep)\s+[A-Za-z]{3,4}\b|\bweather\s+(?:at|for|near)\s+[A-Za-z]{3,4}\b/i;
const NOTAM_PATTERN = /\b(?:notam|notams|fdc|tfr)\b/i;
const FREQUENCY_PATTERN = /\b(?:frequency|frequencies|tower|twr|ground|gnd|approach|app|departure|delivery|del|atis|ctaf)\b/i;
const PLATES_PATTERN =
  /\b(?:plate|plates|chart|charts|approach plates?|instrument approach(?:es)?|approach procedure(?:s)?|approaches|sid|star|ils|rnav|vor|visual)\b/i;
const TRAFFIC_PATTERN = /\b(?:traffic|ads-b|adsb|targets|planes?\s+(?:near|around)|aircraft\s+(?:near|around)|in the pattern)\b/i;
const NAVIGATION_PATTERN =
  /\b(?:heading(?:\s+vector)?|vector|direct|distance|bearing|route)\b|\bhow far is\b|\bfrom\s+(?:my airport|[A-Za-z]{3,4})\s+to\s+(?:my airport|[A-Za-z]{3,4})\b/i;
const REGULATORY_PATTERN =
  /\b(?:far|cfr|aim|regulation|regulatory|part|section|7110(?:\.65)?|wake turbulence|light gun|nordo|squawk|speed restrictions?|speed limits?|weather minimums?|vfr minimums?|class [bcdeg]|line up and wait|position and hold|hold short|go around|cleared to land|special vfr|airspace class)\b/i;
const AIRPORT_INFO_PATTERN =
  /\b(?:airport info|airport information|airport details|runway configuration|runway layout|runways? at|airport diagram|field layout|hours of operation|(?:how long|when) (?:is|does|are).*(?:open|close|operat|staffed))\b/i;
const HOURS_CONTEXT_PATTERN = /\b(?:hours|open|close|closing|operat|schedule|staffed|manned|unmanned|part.?time|24.?hour)\b/i;
const GENERIC_AIRPORT_INFO_PATTERN = /\b(?:tell me about|information (?:for|on)|details (?:for|on)|info (?:for|on)|show me (?:everything|all|all data)|everything (?:for|on|about|at)|all (?:data|info) (?:for|on|about|at)|give me (?:everything|all))\b/i;
const WEATHER_MINIMUMS_PATTERN = /\b(?:vfr\s+)?weather minimums?\b|\bvfr minimums?\b/i;
const APPROACH_PROCEDURE_CONTEXT_PATTERN =
  /\b(?:approach\s+(?:plate|plates|chart|charts|procedure|procedures)|instrument approach(?:es)?|(?:plate|plates|chart|charts|procedure|procedures).*\bapproach(?:es)?|\bapproaches?\s+(?:at|for|into))\b/i;

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
  const betweenMatch = /\bbetween\s+(\d{3,5}|fl\d{2,3})\s+(?:and|-)\s+(\d{3,5}|fl\d{2,3})\b/i.exec(normalized);

  if (!betweenMatch) {
    return undefined;
  }

  const toFeet = (value: string): number => {
    if (/^fl/i.test(value)) {
      return Number(value.replace(/^fl/i, "")) * 100;
    }

    return Number(value);
  };

  return [toFeet(betweenMatch[1]), toFeet(betweenMatch[2])];
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
  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input) && !PLATES_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input)) {
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
    !TRAFFIC_PATTERN.test(input)
  ) {
    candidates.push("airport_info");
  }

  // Compound query detection: if 2+ data-type intents are detected,
  // collapse into airport_info so all panels show
  const dataTypeCandidates = candidates.filter(
    (c) => c !== "navigation" && c !== "regulatory" && c !== "airport_info"
  );
  if (dataTypeCandidates.length >= 2 && entities.airports.length > 0) {
    return ["airport_info"];
  }

  return candidates;
};

export const matchIntentPattern = (input: string, options: { defaultFromAirport?: string } = {}): IntentPatternMatch | null => {
  const entities = extractEntities(input, options);
  const airportInfoDetail = detectAirportInfoDetail(input);
  const isWeatherMinimumsQuery = WEATHER_MINIMUMS_PATTERN.test(input);

  // Compound query detection: if 2+ data types are mentioned with an airport,
  // treat as a broad airport_info request instead of picking just one
  if (entities.airports.length > 0) {
    const hasPlates = PLATES_PATTERN.test(input);
    const hasApproachProcedureContext = APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input);
    const matchCount = [
      FREQUENCY_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input) && !hasPlates && !hasApproachProcedureContext,
      hasPlates,
      WEATHER_PATTERN.test(input) && !isWeatherMinimumsQuery,
      NOTAM_PATTERN.test(input),
      TRAFFIC_PATTERN.test(input)
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

  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input) && !PLATES_PATTERN.test(input) && !HOURS_CONTEXT_PATTERN.test(input)) {
    return {
      type: "frequency",
      confidence: entities.airports.length > 0 ? 0.94 : 0.69,
      facility: entities.airports[0],
      freq_type: detectFrequencyType(input)
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

  return null;
};
