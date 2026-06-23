/**
 * Route-level unit tests for /api/atis (GET).
 *
 * The route handler is imported directly and called with a synthetic Request
 * object — no HTTP server required. Global fetch is stubbed per-test to
 * control the upstream datis.clowd.io responses.
 */

import { GET } from "@/app/api/atis/route";
import { describe, expect, it, vi } from "vitest";

const DATIS_SOURCE_ID = "datis-clowd";

const makeDatisResponse = (entries: { type: string; code: string; datis: string }[]) =>
  new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

const req = (url: string) => new Request(url);

const expectAtisEnvelope = (body: Record<string, unknown>) => {
  expect(body).toMatchObject({
    ok: true,
    data: expect.any(Object),
    source: expect.objectContaining({ id: DATIS_SOURCE_ID }),
    attribution: {
      primary: expect.objectContaining({ id: DATIS_SOURCE_ID })
    },
    fetchedAt: expect.any(String),
    isStale: false
  });
  expect(body).not.toHaveProperty("airports");
  expect(body.data).not.toHaveProperty("airports");
};

describe("/api/atis — parameter validation", () => {
  it("returns a 400 envelope when the airports query param is absent", async () => {
    const res = await GET(req("http://localhost/api/atis"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({
      ok: false,
      data: null,
      error: expect.objectContaining({
        code: "MISSING_REQUIRED_PARAMETER",
        status: 400
      }),
      source: expect.objectContaining({ id: DATIS_SOURCE_ID }),
      attribution: {
        primary: expect.objectContaining({ id: DATIS_SOURCE_ID })
      }
    });
  });

  it("returns a 400 envelope when airports is empty after trimming", async () => {
    const res = await GET(req("http://localhost/api/atis?airports=%20,%20"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({
      ok: false,
      data: null,
      error: expect.objectContaining({
        code: "INVALID_PARAMETER",
        status: 400
      })
    });
  });
});

describe("/api/atis — happy path", () => {
  it("returns an ApiResponse envelope with single-airport ATIS data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([
          {
            type: "combined",
            code: "J",
            datis: "KSEA ATIS INFO J 1853Z. WIND 170 AT 6. VIS 10. ALTM 3012."
          }
        ])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=KSEA"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expectAtisEnvelope(body);
    expect(body.data.KSEA).toMatchObject({
      letter: "J",
      type: "combined",
      fullText: expect.stringContaining("INFO J"),
      fetchedAt: body.fetchedAt,
      stale: expect.any(Boolean)
    });
  });

  it("ICAO codes are upper-cased in the data keys", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([{ type: "combined", code: "A", datis: "KBFI ATIS INFO A 2000Z." }])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=kbfi"));
    const body = await res.json();

    expectAtisEnvelope(body);
    expect(body.data).toHaveProperty("KBFI");
    expect(body.data).not.toHaveProperty("kbfi");
  });

  it("prefers 'combined' type over other ATIS types in the same payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([
          { type: "arrival", code: "X", datis: "KSEA ARR ATIS INFO X 1800Z." },
          { type: "combined", code: "J", datis: "KSEA ATIS INFO J 1853Z." },
          { type: "departure", code: "Y", datis: "KSEA DEP ATIS INFO Y 1830Z." }
        ])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=KSEA"));
    const body = await res.json();

    expect(body.data.KSEA?.type).toBe("combined");
    expect(body.data.KSEA?.letter).toBe("J");
  });

  it("issuedAt is a valid ISO string when a HHMMZ token is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([
          { type: "combined", code: "J", datis: "KSEA ATIS INFO J 1853Z. WIND 170 AT 6." }
        ])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=KSEA"));
    const body = await res.json();
    const issuedAt = body.data.KSEA?.issuedAt;

    expect(issuedAt).not.toBeNull();
    expect(typeof issuedAt).toBe("string");
    expect(issuedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("issuedAt is null when no HHMMZ token is present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([
          { type: "combined", code: "A", datis: "KBFI ATIS INFO A. NO TIME TOKEN HERE." }
        ])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.data.KBFI?.issuedAt).toBeNull();
    expect(body.data.KBFI?.ageMinutes).toBeNull();
  });
});

describe("/api/atis — error handling", () => {
  it("sets the airport entry to null when the upstream fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network timeout");
      })
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expectAtisEnvelope(body);
    expect(body.data.KBFI).toBeNull();
  });

  it("sets the airport entry to null when upstream returns a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 }))
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.data.KBFI).toBeNull();
  });

  it("sets the airport entry to null when upstream returns an empty array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => makeDatisResponse([]))
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.data.KBFI).toBeNull();
  });

  it("sets the airport entry to null when upstream returns malformed data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => makeDatisResponse([{ type: "combined", code: "", datis: "KBFI ATIS INFO A 1200Z." }]))
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.data.KBFI).toBeNull();
  });

  it("handles multiple airports where one succeeds and one fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("ksea")) {
          return makeDatisResponse([
            { type: "combined", code: "J", datis: "KSEA ATIS INFO J 1853Z." }
          ]);
        }

        throw new Error("upstream failure for KBFI");
      })
    );

    const res = await GET(req("http://localhost/api/atis?airports=KSEA,KBFI"));
    const body = await res.json();

    expect(body.data.KSEA).not.toBeNull();
    expect(body.data.KBFI).toBeNull();
  });

  it("silently drops airports beyond the 10-airport limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => makeDatisResponse([{ type: "combined", code: "A", datis: "ATIS INFO A 1200Z." }]))
    );

    const manyAirports = Array.from({ length: 11 }, (_, i) => `K${String(i).padStart(3, "0")}`).join(",");
    const res = await GET(req(`http://localhost/api/atis?airports=${manyAirports}`));
    const body = await res.json();

    expect(Object.keys(body.data)).toHaveLength(10);
    expect(body.data).not.toHaveProperty("K010");
  });
});
