import type { DataSource } from "@/types/api";

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type IntentType =
  | "weather"
  | "notam"
  | "frequency"
  | "plates"
  | "traffic"
  | "regulatory"
  | "airport_info"
  | "unknown";

export type WeatherSubtype = "metar" | "taf" | "pirep" | "all";
export type NotamTypeFilter = "D" | "FDC" | "TFR";
export type FrequencyQueryType = "TWR" | "APP" | "GND" | "DEL" | "ATIS" | "CTAF";
export type ProcedureType = "ILS" | "RNAV" | "VOR" | "VISUAL" | "SID" | "STAR";
export type AirportInfoDetail = "runways" | "frequencies" | "all";
export type ClarificationReason = "ambiguous" | "low-confidence" | "missing-entity" | "empty-input";

export interface IntentEntity {
  label: string;
  value: string;
  normalized?: string;
}

export interface IntentMetadata {
  confidence: number;
  rawInput: string;
  parsedAt: string;
  source: DataSource;
  entities: IntentEntity[];
  requiresClarification: boolean;
  clarificationReason?: ClarificationReason;
  clarificationPrompt?: string;
}

export interface WeatherIntent extends IntentMetadata {
  type: "weather";
  subtype: WeatherSubtype;
  airport: string;
  radius?: number;
}

export interface NotamIntent extends IntentMetadata {
  type: "notam";
  airport?: string;
  route?: string[];
  type_filter?: NotamTypeFilter;
}

export interface FrequencyIntent extends IntentMetadata {
  type: "frequency";
  facility: string;
  freq_type?: FrequencyQueryType;
}

export interface PlatesIntent extends IntentMetadata {
  type: "plates";
  airport: string;
  procedure_type?: ProcedureType;
  runway?: string;
}

export interface TrafficIntent extends IntentMetadata {
  type: "traffic";
  airport?: string;
  bounds?: BoundingBox;
  altitude_range?: [number, number];
}

export interface RegulatoryIntent extends IntentMetadata {
  type: "regulatory";
  query: string;
  part?: number;
  section?: string;
}

export interface AirportInfoIntent extends IntentMetadata {
  type: "airport_info";
  airport: string;
  detail?: AirportInfoDetail;
}

export interface UnknownIntent extends IntentMetadata {
  type: "unknown";
  candidates?: Exclude<IntentType, "unknown">[];
}

export type ParsedIntent =
  | WeatherIntent
  | NotamIntent
  | FrequencyIntent
  | PlatesIntent
  | TrafficIntent
  | RegulatoryIntent
  | AirportInfoIntent
  | UnknownIntent;
