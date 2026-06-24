import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FacilityOverview from "@/components/FacilityOverview";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });

describe("FacilityOverview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses live resolved airport names instead of Unknown Airport for FAA local identifiers", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.startsWith("/api/weather")) {
        return jsonResponse({ ok: false, data: null });
      }

      if (url.startsWith("/api/atis")) {
        return jsonResponse({ ok: true, data: { S18: null } });
      }

      if (url.startsWith("/api/query")) {
        return jsonResponse({
          response: {
            ok: true,
            data: {
              airportName: "FORKS",
              airportCity: "FORKS",
              airportState: "WA",
              runwayDetails: {
                ok: true,
                data: {
                  runways: [{ designator: "04/22", lengthFeet: 2400, widthFeet: 75, surface: "ASPH" }]
                }
              }
            }
          }
        });
      }

      return jsonResponse({}, { status: 404 });
    });

    render(
      <FacilityOverview
        airports={["S18"]}
        facilityName="Test Facility"
        facilityType="approach"
        onSelectAirport={vi.fn()}
      />
    );

    expect(await screen.findByText("FORKS")).toBeInTheDocument();
    expect(screen.queryByText("Unknown Airport")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/04\/22/)).toBeInTheDocument());
  });
});
