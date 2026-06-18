import { createApiResponse, isStale } from "@/lib/utils";

describe("createApiResponse", () => {
  it("wraps data with required source attribution", () => {
    const response = createApiResponse(
      { ready: true },
      {
        id: "example",
        name: "Example Source",
        url: "https://example.com/source",
        reliability: "high",
        refresh_interval: "hourly"
      },
      { fetchedAt: "2026-01-01T00:00:00.000Z" }
    );

    expect(response.ok).toBe(true);
    expect(response.attribution.primary.url).toBe("https://example.com/source");
    expect(response.fetchedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(response.data).toEqual({ ready: true });
  });
});

describe("isStale", () => {
  it("flags old timestamps", () => {
    const oldTimestamp = new Date(Date.now() - 60_000).toISOString();

    expect(isStale(oldTimestamp, 5_000)).toBe(true);
  });
});
