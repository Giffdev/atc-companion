import { act, render, screen, waitFor } from "@testing-library/react";

import { AtisStrip } from "@/components/AtisStrip";
import type { DataSource } from "@/types/api";

import { afterEach, describe, expect, it, vi } from "vitest";

const DATIS_SOURCE: DataSource = {
  id: "datis-clowd",
  name: "FAA D-ATIS (clowd.io)",
  url: "https://datis.clowd.io/api",
  reliability: "medium",
  refresh_interval: "60s"
};

const successEnvelope = (data: Record<string, unknown>) => ({
  ok: true as const,
  data,
  source: DATIS_SOURCE,
  attribution: { primary: DATIS_SOURCE },
  fetchedAt: "2026-06-23T16:00:00.000Z",
  isStale: false
});

const errorEnvelope = {
  ok: false as const,
  data: null,
  source: DATIS_SOURCE,
  attribution: { primary: DATIS_SOURCE },
  fetchedAt: "2026-06-23T16:00:00.000Z",
  isStale: false,
  error: {
    code: "UPSTREAM_UNAVAILABLE",
    message: "D-ATIS unavailable",
    retryable: true,
    status: 503
  }
};

const jsonResponse = (payload: unknown, init?: ResponseInit) =>
  Promise.resolve(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
      ...init
    })
  );

const flushUpdates = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("AtisStrip", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("unwraps a successful ApiResponse envelope and renders ATIS letters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(
          successEnvelope({
            KSEA: {
              letter: "J",
              type: "combined",
              fullText: "KSEA ATIS INFO J 1853Z. WIND 170 AT 6.",
              fetchedAt: "2026-06-23T16:00:00.000Z",
              issuedAt: "2026-06-23T18:53:00.000Z",
              ageMinutes: 12,
              stale: false
            },
            KBFI: {
              letter: "A",
              type: "departure",
              fullText: "KBFI DEP ATIS INFO A 1900Z.",
              fetchedAt: "2026-06-23T16:00:00.000Z",
              issuedAt: "2026-06-23T19:00:00.000Z",
              ageMinutes: 5,
              stale: false
            }
          })
        )
      )
    );

    render(<AtisStrip airports={["KSEA", "KBFI"]} refreshIntervalMs={600_000} />);
    await flushUpdates();

    expect(screen.getByText("SEA")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("BFI")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText(/Checked 16:00Z/i)).toBeInTheDocument();
  });

  it("renders the error state for an ok:false ApiResponse envelope", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(errorEnvelope, { status: 503 })));

    render(<AtisStrip airports={["KSEA"]} refreshIntervalMs={600_000} />);
    await flushUpdates();

    expect(screen.getByRole("alert")).toHaveTextContent(/ATIS unavailable/i);
    expect(screen.queryByText(/Loading ATIS/i)).not.toBeInTheDocument();
  });

  it("hides the strip when every airport has a null ATIS entry", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(successEnvelope({ KSEA: null, KBFI: null }))));
    const { container } = render(<AtisStrip airports={["KSEA", "KBFI"]} refreshIntervalMs={600_000} />);

    await waitFor(() => expect(screen.queryByText(/Loading ATIS/i)).not.toBeInTheDocument());

    expect(screen.queryByText("SEA")).not.toBeInTheDocument();
    expect(screen.queryByText("BFI")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
