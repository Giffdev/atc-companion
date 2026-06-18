import { getStalenessThresholdMs, isDataStale } from "@/data/staleness";

describe("staleness detection", () => {
  const now = Date.parse("2026-06-17T21:00:00.000Z");

  it("flags a METAR older than 60 minutes as stale", () => {
    expect(isDataStale("2026-06-17T19:59:59.000Z", "metar", now)).toBe(true);
  });

  it("flags a TAF older than 6 hours as stale", () => {
    expect(isDataStale("2026-06-17T14:59:59.000Z", "taf", now)).toBe(true);
  });

  it("flags ADS-B traffic older than 30 seconds as stale", () => {
    expect(isDataStale("2026-06-17T20:59:29.000Z", "trafficTarget", now)).toBe(true);
  });

  it("does not flag fresh data as stale", () => {
    expect(isDataStale("2026-06-17T20:30:00.000Z", "metar", now)).toBe(false);
    expect(isDataStale("2026-06-17T18:00:01.000Z", "taf", now)).toBe(false);
  });

  it("treats an observation exactly on the threshold as still fresh", () => {
    const threshold = getStalenessThresholdMs("metar");
    expect(isDataStale(new Date(now - threshold).toISOString(), "metar", now)).toBe(false);
  });
});
