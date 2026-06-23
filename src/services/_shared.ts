import { createApiErrorResponse } from "@/lib/utils";
import { FetcherError } from "@/lib/fetcher";
import type { ApiResponse, DataSource } from "@/types/api";
import type { StalenessCategory } from "@/data/staleness";

export const toServiceErrorResponse = (
  error: unknown,
  source: DataSource,
  stalenessCategory?: StalenessCategory
): ApiResponse<never> => {
  if (error instanceof FetcherError) {
    return createApiErrorResponse(
      {
        code: error.options.code,
        message: error.message,
        details: error.options.details,
        retryable: error.options.retryable,
        status: error.options.status
      },
      {
        source: error.options.source,
        fetchedAt: error.options.fetchedAt,
        stalenessCategory
      }
    );
  }

  return createApiErrorResponse(
    {
      code: "UNEXPECTED_SERVICE_ERROR",
      message: "The upstream aviation source could not be processed.",
      details: error instanceof Error ? error.message : String(error),
      retryable: false,
      status: 500
    },
    {
      source,
      stalenessCategory
    }
  );
};

export const toIsoTimestamp = (value: string | number | null | undefined, fallback: string): string => {
  if (typeof value === "number") {
    return new Date(value * 1000).toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    // Append "Z" to strings that have no timezone designator so they are
    // treated as UTC rather than local time on non-UTC runtimes.
    const hasTz = /[Zz]$/.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed);
    const normalized = hasTz ? trimmed : `${trimmed}Z`;
    const parsed = Date.parse(normalized);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return fallback;
};

export const parseVisibilityMiles = (value: unknown): number | null => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.replace("+", "").replace("SM", "").trim();

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return Number.parseFloat(normalized);
  }

  const fractionMatch = normalized.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const [, whole, numerator, denominator] = fractionMatch;
    return Number.parseInt(whole, 10) + Number.parseInt(numerator, 10) / Number.parseInt(denominator, 10);
  }

  const simpleFractionMatch = normalized.match(/^(\d+)\/(\d+)$/);
  if (simpleFractionMatch) {
    const [, numerator, denominator] = simpleFractionMatch;
    return Number.parseInt(numerator, 10) / Number.parseInt(denominator, 10);
  }

  return null;
};

export const metersToFeet = (value: number | null | undefined): number | null =>
  typeof value === "number" ? Math.round(value * 3.28084) : null;

export const metersPerSecondToKnots = (value: number | null | undefined): number | null =>
  typeof value === "number" ? Math.round(value * 1.94384) : null;

export const metersPerSecondToFpm = (value: number | null | undefined): number | null =>
  typeof value === "number" ? Math.round(value * 196.850394) : null;

export const stripHtml = (value: string | null | undefined): string =>
  (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
