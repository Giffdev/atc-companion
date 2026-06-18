import {
  detectAirportInfoDetail,
  detectFrequencyType,
  detectProcedureType,
  extractEntities
} from "@/ai/entity-extractor";
import type {
  AirportInfoDetail,
  BoundingBox,
  FrequencyQueryType,
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
const PLATES_PATTERN = /\b(?:plate|plates|chart|charts|approach plate|sid|star|ils|rnav|vor|visual)\b/i;
const TRAFFIC_PATTERN = /\b(?:traffic|ads-b|adsb|targets)\b/i;
const REGULATORY_PATTERN =
  /\b(?:far|cfr|aim|regulation|regulatory|part|section|7110(?:\.65)?|wake turbulence|light gun|nordo|squawk|speed restrictions?|class [bcdeg]|line up and wait|position and hold|hold short|go around|cleared to land|special vfr|airspace class)\b/i;
const AIRPORT_INFO_PATTERN = /\b(?:airport info|airport information|airport details|runways? at|frequencies? at)\b/i;
const APPROACH_PROCEDURE_CONTEXT_PATTERN = /\b(?:approach\s+(?:plate|chart|procedure)|(?:plate|chart|procedure).*\bapproach)\b/i;

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

  if (WEATHER_PATTERN.test(input)) {
    candidates.push("weather");
  }
  if (NOTAM_PATTERN.test(input)) {
    candidates.push("notam");
  }
  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input)) {
    candidates.push("frequency");
  }
  if (PLATES_PATTERN.test(input)) {
    candidates.push("plates");
  }
  if (TRAFFIC_PATTERN.test(input)) {
    candidates.push("traffic");
  }
  if (REGULATORY_PATTERN.test(input)) {
    candidates.push("regulatory");
  }
  if (
    AIRPORT_INFO_PATTERN.test(input) ||
    (detectAirportInfoDetail(input) &&
      entities.airports.length > 0 &&
      !FREQUENCY_PATTERN.test(input) &&
      !PLATES_PATTERN.test(input))
  ) {
    candidates.push("airport_info");
  }

  return candidates;
};

export const matchIntentPattern = (input: string): IntentPatternMatch | null => {
  const entities = extractEntities(input);

  if (WEATHER_PATTERN.test(input)) {
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

  if (FREQUENCY_PATTERN.test(input) && !APPROACH_PROCEDURE_CONTEXT_PATTERN.test(input)) {
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

  if (AIRPORT_INFO_PATTERN.test(input) || (detectAirportInfoDetail(input) && entities.airports.length > 0)) {
    return {
      type: "airport_info",
      confidence: entities.airports.length > 0 ? 0.91 : 0.68,
      airport: entities.airports[0],
      detail: detectAirportInfoDetail(input)
    };
  }

  return null;
};
