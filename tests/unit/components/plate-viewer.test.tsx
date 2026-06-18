import { fireEvent, render, screen } from "@testing-library/react";

import { PlateViewer, getPlateMatchScore, pickBestMatchingPlate } from "@/components/PlateViewer";
import type { ApproachPlate } from "@/types/aviation";

import { describe, expect, it } from "vitest";

const SOURCE = {
  id: "faa-dtpp",
  name: "FAA DTPP",
  url: "https://aeronav.faa.gov/d-tpp/",
  reliability: "high" as const,
  refresh_interval: "28d"
};

const PLATES: ApproachPlate[] = [
  {
    airportIcao: "KPAE",
    procedureName: "ILS OR LOC RWY 34L",
    procedureType: "ILS",
    runway: "34L",
    chartUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_ILS34L.PDF",
    pdfUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_ILS34L.PDF",
    source: SOURCE,
    fetchedAt: "2026-06-18T05:00:00.000Z",
    isStale: false
  },
  {
    airportIcao: "KPAE",
    procedureName: "RNAV (GPS) RWY 34L",
    procedureType: "RNAV",
    runway: "34L",
    chartUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_RNAV34L.PDF",
    pdfUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_RNAV34L.PDF",
    source: SOURCE,
    fetchedAt: "2026-06-18T05:00:00.000Z",
    isStale: false
  },
  {
    airportIcao: "KPAE",
    procedureName: "RNAV (GPS) RWY 16R",
    procedureType: "RNAV",
    runway: "16R",
    chartUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_RNAV16R.PDF",
    pdfUrl: "https://aeronav.faa.gov/d-tpp/2607/PAE_IAP_RNAV16R.PDF",
    source: SOURCE,
    fetchedAt: "2026-06-18T05:00:00.000Z",
    isStale: false
  }
];

describe("PlateViewer", () => {
  it("scores exact procedure and runway matches highest", () => {
    expect(getPlateMatchScore(PLATES[1], "RNAV", "34L")).toBe(3);
    expect(getPlateMatchScore(PLATES[2], "RNAV", "34L")).toBe(2);
    expect(getPlateMatchScore(PLATES[0], "RNAV", "34L")).toBe(1);
  });

  it("falls back to the first plate when no selection hints match", () => {
    expect(pickBestMatchingPlate(PLATES, "VOR", "10")).toBe(PLATES[0]);
  });

  it("renders the best matching plate and swaps when an alternate is clicked", () => {
    render(
      <PlateViewer
        plates={PLATES}
        referenceTime="2026-06-18T05:10:00.000Z"
        selectedProcedureType="RNAV"
        selectedRunway="34L"
      />
    );

    expect(screen.getByTitle("RNAV (GPS) RWY 34L PDF")).toHaveAttribute("src", PLATES[1].chartUrl);
    expect(screen.getAllByRole("link", { name: /open in new tab/i })[0]).toHaveAttribute("href", PLATES[1].chartUrl);

    fireEvent.click(screen.getByRole("button", { name: /ILS OR LOC RWY 34L/i }));

    expect(screen.getByTitle("ILS OR LOC RWY 34L PDF")).toHaveAttribute("src", PLATES[0].chartUrl);
    expect(screen.getAllByRole("link", { name: /open in new tab/i })[0]).toHaveAttribute("href", PLATES[0].chartUrl);
  });
});
