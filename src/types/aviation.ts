import type { DataSource } from "@/types/api";

/** ISO-8601 timestamp string returned by upstream aviation data providers. */
export type IsoTimestamp = string;

/** Shared provenance metadata attached to every aviation record in the domain model. */
export interface SourceTracked {
  source: DataSource;
  fetchedAt: IsoTimestamp;
  isStale: boolean;
}

/** Geodetic position using WGS-84 decimal degrees. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** FAA flight category derived from ceiling and visibility. */
export type FlightCategory = "VFR" | "MVFR" | "IFR" | "LIFR" | "UNKNOWN";

/** Common cloud coverage codes used in METARs, TAFs, and PIREPs. */
export type SkyCoverage = "SKC" | "CLR" | "FEW" | "SCT" | "BKN" | "OVC" | "VV" | "NSC";

/** Weather shorthand groups such as -RA, BR, TSRA, or FG. */
export type WeatherPhenomenonCode = string;

/** Surface wind as reported in aviation weather products. */
export interface WindCondition {
  directionDegrees: number | null;
  speedKnots: number;
  gustKnots?: number;
  variableDirection?: boolean;
}

/** Prevailing flight visibility; US products commonly report statute miles. */
export interface VisibilityCondition {
  prevailingStatuteMiles: number | null;
  minimumStatuteMiles?: number | null;
  rawValue?: string;
}

/** Individual cloud layer like SCT025 or BKN080. */
export interface SkyConditionLayer {
  coverage: SkyCoverage;
  baseFeetAgl: number | null;
  cloudType?: "CB" | "TCU" | "CI" | string;
}

/** Ceiling is the lowest broken, overcast, or vertical-visibility layer. */
export interface CeilingCondition {
  minimumBrokenOrOvercastFeetAgl: number | null;
  verticalVisibilityFeetAgl?: number | null;
}

/** Full METAR observation normalized for app use. */
export interface Metar extends SourceTracked {
  stationIcao: string;
  rawText: string;
  observedAt: IsoTimestamp;
  wind: WindCondition | null;
  visibility: VisibilityCondition | null;
  ceiling: CeilingCondition | null;
  skyConditions: SkyConditionLayer[];
  weather: WeatherPhenomenonCode[];
  temperatureC: number | null;
  dewpointC: number | null;
  altimeterInHg: number | null;
  flightCategory: FlightCategory;
  remarks: string[];
}

/** TAF groups describe how conditions change over time within a forecast period. */
export type TafForecastGroupType = "INITIAL" | "FM" | "TEMPO" | "BECMG" | "PROB30" | "PROB40";

/** Forecast conditions within one TAF change group. */
export interface TafForecastGroup {
  groupType: TafForecastGroupType;
  validFrom: IsoTimestamp;
  validTo?: IsoTimestamp;
  wind: WindCondition | null;
  visibility: VisibilityCondition | null;
  skyConditions: SkyConditionLayer[];
  weather: WeatherPhenomenonCode[];
  ceiling: CeilingCondition | null;
  remarks?: string[];
}

/** Terminal Aerodrome Forecast issued for an airport. */
export interface Taf extends SourceTracked {
  stationIcao: string;
  rawText: string;
  issuedAt: IsoTimestamp;
  validFrom: IsoTimestamp;
  validTo: IsoTimestamp;
  forecastGroups: TafForecastGroup[];
}

/** PIREP urgency; UUA indicates urgent pilot-reported hazardous conditions. */
export type PirepType = "UA" | "UUA";

/** Pilot-reported icing intensity and layer. */
export interface IcingCondition {
  intensity: "TRACE" | "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME" | "UNKNOWN";
  type?: "RIME" | "CLEAR" | "MIXED" | "UNKNOWN";
  baseFeetMsl?: number;
  topFeetMsl?: number;
}

/** Pilot-reported turbulence intensity and altitude band. */
export interface TurbulenceCondition {
  intensity: "LIGHT" | "MODERATE" | "SEVERE" | "EXTREME" | "UNKNOWN";
  frequency?: "OCCASIONAL" | "INTERMITTENT" | "CONTINUOUS";
  baseFeetMsl?: number;
  topFeetMsl?: number;
}

/** Sky condition from a pilot report, often based on tops and bases seen in flight. */
export interface PirepSkyCondition {
  coverage: SkyCoverage;
  baseFeetMsl?: number;
  topFeetMsl?: number;
}

/** Pilot report (PIREP) from a flight crew or other aircraft observer. */
export interface Pirep extends SourceTracked {
  reportId?: string;
  type: PirepType;
  rawText: string;
  issuedAt: IsoTimestamp;
  aircraftType?: string;
  stationIcao?: string;
  location: {
    description: string;
    point?: GeoPoint;
  };
  altitudeFeetMsl: number | null;
  icing: IcingCondition[];
  turbulence: TurbulenceCondition[];
  skyConditions: PirepSkyCondition[];
  weather: WeatherPhenomenonCode[];
  remarks?: string;
}

/** FAA NOTAM class. D = distant, FDC = regulatory, TFR = temporary flight restriction. */
export type NotamType = "D" | "FDC" | "TFR";

/** Shared NOTAM fields. */
export interface BaseNotam extends SourceTracked {
  notamId: string;
  type: NotamType;
  affectedFacility: string;
  effectiveAt: IsoTimestamp;
  expiresAt?: IsoTimestamp;
  text: string;
}

/** D NOTAMs describe operational conditions like runway closures or navaid outages. */
export interface DNotam extends BaseNotam {
  type: "D";
  keyword?: string;
}

/** FDC NOTAMs publish regulatory or procedure changes that carry legal effect. */
export interface FdcNotam extends BaseNotam {
  type: "FDC";
  reference?: string;
}

/** TFR NOTAMs temporarily restrict access to designated airspace. */
export interface TfrNotam extends BaseNotam {
  type: "TFR";
  tfrNumber?: string;
  purpose?: string;
}

export type Notam = DNotam | FdcNotam | TfrNotam;

/** Supported procedure chart families returned by the chart services. */
export type ApproachType = "ILS" | "RNAV" | "VOR" | "VISUAL" | "LOC" | "NDB";

/** Instrument or visual approach chart metadata, usually backed by FAA DTPP PDFs. */
export interface ApproachPlate extends SourceTracked {
  airportIcao: string;
  procedureName: string;
  procedureType: ApproachType;
  runway: string;
  chartUrl: string;
  pdfUrl?: string;
}

/** Standard Instrument Departure used to leave busy terminal areas in an organized way. */
export interface Sid extends SourceTracked {
  airportIcao: string;
  procedureName: string;
  transitions: string[];
  chartUrl: string;
}

/** Standard Terminal Arrival Route used to sequence inbound IFR traffic. */
export interface Star extends SourceTracked {
  airportIcao: string;
  procedureName: string;
  transitions: string[];
  chartUrl: string;
}

/** ILS equipment installed for a runway end. */
export interface RunwayIlsEquipment {
  runwayEnd: string;
  localizerFrequencyMHz?: number;
  glideslopeAngleDegrees?: number;
  category?: "CAT I" | "CAT II" | "CAT III";
}

/** Basic runway characteristics used by dispatch, performance, and airport views. */
export interface Runway extends SourceTracked {
  identifier: string;
  lengthFeet: number;
  widthFeet: number;
  surface: "ASPHALT" | "CONCRETE" | "GRASS" | "GRAVEL" | "DIRT" | "WATER" | "OTHER";
  ilsEquipment: RunwayIlsEquipment | null;
}

/** Tower, approach, or advisory radio frequency assigned to an airport service. */
export type FrequencyType =
  | "TWR"
  | "APP"
  | "GND"
  | "DEL"
  | "ATIS"
  | "CTAF"
  | "UNICOM"
  | "AWOS"
  | "ASOS"
  | "CENTER"
  | "FSS"
  | "OTHER";

/** One named radio service at an airport or facility. */
export interface Frequency extends SourceTracked {
  type: FrequencyType;
  valueMHz: number;
  name: string;
}

/** Airport master data compiled from FAA facility records. */
export interface AirportInfo extends SourceTracked {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  state: string;
  elevationFeet: number;
  location: GeoPoint;
  runways: Runway[];
  frequencies: Frequency[];
}

/** Live or near-live traffic target from an ADS-B surveillance feed. */
export interface TrafficTarget extends SourceTracked {
  callsign: string | null;
  icao24: string;
  position: GeoPoint | null;
  altitudeFeet: number | null;
  groundspeedKnots: number | null;
  trackDegrees: number | null;
  verticalRateFpm: number | null;
  onGround: boolean;
}

export type AdsBTrafficTarget = TrafficTarget;

/** Citation into Title 14 of the CFR, the core body of US aviation regulations. */
export interface FarReference extends SourceTracked {
  title: string;
  part: string;
  section: string;
  text: string;
  effectiveDate: string;
}

export interface AtcProcedureReference extends SourceTracked {
  referenceId: string;
  category: string;
  title: string;
  content: string;
  officialSource: string;
  keywords: string[];
  relatedFarSections?: string[];
}

/** Convenience bundle used by weather endpoints that return multiple products together. */
export interface WeatherBundle extends SourceTracked {
  stationIcao: string;
  metar: Metar | null;
  taf: Taf | null;
  pireps: Pirep[];
  nearestStationNote?: string;
}
