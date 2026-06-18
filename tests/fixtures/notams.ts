import type { DataSource } from "@/types/api";
import type { Notam } from "@/types/aviation";

const FAA_NOTAM_SOURCE: DataSource = {
  id: "faa-notams",
  name: "FAA NOTAM Search / NOTAM Management Service",
  url: "https://notams.aim.faa.gov/notamSearch/",
  reliability: "high",
  refresh_interval: "Continuous; operational consumers should re-check at least every 12 hours"
};

export const SAMPLE_NOTAMS: Notam[] = [
  {
    notamId: "!JFK 06/123 JFK RWY 04L/22R CLSD",
    type: "D",
    affectedFacility: "KJFK",
    keyword: "RWY",
    text: "RWY 04L/22R CLSD",
    effectiveAt: "2026-06-17T19:00:00.000Z",
    expiresAt: "2026-06-18T05:00:00.000Z",
    source: FAA_NOTAM_SOURCE,
    fetchedAt: "2026-06-17T19:05:00.000Z",
    isStale: false
  },
  {
    notamId: "FDC 6/4321 JFK IAP JFK ILS RWY 04R AMDT 5A",
    type: "FDC",
    affectedFacility: "KJFK",
    reference: "IAP",
    text: "ILS RWY 04R AMDT 5A",
    effectiveAt: "2026-06-17T18:00:00.000Z",
    source: FAA_NOTAM_SOURCE,
    fetchedAt: "2026-06-17T18:05:00.000Z",
    isStale: false
  }
];
