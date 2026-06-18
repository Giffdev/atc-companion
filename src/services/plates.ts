import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import type { ApproachPlate, ApproachType, Sid, Star } from "@/types/aviation";
import { toServiceErrorResponse } from "@/services/_shared";

const DTPP_SOURCE = getDataSource("faaDtpp");
const DTPP_XML_URL = "https://nfdc.faa.gov/webContent/dtpp/current.xml";

type DtppRecord = {
  chart_code: string;
  chart_name: string;
  pdf_name?: string;
  faanfd18?: string;
};

type DtppAirportPayload = {
  cycle: string;
  faaId: string;
  icaoId: string;
  records: DtppRecord[];
  sourceUrl: string;
  fetchedAt: string;
  cache: NonNullable<ApiResponse<unknown>["cache"]>;
};

const plateManifest = new Map<string, string>();

const parseXmlTag = (block: string, tagName: string): string | undefined => {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1]?.trim();
};

const inferApproachType = (chartName: string): ApproachType => {
  const normalized = chartName.toUpperCase();

  if (normalized.includes("ILS")) {
    return "ILS";
  }

  if (normalized.includes("RNAV") || normalized.includes("GPS")) {
    return "RNAV";
  }

  if (normalized.includes("LOC")) {
    return "LOC";
  }

  if (normalized.includes("VOR")) {
    return "VOR";
  }

  if (normalized.includes("NDB")) {
    return "NDB";
  }

  return "VISUAL";
};

const extractRunway = (chartName: string): string => chartName.match(/\bRWY\s+([0-9]{1,2}[LRC]?)\b/i)?.[1] ?? "";

const extractAirportBlock = (xml: string, faaId: string, icaoId: string): string | null => {
  const patterns = [
    new RegExp(`<airport_name[^>]*apt_ident="${faaId}"[^>]*icao_ident="${icaoId}"[^>]*>[\\s\\S]*?<\\/airport_name>`, "i"),
    new RegExp(`<airport_name[^>]*icao_ident="${icaoId}"[^>]*apt_ident="${faaId}"[^>]*>[\\s\\S]*?<\\/airport_name>`, "i")
  ];

  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
};

const getDtppAirportData = async (airport: string): Promise<DtppAirportPayload> => {
  const faaId = toFaaCode(airport);
  const icaoId = toIcaoCode(airport);
  const result = await fetchWithRetry<string>(DTPP_XML_URL, {
    source: DTPP_SOURCE,
    parseAs: "text",
    ttlMs: getCacheTtlMs("dtppXml"),
    cacheNamespace: "dtpp-xml",
    cacheKey: createCacheKey("dtpp-xml", { cycle: "current" })
  });

  const cycle = result.data.match(/<digital_tpp[^>]*cycle="([^"]+)"/i)?.[1];
  const airportBlock = extractAirportBlock(result.data, faaId, icaoId);

  if (!cycle || !airportBlock) {
    throw createApiErrorResponse(
      {
        code: "AIRPORT_NOT_FOUND",
        message: `No DTPP records were found for ${icaoId}.`,
        details: "The FAA current.xml metafile did not contain this airport.",
        retryable: false,
        status: 404
      },
      {
        source: result.source,
        fetchedAt: result.fetchedAt,
        stalenessCategory: "approachPlate",
        cache: result.cache
      }
    );
  }

  const records = [...airportBlock.matchAll(/<record>([\s\S]*?)<\/record>/gi)].map((match) => ({
    chart_code: parseXmlTag(match[1], "chart_code") ?? "",
    chart_name: parseXmlTag(match[1], "chart_name") ?? "",
    pdf_name: parseXmlTag(match[1], "pdf_name"),
    faanfd18: parseXmlTag(match[1], "faanfd18")
  }));

  return {
    cycle,
    faaId,
    icaoId,
    records,
    sourceUrl: result.url,
    fetchedAt: result.fetchedAt,
    cache: result.cache
  };
};

const toPdfUrl = (cycle: string, pdfName: string | undefined): string => `https://aeronav.faa.gov/d-tpp/${cycle}/${pdfName ?? ""}`;

const createPlateManifestKey = (airport: string, procedure: string): string =>
  `${toIcaoCode(airport)}:${procedure.trim().toUpperCase().replace(/\s+/g, " ")}`;

const recordPlateUrl = (airport: string, procedure: string, url: string): void => {
  plateManifest.set(createPlateManifestKey(airport, procedure), url);
};

const recordPlateUrls = <T extends { airportIcao: string; procedureName: string; chartUrl: string }>(items: T[]): void => {
  items.forEach((item) => recordPlateUrl(item.airportIcao, item.procedureName, item.chartUrl));
};

const dedupe = <T extends { chartUrl: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.chartUrl)) {
      return false;
    }

    seen.add(item.chartUrl);
    return true;
  });
};

export const getPlates = async (params: { airport: string; type?: string }): Promise<ApiResponse<ApproachPlate[]>> => {
  try {
    const airportData = await getDtppAirportData(params.airport);
    const records = airportData.records.filter((record) => record.chart_code === "IAP" && record.pdf_name);
    const plateTypeFilter = params.type?.toUpperCase();
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };

    const plates = dedupe(
      records
        .map(
          (record): ApproachPlate => ({
            airportIcao: airportData.icaoId,
            procedureName: record.chart_name,
            procedureType: inferApproachType(record.chart_name),
            runway: extractRunway(record.chart_name),
            chartUrl: toPdfUrl(airportData.cycle, record.pdf_name),
            pdfUrl: toPdfUrl(airportData.cycle, record.pdf_name),
            source,
            fetchedAt: airportData.fetchedAt,
            isStale: false
          })
        )
        .filter((plate) => !plateTypeFilter || plate.procedureType === plateTypeFilter || plate.procedureName.toUpperCase().includes(plateTypeFilter))
    );

    recordPlateUrls(plates);

    return createApiResponse(plates, source, {
      fetchedAt: airportData.fetchedAt,
      stalenessCategory: "approachPlate",
      cache: airportData.cache
    });
  } catch (error) {
    if (error && typeof error === "object" && "ok" in error) {
      return error as ApiResponse<ApproachPlate[]>;
    }

    return toServiceErrorResponse(error, DTPP_SOURCE, "approachPlate");
  }
};

export const getSids = async (airport: string): Promise<ApiResponse<Sid[]>> => {
  try {
    const airportData = await getDtppAirportData(airport);
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };
    const sids = dedupe(
      airportData.records
        .filter((record) => record.chart_code === "DP" && record.pdf_name)
        .map(
          (record): Sid => ({
            airportIcao: airportData.icaoId,
            procedureName: record.chart_name,
            transitions: record.faanfd18 ? [record.faanfd18] : [],
            chartUrl: toPdfUrl(airportData.cycle, record.pdf_name),
            source,
            fetchedAt: airportData.fetchedAt,
            isStale: false
          })
        )
    );

    recordPlateUrls(sids);

    return createApiResponse(sids, source, {
      fetchedAt: airportData.fetchedAt,
      stalenessCategory: "sid",
      cache: airportData.cache
    });
  } catch (error) {
    if (error && typeof error === "object" && "ok" in error) {
      return error as ApiResponse<Sid[]>;
    }

    return toServiceErrorResponse(error, DTPP_SOURCE, "sid");
  }
};

export const getStars = async (airport: string): Promise<ApiResponse<Star[]>> => {
  try {
    const airportData = await getDtppAirportData(airport);
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };
    const stars = dedupe(
      airportData.records
        .filter((record) => record.chart_code === "STR" && record.pdf_name)
        .map(
          (record): Star => ({
            airportIcao: airportData.icaoId,
            procedureName: record.chart_name,
            transitions: record.faanfd18 ? [record.faanfd18] : [],
            chartUrl: toPdfUrl(airportData.cycle, record.pdf_name),
            source,
            fetchedAt: airportData.fetchedAt,
            isStale: false
          })
        )
    );

    recordPlateUrls(stars);

    return createApiResponse(stars, source, {
      fetchedAt: airportData.fetchedAt,
      stalenessCategory: "star",
      cache: airportData.cache
    });
  } catch (error) {
    if (error && typeof error === "object" && "ok" in error) {
      return error as ApiResponse<Star[]>;
    }

    return toServiceErrorResponse(error, DTPP_SOURCE, "star");
  }
};

export const getPlateUrl = (airport: string, procedure: string): string | undefined =>
  plateManifest.get(createPlateManifestKey(airport, procedure));

export const prewarmPlateCache = async (airports: string[]): Promise<void> => {
  await Promise.allSettled(
    airports.map(async (airport) => {
      const [plates, sids, stars] = await Promise.all([getPlates({ airport }), getSids(airport), getStars(airport)]);

      if (plates.ok) {
        recordPlateUrls(plates.data);
      }

      if (sids.ok) {
        recordPlateUrls(sids.data);
      }

      if (stars.ok) {
        recordPlateUrls(stars.data);
      }
    })
  );
};
