import { toFaaCode, toIcaoCode } from "@/data/airports";
import { getDatasetAirport, type DatasetAirport } from "@/data/airport-dataset";
import { getDataSource } from "@/data/sources";
import { createCacheKey, getCacheTtlMs } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetcher";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import { OURAIRPORTS_SOURCE } from "@/services/dataset-airport-fallback";
import type { ApiResponse } from "@/types/api";
import type { ApproachPlate, ApproachType, Odp, Sid, Star } from "@/types/aviation";
import { toServiceErrorResponse } from "@/services/_shared";

const DTPP_SOURCE = getDataSource("faaDtpp");
const DTPP_XML_URL = "https://nfdc.faa.gov/webContent/dtpp/current.xml";
export const PLATES_DATA_GAP_CODE = "PLATES_DATA_GAP";

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

type ProcedureFamily = "approach" | "sid" | "star" | "odp" | "diagram";

const getPlateDatasetAirport = (airport: string): DatasetAirport | undefined => {
  const faaId = toFaaCode(airport);
  const icaoId = toIcaoCode(airport);

  return getDatasetAirport(airport) ?? getDatasetAirport(icaoId) ?? getDatasetAirport(faaId) ?? undefined;
};

const getProcedureFamilyLabel = (family: ProcedureFamily): string => {
  switch (family) {
    case "sid":
      return "Departure procedures";
    case "star":
      return "Arrival procedures";
    case "odp":
      return "Obstacle departure procedures";
    case "diagram":
      return "Airport diagrams";
    case "approach":
      return "Approach procedures";
  }
};

const getForeignJurisdictionPlateGapMessage = (
  airportCode: string,
  family: ProcedureFamily,
  datasetAirport?: DatasetAirport
): string => {
  const label = getProcedureFamilyLabel(family);

  if (datasetAirport?.country === "CA") {
    return `${label} for ${airportCode} are published by NAV CANADA in the Canada Air Pilot (CAP), not the FAA Digital Terminal Procedures source. Verify via official NAV CANADA publications.`;
  }

  return `${label} for ${airportCode} are not available via the FAA Digital Terminal Procedures source. Verify via the appropriate national aeronautical authority.`;
};

const getForeignJurisdictionPlateGap = <T>(
  airport: string,
  family: ProcedureFamily
): ApiResponse<T> | null => {
  const airportCode = toIcaoCode(airport);
  const datasetAirport = getPlateDatasetAirport(airport);

  if (!datasetAirport?.country || datasetAirport.country === "US") {
    return null;
  }

  const message = getForeignJurisdictionPlateGapMessage(airportCode, family, datasetAirport);

  return createApiErrorResponse(
    {
      code: PLATES_DATA_GAP_CODE,
      message,
      details: message,
      retryable: true,
      status: 503
    },
    {
      source: OURAIRPORTS_SOURCE,
      fetchedAt: toIsoNow(),
      stalenessCategory: "approachPlate"
    }
  ) as ApiResponse<T>;
};

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

const toApproachPlate = (airportData: DtppAirportPayload, record: DtppRecord, source: typeof DTPP_SOURCE): ApproachPlate => ({
  airportIcao: airportData.icaoId,
  procedureName: record.chart_name,
  procedureType: inferApproachType(record.chart_name),
  runway: extractRunway(record.chart_name),
  chartUrl: toPdfUrl(airportData.cycle, record.pdf_name),
  pdfUrl: toPdfUrl(airportData.cycle, record.pdf_name),
  source,
  fetchedAt: airportData.fetchedAt,
  isStale: false
});

export const getPlates = async (params: { airport: string; type?: string }): Promise<ApiResponse<ApproachPlate[]>> => {
  const jurisdictionGap = getForeignJurisdictionPlateGap<ApproachPlate[]>(params.airport, "approach");
  if (jurisdictionGap) {
    return jurisdictionGap;
  }

  try {
    const airportData = await getDtppAirportData(params.airport);
    const records = airportData.records.filter((record) => record.chart_code === "IAP" && record.pdf_name);
    const plateTypeFilter = params.type?.toUpperCase();
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };

    const plates = dedupe(
      records
        .map((record) => toApproachPlate(airportData, record, source))
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

export const getAirportDiagram = async (airport: string): Promise<ApiResponse<ApproachPlate | null>> => {
  const jurisdictionGap = getForeignJurisdictionPlateGap<ApproachPlate | null>(airport, "diagram");
  if (jurisdictionGap) {
    return jurisdictionGap;
  }

  try {
    const airportData = await getDtppAirportData(airport);
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };
    const record = airportData.records.find((item) => item.chart_code === "APD" && item.pdf_name);
    const diagram = record ? toApproachPlate(airportData, record, source) : null;

    if (diagram) {
      recordPlateUrl(diagram.airportIcao, diagram.procedureName, diagram.chartUrl);
    }

    return createApiResponse(diagram, source, {
      fetchedAt: airportData.fetchedAt,
      stalenessCategory: "approachPlate",
      cache: airportData.cache
    });
  } catch (error) {
    if (error && typeof error === "object" && "ok" in error) {
      return error as ApiResponse<ApproachPlate | null>;
    }

    return toServiceErrorResponse(error, DTPP_SOURCE, "approachPlate");
  }
};

export const getSids = async (airport: string): Promise<ApiResponse<Sid[]>> => {
  const jurisdictionGap = getForeignJurisdictionPlateGap<Sid[]>(airport, "sid");
  if (jurisdictionGap) {
    return jurisdictionGap;
  }

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
  const jurisdictionGap = getForeignJurisdictionPlateGap<Star[]>(airport, "star");
  if (jurisdictionGap) {
    return jurisdictionGap;
  }

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

export const getOdps = async (airport: string): Promise<ApiResponse<Odp[]>> => {
  const jurisdictionGap = getForeignJurisdictionPlateGap<Odp[]>(airport, "odp");
  if (jurisdictionGap) {
    return jurisdictionGap;
  }

  try {
    const airportData = await getDtppAirportData(airport);
    const source = { ...DTPP_SOURCE, url: airportData.sourceUrl };
    const odps = airportData.records
      .filter((record) => record.chart_code === "MIN" && record.pdf_name)
      .map(
        (record): Odp => ({
          airportIcao: airportData.icaoId,
          procedureName: record.chart_name,
          chartUrl: toPdfUrl(airportData.cycle, record.pdf_name),
          source,
          fetchedAt: airportData.fetchedAt,
          isStale: false
        })
      );

    recordPlateUrls(odps);

    return createApiResponse(odps, source, {
      fetchedAt: airportData.fetchedAt,
      stalenessCategory: "sid",
      cache: airportData.cache
    });
  } catch (error) {
    if (error && typeof error === "object" && "ok" in error) {
      return error as ApiResponse<Odp[]>;
    }

    return toServiceErrorResponse(error, DTPP_SOURCE, "odp");
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
