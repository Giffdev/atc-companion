import { createMissingParamResponse, jsonWithStandardHeaders, readRequiredSearchParam } from "@/app/api/route-utils";
import { parseIntent } from "@/ai/intent-parser";
import { createApiResponse } from "@/lib/utils";
import type { DataSource } from "@/types/api";

const INTENT_ROUTE_SOURCE: DataSource = {
  id: "internal-intent-route",
  name: "Internal Intent Route",
  url: "internal://intent-route",
  reliability: "high",
  refresh_interval: "on-demand"
};

const readQuery = async (request: Request): Promise<{ query: string; facility?: string }> => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return {
      query: readRequiredSearchParam(request, "q") ?? "",
      facility: url.searchParams.get("facility")?.trim() || undefined
    };
  }

  const body = (await request.json().catch(() => null)) as { input?: string; q?: string; facility?: string } | null;
  return {
    query: body?.input?.trim() ?? body?.q?.trim() ?? "",
    facility: body?.facility?.trim() || undefined
  };
};

export async function GET(request: Request) {
  const { query, facility } = await readQuery(request);

  if (!query) {
    return createMissingParamResponse("q", INTENT_ROUTE_SOURCE);
  }

  const parsed = await parseIntent(query, { facilityId: facility });

  return jsonWithStandardHeaders(createApiResponse(parsed, parsed.source, { fetchedAt: parsed.parsedAt }));
}

export async function POST(request: Request) {
  const { query, facility } = await readQuery(request);

  if (!query) {
    return createMissingParamResponse("input", INTENT_ROUTE_SOURCE);
  }

  const parsed = await parseIntent(query, { facilityId: facility });

  return jsonWithStandardHeaders(createApiResponse(parsed, parsed.source, { fetchedAt: parsed.parsedAt }));
}
