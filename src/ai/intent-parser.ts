import {
  extractEntities,
  normalizeAviationText,
  toIntentEntities,
  type ExtractedEntities
} from "@/ai/entity-extractor";
import { classifyIntentWithLlm } from "@/ai/llm-classifier";
import { detectIntentPatternCandidates, matchIntentPattern, type IntentPatternMatch } from "@/ai/patterns";
import { getFacilityById } from "@/data/facilities";
import { toIsoNow } from "@/lib/utils";
import type { DataSource } from "@/types/api";
import type { ParsedIntent } from "@/types/intents";

const CONFIDENCE_THRESHOLD = 0.7;

const PATTERN_SOURCE: DataSource = {
  id: "internal-intent-patterns",
  name: "Internal Intent Pattern Matcher",
  url: "internal://intent-patterns",
  reliability: "high",
  refresh_interval: "on-demand"
};

const LLM_SOURCE: DataSource = {
  id: "llm-intent-classifier",
  name: "LLM Intent Classifier",
  url: "internal://llm-intent-classifier",
  reliability: "medium",
  refresh_interval: "on-demand"
};

const createUnknownIntent = (
  rawInput: string,
  parsedAt: string,
  entities: ExtractedEntities,
  options: {
    confidence: number;
    prompt: string;
    reason: "ambiguous" | "low-confidence" | "missing-entity" | "empty-input";
    candidates?: ParsedIntent["type"][];
  }
): ParsedIntent => ({
  type: "unknown",
  confidence: options.confidence,
  rawInput,
  parsedAt,
  source: PATTERN_SOURCE,
  entities: toIntentEntities(entities),
  requiresClarification: true,
  clarificationPrompt: options.prompt,
  clarificationReason: options.reason,
  candidates: options.candidates?.filter((candidate): candidate is Exclude<ParsedIntent["type"], "unknown"> => {
    return candidate !== "unknown";
  })
});

const createIntentFromPattern = (
  rawInput: string,
  parsedAt: string,
  entities: ExtractedEntities,
  source: DataSource,
  match: IntentPatternMatch
): ParsedIntent => {
  const metadata = {
    confidence: match.confidence,
    rawInput,
    parsedAt,
    source,
    entities: toIntentEntities(entities),
    requiresClarification: false
  };

  switch (match.type) {
    case "weather":
      return match.airport
        ? {
            ...metadata,
            type: "weather",
            subtype: match.subtype,
            airport: match.airport,
            radius: match.radius
          }
        : createUnknownIntent(rawInput, parsedAt, entities, {
            confidence: 0.52,
            prompt: "Which airport do you want weather for?",
            reason: "missing-entity",
            candidates: ["weather"]
          });
    case "notam":
      return {
        ...metadata,
        type: "notam",
        airport: match.airport,
        route: match.route,
        type_filter: match.type_filter
      };
    case "frequency":
      return match.facility
        ? {
            ...metadata,
            type: "frequency",
            facility: match.facility,
            freq_type: match.freq_type
          }
        : createUnknownIntent(rawInput, parsedAt, entities, {
            confidence: 0.5,
            prompt: "Which airport or facility do you need the frequency for?",
            reason: "missing-entity",
            candidates: ["frequency"]
          });
    case "plates":
      return match.airport
        ? {
            ...metadata,
            type: "plates",
            airport: match.airport,
            procedure_type: match.procedure_type,
            runway: match.runway
          }
        : createUnknownIntent(rawInput, parsedAt, entities, {
            confidence: 0.49,
            prompt: "Which airport do you need the plate for?",
            reason: "missing-entity",
            candidates: ["plates"]
          });
    case "traffic":
      return {
        ...metadata,
        type: "traffic",
        airport: match.airport,
        bounds: match.bounds,
        altitude_range: match.altitude_range
      };
    case "navigation":
      return match.to
        ? match.from
          ? {
              ...metadata,
              type: "navigation",
              from: match.from,
              to: match.to,
              speed_knots: match.speed_knots
            }
          : createUnknownIntent(rawInput, parsedAt, entities, {
              confidence: match.confidence,
              prompt: "Which airport should I calculate the heading or distance from?",
              reason: "missing-entity",
              candidates: ["navigation"]
            })
        : createUnknownIntent(rawInput, parsedAt, entities, {
            confidence: 0.45,
            prompt: "Which destination airport do you want a heading or distance to?",
            reason: "missing-entity",
            candidates: ["navigation"]
          });
    case "regulatory":
      return {
        ...metadata,
        type: "regulatory",
        query: match.query,
        part: match.part,
        section: match.section
      };
    case "airport_info":
      return match.airport
        ? {
            ...metadata,
            type: "airport_info",
            airport: match.airport,
            detail: match.detail
          }
        : createUnknownIntent(rawInput, parsedAt, entities, {
            confidence: 0.48,
            prompt: "Which airport do you want information for?",
            reason: "missing-entity",
            candidates: ["airport_info"]
          });
  }
};

const createIntentFromLlm = (
  rawInput: string,
  parsedAt: string,
  entities: ExtractedEntities,
  result: NonNullable<Awaited<ReturnType<typeof classifyIntentWithLlm>>>
): ParsedIntent => {
  if (result.type === "unknown" || result.confidence < CONFIDENCE_THRESHOLD) {
    return createUnknownIntent(rawInput, parsedAt, entities, {
      confidence: result.confidence,
      prompt: result.reason ?? "Can you clarify what aviation data you want me to look up?",
      reason: "low-confidence"
    });
  }

  const enrichedEntities: ExtractedEntities = {
    ...entities,
    airports: result.airport ? Array.from(new Set([result.airport, ...entities.airports])) : entities.airports,
    route: result.route ?? entities.route
  };

  const base = {
    confidence: result.confidence,
    rawInput,
    parsedAt,
    source: LLM_SOURCE,
    entities: toIntentEntities(enrichedEntities),
    requiresClarification: false
  };

  switch (result.type) {
    case "weather":
      return result.airport
        ? {
            ...base,
            type: "weather",
            subtype: result.subtype ?? "all",
            airport: result.airport,
            radius: result.radius
          }
        : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
            confidence: result.confidence,
            prompt: "Which airport do you want weather for?",
            reason: "missing-entity",
            candidates: ["weather"]
          });
    case "notam":
      return {
        ...base,
        type: "notam",
        airport: result.airport,
        route: result.route,
        type_filter: result.type_filter
      };
    case "frequency":
      return result.facility
        ? {
            ...base,
            type: "frequency",
            facility: result.facility,
            freq_type: result.freq_type
          }
        : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
            confidence: result.confidence,
            prompt: "Which airport or facility do you need the frequency for?",
            reason: "missing-entity",
            candidates: ["frequency"]
          });
    case "plates":
      return result.airport
        ? {
            ...base,
            type: "plates",
            airport: result.airport,
            procedure_type: result.procedure_type,
            runway: result.runway
          }
        : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
            confidence: result.confidence,
            prompt: "Which airport do you need the plate for?",
            reason: "missing-entity",
            candidates: ["plates"]
          });
    case "traffic":
      return {
        ...base,
        type: "traffic",
        airport: result.airport
      };
    case "navigation": {
      const fromAirport = result.from ?? entities.navigationFromAirport;
      const toAirport = result.to ?? entities.navigationToAirport;

      return toAirport
        ? fromAirport
          ? {
              ...base,
              type: "navigation",
              from: fromAirport,
              to: toAirport,
              speed_knots: result.speed_knots ?? entities.speedKnots[0]
            }
          : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
              confidence: result.confidence,
              prompt: "Which airport should I calculate the heading or distance from?",
              reason: "missing-entity",
              candidates: ["navigation"]
            })
        : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
            confidence: result.confidence,
            prompt: "Which destination airport do you want a heading or distance to?",
            reason: "missing-entity",
            candidates: ["navigation"]
          });
    }
    case "regulatory":
      return {
        ...base,
        type: "regulatory",
        query: result.query ?? rawInput,
        part: result.part,
        section: result.section
      };
    case "airport_info":
      return result.airport
        ? {
            ...base,
            type: "airport_info",
            airport: result.airport,
            detail: result.airport_info_detail
          }
        : createUnknownIntent(rawInput, parsedAt, enrichedEntities, {
            confidence: result.confidence,
            prompt: "Which airport do you want information for?",
            reason: "missing-entity",
            candidates: ["airport_info"]
          });
  }
};

export interface ParseIntentOptions {
  facilityId?: string;
}

export const parseIntent = async (input: string, options: ParseIntentOptions = {}): Promise<ParsedIntent> => {
  const parsedAt = toIsoNow();
  const rawInput = input.trim();
  const normalizedInput = normalizeAviationText(rawInput);
  const selectedFacility = options.facilityId ? getFacilityById(options.facilityId) : null;
  const defaultFromAirport = selectedFacility?.primaryAirport;
  const entities = extractEntities(normalizedInput, { defaultFromAirport });

  if (!rawInput) {
    return createUnknownIntent(rawInput, parsedAt, entities, {
      confidence: 0,
      prompt: "Tell me what aviation data you need, such as weather at KJFK or FAR 91.113.",
      reason: "empty-input"
    });
  }

  const patternCandidates = detectIntentPatternCandidates(normalizedInput);

  if (patternCandidates.length > 1) {
    return createUnknownIntent(rawInput, parsedAt, entities, {
      confidence: 0.42,
      prompt: `I heard multiple request types (${patternCandidates.join(", ")}). Please ask for one aviation data source at a time so I do not mix answers.`,
      reason: "ambiguous",
      candidates: patternCandidates
    });
  }

  const patternMatch = matchIntentPattern(normalizedInput, { defaultFromAirport });

  if (patternMatch) {
    const parsedIntent = createIntentFromPattern(rawInput, parsedAt, entities, PATTERN_SOURCE, patternMatch);

    if (parsedIntent.confidence >= CONFIDENCE_THRESHOLD || parsedIntent.type === "unknown") {
      return parsedIntent;
    }
  }

  const llmResult = await classifyIntentWithLlm(rawInput);

  if (llmResult) {
    return createIntentFromLlm(rawInput, parsedAt, entities, llmResult);
  }

  return createUnknownIntent(rawInput, parsedAt, entities, {
    confidence: patternMatch?.confidence ?? 0.2,
    prompt: "Can you clarify whether you need weather, NOTAMs, frequencies, plates, traffic, navigation, airport info, or a regulation lookup?",
    reason: patternMatch ? "low-confidence" : "ambiguous",
    candidates: patternMatch ? [patternMatch.type] : undefined
  });
};
