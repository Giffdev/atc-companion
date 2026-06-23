/**
 * Route-level unit tests for /api/atis (GET).
 *
 * The route handler is imported directly and called with a synthetic Request
 * object — no HTTP server required.  Global fetch is stubbed per-test to
 * control the upstream datis.clowd.io responses.
 *
 * Covers:
 *   - Missing / empty airports query parameter → 400
 *   - Single-airport happy path: correct response shape + field types
 *   - "combined" type is preferred over other ATIS types
 *   - Upstream fetch failure → airport entry is null (not a crash)
 *   - Upstream non-OK response → airport entry is null
 *   - Upstream returns empty array → airport entry is null
 *   - Up to 10 airports are processed; 11th is silently dropped
 */

import { GET } from "@/app/api/atis/route";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeDatisResponse = (entries: { type: string; code: string; datis: string }[]) =>
  new Response(JSON.stringify(entries), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

const req = (url: string) => new Request(url);

// ---------------------------------------------------------------------------
// 400 — missing / empty airports parameter
// ---------------------------------------------------------------------------

describe("/api/atis — parameter validation", () => {
  it("returns 400 when the airports query param is absent", async () => {
    const res = await GET(req("http://localhost/api/atis"));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/airports/i);
  });

  it("returns 400 when airports is an empty string after trimming", async () => {
    const res = await GET(req("http://localhost/api/atis?airports="));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 200 — successful ATIS fetch
// ---------------------------------------------------------------------------

describe("/api/atis — happy path", () => {
  it("returns 200 with the correct response shape for a single airport", async () => {
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

    expect(body).toMatchObject({
      airports: {
        KSEA: expect.objectContaining({
          letter: "J",
          type: "combined",
          fullText: expect.stringContaining("INFO J"),
          fetchedAt: expect.any(String),
          stale: expect.any(Boolean)
        })
      },
      fetchedAt: expect.any(String)
    });
  });

  it("ICAO codes are upper-cased in the response keys", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        makeDatisResponse([{ type: "combined", code: "A", datis: "KBFI ATIS INFO A 2000Z." }])
      )
    );

    const res = await GET(req("http://localhost/api/atis?airports=kbfi"));
    const body = await res.json();

    // Key should be upper-cased even if the query param was lower-case
    expect(body.airports).toHaveProperty("KBFI");
    expect(body.airports).not.toHaveProperty("kbfi");
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

    expect(body.airports.KSEA?.type).toBe("combined");
    expect(body.airports.KSEA?.letter).toBe("J");
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
    const issuedAt = body.airports.KSEA?.issuedAt;

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

    expect(body.airports.KBFI?.issuedAt).toBeNull();
    expect(body.airports.KBFI?.ageMinutes).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Error / fallback handling
// ---------------------------------------------------------------------------

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
    expect(body.airports.KBFI).toBeNull();
  });

  it("sets the airport entry to null when upstream returns a non-2xx status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not found", { status: 404 }))
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.airports.KBFI).toBeNull();
  });

  it("sets the airport entry to null when upstream returns an empty array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => makeDatisResponse([]))
    );

    const res = await GET(req("http://localhost/api/atis?airports=KBFI"));
    const body = await res.json();

    expect(body.airports.KBFI).toBeNull();
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

    expect(body.airports.KSEA).not.toBeNull();
    expect(body.airports.KBFI).toBeNull();
  });

  it("silently drops airports beyond the 10-airport limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => makeDatisResponse([{ type: "combined", code: "A", datis: "ATIS INFO A 1200Z." }]))
    );

    const manyAirports = Array.from({ length: 11 }, (_, i) => `K${String(i).padStart(3, "0")}`).join(",");
    const res = await GET(req(`http://localhost/api/atis?airports=${manyAirports}`));
    const body = await res.json();

    expect(Object.keys(body.airports)).toHaveLength(10);
  });
});
