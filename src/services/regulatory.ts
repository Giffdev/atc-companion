import { AIM_REFERENCES } from "@/data/aim-references";
import { ATC_REFERENCES, type AtcReference } from "@/data/atc-references";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs, getOrPopulateCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { AtcProcedureReference, FarReference } from "@/types/aviation";
import { stripHtml, toServiceErrorResponse } from "@/services/_shared";

const ECFR_SOURCE = getDataSource("ecfr");
const ATC_SOURCE = getDataSource("faaAtc");
const AIM_SOURCE = getDataSource("faaAim");
const ECFR_SEARCH_URL = "https://www.ecfr.gov/api/search/v1/results";
const LOCAL_RESULT_LIMIT = 8;

type EcfrResult = {
  starts_on?: string;
  hierarchy?: {
    title?: string;
    part?: string;
    section?: string;
  };
  hierarchy_headings?: {
    section?: string;
  };
  full_text_excerpt?: string;
};

type EcfrSearchResponse = {
  results?: EcfrResult[];
};

type LocalReferenceRecord = {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  keywords: string[];
  relatedFarSections?: string[];
};

export type RegulatorySearchResult = FarReference | AtcProcedureReference;

const normalizeSearchText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenizeSearchText = (value: string): string[] =>
  Array.from(
    new Set(
      normalizeSearchText(value)
        .split(" ")
        .map((token) => token.trim())
        .filter((token) => token.length > 1 || /\d/.test(token))
    )
  );

const scoreReference = (reference: LocalReferenceRecord, query: string): number => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return 0;
  }

  const tokens = tokenizeSearchText(query);
  const title = normalizeSearchText(reference.title);
  const content = normalizeSearchText(reference.content);
  const source = normalizeSearchText(reference.source);
  const keywordBlob = normalizeSearchText(reference.keywords.join(" "));
  const relatedFarBlob = normalizeSearchText(reference.relatedFarSections?.join(" ") ?? "");

  let score = 0;

  if (title.includes(normalizedQuery)) {
    score += 12;
  }
  if (keywordBlob.includes(normalizedQuery)) {
    score += 14;
  }
  if (content.includes(normalizedQuery)) {
    score += 8;
  }
  if (source.includes(normalizedQuery)) {
    score += 4;
  }

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 5;
    }
    if (keywordBlob.includes(token)) {
      score += 6;
    }
    if (content.includes(token)) {
      score += 2;
    }
    if (source.includes(token)) {
      score += 1;
    }
    if (relatedFarBlob.includes(token)) {
      score += 3;
    }
  }

  return score;
};

const mapLocalReference = (
  reference: LocalReferenceRecord,
  source: typeof ATC_SOURCE,
  fetchedAt: string
): AtcProcedureReference => ({
  referenceId: reference.id,
  category: reference.category,
  title: reference.title,
  content: reference.content,
  officialSource: reference.source,
  keywords: reference.keywords,
  relatedFarSections: reference.relatedFarSections,
  source,
  fetchedAt,
  isStale: false
});

const searchLocalReferenceSet = async (
  dataset: LocalReferenceRecord[],
  query: string,
  source: typeof ATC_SOURCE,
  cacheNamespace: string
): Promise<ApiResponse<AtcProcedureReference[]>> => {
  const cacheKey = createCacheKey(cacheNamespace, { query });

  const { value, cache } = await getOrPopulateCache(
    cacheKey,
    getCacheTtlMs("farReference"),
    async () => {
      const fetchedAt = toIsoNow();
      const matches = dataset
        .map((reference) => ({
          reference,
          score: scoreReference(reference, query)
        }))
        .filter((result) => result.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }

          return left.reference.title.localeCompare(right.reference.title);
        })
        .slice(0, LOCAL_RESULT_LIMIT)
        .map((result) => mapLocalReference(result.reference, source, fetchedAt));

      return {
        fetchedAt,
        data: matches
      };
    }
  );

  return createApiResponse(value.data, source, {
    fetchedAt: value.fetchedAt,
    stalenessCategory: "farReference",
    cache
  });
};

const shouldPrioritizeFarResults = (query: string, part?: number): boolean =>
  Boolean(part) || /\b(?:far|cfr|14 cfr|§)\b/i.test(query);

export const searchFars = async (query: string, part?: number): Promise<ApiResponse<FarReference[]>> => {
  try {
    const result = await fetchWithRetry<EcfrSearchResponse>(ECFR_SEARCH_URL, {
      source: ECFR_SOURCE,
      query: {
        query,
        "hierarchy[title]": 14,
        ...(part ? { "hierarchy[part]": part } : {})
      },
      ttlMs: getCacheTtlMs("farReference"),
      cacheNamespace: "regulatory-search",
      cacheKey: createCacheKey("regulatory-search", { query, part: part ?? null })
    });

    const references = (result.data.results ?? []).map(
      (item): FarReference => ({
        title: item.hierarchy?.title ?? "14",
        part: item.hierarchy?.part ?? "",
        section: item.hierarchy?.section ?? "",
        text: stripHtml(item.full_text_excerpt ?? item.hierarchy_headings?.section ?? ""),
        effectiveDate: item.starts_on ?? result.fetchedAt.slice(0, 10),
        source: result.source,
        fetchedAt: result.fetchedAt,
        isStale: false
      })
    );

    return createApiResponse(references, result.source, {
      fetchedAt: result.fetchedAt,
      stalenessCategory: "farReference",
      cache: result.cache
    });
  } catch (error) {
    return toServiceErrorResponse(error, ECFR_SOURCE, "farReference");
  }
};

export const searchAtcReferences = async (query: string): Promise<ApiResponse<AtcProcedureReference[]>> =>
  searchLocalReferenceSet(ATC_REFERENCES as AtcReference[], query, ATC_SOURCE, "atc-reference-search");

export const searchAimReferences = async (query: string): Promise<ApiResponse<AtcProcedureReference[]>> =>
  searchLocalReferenceSet(AIM_REFERENCES, query, AIM_SOURCE, "aim-reference-search");

export const searchAllRegulatory = async (
  query: string,
  part?: number
): Promise<ApiResponse<RegulatorySearchResult[]>> => {
  const [farResponse, atcResponse, aimResponse] = await Promise.all([
    searchFars(query, part),
    searchAtcReferences(query),
    searchAimReferences(query)
  ]);

  const orderedResponses = shouldPrioritizeFarResults(query, part)
    ? [farResponse, atcResponse, aimResponse]
    : [atcResponse, aimResponse, farResponse];

  const combined: RegulatorySearchResult[] = [];

  for (const response of orderedResponses) {
    if (response.ok) {
      combined.push(...(response.data as RegulatorySearchResult[]));
    }
  }

  if (combined.length === 0) {
    if (!farResponse.ok) {
      return farResponse;
    }
    if (!atcResponse.ok) {
      return atcResponse;
    }
    if (!aimResponse.ok) {
      return aimResponse;
    }
  }

  const primarySource = combined[0]?.source ?? (shouldPrioritizeFarResults(query, part) ? ECFR_SOURCE : ATC_SOURCE);
  const supportingSources = [ECFR_SOURCE, ATC_SOURCE, AIM_SOURCE].filter((source) => source.id !== primarySource.id);

  return createApiResponse(combined, primarySource, {
    fetchedAt: toIsoNow(),
    stalenessCategory: "farReference",
    supportingSources
  });
};

export const searchRegulatory = searchAllRegulatory;
