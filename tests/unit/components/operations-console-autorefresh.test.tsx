import { act, fireEvent, render, screen } from "@testing-library/react";

import { OperationsConsole } from "@/components/OperationsConsole";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/QueryInput", () => {
  const source = {
    id: "test-intent-parser",
    name: "Test Intent Parser",
    url: "internal://test-intent-parser",
    reliability: "high" as const,
    refresh_interval: "on-demand"
  };

  return {
    QueryInput: ({ onSubmit }: { onSubmit: (query: string, intent: unknown) => void }) => (
      <div>
        <button
          type="button"
          onClick={() =>
            onSubmit("traffic at KBFI", {
              type: "traffic",
              airport: "KBFI",
              confidence: 0.99,
              rawInput: "traffic at KBFI",
              parsedAt: "2026-06-18T05:00:00.000Z",
              source,
              entities: [],
              requiresClarification: false
            })
          }
        >
          Submit traffic query
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit("latest metar for KBFI", {
              type: "weather",
              subtype: "metar",
              airport: "KBFI",
              confidence: 0.99,
              rawInput: "latest metar for KBFI",
              parsedAt: "2026-06-18T05:00:00.000Z",
              source,
              entities: [],
              requiresClarification: false
            })
          }
        >
          Submit weather query
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit("notams for KSEA", {
              type: "notam",
              airport: "KSEA",
              confidence: 0.99,
              rawInput: "notams for KSEA",
              parsedAt: "2026-06-18T05:00:00.000Z",
              source,
              entities: [],
              requiresClarification: false
            })
          }
        >
          Submit NOTAM query
        </button>
      </div>
    )
  };
});

const QUERY_SOURCE = {
  id: "test-source",
  name: "Test Source",
  url: "https://example.com/data",
  reliability: "high" as const,
  refresh_interval: "15s"
};

const createTrafficResult = (timestamp: string) => ({
  intent: {
    type: "traffic",
    airport: "KBFI",
    confidence: 0.99,
    rawInput: "traffic at KBFI",
    parsedAt: timestamp,
    source: QUERY_SOURCE,
    entities: [],
    requiresClarification: false
  },
  response: {
    ok: true as const,
    data: [
      {
        icao24: "a4b294",
        callsign: "ASA123",
        position: { latitude: 47.533, longitude: -122.302 },
        altitudeFeet: 3000,
        groundspeedKnots: 120,
        trackDegrees: 140,
        verticalRateFpm: 0,
        onGround: false,
        source: QUERY_SOURCE,
        fetchedAt: timestamp,
        isStale: false
      }
    ],
    source: QUERY_SOURCE,
    attribution: { primary: QUERY_SOURCE },
    fetchedAt: timestamp,
    isStale: false
  },
  executionTimeMs: 18,
  timestamp
});

const createWeatherResult = (timestamp: string) => ({
  intent: {
    type: "weather",
    subtype: "metar",
    airport: "KBFI",
    confidence: 0.99,
    rawInput: "latest metar for KBFI",
    parsedAt: timestamp,
    source: QUERY_SOURCE,
    entities: [],
    requiresClarification: false
  },
  response: {
    ok: true as const,
    data: {
      stationIcao: "KBFI",
      rawText: "METAR KBFI 180500Z 14006KT 10SM SCT020 BKN035 18/12 A2998 RMK AO2",
      observedAt: timestamp,
      source: QUERY_SOURCE,
      fetchedAt: timestamp,
      isStale: false,
      wind: {
        directionDegrees: 140,
        speedKnots: 6
      },
      visibility: {
        prevailingStatuteMiles: 10,
        rawValue: "10SM"
      },
      ceiling: {
        minimumBrokenOrOvercastFeetAgl: 3500
      },
      skyConditions: [
        { coverage: "SCT", baseFeetAgl: 2000 },
        { coverage: "BKN", baseFeetAgl: 3500 }
      ],
      weather: [],
      temperatureC: 18,
      dewpointC: 12,
      altimeterInHg: 29.98,
      flightCategory: "VFR",
      remarks: ["AO2"]
    },
    source: QUERY_SOURCE,
    attribution: { primary: QUERY_SOURCE },
    fetchedAt: timestamp,
    isStale: false
  },
  executionTimeMs: 22,
  timestamp
});

const createNotamUnavailableResult = (timestamp: string) => ({
  intent: {
    type: "notam",
    airport: "KSEA",
    confidence: 0.99,
    rawInput: "notams for KSEA",
    parsedAt: timestamp,
    source: QUERY_SOURCE,
    entities: [],
    requiresClarification: false
  },
  response: {
    ok: false as const,
    data: null,
    source: QUERY_SOURCE,
    attribution: { primary: QUERY_SOURCE },
    fetchedAt: timestamp,
    isStale: false,
    error: {
      code: "NOTAM_FEED_NOT_CONFIGURED",
      message: "Live inline NOTAMs for KSEA require FAA NOTAM API credentials. Use FAA NOTAM Search for the authoritative briefing.",
      details: "https://notams.aim.faa.gov/notamSearch/?designatorsForLocation=SEA",
      retryable: false,
      status: 200
    }
  },
  executionTimeMs: 12,
  timestamp
});

const createEmptyNotamResult = (timestamp: string) => ({
  intent: {
    type: "notam",
    airport: "KSEA",
    confidence: 0.99,
    rawInput: "notams for KSEA",
    parsedAt: timestamp,
    source: QUERY_SOURCE,
    entities: [],
    requiresClarification: false
  },
  response: {
    ok: true as const,
    data: [],
    source: QUERY_SOURCE,
    attribution: { primary: QUERY_SOURCE },
    fetchedAt: timestamp,
    isStale: false
  },
  executionTimeMs: 12,
  timestamp
});

const jsonResponse = (payload: unknown) =>
  Promise.resolve(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );

const flushUpdates = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("OperationsConsole auto-refresh", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("auto-refreshes traffic queries every 15 seconds with cache bypass", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      // First call is the warmup fetch that fires on mount (ignored by the component)
      .mockImplementationOnce(() => jsonResponse({}))
      .mockImplementationOnce(() => jsonResponse(createTrafficResult("2026-06-18T05:00:00.000Z")))
      .mockImplementationOnce(() => jsonResponse(createTrafficResult("2026-06-18T05:00:15.000Z")));
    vi.stubGlobal("fetch", fetchMock);

    const { unmount } = render(<OperationsConsole initialNow="2026-06-18T05:00:00.000Z" />);

    // Flush the warmup fetch that fires on mount, then clear so call counts start from 0
    await flushUpdates();
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Submit traffic query" }));

    await flushUpdates();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText(/Live • Auto-refreshing every 15s/i).length).toBeGreaterThan(0);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      input: "traffic at KBFI",
      bypassCache: false
    });

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });
    await flushUpdates();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      input: "traffic at KBFI",
      bypassCache: true
    });

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(15_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("auto-refreshes weather queries every 60 seconds with cache bypass", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      // First call is the warmup fetch that fires on mount (ignored by the component)
      .mockImplementationOnce(() => jsonResponse({}))
      .mockImplementationOnce(() => jsonResponse(createWeatherResult("2026-06-18T05:00:00.000Z")))
      .mockImplementationOnce(() => jsonResponse(createWeatherResult("2026-06-18T05:01:00.000Z")));
    vi.stubGlobal("fetch", fetchMock);

    render(<OperationsConsole initialNow="2026-06-18T05:00:00.000Z" />);

    // Flush the warmup fetch that fires on mount, then clear so call counts start from 0
    await flushUpdates();
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Submit weather query" }));

    await flushUpdates();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText(/Live • Auto-refreshing every 60s/i).length).toBeGreaterThan(0);

    await act(async () => {
      vi.advanceTimersByTime(59_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(1_000);
    });
    await flushUpdates();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      input: "latest metar for KBFI",
      bypassCache: true
    });
  });

  it("renders NOTAM feed failures as unavailable, not as zero NOTAMs", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({}))
      .mockImplementationOnce(() => jsonResponse(createNotamUnavailableResult("2026-06-18T05:00:00.000Z")));
    vi.stubGlobal("fetch", fetchMock);

    render(<OperationsConsole initialNow="2026-06-18T05:00:00.000Z" />);

    await flushUpdates();
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Submit NOTAM query" }));

    await flushUpdates();

    expect(screen.getAllByText("⚠️ NOTAMs could not be loaded").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/This is NOT confirmation that there are zero active NOTAMs/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Search FAA NOTAMs directly/i })).toHaveAttribute(
      "href",
      "https://notams.aim.faa.gov/notamSearch/?designatorsForLocation=SEA"
    );
    expect(screen.queryByText(/No active NOTAMs$/i)).not.toBeInTheDocument();
  });

  it("renders successful empty NOTAM results as no active NOTAMs", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => jsonResponse({}))
      .mockImplementationOnce(() => jsonResponse(createEmptyNotamResult("2026-06-18T05:00:00.000Z")));
    vi.stubGlobal("fetch", fetchMock);

    render(<OperationsConsole initialNow="2026-06-18T05:00:00.000Z" />);

    await flushUpdates();
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Submit NOTAM query" }));

    await flushUpdates();

    expect(screen.getAllByText("No active NOTAMs").length).toBeGreaterThan(0);
    expect(screen.getByText(/The live NOTAM feed loaded successfully and returned zero notices/i)).toBeInTheDocument();
    expect(screen.queryByText("⚠️ NOTAMs could not be loaded")).not.toBeInTheDocument();
  });
});
