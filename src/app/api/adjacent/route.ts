import { NextResponse } from "next/server";

import { getAdjacentFacilities } from "@/data/facility-adjacency";
import { getFacilityById } from "@/data/facilities";

export async function GET(request: Request) {
  const facilityId = new URL(request.url).searchParams.get("facility")?.trim();

  if (!facilityId) {
    return NextResponse.json({ error: "Missing 'facility' query parameter" }, { status: 400 });
  }

  if (!getFacilityById(facilityId)) {
    return NextResponse.json({ error: `Unknown facility: ${facilityId}` }, { status: 404 });
  }

  return NextResponse.json(getAdjacentFacilities(facilityId));
}
