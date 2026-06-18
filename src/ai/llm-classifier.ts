import { normalizeAviationText } from "@/ai/entity-extractor";
import type {
  AirportInfoDetail,
  FrequencyQueryType,
  IntentType,
  NotamTypeFilter,
  ProcedureType,
  WeatherSubtype
} from "@/types/intents";

type ClassifiedIntentType = Exclude<IntentType, "unknown"> | "unknown";

export interface LlmClassificationResult {
  type: ClassifiedIntentType;
  confidence: number;
  airport?: string;
  route?: string[];
  subtype?: WeatherSubtype;
  radius?: number;
  type_filter?: NotamTypeFilter;
  facility?: string;
  freq_type?: FrequencyQueryType;
  procedure_type?: ProcedureType;
  runway?: string;
  query?: string;
  part?: number;
  section?: string;
  airport_info_detail?: AirportInfoDetail;
  reason?: string;
}

export const INTENT_CLASSIFIER_SYSTEM_PROMPT = `You classify aviation-related user input into a fixed intent schema.

Rules:
- You ONLY classify intent and extract entities.
- You MUST NEVER answer the user's aviation question.
- You MUST NEVER fabricate METARs, TAFs, NOTAMs, frequencies, traffic, or regulations.
- If the input is ambiguous, return type "unknown" with lower confidence.
- Return valid JSON only. No markdown. No prose.

Allowed intent types:
- weather
- notam
- frequency
- plates
- traffic
- regulatory
- airport_info
- unknown

JSON schema:
{
  "type": "weather" | "notam" | "frequency" | "plates" | "traffic" | "regulatory" | "airport_info" | "unknown",
  "confidence": number,
  "airport"?: string,
  "route"?: string[],
  "subtype"?: "metar" | "taf" | "pirep" | "all",
  "radius"?: number,
  "type_filter"?: "D" | "FDC" | "TFR",
  "facility"?: string,
  "freq_type"?: "TWR" | "APP" | "GND" | "DEL" | "ATIS" | "CTAF",
  "procedure_type"?: "ILS" | "RNAV" | "VOR" | "VISUAL" | "SID" | "STAR",
  "runway"?: string,
  "query"?: string,
  "part"?: number,
  "section"?: string,
  "airport_info_detail"?: "runways" | "frequencies" | "all",
  "reason"?: string
}`;

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const parseJsonObject = (content: string): LlmClassificationResult | null => {
  const trimmed = content.trim();
  const jsonCandidate = trimmed.startsWith("{") ? trimmed : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);

  if (!jsonCandidate) {
    return null;
  }

  try {
    return JSON.parse(jsonCandidate) as LlmClassificationResult;
  } catch {
    return null;
  }
};

export const classifyIntentWithLlm = async (input: string): Promise<LlmClassificationResult | null> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: INTENT_CLASSIFIER_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            rawInput: input,
            normalizedInput: normalizeAviationText(input),
            task: "Classify the intent and extract only entities that are explicitly present in the input."
          })
        }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const messageContent = payload.choices?.[0]?.message?.content;
  const content =
    typeof messageContent === "string"
      ? messageContent
      : Array.isArray(messageContent)
        ? messageContent.map((item) => item.text ?? "").join("")
        : "";

  const parsed = parseJsonObject(content);

  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    confidence: Number.isFinite(parsed.confidence) ? parsed.confidence : 0
  };
};
