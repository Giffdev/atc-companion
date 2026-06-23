import type { NextResponse } from "next/server";

import { getResponseStatus, jsonWithStandardHeaders } from "@/app/api/route-utils";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import { parseAtisIssuanceTime, ATIS_STALE_THRESHOLD_MIN } from "@/services/datis";
import type { ApiResponse, DataSource } from "@/types/api";

export interface AtisLetterPayload {
  letter: string;
  type: "combined" | "departure" | "arrival";
  fullText: string;
  fetchedAt: string;
  issuedAt: string | null;
  ageMinutes: number | null;
  stale: boolean;
}

export type AtisBatchData = Record<string, AtisLetterPayload | null>;

const DATIS_BATCH_SOURCE: DataSource = {
  id: "datis-clowd",
  name: "FAA D-ATIS (clowd.io)",
  url: "https://datis.clowd.io/api",
  reliability: "medium",
  refresh_interval: "60s"
};

interface DatisBatchEntry {
  type?: unknown;
  code?: unknown;
  datis?: unknown;
}

const ATIS_TYPES = new Set<AtisLetterPayload["type"]>(["combined", "departure", "arrival"]);

const isAtisType = (type: unknown): type is AtisLetterPayload["type"] =>
  typeof type === "string" && ATIS_TYPES.has(type as AtisLetterPayload["type"]);

const send = <T>(response: ApiResponse<T>): NextResponse =>
  jsonWithStandardHeaders(response, { status: getResponseStatus(response) });

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const airports = searchParams.get("airports");

  if (airports === null) {
    return send(
      createApiErrorResponse(
        {
          code: "MISSING_REQUIRED_PARAMETER",
          message: "Missing required parameter: airports",
          retryable: false,
          status: 400
        },
        { source: DATIS_BATCH_SOURCE }
      )
    );
  }

  const icaoList = airports.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (icaoList.length === 0) {
    return send(
      createApiErrorResponse(
        {
          code: "INVALID_PARAMETER",
          message: "Invalid parameter: airports",
          details: "Provide at least one comma-separated ICAO code.",
          retryable: false,
          status: 400
        },
        { source: DATIS_BATCH_SOURCE }
      )
    );
  }

  const fetchedAt = toIsoNow();
  // Limit to 10 airports per request
  const limited = icaoList.slice(0, 10);

  const results: AtisBatchData = {};

  await Promise.allSettled(
    limited.map(async (icao) => {
      try {
        const response = await fetch(`https://datis.clowd.io/api/${icao.toLowerCase()}`, {
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 90 }
        });

        if (!response.ok) {
          results[icao] = null;
          return;
        }

        const data = await response.json() as unknown;

        if (!Array.isArray(data) || data.length === 0) {
          results[icao] = null;
          return;
        }

        // Prefer "combined" type, fall back to first entry
        const combined = (data as DatisBatchEntry[]).find((d) => d.type === "combined") ?? data[0] as DatisBatchEntry;

        if (
          typeof combined !== "object" ||
          combined === null ||
          typeof combined.code !== "string" ||
          combined.code.length === 0 ||
          !isAtisType(combined.type) ||
          typeof combined.datis !== "string" ||
          combined.datis.length === 0
        ) {
          results[icao] = null;
          return;
        }

        const issuedAt = parseAtisIssuanceTime(combined.datis);
        const ageMinutes = issuedAt != null
          ? Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000)
          : null;
        results[icao] = {
          letter: combined.code,
          type: combined.type,
          fullText: combined.datis,
          fetchedAt,
          issuedAt,
          ageMinutes,
          stale: ageMinutes != null && ageMinutes > ATIS_STALE_THRESHOLD_MIN
        };
      } catch {
        results[icao] = null;
      }
    })
  );

  return send(createApiResponse(results, DATIS_BATCH_SOURCE, { fetchedAt }));
}
