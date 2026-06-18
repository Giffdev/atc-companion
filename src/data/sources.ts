import type { DataSource, SourceReliabilityRating } from "@/types/api";

export type SourceAuthority = "NOAA" | "FAA" | "OpenSky Network" | "ADSB.fi" | "eCFR";
export type SourceDataFormat = "JSON" | "GeoJSON" | "XML" | "CSV" | "TXT" | "ZIP" | "PDF" | "HTML";
export type SourceAuthMode = "none" | "registration-required" | "contact-provider";

export interface SourceEndpoint {
  name: string;
  url: string;
  description: string;
}

export interface SourceAuthRequirement {
  mode: SourceAuthMode;
  notes: string;
}

export interface SourceRegistryEntry extends DataSource {
  authority: SourceAuthority;
  baseUrl: string;
  endpoints: SourceEndpoint[];
  auth: SourceAuthRequirement;
  rateLimits: string;
  dataFormat: SourceDataFormat[];
  reliabilityNotes: string;
}

const withSourceShape = (
  entry: Omit<SourceRegistryEntry, "url" | "reliability"> & { reliability: SourceReliabilityRating }
): SourceRegistryEntry => ({
  ...entry,
  url: entry.baseUrl
});

export const AVIATION_SOURCE_REGISTRY = {
  aviationWeather: withSourceShape({
    id: "aviation-weather",
    name: "NOAA Aviation Weather Center Data API",
    baseUrl: "https://aviationweather.gov/data/api/",
    authority: "NOAA",
    reliability: "high",
    refresh_interval: "Hourly for METARs, every 6 hours for TAFs, and near real time for PIREPs",
    endpoints: [
      {
        name: "METAR endpoint",
        url: "https://aviationweather.gov/api/data/metar",
        description: "Structured and raw METAR observations."
      },
      {
        name: "TAF endpoint",
        url: "https://aviationweather.gov/api/data/taf",
        description: "Structured and raw TAF forecasts."
      },
      {
        name: "PIREP endpoint",
        url: "https://aviationweather.gov/api/data/pirep",
        description: "Pilot reports with JSON, raw text, and geospatial formats."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public NOAA service; no API key required."
    },
    rateLimits: "Rate limited by the Aviation Weather Center; keep queries scoped and use cache files for bulk pulls.",
    dataFormat: ["JSON", "GeoJSON", "XML", "CSV", "TXT"],
    reliabilityNotes: "Official NOAA/NWS feed and the authoritative source for operational US weather products."
  }),
  faaNotams: withSourceShape({
    id: "faa-notams",
    name: "FAA NOTAM Search / NOTAM Management Service",
    baseUrl: "https://notams.aim.faa.gov/notamSearch/",
    authority: "FAA",
    reliability: "high",
    refresh_interval: "Continuous; operational consumers should re-check at least every 12 hours",
    endpoints: [
      {
        name: "Public NOTAM search portal",
        url: "https://notams.aim.faa.gov/notamSearch/",
        description: "FAA-hosted NOTAM search interface and official user workflow."
      },
      {
        name: "NMS access portal",
        url: "https://nms.aim.faa.gov/",
        description: "Official NOTAM Management Service portal for onboarding and system integration."
      },
      {
        name: "FAA NOTAM modernization FAQ",
        url: "https://www.faa.gov/about/initiatives/notam/faqs",
        description: "Official FAA guidance for the modernized NOTAM platform."
      }
    ],
    auth: {
      mode: "registration-required",
      notes: "Public search is open in the browser; programmatic NMS access requires FAA onboarding and credentials."
    },
    rateLimits: "Publicly documented API rate limits are not published; assume controlled access and coordinate with FAA for automation.",
    dataFormat: ["HTML", "JSON"],
    reliabilityNotes: "FAA is authoritative, but machine-to-machine access is more restricted than NOAA weather data."
  }),
  faaDtpp: withSourceShape({
    id: "faa-dtpp",
    name: "FAA Digital Terminal Procedures Publication",
    baseUrl: "https://aeronav.faa.gov/d-tpp/",
    authority: "FAA",
    reliability: "high",
    refresh_interval: "28-day chart cycle",
    endpoints: [
      {
        name: "DTPP cycle directory",
        url: "https://aeronav.faa.gov/d-tpp/",
        description: "FAA-hosted directory of current and archived terminal procedure chart cycles."
      },
      {
        name: "Digital products overview",
        url: "https://www.faa.gov/air_traffic/flight_info/aeronav/digital_products/",
        description: "FAA guidance page for digital chart products and distribution."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public FAA download site."
    },
    rateLimits: "No published API quota; prefer cycle-aware batch downloads over aggressive repeated polling.",
    dataFormat: ["PDF", "HTML"],
    reliabilityNotes: "Official FAA chart publication used for approaches, SIDs, and STARs."
  }),
  faaNasr: withSourceShape({
    id: "faa-nasr",
    name: "FAA NASR Subscription",
    baseUrl: "https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/",
    authority: "FAA",
    reliability: "high",
    refresh_interval: "28-day AIRAC cycle",
    endpoints: [
      {
        name: "NASR subscription page",
        url: "https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/",
        description: "FAA landing page with current and archived subscriber files."
      },
      {
        name: "NFDC 28-day subscription directory",
        url: "https://nfdc.faa.gov/webContent/28DaySub/",
        description: "Direct file distribution area for NASR subscriber archives."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public FAA data download."
    },
    rateLimits: "Bulk file downloads should follow the 28-day publication cadence rather than high-frequency polling.",
    dataFormat: ["ZIP", "CSV", "TXT"],
    reliabilityNotes: "Authoritative FAA facility dataset for airports, runways, and frequencies."
  }),
  openSkyNetwork: withSourceShape({
    id: "opensky-network",
    name: "OpenSky Network REST API",
    baseUrl: "https://opensky-network.org/api",
    authority: "OpenSky Network",
    reliability: "medium",
    refresh_interval: "Near real time; ADS-B positions should be considered stale after 30 seconds",
    endpoints: [
      {
        name: "REST API root",
        url: "https://opensky-network.org/api",
        description: "Root URL for all OpenSky REST resources."
      },
      {
        name: "All state vectors",
        url: "https://opensky-network.org/api/states/all",
        description: "Live aircraft state vectors filtered by time, ICAO24, or bounding box."
      },
      {
        name: "REST API documentation",
        url: "https://openskynetwork.github.io/opensky-api/rest.html",
        description: "Official OpenSky REST API reference."
      }
    ],
    auth: {
      mode: "none",
      notes: "Anonymous access is available with stricter rate limiting; authenticated access offers higher limits."
    },
    rateLimits: "Rate limited, especially for anonymous users and broad geographic queries.",
    dataFormat: ["JSON", "HTML"],
    reliabilityNotes: "Useful operationally, but coverage varies by receiver density and it is not an FAA-certified surveillance feed."
  }),
  adsbFi: withSourceShape({
    id: "adsb-fi",
    name: "ADSB.fi Open Data",
    baseUrl: "https://opendata.adsb.fi",
    authority: "ADSB.fi",
    reliability: "medium",
    refresh_interval: "~10 seconds",
    endpoints: [
      {
        name: "Nearby aircraft search",
        url: "https://opendata.adsb.fi/api/v2/lat/{lat}/lon/{lon}/dist/{dist}",
        description: "Public open-data API for nearby aircraft state vectors."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public open-data feed; no API key required."
    },
    rateLimits: "Free-tier public feed; keep queries scoped and rely on caching to avoid excessive polling.",
    dataFormat: ["JSON"],
    reliabilityNotes: "Open community ADS-B feed suitable as a fallback when other public traffic services are rate limited."
  }),
  ecfr: withSourceShape({
    id: "ecfr-title-14",
    name: "eCFR API",
    baseUrl: "https://www.ecfr.gov/api/",
    authority: "eCFR",
    reliability: "high",
    refresh_interval: "Regulatory text changes infrequently; a 30-day refresh is usually sufficient",
    endpoints: [
      {
        name: "API root",
        url: "https://www.ecfr.gov/api/",
        description: "Official eCFR API entry point."
      },
      {
        name: "Title metadata",
        url: "https://www.ecfr.gov/api/versioner/v1/titles.json",
        description: "JSON metadata for all CFR titles, including Title 14 effective dates."
      },
      {
        name: "API documentation",
        url: "https://www.ecfr.gov/developers/documentation/api/v1",
        description: "Developer documentation for eCFR API resources."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public federal API."
    },
    rateLimits: "No API key is required; still keep requests polite and cache text that rarely changes.",
    dataFormat: ["JSON", "HTML"],
    reliabilityNotes: "Official government regulatory source for FAR text, but not a substitute for legal or operational interpretation."
  }),
  faaAtc: withSourceShape({
    id: "faa-atc-order-7110-65",
    name: "FAA Order JO 7110.65 Air Traffic Control",
    baseUrl: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/",
    authority: "FAA",
    reliability: "high",
    refresh_interval: "Per FAA order revision and change notice cycle",
    endpoints: [
      {
        name: "ATC order HTML publication",
        url: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/",
        description: "Official FAA HTML publication of Order JO 7110.65 Air Traffic Control."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public FAA publication."
    },
    rateLimits: "Static FAA publication; cache local reference lookups and refresh when FAA revises the order.",
    dataFormat: ["HTML"],
    reliabilityNotes: "Primary FAA controller procedures and phraseology source for separation, runway, and emergency handling."
  }),
  faaAim: withSourceShape({
    id: "faa-aim",
    name: "FAA Aeronautical Information Manual",
    baseUrl: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/",
    authority: "FAA",
    reliability: "high",
    refresh_interval: "Per AIM revision and change notice cycle",
    endpoints: [
      {
        name: "AIM HTML publication",
        url: "https://www.faa.gov/air_traffic/publications/atpubs/aim_html/",
        description: "Official FAA HTML publication of the Aeronautical Information Manual."
      }
    ],
    auth: {
      mode: "none",
      notes: "Public FAA publication."
    },
    rateLimits: "Static FAA publication; cache derived search results and refresh on publication changes.",
    dataFormat: ["HTML"],
    reliabilityNotes: "Official FAA operational guidance and procedures publication used alongside the FARs and JO 7110.65."
  })
} as const satisfies Record<string, SourceRegistryEntry>;

export type SourceRegistryKey = keyof typeof AVIATION_SOURCE_REGISTRY;

export const SOURCE_REGISTRY = Object.values(AVIATION_SOURCE_REGISTRY);

export const getDataSource = (key: SourceRegistryKey): DataSource => {
  const entry = AVIATION_SOURCE_REGISTRY[key];

  return {
    id: entry.id,
    name: entry.name,
    url: entry.url,
    reliability: entry.reliability,
    refresh_interval: entry.refresh_interval
  };
};
