import { createApiErrorResponse, createApiResponse } from "@/lib/utils";
import type { DataSource } from "@/types/api";

const NOAA_SOURCE: DataSource = {
  id: "aviation-weather",
  name: "NOAA Aviation Weather Center Data API",
  url: "https://aviationweather.gov/data/api/",
  reliability: "high",
  refresh_interval: "Hourly for METARs, every 6 hours for TAFs, and near real time for PIREPs"
};

export const AUTHORITATIVE_DOMAIN_ALLOWLIST = [
  "aviationweather.gov",
  "faa.gov",
  "opensky-network.org",
  "ecfr.gov"
] as const;

export const SAMPLE_WEATHER_ERROR_RESPONSE = createApiErrorResponse(
  {
    code: "AUTHORITATIVE_SOURCE_UNAVAILABLE",
    message: "Live weather data is unavailable.",
    details: "Safety first: no fabricated METAR or TAF content is returned.",
    retryable: true
  },
  {
    source: NOAA_SOURCE,
    fetchedAt: "2026-06-17T21:00:00.000Z"
  }
);

export const SAMPLE_STALE_METAR_RESPONSE = createApiResponse(
  {
    stationIcao: "KJFK",
    rawText: "METAR KJFK 171900Z 18012KT 10SM CLR 27/18 A2992",
    source: NOAA_SOURCE,
    fetchedAt: "2026-06-17T19:00:00.000Z",
    isStale: true
  },
  NOAA_SOURCE,
  {
    fetchedAt: "2026-06-17T19:00:00.000Z",
    stalenessCategory: "metar"
  }
);
