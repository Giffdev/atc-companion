import { NextResponse } from "next/server";

import { createApiErrorResponse } from "@/lib/utils";
import type { ApiResponse, DataSource } from "@/types/api";

const RATE_LIMIT_HEADERS = {
  "RateLimit-Limit": "60",
  "RateLimit-Remaining": "59",
  "RateLimit-Reset": "60",
  "X-RateLimit-Limit": "60",
  "X-RateLimit-Remaining": "59",
  "X-RateLimit-Reset": "60"
} as const;

export const jsonWithStandardHeaders = (body: unknown, init?: ResponseInit): NextResponse => {
  const response = NextResponse.json(body, init);

  for (const [header, value] of Object.entries(RATE_LIMIT_HEADERS)) {
    response.headers.set(header, value);
  }

  const apiBody = body as Partial<ApiResponse<unknown>>;
  if (!response.headers.has("Cache-Control")) {
    const ttlSeconds = apiBody.cache?.ttlSeconds ?? 0;
    response.headers.set("Cache-Control", ttlSeconds > 0 ? `private, max-age=${ttlSeconds}` : "no-store");
  }

  if (apiBody.source?.url) {
    response.headers.set("X-Source-Url", apiBody.source.url);
  }

  if (apiBody.fetchedAt) {
    response.headers.set("X-Fetched-At", apiBody.fetchedAt);
  }

  if (apiBody.cache) {
    response.headers.set("X-Cache", apiBody.cache.cached ? "HIT" : apiBody.cache.status.toUpperCase());
    response.headers.set("Age", String(apiBody.cache.ageSeconds));
  }

  return response;
};

export const readRequiredSearchParam = (request: Request, key: string): string | null => {
  const value = new URL(request.url).searchParams.get(key)?.trim();
  return value ? value : null;
};

export const createMissingParamResponse = (paramName: string, source: DataSource): NextResponse =>
  jsonWithStandardHeaders(
    createApiErrorResponse(
      {
        code: "MISSING_REQUIRED_PARAMETER",
        message: `Missing required parameter: ${paramName}`,
        details: `Provide the ${paramName} query parameter so the route can request the correct authoritative data source.`,
        retryable: false
      },
      { source }
    ),
    { status: 400 }
  );

export const createInvalidParamResponse = (paramName: string, details: string, source: DataSource): NextResponse =>
  jsonWithStandardHeaders(
    createApiErrorResponse(
      {
        code: "INVALID_PARAMETER",
        message: `Invalid parameter: ${paramName}`,
        details,
        retryable: false,
        status: 400
      },
      { source }
    ),
    { status: 400 }
  );

export const readOptionalSearchParam = (request: Request, key: string): string | null => {
  const value = new URL(request.url).searchParams.get(key)?.trim();
  return value ? value : null;
};

export const readBooleanSearchParam = (request: Request, key: string): boolean => {
  const value = new URL(request.url).searchParams.get(key)?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
};

export const getResponseStatus = <T>(response: ApiResponse<T>): number => {
  if (response.ok) {
    return 200;
  }

  return response.error.status ?? 503;
};
