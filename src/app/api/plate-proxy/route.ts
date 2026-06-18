import { type NextRequest, NextResponse } from "next/server";

/**
 * Proxies FAA chart PDFs to avoid X-Frame-Options / CSP restrictions
 * that prevent embedding aeronav.faa.gov PDFs in iframes.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Only allow proxying from trusted FAA domains
  const ALLOWED_HOSTS = [
    "aeronav.faa.gov",
    "www.faa.gov",
    "nfdc.faa.gov",
  ];

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: `Host not allowed: ${parsedUrl.hostname}` },
      { status: 403 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ATC-Companion/1.0 (FAA chart viewer)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") ?? "application/pdf";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
