/** Default UI threshold when a record does not provide a more specific contract. */
export const DEFAULT_STALENESS_THRESHOLD_MS = 10 * 60 * 1000;

/** Source-specific freshness windows based on operational publication cadence. */
export const STALENESS_THRESHOLDS_MS = {
  metar: 60 * 60 * 1000,
  taf: 6 * 60 * 60 * 1000,
  pirep: 2 * 60 * 60 * 1000,
  notam: 12 * 60 * 60 * 1000,
  approachPlate: 28 * 24 * 60 * 60 * 1000,
  sid: 28 * 24 * 60 * 60 * 1000,
  star: 28 * 24 * 60 * 60 * 1000,
  airportInfo: 28 * 24 * 60 * 60 * 1000,
  frequency: 28 * 24 * 60 * 60 * 1000,
  runway: 28 * 24 * 60 * 60 * 1000,
  trafficTarget: 30 * 1000,
  farReference: 30 * 24 * 60 * 60 * 1000
} as const;

export type StalenessCategory = keyof typeof STALENESS_THRESHOLDS_MS;

export const getStalenessThresholdMs = (category: StalenessCategory): number => STALENESS_THRESHOLDS_MS[category];

export const isDataStale = (
  fetchedAt: string,
  category: StalenessCategory,
  nowMs = Date.now()
): boolean => nowMs - new Date(fetchedAt).getTime() > getStalenessThresholdMs(category);
