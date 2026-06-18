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

const readQuery = async (request: Request): Promise<string> => {
  if (request.method === "GET") {
    return readRequiredSearchParam(request, "q") ?? "";
  }

  const body = (await request.json().catch(() => null)) as { input?: string; q?: string } | null;
  return body?.input?.trim() ?? body?.q?.trim() ?? "";
};

export async function GET(request: Request) {
  const query = await readQuery(request);

  if (!query) {
    return createMissingParamResponse("q", INTENT_ROUTE_SOURCE);
  }

  const parsed = await parseIntent(query);

  return jsonWithStandardHeaders(createApiResponse(parsed, parsed.source, { fetchedAt: parsed.parsedAt }));
}

export async function POST(request: Request) {
  const query = await readQuery(request);

  if (!query) {
    return createMissingParamResponse("input", INTENT_ROUTE_SOURCE);
  }

  const parsed = await parseIntent(query);

  return jsonWithStandardHeaders(createApiResponse(parsed, parsed.source, { fetchedAt: parsed.parsedAt }));
}
