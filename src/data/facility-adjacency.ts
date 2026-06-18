import {
  APPROACH_FACILITIES,
  findApproachFacilityByAirport,
  type ApproachFacility
} from "@/data/approach-facilities";
import { getFacilityById } from "@/data/facilities";
import type { ControllerFacility, FacilityType } from "@/types/facility";

type FacilitySummary = {
  id: string;
  name: string;
  type: FacilityType;
};

type NeighborSummary = {
  id: string;
  name: string;
};

export interface AdjacentFacilityResult {
  facility: FacilitySummary;
  overlying?: FacilitySummary;
  adjacentCenters: NeighborSummary[];
  adjacentApproach: NeighborSummary[];
  adjacentTowers: NeighborSummary[];
}

type AdjacencySeed = Record<string, readonly string[]>;

const CENTER_IDS = [
  "ZAB",
  "ZAU",
  "ZAN",
  "ZBW",
  "ZDC",
  "ZDV",
  "ZFW",
  "ZHU",
  "ZHN",
  "ZID",
  "ZJX",
  "ZKC",
  "ZLA",
  "ZLC",
  "ZMA",
  "ZME",
  "ZMP",
  "ZNY",
  "ZOA",
  "ZOB",
  "ZSE",
  "ZTL"
] as const;

const buildSymmetricAdjacency = (seed: AdjacencySeed, allIds: readonly string[]): Record<string, string[]> => {
  const adjacency = new Map<string, Set<string>>();

  for (const id of allIds) {
    adjacency.set(id, new Set());
  }

  for (const [source, neighbors] of Object.entries(seed)) {
    const sourceId = source.toUpperCase();
    const sourceNeighbors = adjacency.get(sourceId) ?? new Set<string>();
    adjacency.set(sourceId, sourceNeighbors);

    for (const neighbor of neighbors) {
      const neighborId = neighbor.toUpperCase();
      sourceNeighbors.add(neighborId);

      const neighborNeighbors = adjacency.get(neighborId) ?? new Set<string>();
      neighborNeighbors.add(sourceId);
      adjacency.set(neighborId, neighborNeighbors);
    }
  }

  return Object.fromEntries(
    Array.from(adjacency.entries()).map(([id, neighbors]) => [id, Array.from(neighbors)])
  );
};

export const CENTER_ADJACENCY = buildSymmetricAdjacency(
  {
    ZSE: ["ZOA", "ZLC", "ZAN"],
    ZOA: ["ZSE", "ZLC", "ZLA"],
    ZLC: ["ZSE", "ZOA", "ZLA", "ZDV", "ZMP", "ZAB"],
    ZLA: ["ZOA", "ZLC", "ZAB", "ZDV"],
    ZAB: ["ZLA", "ZLC", "ZDV", "ZKC", "ZFW"],
    ZDV: ["ZLC", "ZMP", "ZKC", "ZAB", "ZLA"],
    ZMP: ["ZLC", "ZDV", "ZKC", "ZAU", "ZID", "ZSE"],
    ZAU: ["ZMP", "ZKC", "ZID", "ZOB", "ZME"],
    ZKC: ["ZDV", "ZMP", "ZAU", "ZME", "ZFW", "ZAB"],
    ZFW: ["ZAB", "ZKC", "ZME", "ZHU"],
    ZHU: ["ZFW", "ZME", "ZJX", "ZMA"],
    ZME: ["ZKC", "ZAU", "ZID", "ZTL", "ZJX", "ZHU", "ZFW"],
    ZID: ["ZAU", "ZOB", "ZMP", "ZME", "ZTL", "ZDC"],
    ZOB: ["ZAU", "ZID", "ZDC", "ZNY", "ZBW"],
    ZTL: ["ZME", "ZID", "ZDC", "ZJX"],
    ZJX: ["ZTL", "ZDC", "ZMA", "ZHU", "ZME"],
    ZDC: ["ZID", "ZOB", "ZNY", "ZBW", "ZTL", "ZJX"],
    ZNY: ["ZOB", "ZDC", "ZBW"],
    ZBW: ["ZNY", "ZOB", "ZDC"],
    ZMA: ["ZJX", "ZHU"],
    ZAN: ["ZSE"],
    ZHN: []
  },
  CENTER_IDS
);

export const APPROACH_PARENT_CENTER: Record<string, string> = {
  S46: "ZSE",
  NUW: "ZSE",
  P80: "ZSE",
  NCT: "ZOA",
  SCT: "ZLA",
  PCT: "ZDC",
  N90: "ZNY",
  C90: "ZAU",
  A80: "ZTL",
  D01: "ZDV",
  D10: "ZFW",
  A90: "ZBW",
  P50: "ZAB",
  L30: "ZLA",
  GSO: "ZTL",
  CLT: "ZTL",
  RDU: "ZDC",
  BNA: "ZME",
  MEM: "ZME",
  STL: "ZKC",
  SLC: "ZLC",
  TPA: "ZJX",
  MCO: "ZJX",
  MSP: "ZMP",
  IND: "ZID",
  CVG: "ZID",
  PIT: "ZOB",
  MCI: "ZKC",
  SAT: "ZHU",
  AUS: "ZHU",
  HCF: "ZHN",
  NKX: "ZLA",
  DTW: "ZOB",
  MKE: "ZAU",
  CLE: "ZOB",
  BWI: "ZDC",
  JAX: "ZJX"
};

export const APPROACH_ADJACENCY = buildSymmetricAdjacency(
  {
    S46: ["P80", "NUW"],
    NUW: ["S46", "P80"],
    P80: ["S46", "NUW", "NCT"],
    NCT: ["P80", "SCT", "L30"],
    SCT: ["NCT", "L30", "P50", "NKX"],
    PCT: ["BWI", "PIT", "N90", "RDU"],
    N90: ["PCT", "A90", "PIT", "BWI"],
    C90: ["MKE", "MSP", "IND", "CLE", "MCI"],
    A80: ["CLT", "GSO", "RDU", "BNA"],
    D01: ["SLC", "P50", "MCI", "D10"],
    D10: ["AUS", "SAT", "MCI", "MEM", "D01"],
    A90: ["N90", "PIT", "CLE"],
    P50: ["L30", "SCT", "D01", "SAT", "AUS", "SLC"],
    L30: ["SCT", "P50", "NKX", "NCT"],
    GSO: ["CLT", "RDU", "A80"],
    CLT: ["GSO", "RDU", "A80"],
    RDU: ["GSO", "CLT", "PCT", "BWI", "A80"],
    BNA: ["MEM", "STL", "IND", "CVG", "A80"],
    MEM: ["BNA", "STL", "MCI", "D10", "CVG"],
    STL: ["BNA", "MEM", "MCI", "IND"],
    SLC: ["D01", "P50", "L30", "NKX"],
    TPA: ["MCO", "JAX"],
    MCO: ["TPA", "JAX"],
    MSP: ["MKE", "DTW", "IND", "CLE", "MCI", "C90"],
    IND: ["CVG", "PIT", "CLE", "DTW", "MSP", "C90", "STL", "BNA"],
    CVG: ["IND", "PIT", "BNA", "MEM", "CLE"],
    PIT: ["CLE", "DTW", "IND", "CVG", "BWI", "PCT", "N90", "A90"],
    MCI: ["STL", "MEM", "D10", "D01", "MSP", "C90"],
    SAT: ["AUS", "D10", "P50"],
    AUS: ["SAT", "D10", "P50"],
    HCF: [],
    NKX: ["SCT", "L30", "SLC"],
    DTW: ["CLE", "MKE", "MSP", "IND", "PIT"],
    MKE: ["C90", "MSP", "DTW", "CLE"],
    CLE: ["DTW", "MKE", "MSP", "IND", "CVG", "PIT", "C90", "A90"],
    BWI: ["PCT", "PIT", "RDU", "N90"],
    JAX: ["MCO", "TPA"]
  },
  APPROACH_FACILITIES.map((facility) => facility.icao.toUpperCase())
);

const APPROACH_INDEX = new Map<string, ApproachFacility>(
  APPROACH_FACILITIES.map((facility) => [facility.icao.toUpperCase(), facility])
);

const towerIdForAirport = (airportIcao: string): string => `${airportIcao.toUpperCase()}-TWR`;

const toSummary = (facility: ControllerFacility): FacilitySummary => ({
  id: facility.id,
  name: facility.name,
  type: facility.type
});

const toNeighborSummary = (facilityId: string): NeighborSummary | null => {
  const facility = getFacilityById(facilityId);
  if (!facility) {
    return null;
  }

  return {
    id: facility.id,
    name: facility.name
  };
};

const resolveNeighborSummaries = (facilityIds: readonly string[]): NeighborSummary[] => {
  const neighbors = facilityIds
    .map(toNeighborSummary)
    .filter((facility): facility is NeighborSummary => facility !== null);

  return neighbors.sort((left, right) => left.name.localeCompare(right.name));
};

const resolveApproach = (facilityId: string): ApproachFacility | null =>
  APPROACH_INDEX.get(facilityId.trim().toUpperCase()) ?? null;

const resolveCenterSummary = (centerId: string | undefined): NeighborSummary[] =>
  centerId ? resolveNeighborSummaries([centerId]) : [];

export function getAdjacentFacilities(facilityId: string): AdjacentFacilityResult {
  const facility = getFacilityById(facilityId);

  if (!facility) {
    throw new Error(`Unknown facility: ${facilityId}`);
  }

  if (facility.type === "center") {
    return {
      facility: toSummary(facility),
      adjacentCenters: resolveNeighborSummaries(CENTER_ADJACENCY[facility.id] ?? []),
      adjacentApproach: [],
      adjacentTowers: []
    };
  }

  if (facility.type === "approach") {
    const approach = resolveApproach(facility.id);
    const parentCenterId = approach ? APPROACH_PARENT_CENTER[approach.icao] : undefined;
    const parentCenter = parentCenterId ? getFacilityById(parentCenterId) : null;

    return {
      facility: toSummary(facility),
      overlying: parentCenter ? toSummary(parentCenter) : undefined,
      adjacentCenters: resolveCenterSummary(parentCenterId),
      adjacentApproach: resolveNeighborSummaries(APPROACH_ADJACENCY[facility.id] ?? []),
      adjacentTowers: resolveNeighborSummaries(
        (approach?.airports ?? []).map(towerIdForAirport)
      )
    };
  }

  if (facility.type === "tower") {
    const approach = facility.primaryAirport ? findApproachFacilityByAirport(facility.primaryAirport) : null;
    const parentCenterId = approach ? APPROACH_PARENT_CENTER[approach.icao] : undefined;
    const overlyingApproach = approach ? getFacilityById(approach.icao) : null;
    const siblingTowerIds = (approach?.airports ?? [])
      .filter((airportIcao) => towerIdForAirport(airportIcao) !== facility.id)
      .map(towerIdForAirport);

    return {
      facility: toSummary(facility),
      overlying: overlyingApproach ? toSummary(overlyingApproach) : undefined,
      adjacentCenters: resolveCenterSummary(parentCenterId),
      adjacentApproach: approach ? [{ id: approach.icao, name: approach.name }] : [],
      adjacentTowers: resolveNeighborSummaries(siblingTowerIds)
    };
  }

  return {
    facility: toSummary(facility),
    adjacentCenters: [],
    adjacentApproach: [],
    adjacentTowers: []
  };
}
