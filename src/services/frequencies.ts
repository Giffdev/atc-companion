import { LOCAL_FREQUENCY_SEED } from "@/data/frequency-seed";
import { toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { createApiErrorResponse, createApiResponse, toIsoNow, withSourceUrl } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { Frequency } from "@/types/aviation";

const FREQUENCY_SOURCE = getDataSource("faaNasr");
const FREQUENCY_SOURCE_URL = "https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/";

export const getFrequencies = async (airport: string): Promise<ApiResponse<Frequency[]>> => {
  const airportCode = toIcaoCode(airport);
  const cacheKey = createCacheKey("airport-frequencies", { airportCode });
  const lookup = LOCAL_FREQUENCY_SEED[airportCode];

  if (!lookup) {
    return createApiErrorResponse(
      {
        code: "AIRPORT_NOT_FOUND",
        message: `No FAA frequency seed data is available for ${airportCode}.`,
        details: "The local seed now covers a broad FAA NASR subset of major US airports plus expanded towered and approach-control coverage.",
        retryable: false,
        status: 404
      },
      {
        source: withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL),
        fetchedAt: toIsoNow(),
        stalenessCategory: "frequency"
      }
    );
  }

  const { value, cache } = await getOrPopulateCache(cacheKey, getCacheTtlMs("frequencyLookup"), async () => {
    const fetchedAt = toIsoNow();
    const source = withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL);

    return lookup.map(
      (record): Frequency => ({
        ...record,
        source,
        fetchedAt,
        isStale: false
      })
    );
  });

  return createApiResponse(value, withSourceUrl(FREQUENCY_SOURCE, FREQUENCY_SOURCE_URL), {
    fetchedAt: value[0]?.fetchedAt ?? toIsoNow(),
    stalenessCategory: "frequency",
    cache
  });
};
