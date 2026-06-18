import { createCacheKey, getOrPopulateCache } from "@/lib/cache";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse, DataSource } from "@/types/api";

const DATIS_SOURCE: DataSource = {
  id: "datis-clowd",
  name: "FAA D-ATIS (clowd.io)",
  url: "https://datis.clowd.io",
  reliability: "medium",
  refresh_interval: "60s"
};

const DATIS_TTL_MS = 90_000; // 90 seconds — ATIS updates roughly hourly but we check frequently

export interface DatisEntry {
  airport: string;
  type: "combined" | "departure" | "arrival";
  code: string; // The ATIS letter (e.g., "A", "B", "Z")
  datis: string; // Full D-ATIS text
}

export interface AtisInfo {
  airportIcao: string;
  letter: string;
  type: "combined" | "departure" | "arrival";
  fullText: string;
  fetchedAt: string;
}

/**
 * Fetch the current D-ATIS (Digital ATIS) for an airport.
 * Returns the ATIS letter and full text from the FAA D-ATIS feed.
 * Only works for towered airports with D-ATIS capability.
 */
export const getAtis = async (airportIcao: string): Promise<ApiResponse<AtisInfo[]>> => {
  const icao = airportIcao.trim().toUpperCase();
  const cacheKey = createCacheKey("datis", { airport: icao });
  const source = withSourceUrl(DATIS_SOURCE, `https://datis.clowd.io/api/${icao.toLowerCase()}`);

  const { value } = await getOrPopulateCache(cacheKey, DATIS_TTL_MS, async () => {
    const fetchedAt = toIsoNow();

    try {
      const response = await fetch(`https://datis.clowd.io/api/${icao.toLowerCase()}`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return createApiErrorResponse(
          {
            code: "DATIS_UNAVAILABLE",
            message: `D-ATIS not available for ${icao}. Airport may not have D-ATIS or may be non-towered.`,
            details: `HTTP ${response.status}`,
            retryable: response.status >= 500,
            status: response.status
          },
          { source, fetchedAt }
        );
      }

      const data = await response.json() as DatisEntry[] | { error: string };

      if (!Array.isArray(data) || data.length === 0) {
        return createApiErrorResponse(
          {
            code: "DATIS_EMPTY",
            message: `No D-ATIS data found for ${icao}. Airport may not have D-ATIS capability.`,
            retryable: false,
            status: 404
          },
          { source, fetchedAt }
        );
      }

      const entries: AtisInfo[] = data.map((entry) => ({
        airportIcao: entry.airport,
        letter: entry.code,
        type: entry.type,
        fullText: entry.datis,
        fetchedAt
      }));

      return createApiResponse(entries, source, { fetchedAt });
    } catch (err) {
      const message = err instanceof Error ? err.message : "D-ATIS fetch failed";
      return createApiErrorResponse(
        {
          code: "DATIS_FETCH_ERROR",
          message: `Failed to fetch D-ATIS for ${icao}: ${message}`,
          retryable: true,
          status: 503
        },
        { source, fetchedAt }
      );
    }
  });

  return value as ApiResponse<AtisInfo[]>;
};

/**
 * Fetch ATIS letters for multiple airports in parallel.
 * Returns a map of airport ICAO → ATIS letter(s).
 */
export const getAtisForAirports = async (airports: string[]): Promise<Map<string, AtisInfo[]>> => {
  const results = await Promise.allSettled(
    airports.map(async (icao) => {
      const response = await getAtis(icao);
      return { icao: icao.toUpperCase(), response };
    })
  );

  const map = new Map<string, AtisInfo[]>();

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.response.ok) {
      map.set(result.value.icao, result.value.response.data);
    }
  }

  return map;
};
