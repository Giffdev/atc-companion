import { getFrequencies } from "@/services/frequencies";
import { prewarmPlateCache } from "@/services/plates";
import { getMetar } from "@/services/weather";

export const warmCache = async (airports: string[]): Promise<void> => {
  await Promise.all(
    airports.map(async (airport) => {
      try {
        await Promise.allSettled([getMetar(airport), getFrequencies(airport), prewarmPlateCache([airport])]);
      } catch (error) {
        console.warn(`[prefetch] failed to warm ${airport}`, error);
      }
    })
  );
};
