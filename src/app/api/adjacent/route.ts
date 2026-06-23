import type { NextResponse } from "next/server";

import { getResponseStatus, jsonWithStandardHeaders, readRequiredSearchParam } from "@/app/api/route-utils";
import { getAdjacentFacilities, type AdjacentFacilityResult } from "@/data/facility-adjacency";
import { getFacilityById } from "@/data/facilities";
import { createApiErrorResponse, createApiResponse, toIsoNow } from "@/lib/utils";
import type { ApiResponse, DataSource } from "@/types/api";

const ADJACENCY_SOURCE: DataSource = {
  id: "atc-companion-facility-adjacency",
  name: "ATC Companion facility adjacency dataset",
  url: "local://src/data/facility-adjacency.ts",
  reliability: "medium",
  refresh_interval: "static bundled data"
};

const send = <T>(response: ApiResponse<T>): NextResponse =>
  jsonWithStandardHeaders(response, { status: getResponseStatus(response) });

export async function GET(request: Request) {
  const facilityId = readRequiredSearchParam(request, "facility");

  if (!facilityId) {
    return send(
      createApiErrorResponse(
        {
          code: "MISSING_REQUIRED_PARAMETER",
          message: "Missing required parameter: facility",
          retryable: false,
          status: 400
        },
        { source: ADJACENCY_SOURCE }
      )
    );
  }

  if (!getFacilityById(facilityId)) {
    return send(
      createApiErrorResponse(
        {
          code: "NOT_FOUND",
          message: `Unknown facility: ${facilityId}`,
          retryable: false,
          status: 404
        },
        { source: ADJACENCY_SOURCE }
      )
    );
  }

  const fetchedAt = toIsoNow();
  const response = createApiResponse<AdjacentFacilityResult>(
    getAdjacentFacilities(facilityId),
    ADJACENCY_SOURCE,
    { fetchedAt }
  );
  return send(response);
}
