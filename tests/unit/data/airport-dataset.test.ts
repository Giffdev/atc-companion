import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getDatasetAirport,
  getDatasetFrequencies,
  getDatasetRunways,
  findDatasetAirportsByCity
} from "@/data/airport-dataset";

describe("airport dataset", () => {
  it("returns Lynden 38W runway 08/26 from the static fallback dataset", () => {
    expect(getDatasetRunways("38W")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          designator: "08/26"
        })
      ])
    );
  });

  it("returns Lynden 38W CTAF 122.9 from the static frequency dataset", () => {
    expect(getDatasetFrequencies("38W")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "CTAF",
          frequencyMHz: 122.9
        })
      ])
    );
  });

  it("resolves Forks S18 as a small airport", () => {
    expect(getDatasetAirport("S18")).toMatchObject({
      ident: "S18",
      name: "Forks Airport",
      type: "small_airport",
      regionCode: "WA",
      municipality: "Forks"
    });
  });

  it("resolves Bandera 4W0 as a small airport with no static frequency rows", () => {
    expect(getDatasetAirport("4W0")).toMatchObject({
      ident: "4W0",
      name: "Bandera State Airport",
      type: "small_airport",
      country: "US"
    });
    expect(getDatasetFrequencies("4W0")).toEqual([]);
  });

  it("resolves Vancouver CYVR from the Canadian generated dataset", () => {
    expect(getDatasetAirport("CYVR")).toMatchObject({
      ident: "CYVR",
      name: "Vancouver International Airport",
      country: "CA"
    });
  });

  it("resolves Canadian local code CSQ4 from the generated dataset", () => {
    expect(getDatasetAirport("CSQ4")).toMatchObject({
      ident: "CA-0084",
      localCode: "CSQ4",
      name: "Casey (Camp de Base) Airport",
      country: "CA"
    });
  });

  it("resolves Jamaican ICAO MKJS from the Caribbean generated dataset", () => {
    expect(getDatasetAirport("MKJS")).toMatchObject({
      ident: "MKJS",
      name: "Sangster International Airport",
      country: "JM"
    });
  });

  it("normalizes Puerto Rico airports to US jurisdiction while keeping them in the Caribbean dataset", () => {
    expect(getDatasetAirport("TJSJ")).toMatchObject({
      ident: "TJSJ",
      name: "Luis Munoz Marin International Airport",
      country: "US"
    });
  });

  it("returns runway and frequency rows for Caribbean airports", () => {
    expect(getDatasetRunways("MKJS")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          designator: "07/25"
        })
      ])
    );
    expect(getDatasetFrequencies("MKJS")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "TWR"
        })
      ])
    );
  });

  it("filters closed runways while preserving open multi-runway airports", () => {
    const runways = getDatasetRunways("PAE");

    expect(runways.map((runway) => runway.designator).sort()).toEqual(["16L/34R", "16R/34L"]);
  });

  it("returns multiple frequency entries for towered airports", () => {
    expect(getDatasetFrequencies("KSEA").length).toBeGreaterThan(1);
  });

  it("finds airports by normalized city and two-letter region code", () => {
    expect(findDatasetAirportsByCity("forks", "WA")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ident: "S18"
        })
      ])
    );
  });

  it("returns clean empty results for unknown codes", () => {
    expect(getDatasetAirport("NOTREAL")).toBeNull();
    expect(getDatasetRunways("NOTREAL")).toEqual([]);
    expect(getDatasetFrequencies("NOTREAL")).toEqual([]);
  });
});
