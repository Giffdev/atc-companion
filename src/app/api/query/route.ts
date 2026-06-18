import { jsonWithStandardHeaders } from "@/app/api/route-utils";
import { parseIntent } from "@/ai/intent-parser";
import { executeQuery } from "@/services/orchestrator";

const readRequestBody = async (
  request: Request
): Promise<{ input: string; facility?: string; bypassCache: boolean }> => {
  const body = (await request.json().catch(() => null)) as { input?: string; facility?: string; bypassCache?: boolean } | null;

  return {
    input: body?.input?.trim() ?? "",
    facility: body?.facility?.trim() || undefined,
    bypassCache: body?.bypassCache === true
  };
};

export async function POST(request: Request) {
  const { input, facility, bypassCache } = await readRequestBody(request);

  if (!input) {
    return jsonWithStandardHeaders(
      {
        intent: {
          type: "unknown",
          confidence: 0,
          rawInput: "",
          parsedAt: new Date().toISOString(),
          source: {
            id: "internal-query-route",
            name: "Internal Query Route",
            url: "internal://query-route",
            reliability: "high",
            refresh_interval: "on-demand"
          },
          entities: [],
          requiresClarification: true,
          clarificationReason: "empty-input",
          clarificationPrompt: "Provide a query such as weather at KJFK or FAR 91.113."
        },
        response: {
          ok: false,
          data: null,
          source: {
            id: "internal-query-route",
            name: "Internal Query Route",
            url: "internal://query-route",
            reliability: "high",
            refresh_interval: "on-demand"
          },
          attribution: {
            primary: {
              id: "internal-query-route",
              name: "Internal Query Route",
              url: "internal://query-route",
              reliability: "high",
              refresh_interval: "on-demand"
            }
          },
          fetchedAt: new Date().toISOString(),
          isStale: false,
          error: {
            code: "MISSING_REQUIRED_PARAMETER",
            message: "Missing required parameter: input",
            details: "POST /api/query expects a JSON body with an input string.",
            retryable: false,
            status: 400
          }
        },
        executionTimeMs: 0,
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  const intent = await parseIntent(input, { facilityId: facility });
  const result = await executeQuery(intent, { bypassCache, facilityId: facility });

  return jsonWithStandardHeaders(result, {
    status: result.response.ok ? 200 : (result.response.error.status ?? 503)
  });
}
