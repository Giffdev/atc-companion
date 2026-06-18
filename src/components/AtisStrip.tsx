"use client";

import { useCallback, useEffect, useState } from "react";

export interface AtisEntry {
  letter: string;
  type: string;
  fullText: string;
  fetchedAt: string;
}

type AtisStripProps = {
  airports: string[];
  refreshIntervalMs?: number;
};

/**
 * Compact ATIS information strip showing current ATIS letters for towered airports.
 * Auto-refreshes every 90 seconds (configurable) since ATIS updates roughly hourly.
 */
export function AtisStrip({ airports, refreshIntervalMs = 90_000 }: AtisStripProps) {
  const [atisData, setAtisData] = useState<Record<string, AtisEntry | null>>({});
  const [expandedAirport, setExpandedAirport] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  const fetchAtis = useCallback(async () => {
    if (airports.length === 0) return;

    try {
      const response = await fetch(`/api/atis?airports=${airports.join(",")}`);
      if (!response.ok) return;
      const data = await response.json();
      setAtisData(data.airports ?? {});
      setLastFetch(data.fetchedAt ?? new Date().toISOString());
    } catch {
      // Silent failure — ATIS is supplemental info
    }
  }, [airports]);

  useEffect(() => {
    fetchAtis();
    const interval = setInterval(fetchAtis, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchAtis, refreshIntervalMs]);

  // Filter airports that have ATIS data
  const activeEntries = airports
    .map((icao) => ({ icao, atis: atisData[icao] }))
    .filter((entry): entry is { icao: string; atis: AtisEntry } => entry.atis !== null && entry.atis !== undefined);

  if (activeEntries.length === 0 && lastFetch) {
    return null; // No D-ATIS available for these airports — hide the strip entirely
  }

  if (activeEntries.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-aviation-border bg-black/15 px-3 py-2">
        <span className="text-xs text-aviation-muted">Loading ATIS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-aviation-muted">ATIS</span>
        {activeEntries.map(({ icao, atis }) => (
          <button
            key={icao}
            className={`group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-data text-xs transition-all
              ${expandedAirport === icao
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100"
                : "border-aviation-border bg-black/20 text-aviation-text hover:border-cyan-500/30 hover:bg-cyan-500/10"
              }`}
            onClick={() => setExpandedAirport(expandedAirport === icao ? null : icao)}
            title={`${icao} ATIS Information ${atis.letter}`}
            type="button"
          >
            <span className="text-aviation-muted">{icao.replace(/^K/, "")}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-300">
              {atis.letter}
            </span>
            {atis.type !== "combined" && (
              <span className="text-[10px] text-aviation-muted">{atis.type === "departure" ? "DEP" : "ARR"}</span>
            )}
          </button>
        ))}
        {lastFetch && (
          <span className="ml-auto text-[10px] text-aviation-muted">
            Updated {new Date(lastFetch).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}Z
          </span>
        )}
      </div>

      {expandedAirport && atisData[expandedAirport] && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-data text-xs font-semibold text-cyan-200">
              {expandedAirport} Information {atisData[expandedAirport]!.letter}
            </span>
            <button
              className="text-xs text-aviation-muted hover:text-cyan-200"
              onClick={() => setExpandedAirport(null)}
              type="button"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 font-data text-xs leading-relaxed text-aviation-text">
            {atisData[expandedAirport]!.fullText}
          </p>
        </div>
      )}
    </div>
  );
}
