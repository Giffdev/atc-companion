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
  | "navigation"
  | "regulatory"
  | "airport_info"
  | "facility_info"
  | "unknown";

export type WeatherSubtype = "metar" | "taf" | "pirep" | "all";
export type NotamTypeFilter = "D" | "FDC" | "TFR";
export type FrequencyQueryType = "TWR" | "APP" | "GND" | "DEL" | "ATIS" | "CTAF";
export type ProcedureType = "ILS" | "RNAV" | "VOR" | "VISUAL" | "SID" | "STAR" | "ODP";
export type AirportInfoDetail = "runways" | "frequencies" | "hours" | "supplement" | "all";
export type ClarificationReason = "ambiguous" | "ambiguous-airport" | "low-confidence" | "missing-entity" | "empty-input";

export interface IntentEntity {
  label: string;
  value: string;
  normalized?: string;
  city?: string;
  regionCode?: string;
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
  procedure_name?: string;
  runway?: string;
}

export interface TrafficIntent extends IntentMetadata {
  type: "traffic";
  airport?: string;
  bounds?: BoundingBox;
  altitude_range?: [number, number];
}

export interface NavigationIntent extends IntentMetadata {
  type: "navigation";
  from?: string;
  to: string;
  speed_knots?: number;
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

export type FacilityInfoQuery = "adjacent" | "overlying" | "underlying" | "general" | "airports";

export interface FacilityInfoIntent extends IntentMetadata {
  type: "facility_info";
  facility?: string;
  query_type: FacilityInfoQuery;
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
  | NavigationIntent
  | RegulatoryIntent
  | AirportInfoIntent
  | FacilityInfoIntent
  | UnknownIntent;
