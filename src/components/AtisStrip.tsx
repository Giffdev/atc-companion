"use client";

import { useCallback, useEffect, useState } from "react";

import type { ApiResponse } from "@/types/api";

export interface AtisEntry {
  letter: string;
  type: string;
  fullText: string;
  fetchedAt: string;
  issuedAt: string | null;
  ageMinutes: number | null;
  stale: boolean;
}

type AtisStripProps = {
  airports: string[];
  refreshIntervalMs?: number;
};

/** Convert a full ISO timestamp (or legacy HHMMZ string) to a `HHMMZ` display token.
 *  Returns null when the input is null/undefined or not a valid date. */
export const toHHMMZ = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(11, 16).replace(":", "") + "Z";
};

/**
 * Compact ATIS information strip showing current ATIS letters for towered airports.
 * Auto-refreshes every 90 seconds (configurable) since ATIS updates roughly hourly.
 */
export function AtisStrip({ airports, refreshIntervalMs = 90_000 }: AtisStripProps) {
  const [atisData, setAtisData] = useState<Record<string, AtisEntry | null>>({});
  const [expandedAirport, setExpandedAirport] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchAtis = useCallback(async () => {
    if (airports.length === 0) return;

    try {
      const response = await fetch(`/api/atis?airports=${airports.join(",")}`);
      const payload = (await response.json()) as ApiResponse<Record<string, AtisEntry | null>>;
      if (!response.ok && payload.ok !== false) {
        setFetchError(true);
        setLastFetch(new Date().toISOString());
        return;
      }

      if (!payload.ok) {
        setFetchError(true);
        setAtisData({});
        setLastFetch(payload.fetchedAt);
        return;
      }

      setFetchError(false);
      setAtisData(payload.data);
      setLastFetch(payload.fetchedAt);
    } catch {
      setFetchError(true);
      setLastFetch(new Date().toISOString());
    }
  }, [airports]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAtis();
    const interval = setInterval(() => { void fetchAtis(); }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [fetchAtis, refreshIntervalMs]);

  // Filter airports that have ATIS data
  const activeEntries = airports
    .map((icao) => ({ icao, atis: atisData[icao] }))
    .filter((entry): entry is { icao: string; atis: AtisEntry } => entry.atis !== null && entry.atis !== undefined);

  if (activeEntries.length === 0 && lastFetch) {
    if (fetchError) {
      return (
        <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2" role="alert">
          <span className="text-xs text-amber-300">⚠ ATIS unavailable — could not fetch</span>
        </div>
      );
    }
    return null; // No D-ATIS available for these airports — hide the strip entirely
  }

  if (activeEntries.length === 0) {
    return (
      <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-aviation-border bg-black/15 px-3 py-2">
        <span className="text-xs text-aviation-muted">Loading ATIS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-aviation-muted">ATIS</span>
        {activeEntries.map(({ icao, atis }) => {
          const issuedHHMM = toHHMMZ(atis.issuedAt);
          const staleRing = atis.stale
            ? "ring-2 ring-amber-400/70"
            : "";
          const activeStyle = expandedAirport === icao
            ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100"
            : "border-aviation-border bg-black/20 text-aviation-text hover:border-cyan-500/30 hover:bg-cyan-500/10";

          return (
            <button
              key={icao}
              className={`group relative flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 font-data text-xs transition-all ${activeStyle} ${staleRing}`}
              onClick={() => setExpandedAirport(expandedAirport === icao ? null : icao)}
              title={`${icao} ATIS Information ${atis.letter}${atis.stale ? " — STALE" : ""}`}
              type="button"
              aria-pressed={expandedAirport === icao}
            >
              <span className="text-aviation-muted">{icao.replace(/^K/, "")}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-300">
                {atis.letter}
              </span>
              {atis.type !== "combined" && (
                <span className="text-xs text-aviation-muted">{atis.type === "departure" ? "DEP" : "ARR"}</span>
              )}
              {issuedHHMM && (
                <span className={`text-[10px] tabular-nums ${atis.stale ? "text-amber-300" : "text-aviation-muted"}`}>
                  {issuedHHMM}
                </span>
              )}
              {atis.stale && (
                <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300" aria-label="Stale ATIS">
                  STALE
                </span>
              )}
            </button>
          );
        })}
        {lastFetch && (
          <span className="w-full text-right text-[10px] text-aviation-muted sm:ml-auto sm:w-auto">
            Checked {new Date(lastFetch).toISOString().slice(11, 16)}Z
          </span>
        )}
      </div>

      {expandedAirport && atisData[expandedAirport] && (
        <div className={`rounded-xl border p-3 ${atisData[expandedAirport]!.stale ? "border-amber-400/30 bg-amber-500/5" : "border-cyan-500/20 bg-cyan-500/5"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="break-words font-data text-xs font-semibold text-cyan-200">
              {expandedAirport} Information {atisData[expandedAirport]!.letter}
            </span>
            <button
              className="min-h-[44px] min-w-[44px] text-xs text-aviation-muted hover:text-cyan-200"
              onClick={() => setExpandedAirport(null)}
              type="button"
              aria-label="Close ATIS panel"
            >
              ✕
            </button>
          </div>
          {atisData[expandedAirport]!.stale && (
            <p className="mt-1 text-xs font-semibold text-amber-300" role="alert">
              ⚠ ATIS issued {toHHMMZ(atisData[expandedAirport]!.issuedAt)} — {atisData[expandedAirport]!.ageMinutes} min old. May lag live D-ATIS.
            </p>
          )}
          {atisData[expandedAirport]!.issuedAt && !atisData[expandedAirport]!.stale && (
            <p className="mt-1 text-[10px] text-aviation-muted">
              Issued {toHHMMZ(atisData[expandedAirport]!.issuedAt)} · {atisData[expandedAirport]!.ageMinutes} min ago
            </p>
          )}
          {!atisData[expandedAirport]!.issuedAt && (
            <p className="mt-1 text-[10px] text-aviation-muted">Issue time unavailable</p>
          )}
          <p className="mt-2 break-words font-data text-xs leading-relaxed text-aviation-text">
            {atisData[expandedAirport]!.fullText}
          </p>
        </div>
      )}
    </div>
  );
}
