import { NextResponse } from "next/server";
import { parseAtisIssuanceTime, ATIS_STALE_THRESHOLD_MIN } from "@/services/datis";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const airports = searchParams.get("airports");

  if (!airports) {
    return NextResponse.json({ error: "Missing 'airports' query parameter (comma-separated ICAO codes)" }, { status: 400 });
  }

  const icaoList = airports.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (icaoList.length === 0) {
    return NextResponse.json({ error: "No valid ICAO codes provided" }, { status: 400 });
  }

  // Limit to 10 airports per request
  const limited = icaoList.slice(0, 10);

  const results: Record<string, { letter: string; type: string; fullText: string; fetchedAt: string; issuedAt: string | null; ageMinutes: number | null; stale: boolean } | null> = {};

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

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          results[icao] = null;
          return;
        }

        // Prefer "combined" type, fall back to first entry
        const combined = data.find((d: { type: string }) => d.type === "combined") ?? data[0];
        const issuedAt = parseAtisIssuanceTime(combined.datis);
        const ageMinutes = issuedAt != null
          ? Math.round((Date.now() - new Date(issuedAt).getTime()) / 60_000)
          : null;
        results[icao] = {
          letter: combined.code,
          type: combined.type,
          fullText: combined.datis,
          fetchedAt: new Date().toISOString(),
          issuedAt,
          ageMinutes,
          stale: ageMinutes != null && ageMinutes > ATIS_STALE_THRESHOLD_MIN
        };
      } catch {
        results[icao] = null;
      }
    })
  );

  return NextResponse.json({ airports: results, fetchedAt: new Date().toISOString() });
}
