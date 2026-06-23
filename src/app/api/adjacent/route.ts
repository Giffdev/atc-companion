import { NextResponse } from "next/server";

import { getAdjacentFacilities } from "@/data/facility-adjacency";
import { getFacilityById } from "@/data/facilities";
import { readRequiredSearchParam } from "@/app/api/route-utils";

export async function GET(request: Request) {
  const facilityId = readRequiredSearchParam(request, "facility");

  if (!facilityId) {
    return NextResponse.json({ error: "Missing 'facility' query parameter" }, { status: 400 });
  }

  if (!getFacilityById(facilityId)) {
    return NextResponse.json({ error: `Unknown facility: ${facilityId}` }, { status: 404 });
  }

  return NextResponse.json(getAdjacentFacilities(facilityId));
}
