import { getStalenessThresholdMs } from "@/data/staleness";
import { getDataSource } from "@/data/sources";
import { formatTimestamp } from "@/lib/utils";
import type { DataSource } from "@/types/api";
import type { ApproachPlate, FarReference, Frequency, Notam, TrafficTarget, WeatherBundle } from "@/types/aviation";

export type DashboardResultType = "weather" | "notam" | "traffic" | "frequency" | "plates" | "regulatory";
export type SourceConnectionStatus = "online" | "standby" | "degraded";

export interface SourceStatusItem {
  id: string;
  label: string;
  source: DataSource;
  fetchedAt: string;
  status: SourceConnectionStatus;
  detail: string;
  warning?: string;
}

const toTimestamp = (referenceMs: number, ageMs: number): string => new Date(referenceMs - ageMs).toISOString();

const isStaleAt = (fetchedAt: string, category: "metar" | "notam" | "trafficTarget", referenceMs: number): boolean =>
  referenceMs - new Date(fetchedAt).getTime() > getStalenessThresholdMs(category);

export const createDemoDashboardData = (referenceTime: string) => {
  const referenceMs = new Date(referenceTime).getTime();
  const weatherSource = getDataSource("aviationWeather");
  const notamSource = getDataSource("faaNotams");
  const trafficSource = getDataSource("openSkyNetwork");
  const frequencySource = getDataSource("faaNasr");
  const platesSource = getDataSource("faaDtpp");
  const regulatorySource = getDataSource("ecfr");

  const weatherFetchedAt = toTimestamp(referenceMs, 6 * 60 * 1000);
  const notamFetchedAt = toTimestamp(referenceMs, 74 * 60 * 1000);
  const trafficFetchedAt = toTimestamp(referenceMs, 92 * 1000);
  const frequencyFetchedAt = toTimestamp(referenceMs, 3 * 60 * 60 * 1000);
  const platesFetchedAt = toTimestamp(referenceMs, 5 * 24 * 60 * 60 * 1000);
  const regulatoryFetchedAt = toTimestamp(referenceMs, 8 * 24 * 60 * 60 * 1000);

  const weather: WeatherBundle = {
    stationIcao: "KSEA",
    source: weatherSource,
    fetchedAt: weatherFetchedAt,
    isStale: isStaleAt(weatherFetchedAt, "metar", referenceMs),
    metar: {
      stationIcao: "KSEA",
      rawText: "KSEA 180653Z 19006KT 10SM FEW020 SCT045 BKN090 14/10 A2992 RMK AO2 SLP132",
      observedAt: weatherFetchedAt,
      source: weatherSource,
      fetchedAt: weatherFetchedAt,
      isStale: false,
      wind: {
        directionDegrees: 190,
        speedKnots: 6
      },
      visibility: {
        prevailingStatuteMiles: 10,
        rawValue: "10SM"
      },
      ceiling: {
        minimumBrokenOrOvercastFeetAgl: 9000
      },
      skyConditions: [
        { coverage: "FEW", baseFeetAgl: 2000 },
        { coverage: "SCT", baseFeetAgl: 4500 },
        { coverage: "BKN", baseFeetAgl: 9000 }
      ],
      weather: [],
      temperatureC: 14,
      dewpointC: 10,
      altimeterInHg: 29.92,
      flightCategory: "VFR",
      remarks: ["AO2", "SLP132"]
    },
    taf: {
      stationIcao: "KSEA",
      rawText:
        "TAF KSEA 180520Z 1806/1912 18005KT P6SM SCT025 BKN080 FM181800 22008KT P6SM SCT040 BKN120 FM190400 20006KT P6SM BKN050",
      issuedAt: toTimestamp(referenceMs, 48 * 60 * 1000),
      validFrom: weatherFetchedAt,
      validTo: toTimestamp(referenceMs, -12 * 60 * 60 * 1000),
      source: weatherSource,
      fetchedAt: weatherFetchedAt,
      isStale: false,
      forecastGroups: [
        {
          groupType: "INITIAL",
          validFrom: weatherFetchedAt,
          validTo: toTimestamp(referenceMs, -12 * 60 * 60 * 1000),
          wind: { directionDegrees: 180, speedKnots: 5 },
          visibility: { prevailingStatuteMiles: 6 },
          skyConditions: [
            { coverage: "SCT", baseFeetAgl: 2500 },
            { coverage: "BKN", baseFeetAgl: 8000 }
          ],
          weather: [],
          ceiling: { minimumBrokenOrOvercastFeetAgl: 8000 }
        },
        {
          groupType: "FM",
          validFrom: toTimestamp(referenceMs, -18 * 60 * 60 * 1000),
          wind: { directionDegrees: 220, speedKnots: 8 },
          visibility: { prevailingStatuteMiles: 6 },
          skyConditions: [
            { coverage: "SCT", baseFeetAgl: 4000 },
            { coverage: "BKN", baseFeetAgl: 12000 }
          ],
          weather: [],
          ceiling: { minimumBrokenOrOvercastFeetAgl: 12000 }
        }
      ]
    },
    pireps: []
  };

  const notams: Notam[] = [
    {
      notamId: "7/3119",
      type: "TFR",
      affectedFacility: "KSEA",
      effectiveAt: toTimestamp(referenceMs, 15 * 60 * 1000),
      expiresAt: toTimestamp(referenceMs, -4 * 60 * 60 * 1000),
      text: "VIP MOVEMENT TFR 7NM NORTH OF KSEA SFC-4000FT. Expect short notice release windows only.",
      tfrNumber: "7/3119",
      purpose: "VIP movement",
      source: notamSource,
      fetchedAt: notamFetchedAt,
      isStale: isStaleAt(notamFetchedAt, "notam", referenceMs)
    },
    {
      notamId: "FDC 4/2156",
      type: "FDC",
      affectedFacility: "KSEA",
      effectiveAt: toTimestamp(referenceMs, 2 * 60 * 60 * 1000),
      expiresAt: toTimestamp(referenceMs, -26 * 60 * 60 * 1000),
      text: "ILS OR LOC RWY 16L AMDT 2A... glideslope unusable below 2100 until further notice. Review localizer-only minima.",
      reference: "ILS OR LOC RWY 16L",
      source: notamSource,
      fetchedAt: notamFetchedAt,
      isStale: isStaleAt(notamFetchedAt, "notam", referenceMs)
    },
    {
      notamId: "SEA 06/141",
      type: "D",
      affectedFacility: "KSEA",
      effectiveAt: toTimestamp(referenceMs, 42 * 60 * 1000),
      expiresAt: toTimestamp(referenceMs, -7 * 60 * 60 * 1000),
      text: "TWY B BTN B3 AND B6 CLSD TO ACFT WINGSPAN GREATER THAN 118FT DURING NIGHT CONSTRUCTION WINDOW.",
      keyword: "TWY",
      source: notamSource,
      fetchedAt: notamFetchedAt,
      isStale: isStaleAt(notamFetchedAt, "notam", referenceMs)
    }
  ];

  const traffic: TrafficTarget[] = [
    {
      callsign: "DAL221",
      icao24: "a31f9c",
      position: { latitude: 47.476, longitude: -122.298 },
      altitudeFeet: 4200,
      groundspeedKnots: 172,
      trackDegrees: 153,
      verticalRateFpm: -850,
      onGround: false,
      source: trafficSource,
      fetchedAt: trafficFetchedAt,
      isStale: isStaleAt(trafficFetchedAt, "trafficTarget", referenceMs)
    },
    {
      callsign: "ASA417",
      icao24: "ab12ce",
      position: { latitude: 47.438, longitude: -122.314 },
      altitudeFeet: 7600,
      groundspeedKnots: 214,
      trackDegrees: 335,
      verticalRateFpm: 1100,
      onGround: false,
      source: trafficSource,
      fetchedAt: trafficFetchedAt,
      isStale: isStaleAt(trafficFetchedAt, "trafficTarget", referenceMs)
    },
    {
      callsign: "SWA908",
      icao24: "c04aa8",
      position: { latitude: 47.462, longitude: -122.352 },
      altitudeFeet: 11800,
      groundspeedKnots: 246,
      trackDegrees: 78,
      verticalRateFpm: 300,
      onGround: false,
      source: trafficSource,
      fetchedAt: trafficFetchedAt,
      isStale: isStaleAt(trafficFetchedAt, "trafficTarget", referenceMs)
    },
    {
      callsign: "N652AT",
      icao24: "d12088",
      position: { latitude: 47.446, longitude: -122.277 },
      altitudeFeet: 2100,
      groundspeedKnots: 128,
      trackDegrees: 255,
      verticalRateFpm: -300,
      onGround: false,
      source: trafficSource,
      fetchedAt: trafficFetchedAt,
      isStale: isStaleAt(trafficFetchedAt, "trafficTarget", referenceMs)
    }
  ];

  const frequencies: Frequency[] = [
    {
      type: "ATIS",
      valueMHz: 132.95,
      name: "ATIS",
      source: frequencySource,
      fetchedAt: frequencyFetchedAt,
      isStale: false
    },
    {
      type: "TWR",
      valueMHz: 119.9,
      name: "Tower North",
      source: frequencySource,
      fetchedAt: frequencyFetchedAt,
      isStale: false
    },
    {
      type: "GND",
      valueMHz: 121.7,
      name: "Ground",
      source: frequencySource,
      fetchedAt: frequencyFetchedAt,
      isStale: false
    },
    {
      type: "APP",
      valueMHz: 124,
      name: "Seattle Approach",
      source: frequencySource,
      fetchedAt: frequencyFetchedAt,
      isStale: false
    }
  ];

  const plates: ApproachPlate[] = [
    {
      airportIcao: "KSEA",
      procedureName: "ILS OR LOC RWY 16L",
      procedureType: "ILS",
      runway: "16L",
      chartUrl: "https://aeronav.faa.gov/d-tpp/2607/SEA_IAP_ILS16L.PDF",
      pdfUrl: "https://aeronav.faa.gov/d-tpp/2607/SEA_IAP_ILS16L.PDF",
      source: platesSource,
      fetchedAt: platesFetchedAt,
      isStale: false
    },
    {
      airportIcao: "KSEA",
      procedureName: "RNAV (GPS) RWY 34R",
      procedureType: "RNAV",
      runway: "34R",
      chartUrl: "https://aeronav.faa.gov/d-tpp/2607/SEA_IAP_RNAV34R.PDF",
      pdfUrl: "https://aeronav.faa.gov/d-tpp/2607/SEA_IAP_RNAV34R.PDF",
      source: platesSource,
      fetchedAt: platesFetchedAt,
      isStale: false
    }
  ];

  const regulatory: FarReference[] = [
    {
      title: "14",
      part: "91",
      section: "113",
      text: "In converging situations, the aircraft to the other's right has the right-of-way.",
      effectiveDate: "2016-12-30",
      source: regulatorySource,
      fetchedAt: regulatoryFetchedAt,
      isStale: false
    },
    {
      title: "14",
      part: "91",
      section: "123",
      text: "When an ATC clearance has been obtained, no pilot in command may deviate from that clearance except in an emergency.",
      effectiveDate: "2016-12-30",
      source: regulatorySource,
      fetchedAt: regulatoryFetchedAt,
      isStale: false
    }
  ];

  const sourceStatuses: SourceStatusItem[] = [
    {
      id: "weather",
      label: "Weather",
      source: weatherSource,
      fetchedAt: weatherFetchedAt,
      status: "online",
      detail: `METAR/TAF brief staged for KSEA • ${formatTimestamp(weatherFetchedAt)}`
    },
    {
      id: "notams",
      label: "NOTAMs",
      source: notamSource,
      fetchedAt: notamFetchedAt,
      status: "standby",
      detail: "FAA NOTAM route scaffolded; demo payload reflects high-priority field notices."
    },
    {
      id: "traffic",
      label: "Traffic",
      source: trafficSource,
      fetchedAt: trafficFetchedAt,
      status: "degraded",
      detail: "ADS-B panel is intentionally a placeholder until live surveillance integration lands.",
      warning: "Traffic positions are older than the 30-second operational target."
    },
    {
      id: "frequencies",
      label: "Frequencies",
      source: frequencySource,
      fetchedAt: frequencyFetchedAt,
      status: "online",
      detail: "Reference frequencies are loaded from the FAA NASR source model."
    },
    {
      id: "plates",
      label: "Plates",
      source: platesSource,
      fetchedAt: platesFetchedAt,
      status: "standby",
      detail: "FAA DTPP procedure charts are staged for live query replacement."
    },
    {
      id: "regulatory",
      label: "Regulatory",
      source: regulatorySource,
      fetchedAt: regulatoryFetchedAt,
      status: "standby",
      detail: "Reference FAR text is available for live regulatory lookups."
    }
  ];

  return {
    weather,
    notams,
    traffic,
    frequencies,
    plates,
    regulatory,
    sourceStatuses
  };
};
