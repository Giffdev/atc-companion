"use client";

import { useEffect, useMemo, useState } from "react";

import { findAirportReference } from "@/data/airports";
import type { AtisEntry } from "@/components/AtisStrip";
import { toHHMMZ } from "@/components/AtisStrip";
import type { ApiResponse } from "@/types/api";
import type { FlightCategory, Notam, NotamCategory, WeatherBundle, WindCondition } from "@/types/aviation";
import { isNotamActive } from "@/services/notams";

interface FacilityOverviewProps {
  facilityName: string;
  facilityType: "approach" | "center";
  airports: string[];
  onSelectAirport: (icao: string) => void;
  notams?: Notam[];
}

type AtisBatchResponse = ApiResponse<Record<string, AtisEntry | null>>;

interface RunwayInfo {
  designator: string;
  lengthFeet: number | null;
  widthFeet: number | null;
  surface: string | null;
}

interface RunwayQueryResult {
  intent: { type: string };
  response: {
    ok: boolean;
    data?: {
      runwayDetails?: {
        ok: boolean;
        data?: { runways: RunwayInfo[] };
      };
    };
  };
}

const FLIGHT_CATEGORY_TONE: Record<FlightCategory, string> = {
  VFR: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  MVFR: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  IFR: "border-red-500/20 bg-red-500/10 text-red-200",
  LIFR: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200",
  UNKNOWN: "border-slate-500/20 bg-slate-500/10 text-slate-200"
};

const formatWind = (wind: WindCondition | null | undefined): string => {
  if (!wind) return "Unavailable";

  const direction = wind.variableDirection || wind.directionDegrees === null
    ? "VRB"
    : wind.directionDegrees.toString().padStart(3, "0");
  const gust = wind.gustKnots ? `G${wind.gustKnots}` : "";

  return `${direction}° / ${wind.speedKnots}KT${gust}`;
};

const formatVisibility = (weather: WeatherBundle | null): string => {
  const visibility = weather?.metar?.visibility;

  if (!visibility) return "Unknown";
  if (visibility.prevailingStatuteMiles !== null) return `${visibility.prevailingStatuteMiles} SM`;

  return visibility.rawValue ?? "Unknown";
};

const getAirportName = (icao: string): string => findAirportReference(icao)?.name ?? "Unknown Airport";

const WeatherSkeletonCard = ({ icao }: { icao: string }) => (
  <div className="rounded-2xl border border-aviation-border bg-black/15 p-4">
    <div className="animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-20 rounded bg-slate-700/50" />
          <div className="h-4 w-32 rounded bg-slate-800/60" />
        </div>
        <div className="h-7 w-12 rounded-full bg-slate-700/50" />
      </div>
      <div className="h-7 w-16 rounded-full bg-slate-700/50" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-slate-800/60" />
          <div className="h-4 w-full rounded bg-slate-700/50" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-slate-800/60" />
          <div className="h-4 w-20 rounded bg-slate-700/50" />
        </div>
      </div>
      <div className="h-10 w-full rounded-xl bg-cyan-500/10" />
    </div>
    <span className="sr-only">Loading overview for {icao}</span>
  </div>
);

type AirportCardProps = {
  icao: string;
  weather: WeatherBundle | null;
  atis: AtisEntry | null;
  atisChecked: boolean;
  runways: RunwayInfo[];
  notams: Notam[] | undefined;
  onSelectAirport: (icao: string) => void;
};

/** Per-category badge palette — red for closures, amber for TFR. */
const CRITICAL_BADGE_TONE: Partial<Record<NotamCategory, string>> = {
  AIRPORT_CLOSURE: "border-red-500/50 bg-red-500/20 text-red-200 ring-2 ring-red-500/40",
  RUNWAY_CLOSURE: "border-orange-500/40 bg-orange-500/15 text-orange-200 ring-2 ring-orange-400/30",
  TFR: "border-amber-500/40 bg-amber-500/15 text-amber-200 ring-2 ring-amber-400/30"
};

const CRITICAL_BADGE_ARIA: Partial<Record<NotamCategory, string>> = {
  AIRPORT_CLOSURE: "airport closure",
  RUNWAY_CLOSURE: "runway closure",
  TFR: "temporary flight restriction"
};

const CATEGORY_WEIGHT: Partial<Record<NotamCategory, number>> = {
  AIRPORT_CLOSURE: 0,
  RUNWAY_CLOSURE: 1,
  TFR: 2
};

const INITIAL_NOTAM_EVALUATION_TIME_MS = Date.now();

const useNotamEvaluationTime = (): number => {
  const [nowMs, setNowMs] = useState(INITIAL_NOTAM_EVALUATION_TIME_MS);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNowMs(Date.now());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return nowMs;
};

const AirportOverviewCard = ({ icao, weather, atis, atisChecked, runways, notams, onSelectAirport }: AirportCardProps) => {
  const flightCategory = weather?.metar?.flightCategory ?? "UNKNOWN";
  const notamEvaluationTimeMs = useNotamEvaluationTime();

  // Compute active critical NOTAMs only when we have data (undefined = not yet loaded)
  const activeCritical = useMemo(() => {
    if (!notams) return undefined;
    return notams.filter((n) => n.isCritical && isNotamActive(n, notamEvaluationTimeMs));
  }, [notams, notamEvaluationTimeMs]);

  const badgeCategory: NotamCategory | null = useMemo(() => {
    if (!activeCritical || activeCritical.length === 0) return null;
    return activeCritical.reduce((prev, curr) => {
      const pw = CATEGORY_WEIGHT[prev.category] ?? 99;
      const cw = CATEGORY_WEIGHT[curr.category] ?? 99;
      return cw < pw ? curr : prev;
    }).category;
  }, [activeCritical]);

  const badgeTone = badgeCategory ? (CRITICAL_BADGE_TONE[badgeCategory] ?? null) : null;

  const badgeLabel = useMemo(() => {
    if (!activeCritical || activeCritical.length === 0 || !badgeCategory) return null;
    if (activeCritical.length === 1) {
      const n = activeCritical[0];
      return n.summary ?? `Critical NOTAM: ${CRITICAL_BADGE_ARIA[badgeCategory] ?? badgeCategory}`;
    }
    return `${activeCritical.length} critical NOTAMs`;
  }, [activeCritical, badgeCategory]);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-aviation-border bg-black/15 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-data text-xl font-semibold tracking-[0.16em] text-aviation-text sm:text-2xl">{icao}</h3>
          <p className="mt-1 break-words text-sm text-aviation-muted">{getAirportName(icao)}</p>
        </div>
        {atis ? (
          <div className={`rounded-full border px-3 py-1 text-center ${atis.stale ? "border-amber-400/40 bg-amber-500/10 ring-2 ring-amber-400/70" : "border-amber-500/20 bg-amber-500/10"}`}>
            <p className="data-label text-xs text-amber-300">ATIS</p>
            <p className="font-data text-sm font-semibold text-amber-200">{atis.letter}</p>
            {toHHMMZ(atis.issuedAt) && (
              <p className={`text-[10px] tabular-nums ${atis.stale ? "text-amber-300" : "text-aviation-muted"}`}>
                Issued {toHHMMZ(atis.issuedAt)}
              </p>
            )}
            {atis.stale && (
              <span
                className="mt-0.5 block rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300"
                aria-label="Stale ATIS"
                role="alert"
              >
                STALE
              </span>
            )}
          </div>
        ) : atisChecked ? (
          <div className="rounded-full border border-slate-600/30 bg-slate-700/20 px-2.5 py-1 text-center" title="D-ATIS not available — voice ATIS only">
            <p className="font-data text-xs text-slate-500">No D-ATIS</p>
          </div>
        ) : null}
      </div>

      {/* Critical NOTAM badge — only rendered when NOTAM data is loaded and a critical NOTAM is active */}
      {badgeTone && badgeLabel && (
        <div
          className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeTone}`}
          role="alert"
          aria-label={`Critical NOTAM: ${CRITICAL_BADGE_ARIA[badgeCategory!] ?? badgeCategory}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
          {badgeLabel}
        </div>
      )}

      <div className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold ${FLIGHT_CATEGORY_TONE[flightCategory]}`}>
        {flightCategory}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="data-label">Wind</p>
          <p className="mt-2 font-data text-sm text-aviation-text">{formatWind(weather?.metar?.wind)}</p>
        </div>
        <div>
          <p className="data-label">Vis</p>
          <p className="mt-2 font-data text-sm text-aviation-text">{formatVisibility(weather)}</p>
        </div>
      </div>

      {!weather?.metar ? (
        <p className="mt-4 text-sm text-aviation-muted">Weather data currently unavailable.</p>
      ) : null}

      {runways.length > 0 && (
        <div className="mt-4">
          <p className="data-label">Runways</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {runways.map((rwy) => (
              <span key={rwy.designator} className="rounded-md border border-aviation-border bg-black/20 px-2 py-0.5 font-data text-xs text-aviation-text" title={[rwy.lengthFeet ? `${rwy.lengthFeet.toLocaleString()}ft` : null, rwy.surface].filter(Boolean).join(" · ")}>
                {rwy.designator}{rwy.lengthFeet ? ` · ${rwy.lengthFeet.toLocaleString()}ft` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        className="mt-auto min-h-[44px] rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
        onClick={() => onSelectAirport(icao)}
        type="button"
      >
        View Details →
      </button>
    </article>
  );
};

export default function FacilityOverview({
  facilityName,
  facilityType,
  airports,
  onSelectAirport,
  notams
}: FacilityOverviewProps) {
  const normalizedAirports = useMemo(() => airports.map((airport) => airport.trim().toUpperCase()).filter(Boolean), [airports]);
  const requestKey = normalizedAirports.join(",");
  const [weatherByAirport, setWeatherByAirport] = useState<Record<string, WeatherBundle | null>>({});
  const [atisByAirport, setAtisByAirport] = useState<Record<string, AtisEntry | null>>({});
  const [runwaysByAirport, setRunwaysByAirport] = useState<Record<string, RunwayInfo[]>>({});
  const [loadedKey, setLoadedKey] = useState("");

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      void (async () => {
        if (normalizedAirports.length === 0) {
          if (!cancelled) {
            setWeatherByAirport({});
            setAtisByAirport({});
            setLoadedKey(requestKey);
          }
          return;
        }

        const [weatherResults, nextAtisByAirport, runwayResults] = await Promise.all([
          Promise.allSettled(
            normalizedAirports.map(async (icao) => {
              const response = await fetch(`/api/weather?station=${encodeURIComponent(icao)}`);

              if (!response.ok) return null;

              const payload = (await response.json()) as ApiResponse<WeatherBundle>;
              return payload.ok ? payload.data : null;
            })
          ),
          (async (): Promise<Record<string, AtisEntry | null>> => {
            try {
              const atisResponse = await fetch(`/api/atis?airports=${normalizedAirports.join(",")}`);
              const atisPayload = (await atisResponse.json()) as AtisBatchResponse;
              return atisPayload.ok ? atisPayload.data : {};
            } catch {
              return {};
            }
          })(),
          Promise.allSettled(
            normalizedAirports.map(async (icao) => {
              const response = await fetch(`/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: `airport info for ${icao}` })
              });
              if (!response.ok) return [] as RunwayInfo[];
              const payload = (await response.json()) as RunwayQueryResult;
              if (payload.response?.ok && payload.response.data?.runwayDetails?.ok) {
                return payload.response.data.runwayDetails.data?.runways ?? [];
              }
              return [] as RunwayInfo[];
            })
          )
        ]);

        const nextWeatherByAirport: Record<string, WeatherBundle | null> = {};
        weatherResults.forEach((result, index) => {
          nextWeatherByAirport[normalizedAirports[index]] = result.status === "fulfilled" ? result.value : null;
        });

        const nextRunwaysByAirport: Record<string, RunwayInfo[]> = {};
        runwayResults.forEach((result, index) => {
          nextRunwaysByAirport[normalizedAirports[index]] = result.status === "fulfilled" ? (result.value ?? []) : [];
        });

        if (!cancelled) {
          setWeatherByAirport(nextWeatherByAirport);
          setAtisByAirport(nextAtisByAirport);
          setRunwaysByAirport(nextRunwaysByAirport);
          setLoadedKey(requestKey);
        }
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedAirports, requestKey]);

  const isLoading = requestKey !== loadedKey;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="data-label">{facilityType === "approach" ? "Approach facility" : "Center facility"}</p>
          <h2 className="text-xl font-semibold text-aviation-text sm:text-2xl">{facilityName} — Airports</h2>
          <p className="mt-2 text-sm text-aviation-muted">
            Quick weather and ATIS across {normalizedAirports.length} airports. Drill into any field for full operational details.
          </p>
        </div>
      </div>

      {normalizedAirports.length === 0 ? (
        <div className="rounded-2xl border border-aviation-border bg-black/15 p-6 text-sm text-aviation-muted">
          No airports are mapped to this facility yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? normalizedAirports.map((icao) => <WeatherSkeletonCard key={icao} icao={icao} />)
            : normalizedAirports.map((icao) => (
                <AirportOverviewCard
                  key={icao}
                  atis={atisByAirport[icao] ?? null}
                  atisChecked={icao in atisByAirport}
                  icao={icao}
                  notams={notams?.filter((n) => n.affectedFacility === icao)}
                  onSelectAirport={onSelectAirport}
                  runways={runwaysByAirport[icao] ?? []}
                  weather={weatherByAirport[icao] ?? null}
                />
              ))}
        </div>
      )}
    </section>
  );
}
