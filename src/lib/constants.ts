import { AVIATION_SOURCE_REGISTRY } from "@/data/sources";

export const APP_NAME = "ATC Companion";
export const DEFAULT_SOURCE = "https://www.faa.gov/";

export const API_ENDPOINTS = {
  weather: "/api/weather",
  notams: "/api/notams",
  frequencies: "/api/frequencies",
  plates: "/api/plates",
  traffic: "/api/traffic",
  search: "/api/search",
  regulatory: "/api/regulatory",
  intent: "/api/intent",
  query: "/api/query"
} as const;

export const AVIATION_SOURCES = {
  weather: AVIATION_SOURCE_REGISTRY.aviationWeather.baseUrl,
  notams: AVIATION_SOURCE_REGISTRY.faaNotams.baseUrl,
  frequencies: AVIATION_SOURCE_REGISTRY.faaNasr.baseUrl,
  plates: AVIATION_SOURCE_REGISTRY.faaDtpp.baseUrl,
  traffic: AVIATION_SOURCE_REGISTRY.openSkyNetwork.baseUrl,
  regulatory: AVIATION_SOURCE_REGISTRY.faaAtc.baseUrl,
  intent: "internal://intent-parser"
} as const;
