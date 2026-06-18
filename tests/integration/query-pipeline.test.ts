import { parseIntent } from "@/ai/intent-parser";
import { appCache } from "@/lib/cache";
import { getFrequencies } from "@/services/frequencies";
import { getPlates } from "@/services/plates";
import { getTraffic } from "@/services/traffic";
import { getMetar, getWeather } from "@/services/weather";
import type { ApiResponse } from "@/types/api";
import type { Frequency, Metar, TrafficTarget, WeatherBundle, ApproachPlate } from "@/types/aviation";
import { beforeEach } from "vitest";
import { installAviationApiMock } from "../fixtures/mock-aviation-fetch";

const executeQuery = async (
  query: string
): Promise<
  | { intentType: string; response: ApiResponse<Metar | WeatherBundle | Frequency[] | ApproachPlate[] | TrafficTarget[]> }
  | { intentType: "unknown"; response: null }
> => {
  const intent = await parseIntent(query);

  switch (intent.type) {
    case "weather":
      return {
        intentType: intent.type,
        response: intent.subtype === "metar" ? await getMetar(intent.airport) : await getWeather(intent.airport)
      };
    case "frequency":
      return { intentType: intent.type, response: await getFrequencies(intent.facility, intent.freq_type) };
    case "plates":
      return {
        intentType: intent.type,
        response: await getPlates({ airport: intent.airport, type: intent.procedure_type })
      };
    case "traffic":
      return { intentType: intent.type, response: await getTraffic({ airport: intent.airport }) };
    default:
      return { intentType: "unknown", response: null };
  }
};

describe("integration: natural language query pipeline", () => {
  beforeEach(() => {
    appCache.clear();
    installAviationApiMock();
  });

  it("routes a Boeing Field approach-plate request from NL intent to typed chart data", async () => {
    const result = await executeQuery("show me the approach plate for the ILS 14R approach into Boeing Field");

    expect(result.intentType).toBe("plates");
    expect(result.response?.ok).toBe(true);
    if (!result.response?.ok) {
      return;
    }

    expect(result.response.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ airportIcao: "KBFI", procedureType: "ILS", runway: "14R" })])
    );
  });

  it("routes a spoken METAR request to the weather service and preserves provenance", async () => {
    const result = await executeQuery("tell me the latest METAR for KPWK airport");

    expect(result.intentType).toBe("weather");
    expect(result.response?.ok).toBe(true);
    if (!result.response?.ok) {
      return;
    }

    expect(result.response.data).toMatchObject({
      stationIcao: "KPWK"
    });
    expect(result.response.source.url).toContain("aviationweather.gov");
  });

  it("routes named-facility traffic and frequency queries to the correct internal services", async () => {
    const [trafficResult, frequencyResult] = await Promise.all([
      executeQuery("how many planes appear to be in the traffic pattern at bremerton international airport"),
      executeQuery("tower frequency for Boeing Field")
    ]);

    expect(trafficResult.intentType).toBe("traffic");
    expect(trafficResult.response?.ok).toBe(true);
    expect(frequencyResult.intentType).toBe("frequency");
    expect(frequencyResult.response?.ok).toBe(true);

    if (!trafficResult.response?.ok || !frequencyResult.response?.ok) {
      return;
    }

    expect(trafficResult.response.data[0]).toMatchObject({ icao24: expect.any(String) });
    expect(frequencyResult.response.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "TWR", valueMHz: expect.any(Number) })])
    );
  });
});
