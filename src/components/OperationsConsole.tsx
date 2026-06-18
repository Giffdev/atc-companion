"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FacilitySelector } from "@/components/FacilitySelector";
import { DiagramPanel } from "@/components/DiagramPanel";
import FacilityOverview from "@/components/FacilityOverview";
import { AtisStrip } from "@/components/AtisStrip";
import { NavigationDisplay } from "@/components/NavigationDisplay";
import { NotamList } from "@/components/NotamList";
import { PlateViewer } from "@/components/PlateViewer";
import { QueryInput } from "@/components/QueryInput";
import { ResultCard } from "@/components/ResultCard";
import { SourceBadge } from "@/components/SourceBadge";
import { StatusBar } from "@/components/StatusBar";
import { TrafficMap } from "@/components/TrafficMap";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { findAirportReference } from "@/data/airports";
import { getFacilityById, getFacilityAirports } from "@/data/facilities";
import { type DashboardResultType, type SourceStatusItem } from "@/data/demo-results";
import { API_ENDPOINTS, TRAFFIC_REFRESH_INTERVAL_MS, WEATHER_REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatTimestamp } from "@/lib/utils";
import { getDataSource } from "@/data/sources";
import type { ControllerFacility } from "@/types/facility";
import type { ApiResponse } from "@/types/api";
import type { ApproachPlate, FarReference, Frequency, Metar, Pirep, Taf, TrafficTarget, WeatherBundle } from "@/types/aviation";
import type { ParsedIntent } from "@/types/intents";
import type { NavigationResult } from "@/services/navigation";

type OperationsConsoleProps = {
  initialNow: string;
};

type LiveQueryResult = {
  intent: ParsedIntent;
  response: ApiResponse<unknown>;
  executionTimeMs: number;
  timestamp: string;
};

import type { AirportInfoQueryPayload } from "@/services/orchestrator";
import type { AirportHours } from "@/services/airport-hours";
import type { Notam } from "@/types/aviation";

const FACILITY_STORAGE_KEY = "atc-companion:selected-facility";
const RESULT_ORDER: DashboardResultType[] = ["weather", "notam", "frequency", "plates", "navigation", "traffic", "regulatory"];

const AUTO_REFRESH_LABELS = {
  traffic: `Live • Auto-refreshing every ${TRAFFIC_REFRESH_INTERVAL_MS / 1000}s`,
  weather: `Live • Auto-refreshing every ${WEATHER_REFRESH_INTERVAL_MS / 1000}s`
} as const;

// Empty baseline — no hardcoded demo airport data
const PLACEHOLDER_SOURCE = getDataSource("aviationWeather");
const EMPTY_DASHBOARD = {
  weather: {
    stationIcao: "",
    metar: null as null,
    taf: null as null,
    pireps: [] as Pirep[],
    source: PLACEHOLDER_SOURCE,
    fetchedAt: "",
    isStale: false
  } as WeatherBundle,
  notams: [] as Notam[],
  traffic: [] as TrafficTarget[],
  navigation: { from: { icao: "", name: "", position: { latitude: 0, longitude: 0 } }, to: { icao: "", name: "", position: { latitude: 0, longitude: 0 } }, magneticHeading: 0, trueHeading: 0, distanceNm: 0, distanceSm: 0 } as NavigationResult,
  frequencies: [] as Frequency[],
  plates: [] as ApproachPlate[],
  regulatory: [] as FarReference[],
  sourceStatuses: [] as SourceStatusItem[]
};

type DashboardData = typeof EMPTY_DASHBOARD;

const mapIntentToDashboardType = (intent: ParsedIntent | null): DashboardResultType | null => {
  if (!intent) {
    return null;
  }

  if (
    intent.type === "weather" ||
    intent.type === "notam" ||
    intent.type === "traffic" ||
    intent.type === "navigation" ||
    intent.type === "frequency" ||
    intent.type === "plates" ||
    intent.type === "regulatory"
  ) {
    return intent.type;
  }

  if (intent.type === "airport_info") {
    if (intent.detail === "frequencies") {
      return "frequency";
    }

    if (intent.detail === "runways") {
      return "plates";
    }

    return "weather";
  }

  return null;
};

const createDetailText = (response: ApiResponse<unknown>): string => {
  if (!response.ok) {
    return response.error.message;
  }

  return `${response.source.name} • ${formatTimestamp(response.fetchedAt)}`;
};

const applyResponseStatus = (items: SourceStatusItem[], id: SourceStatusItem["id"], response: ApiResponse<unknown>): SourceStatusItem[] =>
  items.map((item) =>
    item.id !== id
      ? item
      : {
          ...item,
          source: response.source,
          fetchedAt: response.fetchedAt,
          status: response.ok ? (response.isStale ? "degraded" : "online") : "degraded",
          detail: createDetailText(response),
          warning: response.ok ? response.stalenessWarning : response.error.message
        }
  );

const mergeLiveDashboardData = (
  dashboardData: DashboardData,
  liveResult: LiveQueryResult | null
): DashboardData => {
  if (!liveResult || !liveResult.response.ok) {
    return dashboardData;
  }

  switch (liveResult.intent.type) {
    case "weather": {
      if (liveResult.intent.subtype === "all") {
        return {
          ...dashboardData,
          weather: liveResult.response.data as WeatherBundle
        };
      }

      const nextWeather: WeatherBundle = {
        ...dashboardData.weather,
        stationIcao:
          liveResult.intent.subtype === "metar"
            ? (liveResult.response.data as Metar).stationIcao
            : liveResult.intent.subtype === "taf"
              ? (liveResult.response.data as Taf).stationIcao
              : dashboardData.weather.stationIcao,
        source: liveResult.response.source,
        fetchedAt: liveResult.response.fetchedAt,
        isStale: liveResult.response.isStale,
        metar: liveResult.intent.subtype === "metar" ? (liveResult.response.data as Metar) : dashboardData.weather.metar,
        taf: liveResult.intent.subtype === "taf" ? (liveResult.response.data as Taf) : dashboardData.weather.taf,
        pireps: liveResult.intent.subtype === "pirep" ? (liveResult.response.data as Pirep[]) : dashboardData.weather.pireps
      };

      return {
        ...dashboardData,
        weather: nextWeather
      };
    }
    case "notam":
      return {
        ...dashboardData,
        notams: liveResult.response.data as DashboardData["notams"]
      };
    case "traffic":
      return {
        ...dashboardData,
        traffic: liveResult.response.data as TrafficTarget[]
      };
    case "navigation":
      return {
        ...dashboardData,
        navigation: liveResult.response.data as NavigationResult
      };
    case "frequency":
      return {
        ...dashboardData,
        frequencies: liveResult.response.data as Frequency[]
      };
    case "plates":
      return {
        ...dashboardData,
        plates: liveResult.response.data as ApproachPlate[]
      };
    case "regulatory":
      return {
        ...dashboardData,
        regulatory: liveResult.response.data as FarReference[]
      };
    case "airport_info": {
      const airportInfo = liveResult.response.data as AirportInfoQueryPayload;

      return {
        ...dashboardData,
        weather: airportInfo.weather.ok ? airportInfo.weather.data : dashboardData.weather,
        frequencies: airportInfo.frequencies.ok ? airportInfo.frequencies.data : dashboardData.frequencies,
        plates: airportInfo.plates.ok ? airportInfo.plates.data : dashboardData.plates
      };
    }
    case "unknown":
      return dashboardData;
    case "facility_info":
      return dashboardData;
  }
};

const mergeSourceStatuses = (statuses: SourceStatusItem[], liveResult: LiveQueryResult | null): SourceStatusItem[] => {
  if (!liveResult) {
    return statuses;
  }

  switch (liveResult.intent.type) {
    case "weather":
      return applyResponseStatus(statuses, "weather", liveResult.response);
    case "notam":
      return applyResponseStatus(statuses, "notams", liveResult.response);
    case "traffic":
      return applyResponseStatus(statuses, "traffic", liveResult.response);
    case "navigation":
      return applyResponseStatus(statuses, "navigation", liveResult.response);
    case "frequency":
      return applyResponseStatus(statuses, "frequencies", liveResult.response);
    case "plates":
      return applyResponseStatus(statuses, "plates", liveResult.response);
    case "regulatory":
      return applyResponseStatus(statuses, "regulatory", liveResult.response);
    case "airport_info":
      if (!liveResult.response.ok) {
        return statuses;
      }

      return applyResponseStatus(
        applyResponseStatus(
          applyResponseStatus(statuses, "weather", (liveResult.response.data as AirportInfoQueryPayload).weather),
          "frequencies",
          (liveResult.response.data as AirportInfoQueryPayload).frequencies
        ),
        "plates",
        (liveResult.response.data as AirportInfoQueryPayload).diagram ?? (liveResult.response.data as AirportInfoQueryPayload).plates
      );
    case "unknown":
      return statuses;
    case "facility_info":
      return statuses;
  }
};

const collectWarnings = (
  activeIntent: ParsedIntent | null,
  liveResult: LiveQueryResult | null,
  submitError: string | null,
  sourceStatuses: SourceStatusItem[]
): string[] => {
  const warnings = new Set<string>();

  sourceStatuses.forEach((source) => {
    if (source.warning) {
      warnings.add(source.warning);
    }
  });

  if (activeIntent?.requiresClarification && activeIntent.clarificationPrompt) {
    warnings.add(activeIntent.clarificationPrompt);
  }

  if (submitError) {
    warnings.add(submitError);
  }

  if (!liveResult) {
    return [...warnings];
  }

  if (!liveResult.response.ok) {
    warnings.add(liveResult.response.error.message);
    return [...warnings];
  }

  if (liveResult.response.stalenessWarning) {
    warnings.add(liveResult.response.stalenessWarning);
  }

  if (liveResult.intent.type === "airport_info") {
    const airportInfo = liveResult.response.data as AirportInfoQueryPayload;

    [airportInfo.weather, airportInfo.frequencies, airportInfo.plates, airportInfo.diagram].forEach((response) => {
      if (!response) {
        return;
      }

      if (!response.ok) {
        warnings.add(response.error.message);
        return;
      }

      if (response.stalenessWarning) {
        warnings.add(response.stalenessWarning);
      }
    });
  }

  return [...warnings];
};

const renderQuerySummary = (liveResult: LiveQueryResult | null, isSubmitting: boolean, submittedQuery: string, onFollowUp?: (query: string) => void) => {
  if (isSubmitting) {
    return (
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-4 text-sm text-cyan-100">
        Dispatching live query for <span className="break-words font-data">{submittedQuery}</span>…
      </div>
    );
  }

  if (!liveResult) {
    return null;
  }

  if (!liveResult.response.ok) {
    return (
      <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
        <p>{liveResult.response.error.message}</p>
        {liveResult.intent.clarificationPrompt ? <p className="text-xs text-amber-50/80">{liveResult.intent.clarificationPrompt}</p> : null}
      </div>
    );
  }

  switch (liveResult.intent.type) {
    case "weather": {
      if (liveResult.intent.subtype === "all") {
        const weather = liveResult.response.data as WeatherBundle;
        return <p className="text-sm text-aviation-text">Weather card updated for {weather.stationIcao} with live METAR, TAF, and PIREP data.</p>;
      }

      if (liveResult.intent.subtype === "metar") {
        return <p className="font-data text-sm text-aviation-text">{(liveResult.response.data as Metar).rawText}</p>;
      }

      if (liveResult.intent.subtype === "taf") {
        return <p className="font-data text-sm text-aviation-text">{(liveResult.response.data as Taf).rawText}</p>;
      }

      return <p className="text-sm text-aviation-text">Returned {(liveResult.response.data as Pirep[]).length} live PIREPs near {liveResult.intent.airport}.</p>;
    }
    case "notam":
      return (
        <div className="space-y-2">
          <p className="text-sm text-aviation-text">Returned {(liveResult.response.data as DashboardData["notams"]).length} live NOTAMs.</p>
          <p className="break-words font-data text-xs text-aviation-muted">
            {(liveResult.response.data as DashboardData["notams"])
              .slice(0, 3)
              .map((notam) => notam.notamId)
              .join(" • ") || "No NOTAMs returned"}
          </p>
        </div>
      );
    case "traffic":
      return <p className="text-sm text-aviation-text">Traffic card updated with {(liveResult.response.data as TrafficTarget[]).length} live targets.</p>;
    case "navigation": {
      const navigation = liveResult.response.data as NavigationResult;
      return (
        <p className="text-sm text-aviation-text">
          Direct vector {navigation.from.icao} → {navigation.to.icao}: {navigation.magneticHeading.toString().padStart(3, "0")}° magnetic for{" "}
          {navigation.distanceNm.toFixed(1)} NM.
        </p>
      );
    }
    case "frequency": {
      const freqs = liveResult.response.data as Frequency[];
      return (
        <p className="text-sm text-aviation-text">
          Found {freqs.length} frequenc{freqs.length !== 1 ? "ies" : "y"} — see the frequency panel below.
        </p>
      );
    }
    case "plates": {
      const plates = liveResult.response.data as ApproachPlate[];
      return (
        <p className="text-sm text-aviation-text">
          Found {plates.length} procedure{plates.length !== 1 ? "s" : ""} — see the terminal procedures panel below.
        </p>
      );
    }
    case "regulatory":
      return (
        <div className="space-y-3">
          {(liveResult.response.data as FarReference[]).slice(0, 3).map((reference) => (
            <div key={`${reference.part}-${reference.section}`} className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="font-data text-sm text-aviation-text">
                FAR {reference.part}.{reference.section}
              </p>
              <p className="mt-2 text-sm leading-6 text-aviation-muted">{reference.text}</p>
            </div>
          ))}
        </div>
      );
    case "airport_info": {
      const airportInfo = liveResult.response.data as AirportInfoQueryPayload;
      const plateCount = airportInfo.plates.ok ? airportInfo.plates.data.length : 0;
      const freqCount = airportInfo.frequencies.ok ? airportInfo.frequencies.data.length : 0;
      const diagram = airportInfo.diagram?.ok ? airportInfo.diagram.data : null;
      const hours = airportInfo.hours?.ok ? airportInfo.hours.data : null;

      return (
        <div className="space-y-3">
          {/* Hours of operation (if requested/available) */}
          {hours && (
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Hours of Operation — {airportInfo.airport}</p>
              <div className="mt-3 space-y-3">
                {/* Tower status and schedule */}
                <div className="flex flex-wrap items-start gap-3">
                  <span className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    hours.isTowered
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  }`}>
                    {hours.isTowered ? "✦ Towered" : "Non-Towered"}
                  </span>
                  {hours.timezone && (
                    <span className="mt-0.5 rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-xs text-aviation-muted">
                      {hours.timezone.abbreviation} ({hours.timezone.utcOffset}){hours.timezone.isDst ? " · DST active" : ""}
                    </span>
                  )}
                </div>

                {hours.towerSchedule ? (
                  <div className="rounded-xl border border-aviation-border bg-black/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-aviation-muted">Tower Hours</p>
                    {hours.towerSchedule.is24Hour ? (
                      <p className="mt-1.5 font-data text-sm text-emerald-200">24-hour operation (continuous)</p>
                    ) : (
                      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-aviation-muted">Local</p>
                          <p className="font-data text-sm text-aviation-text">
                            {hours.towerSchedule.openLocal}–{hours.towerSchedule.closeLocal} {hours.timezone?.abbreviation ?? "LCL"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-aviation-muted">Zulu</p>
                          <p className="font-data text-sm text-cyan-200">
                            {hours.towerSchedule.openZulu}–{hours.towerSchedule.closeZulu}
                          </p>
                        </div>
                      </div>
                    )}
                    {hours.towerSchedule.rawText && !hours.towerSchedule.is24Hour && (
                      <p className="mt-1.5 break-words font-data text-xs text-aviation-muted">Raw: {hours.towerSchedule.rawText}</p>
                    )}
                  </div>
                ) : hours.towerHours ? (
                  <div className="rounded-xl border border-aviation-border bg-black/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-aviation-muted">Tower Hours</p>
                    <p className="mt-1.5 font-data text-sm text-aviation-text">{hours.towerHours}</p>
                    {hours.timezone && (() => {
                      // Try to extract Zulu times from the raw string and show local conversion
                      const zuluMatch = hours.towerHours!.match(/(\d{4})Z?\s*[-–]\s*(\d{4})Z?/);
                      if (!zuluMatch) return null;
                      const offsetStr = hours.timezone!.utcOffset; // e.g. "UTC-7"
                      const offsetH = parseFloat(offsetStr.replace("UTC", ""));
                      if (isNaN(offsetH)) return null;
                      const toLocal = (hhmm: string) => {
                        const h = parseInt(hhmm.slice(0, 2), 10) + offsetH;
                        const m = hhmm.slice(2);
                        const norm = ((h % 24) + 24) % 24;
                        return `${Math.floor(norm).toString().padStart(2, "0")}${m}`;
                      };
                      return (
                        <p className="mt-1 font-data text-xs text-cyan-300/80">
                          ≈ {toLocal(zuluMatch[1])}–{toLocal(zuluMatch[2])} {hours.timezone!.abbreviation} (local)
                        </p>
                      );
                    })()}
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-3">
                  {hours.attendanceSchedule && (
                    <div>
                      <p className="text-xs text-aviation-muted">Attendance</p>
                      <p className="font-data text-sm text-aviation-text">{hours.attendanceSchedule}</p>
                    </div>
                  )}
                  {hours.lightingSchedule && (
                    <div>
                      <p className="text-xs text-aviation-muted">Lighting</p>
                      <p className="font-data text-sm text-aviation-text">{hours.lightingSchedule}</p>
                    </div>
                  )}
                  {hours.airportUse && (
                    <div>
                      <p className="text-xs text-aviation-muted">Use</p>
                      <p className="font-data text-sm text-aviation-text">{hours.airportUse}</p>
                    </div>
                  )}
                </div>

                {!hours.towerHours && !hours.isTowered && !hours.attendanceSchedule && (
                  <p className="text-sm text-aviation-muted">
                    Non-towered airport.{" "}
                    <a
                      className="text-cyan-400 hover:text-cyan-300 underline"
                      href={`https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${hours.airportIcao.replace(/^K/, "")}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View Chart Supplement ↗
                    </a>
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-aviation-muted">
                Source: {hours.source}
                {hours.timezone?.isDst ? " · Times reflect current DST offset" : ""}
              </p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Airport</p>
              <p className="mt-2 font-data text-sm text-aviation-text">{airportInfo.airport}</p>
            </div>
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 md:col-span-1">
              <p className="data-label">Runways</p>
              {airportInfo.runwayDetails?.ok && airportInfo.runwayDetails.data.runways.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {airportInfo.runwayDetails.data.runways.map((rwy) => (
                    <div key={rwy.designator} className="font-data text-sm text-aviation-text">
                      <span>{rwy.designator}</span>
                      {rwy.lengthFeet && <span className="text-xs text-aviation-muted"> · {rwy.lengthFeet.toLocaleString()}×{rwy.widthFeet ?? "?"}ft</span>}
                      {rwy.surface && <span className="text-xs text-aviation-muted"> · {rwy.surface}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 font-data text-sm text-aviation-text">{airportInfo.runways.join(" • ") || "Unavailable"}</p>
              )}
            </div>
            {onFollowUp ? (
              <button
                className="min-h-[44px] rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                onClick={() => onFollowUp(`frequencies at ${airportInfo.airport}`)}
                type="button"
              >
                <p className="data-label">Frequencies</p>
                <p className="mt-2 font-data text-sm text-aviation-text">{freqCount} <span className="text-xs text-cyan-400">→ view</span></p>
              </button>
            ) : (
              <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
                <p className="data-label">Frequencies</p>
                <p className="mt-2 font-data text-sm text-aviation-text">{freqCount}</p>
              </div>
            )}
            {onFollowUp ? (
              <button
                className="min-h-[44px] rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                onClick={() => onFollowUp(`approach plates at ${airportInfo.airport}`)}
                type="button"
              >
                <p className="data-label">Plates</p>
                <p className="mt-2 font-data text-sm text-aviation-text">{plateCount} <span className="text-xs text-cyan-400">→ view</span></p>
              </button>
            ) : (
              <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
                <p className="data-label">Plates</p>
                <p className="mt-2 font-data text-sm text-aviation-text">{plateCount}</p>
              </div>
            )}
          </div>
          <DiagramPanel
            diagram={diagram}
            airportCode={airportInfo.airport}
            autoExpand={liveResult.intent.type === "airport_info" && liveResult.intent.detail === "runways" ? "diagram" : undefined}
          />
        </div>
      );
    }
    case "facility_info": {
      const data = liveResult.response.data as Record<string, unknown>;
      if (data.query_type === "airports") {
        const airports = (data.airports as string[]) ?? [];
        const facilityName = (data.facility as { name: string })?.name ?? "Facility";
        const facilityType = (data.facility as { type: string })?.type === "center" ? "center" : "approach";
        return (
          <div className="space-y-3">
            <p className="data-label">{facilityName} — {airports.length} airports</p>
            <FacilityOverview facilityName={facilityName} facilityType={facilityType} airports={airports} onSelectAirport={(icao) => {
              onFollowUp?.(`show me everything for ${icao}`);
            }} />
          </div>
        );
      }
      const adj = data as {
        facility: { id: string; name: string; type: string };
        overlying?: { id: string; name: string; type: string };
        adjacentCenters: { id: string; name: string }[];
        adjacentApproach: { id: string; name: string }[];
        adjacentTowers: { id: string; name: string }[];
      };
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
            <p className="data-label">Facility</p>
            <p className="mt-2 break-words font-data text-sm text-aviation-text">{adj.facility.name} ({adj.facility.id})</p>
            <p className="mt-1 text-xs text-aviation-muted capitalize">{adj.facility.type}</p>
          </div>

          {adj.overlying && (
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Overlying Facility</p>
              <p className="mt-2 break-words font-data text-sm text-aviation-text">{adj.overlying.name} ({adj.overlying.id})</p>
              <p className="mt-1 text-xs text-aviation-muted capitalize">{adj.overlying.type}</p>
            </div>
          )}

          {adj.adjacentCenters.length > 0 && (
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Adjacent Centers</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {adj.adjacentCenters.map((c) => (
                  <span key={c.id} className="rounded-full border border-aviation-border bg-black/20 px-3 py-1 font-data text-sm text-aviation-text break-words">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {adj.adjacentApproach.length > 0 && (
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Adjacent Approach Controls</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {adj.adjacentApproach.map((a) => (
                  <span key={a.id} className="rounded-full border border-aviation-border bg-black/20 px-3 py-1 font-data text-sm text-aviation-text break-words">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {adj.adjacentTowers.length > 0 && (
            <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
              <p className="data-label">Nearby Towers</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {adj.adjacentTowers.map((t) => (
                  <span key={t.id} className="rounded-full border border-aviation-border bg-black/20 px-3 py-1 font-data text-sm text-aviation-text break-words">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    case "unknown":
      return <p className="text-sm text-aviation-muted">Awaiting clarification.</p>;
  }
};

export function OperationsConsole({ initialNow }: OperationsConsoleProps) {
  const [activeIntent, setActiveIntent] = useState<ParsedIntent | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState("Awaiting query");
  const [activeCard, setActiveCard] = useState<DashboardResultType>("weather");
  const [visiblePanels, setVisiblePanels] = useState<Set<DashboardResultType>>(new Set());
  const [liveResult, setLiveResult] = useState<LiveQueryResult | null>(null);
  const [facilityResults, setFacilityResults] = useState<Map<DashboardResultType, LiveQueryResult>>(new Map());
  const [loadingPanels, setLoadingPanels] = useState<Set<DashboardResultType>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [facilityAirportInfo, setFacilityAirportInfo] = useState<AirportInfoQueryPayload | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Hydrate facility from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const storedFacilityId = window.localStorage.getItem(FACILITY_STORAGE_KEY);
    if (storedFacilityId && getFacilityById(storedFacilityId)) {
      setSelectedFacilityId(storedFacilityId);
    }
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) {
      window.localStorage.removeItem(FACILITY_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(FACILITY_STORAGE_KEY, selectedFacilityId);
  }, [selectedFacilityId]);

  const selectedFacility = useMemo<ControllerFacility | null>(
    () => (selectedFacilityId ? getFacilityById(selectedFacilityId) : null),
    [selectedFacilityId]
  );

  const dashboardData = useMemo(() => {
    // Start from empty base — no hardcoded demo data
    let merged = { ...EMPTY_DASHBOARD };

    // Apply all facility results first (these are the baseline for the selected facility)
    for (const [, result] of facilityResults) {
      merged = mergeLiveDashboardData(merged, result);
    }

    // Layer the active live query result on top (user's explicit query takes precedence)
    if (liveResult && liveResult.response.ok) {
      const liveType = mapIntentToDashboardType(liveResult.intent);
      const isFacilityResult = facilityResults.has(liveType as DashboardResultType) &&
        facilityResults.get(liveType as DashboardResultType) === liveResult;
      if (!isFacilityResult) {
        merged = mergeLiveDashboardData(merged, liveResult);
      }
    }

    return merged;
  }, [liveResult, facilityResults]);
  const sourceStatuses = useMemo(() => mergeSourceStatuses(EMPTY_DASHBOARD.sourceStatuses, liveResult), [liveResult]);
  const selectedPlateProcedureType = liveResult?.intent.type === "plates" ? liveResult.intent.procedure_type : undefined;
  const selectedPlateRunway = liveResult?.intent.type === "plates" ? liveResult.intent.runway : undefined;

  const warnings = useMemo(
    () => collectWarnings(activeIntent, liveResult, submitError, sourceStatuses),
    [activeIntent, liveResult, sourceStatuses, submitError]
  );

  const orderedCards = useMemo(() => {
    return [...RESULT_ORDER].sort((left, right) => {
      if (left === activeCard) {
        return -1;
      }

      if (right === activeCard) {
        return 1;
      }

      return RESULT_ORDER.indexOf(left) - RESULT_ORDER.indexOf(right);
    });
  }, [activeCard]);

  const platePanelAirport =
    dashboardData.plates[0]?.airportIcao ??
    (activeIntent?.type === "plates" || activeIntent?.type === "airport_info" ? activeIntent.airport : undefined) ??
    "Field";
  const fallbackSource = PLACEHOLDER_SOURCE;
  const fallbackFetchedAt = initialNow;

  const trafficAirportIcao = selectedFacility?.primaryAirport ?? undefined;
  const trafficAirportRef = trafficAirportIcao ? findAirportReference(trafficAirportIcao) : null;
  const trafficAirportPosition = trafficAirportRef
    ? { latitude: trafficAirportRef.latitude, longitude: trafficAirportRef.longitude }
    : selectedFacility?.position ?? undefined;

  const fetchLiveQuery = useCallback(async (query: string, bypassCache = false): Promise<LiveQueryResult> => {
    const response = await fetch(API_ENDPOINTS.query, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input: query, facility: selectedFacilityId ?? undefined, bypassCache })
    });

    return (await response.json()) as LiveQueryResult;
  }, [selectedFacilityId]);

  const autoRefreshConfig = useMemo(
    () =>
      liveResult?.intent.type === "traffic"
        ? {
            intentType: "traffic" as const,
            intervalMs: TRAFFIC_REFRESH_INTERVAL_MS,
            label: AUTO_REFRESH_LABELS.traffic
          }
        : liveResult?.intent.type === "weather"
          ? {
              intentType: "weather" as const,
              intervalMs: WEATHER_REFRESH_INTERVAL_MS,
              label: AUTO_REFRESH_LABELS.weather
            }
          : null,
    [liveResult?.intent.type]
  );

  const handleSubmit = async (query: string, intent: ParsedIntent | null) => {
    setSubmittedQuery(query);
    setActiveIntent(intent);
    setSubmitError(null);
    setIsSubmitting(true);

    const previewCard = mapIntentToDashboardType(intent);
    if (previewCard) {
      setActiveCard(previewCard);
      setVisiblePanels(new Set([previewCard]));
    }

    try {
      const payload = await fetchLiveQuery(query);
      setLiveResult(payload);
      setActiveIntent(payload.intent);

      const returnedCard = mapIntentToDashboardType(payload.intent);

      // For airport_info queries, show multiple relevant panels
      if (payload.intent.type === "airport_info") {
        const airportInfoPanels: DashboardResultType[] = ["weather", "frequency", "plates"];
        if (payload.intent.detail === "all" || !payload.intent.detail) {
          airportInfoPanels.push("notam", "traffic");
        }
        setActiveCard("weather");
        setVisiblePanels(new Set(airportInfoPanels));
      } else if (returnedCard) {
        setActiveCard(returnedCard);
        setVisiblePanels(new Set([returnedCard]));
      }
    } catch {
      const fallbackMessage =
        typeof navigator !== "undefined" && !navigator.onLine
          ? "Offline — check connectivity."
          : "Query failed. Try again or rephrase.";

      setLiveResult(null);
      setSubmitError(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-fetch relevant data for the selected facility whenever it changes
  useEffect(() => {
    // Always clear stale data from previous facility
    setFacilityResults(new Map());
    setLiveResult(null);
    setActiveIntent(null);
    setSubmittedQuery("");
    setFacilityAirportInfo(null);
    setLoadingPanels(new Set());
    setVisiblePanels(new Set());

    if (!selectedFacility) {
      return;
    }

    // For approach/center facilities, don't auto-fetch single-airport data —
    // the FacilityOverview component handles the multi-airport view
    const isMultiAirport = selectedFacility.type === "approach" || selectedFacility.type === "center";
    if (isMultiAirport) {
      return;
    }

    // Tower facilities: single-airport dashboard
    const airport = selectedFacility.primaryAirport;
    if (!airport) {
      return;
    }

    let cancelled = false;

    const fetchFacilityDashboard = async () => {
      const dashboardPanels: DashboardResultType[] = ["weather", "notam", "traffic", "frequency", "plates"];

      setVisiblePanels(new Set(dashboardPanels));
      setFacilityResults(new Map());
      setLiveResult(null);
      setActiveIntent(null);
      setSubmittedQuery("");
      setFacilityAirportInfo(null);
      setLoadingPanels(new Set(dashboardPanels));

      // Fetch weather
      try {
        const payload = await fetchLiveQuery(`weather at ${airport}`);
        if (cancelled) return;
        setFacilityResults((prev) => new Map(prev).set("weather", payload));
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("weather"); return next; });
        setLiveResult(payload);
        setActiveIntent(payload.intent);
        setActiveCard("weather");
        setSubmittedQuery(`weather at ${airport}`);
      } catch { /* silent */ }

      // Fetch NOTAMs
      try {
        const payload = await fetchLiveQuery(`notams for ${airport}`);
        if (cancelled) return;
        setFacilityResults((prev) => new Map(prev).set("notam", payload));
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("notam"); return next; });
      } catch {
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("notam"); return next; });
      }

      // Fetch traffic
      try {
        const payload = await fetchLiveQuery(`traffic at ${airport}`);
        if (cancelled) return;
        setFacilityResults((prev) => new Map(prev).set("traffic", payload));
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("traffic"); return next; });
      } catch {
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("traffic"); return next; });
      }

      // Fetch frequencies and plates
      try {
        const payload = await fetchLiveQuery(`frequencies at ${airport}`);
        if (cancelled) return;
        setFacilityResults((prev) => new Map(prev).set("frequency", payload));
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("frequency"); return next; });
      } catch {
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("frequency"); return next; });
      }

      try {
        const payload = await fetchLiveQuery(`approach plates at ${airport}`);
        if (cancelled) return;
        setFacilityResults((prev) => new Map(prev).set("plates", payload));
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("plates"); return next; });
      } catch {
        setLoadingPanels((prev) => { const next = new Set(prev); next.delete("plates"); return next; });
      }

      // Fetch airport info (hours, runways)
      try {
        const payload = await fetchLiveQuery(`airport info for ${airport}`);
        if (cancelled) return;
        if (payload.intent.type === "airport_info" && payload.response.ok) {
          setFacilityAirportInfo(payload.response.data as AirportInfoQueryPayload);
        }
      } catch { /* silent */ }
    };

    fetchFacilityDashboard();

    return () => { cancelled = true; };
  }, [selectedFacility?.id, selectedFacility?.type, fetchLiveQuery]);

  useEffect(() => {
    if (!autoRefreshConfig || !submittedQuery || submittedQuery === "Awaiting query") {
      return undefined;
    }

    let refreshInFlight = false;
    let cancelled = false;

    const intervalId = window.setInterval(() => {
      if (refreshInFlight) {
        return;
      }

      refreshInFlight = true;

      fetchLiveQuery(submittedQuery, true)
        .then((payload) => {
          if (cancelled) {
            return;
          }

          if (payload.response.ok) {
            setLiveResult(payload);
            setActiveIntent(payload.intent);
            setSubmitError(null);
          } else {
            setSubmitError(payload.response.error.message);
          }
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          const fallbackMessage = `Auto-refresh failed for live ${autoRefreshConfig.intentType}. Retaining the last successful result.`;
          setSubmitError(fallbackMessage);
        })
        .finally(() => {
          refreshInFlight = false;
        });
    }, autoRefreshConfig.intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [autoRefreshConfig, fetchLiveQuery, submittedQuery]);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <header className="aviation-panel relative overflow-hidden px-5 py-4 md:px-7">
          <div className="absolute inset-y-0 right-[-8rem] hidden w-80 rounded-full bg-cyan-500/10 blur-3xl xl:block" />
           <div className="flex items-center gap-4">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-black/25">
                <div className="absolute inset-1.5 rounded-full border border-emerald-400/20" />
                <div className="radar-sweep absolute left-1/2 top-1/2 h-[1px] w-5 origin-left bg-gradient-to-r from-cyan-300 to-transparent" />
                <div className="h-2 w-2 rounded-full bg-aviation-green shadow-[0_0_18px_rgba(34,197,94,0.75)]" />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight text-aviation-text md:text-2xl">ATC Assist</h1>
                <p className="text-xs text-aviation-muted md:text-sm">Voice &amp; text-powered reference tool for controllers — official FAA data on demand.</p>
              </div>
          </div>
        </header>

        <FacilitySelector
          onSelect={(facility) => setSelectedFacilityId(facility?.id ?? null)}
          selectedFacility={selectedFacility}
        />

        <QueryInput
          facilityId={selectedFacilityId}
          isSubmitting={isSubmitting}
          onPreviewChange={setActiveIntent}
          onSubmit={handleSubmit}
        />

        <section className="aviation-panel px-5 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            {liveResult ? (
              <div className="flex flex-wrap items-center gap-3">
                <SourceBadge
                  fetchedAt={liveResult.response.fetchedAt}
                  isStale={liveResult.response.isStale}
                  referenceTime={initialNow}
                  source={liveResult.response.source}
                />
                <div className="rounded-full border border-aviation-border bg-black/20 px-3 py-1 font-data text-xs text-aviation-muted">
                  {Math.round(liveResult.executionTimeMs)} ms
                </div>
                {autoRefreshConfig ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-aviation-green" />
                    <span>{autoRefreshConfig.label}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {liveResult ? (
            <div className="mt-4 space-y-4">
              {renderQuerySummary(liveResult, isSubmitting, submittedQuery, (followUpQuery) => {
                handleSubmit(followUpQuery, null);
              })}

              <details className="rounded-2xl border border-aviation-border bg-black/20">
                <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 text-sm font-medium text-aviation-muted">Reveal query envelope</summary>
                <pre className="max-h-72 overflow-auto border-t border-aviation-border px-4 py-3 font-data text-xs leading-6 text-slate-300">
                  {JSON.stringify(liveResult, null, 2)}
                </pre>
              </details>
            </div>
          ) : null}
        </section>

        {/* Multi-airport overview for approach/center facilities */}
        {selectedFacility && (selectedFacility.type === "approach" || selectedFacility.type === "center") && !visiblePanels.size && (
          <FacilityOverview
            facilityName={selectedFacility.name}
            facilityType={selectedFacility.type as "approach" | "center"}
            airports={getFacilityAirports(selectedFacility.id)}
            onSelectAirport={(icao) => {
              handleSubmit(`airport info for ${icao}`, null);
            }}
          />
        )}

        {visiblePanels.size > 0 && (liveResult || facilityResults.size > 0) ? (
        <section className="grid gap-6 xl:grid-cols-12">
          {orderedCards.filter((cardType) => visiblePanels.has(cardType)).map((cardType) => {
            switch (cardType) {
              case "weather":
                return (
                  <div key="weather" className="xl:col-span-7">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.weather.fetchedAt}
                      isActive={activeCard === "weather"}
                      isStale={dashboardData.weather.isStale}
                      kind="weather"
                      rawData={dashboardData.weather}
                      referenceTime={initialNow}
                      source={dashboardData.weather.source}
                      stalenessWarning={dashboardData.weather.isStale ? dashboardData.weather.source.refresh_interval : undefined}
                      subtitle="Formatted METAR and TAF presentation with direct flight-category cues and raw observation access."
                      title={`${dashboardData.weather.stationIcao} weather brief`}
                    >
                      <div className="space-y-4">
                        {autoRefreshConfig?.intentType === "weather" ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-aviation-green" />
                            <span>{autoRefreshConfig.label}</span>
                          </div>
                        ) : null}
                        {selectedFacility && (
                          <AtisStrip airports={getFacilityAirports(selectedFacility.id)} />
                        )}
                        <WeatherDisplay weather={dashboardData.weather} />
                      </div>
                    </ResultCard>
                  </div>
                );
              case "notam":
                return (
                  <div key="notam" className="xl:col-span-5">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.notams[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "notam"}
                      isStale={dashboardData.notams.some((notam) => notam.isStale)}
                      kind="notam"
                      rawData={dashboardData.notams}
                      referenceTime={initialNow}
                      source={dashboardData.notams[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      stalenessWarning="One or more NOTAM records are beyond the preferred review window."
                      subtitle="Priority-sorted field notices with TFR emphasis, effective times, and expandable full text."
                      title={`${dashboardData.notams[0]?.affectedFacility ?? "Field"} operational NOTAM stack`}
                    >
                      {loadingPanels.has("notam") ? (
                        <div className="flex items-center gap-2 text-sm text-aviation-muted">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                          Loading NOTAMs…
                        </div>
                      ) : dashboardData.notams.length ? (
                        <NotamList notams={dashboardData.notams} />
                      ) : (
                        <div className="space-y-2 text-sm text-aviation-muted">
                          <p>NOTAMs require an FAA API key.</p>
                          <p className="break-words text-xs">Register free at <a href="https://api.faa.gov" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">api.faa.gov</a>, then add <code className="rounded bg-black/30 px-1.5 py-0.5 font-data text-xs">FAA_NOTAM_API_KEY=your-key</code> to <code className="rounded bg-black/30 px-1.5 py-0.5 font-data text-xs">.env.local</code></p>
                        </div>
                      )}
                    </ResultCard>
                  </div>
                );
              case "traffic":
                return (
                  <div key="traffic" className="xl:col-span-7">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.traffic[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "traffic"}
                      isStale={dashboardData.traffic.some((target) => target.isStale)}
                      kind="traffic"
                      rawData={dashboardData.traffic}
                      referenceTime={initialNow}
                      source={dashboardData.traffic[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      stalenessWarning="Traffic targets are older than the preferred surveillance window."
                      subtitle="Live or fallback traffic picture with callsign labels and altitude-based color coding."
                      title="Surface and terminal traffic picture"
                    >
                      <div className="space-y-4">
                        {autoRefreshConfig?.intentType === "traffic" ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-aviation-green" />
                            <span>{autoRefreshConfig.label}</span>
                          </div>
                        ) : null}
                        {loadingPanels.has("traffic") ? (
                          <div className="flex items-center gap-2 text-sm text-aviation-muted">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                            Loading traffic…
                          </div>
                        ) : dashboardData.traffic.length ? (
                          <TrafficMap
                            traffic={dashboardData.traffic}
                            airportIcao={trafficAirportIcao}
                            airportPosition={trafficAirportPosition}
                          />
                        ) : (
                          <div className="text-sm text-aviation-muted">No live traffic targets returned.</div>
                        )}
                      </div>
                    </ResultCard>
                  </div>
                );
              case "navigation":
                return (
                  <div key="navigation" className="xl:col-span-5">
                    <ResultCard
                      className="h-full"
                      fetchedAt={liveResult?.intent.type === "navigation" ? liveResult.response.fetchedAt : fallbackFetchedAt}
                      isActive={activeCard === "navigation"}
                      kind="navigation"
                      rawData={dashboardData.navigation}
                      referenceTime={initialNow}
                      source={liveResult?.intent.type === "navigation" ? liveResult.response.source : fallbackSource}
                      subtitle="Great-circle bearing and distance calculated from airport reference coordinates, with controller-friendly magnetic vector output."
                      title={`${dashboardData.navigation.from.icao} to ${dashboardData.navigation.to.icao} direct vector`}
                    >
                      <NavigationDisplay navigation={dashboardData.navigation} />
                    </ResultCard>
                  </div>
                );
              case "frequency":
                return (
                  <div key="frequency" className="xl:col-span-5">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.frequencies[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "frequency"}
                      kind="frequency"
                      rawData={dashboardData.frequencies}
                      referenceTime={initialNow}
                      source={dashboardData.frequencies[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      subtitle="High-contrast FAA field frequencies in a terminal-style list for quick eyes-on validation."
                      title={`${activeIntent?.type === "frequency" ? activeIntent.facility : dashboardData.weather.stationIcao} core frequencies`}
                    >
                      {loadingPanels.has("frequency") ? (
                        <div className="flex items-center gap-2 text-sm text-aviation-muted">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                          Loading frequencies…
                        </div>
                      ) : dashboardData.frequencies.length ? (
                        <div className="space-y-3">
                          {dashboardData.frequencies.map((frequency) => (
                            <div
                              key={`${frequency.type}-${frequency.valueMHz}`}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 sm:flex-nowrap"
                            >
                              <div className="min-w-0">
                                <p className="data-label">{frequency.type}</p>
                                <p className="mt-2 break-words text-sm text-aviation-muted">{frequency.name}</p>
                              </div>
                              <p className="shrink-0 font-data text-lg text-aviation-text">{frequency.valueMHz.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-aviation-muted">No frequencies returned for the active live query.</div>
                      )}
                    </ResultCard>
                  </div>
                );
              case "plates":
                return (
                  <div key="plates" className="xl:col-span-7">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.plates[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "plates"}
                      isStale={dashboardData.plates.some((plate) => plate.isStale)}
                      kind="plates"
                      rawData={dashboardData.plates}
                      referenceTime={initialNow}
                      source={dashboardData.plates[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      subtitle="Inline FAA procedure chart viewer with runway-aware plate selection and one-click alternates."
                      title={`${platePanelAirport} terminal procedures`}
                    >
                      {dashboardData.plates.length ? (
                        <PlateViewer
                          plates={dashboardData.plates}
                          referenceTime={initialNow}
                          selectedProcedureType={selectedPlateProcedureType}
                          selectedRunway={selectedPlateRunway}
                        />
                      ) : (
                        <div className="text-sm text-aviation-muted">No approach plates returned for the active live query.</div>
                      )}
                    </ResultCard>
                  </div>
                );
              case "regulatory":
                return (
                  <div key="regulatory" className="xl:col-span-5">
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.regulatory[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "regulatory"}
                      isStale={dashboardData.regulatory.some((reference) => reference.isStale)}
                      kind="regulatory"
                      rawData={dashboardData.regulatory}
                      referenceTime={initialNow}
                      source={dashboardData.regulatory[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      subtitle="Source-attributed FAR references surfaced for rapid procedural and legal cross-checking."
                      title="Regulatory references"
                    >
                      {dashboardData.regulatory.length ? (
                        <div className="space-y-3">
                          {dashboardData.regulatory.map((reference) => (
                            <div key={`${reference.part}-${reference.section}`} className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
                              <p className="font-data text-sm text-aviation-text">
                                FAR {reference.part}.{reference.section}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-aviation-muted">{reference.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-aviation-muted">No regulatory references returned for the active live query.</div>
                      )}
                    </ResultCard>
                  </div>
                );
            }
          })}
        </section>
        ) : null}

        {/* Airport stats card — rendered when facilityAirportInfo is available from dashboard fetch */}
        {facilityAirportInfo?.hours?.ok && (
          <section className="mt-6 grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-12">
              <ResultCard
                className="h-full"
                fetchedAt={facilityAirportInfo.hours.data.source ? new Date().toISOString() : fallbackFetchedAt}
                isActive={false}
                kind="navigation"
                rawData={facilityAirportInfo}
                referenceTime={initialNow}
                source={getDataSource("faaNasr")}
                subtitle="Tower hours, runway information, and airport classification from FAA Chart Supplement data."
                title={`${facilityAirportInfo.airport} airport statistics`}
              >
                <div className="space-y-4">
                  {/* Hours */}
                  {(() => {
                    const hours = facilityAirportInfo.hours!.data;
                    return (
                      <div className="rounded-xl border border-aviation-border bg-black/10 p-3">
                        <div className="mb-3 flex flex-wrap items-start gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            hours.isTowered
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
                          }`}>
                            {hours.isTowered ? "✦ Towered" : "Non-Towered"}
                          </span>
                          {hours.timezone && (
                            <span className="rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-xs text-aviation-muted">
                              {hours.timezone.abbreviation} ({hours.timezone.utcOffset}){hours.timezone.isDst ? " · DST" : ""}
                            </span>
                          )}
                          {hours.airportUse && (
                            <span className="rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-xs text-aviation-muted">
                              {hours.airportUse}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-aviation-muted">Tower Hours</p>
                        {hours.towerSchedule ? (
                          hours.towerSchedule.is24Hour ? (
                            <p className="mt-1.5 font-data text-sm text-emerald-200">24-hour operation (continuous)</p>
                          ) : (
                            <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-aviation-muted">Local</p>
                                <p className="font-data text-sm text-aviation-text">
                                  {hours.towerSchedule.openLocal}–{hours.towerSchedule.closeLocal} {hours.timezone?.abbreviation ?? "LCL"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-aviation-muted">Zulu</p>
                                <p className="font-data text-sm text-cyan-200">
                                  {hours.towerSchedule.openZulu}–{hours.towerSchedule.closeZulu}
                                </p>
                              </div>
                            </div>
                          )
                        ) : hours.towerHours ? (
                          <p className="mt-1.5 font-data text-sm text-aviation-text">{hours.towerHours}</p>
                        ) : (
                          <p className="mt-1.5 text-sm text-aviation-muted">No tower data available</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Runways */}
                  {facilityAirportInfo.runwayDetails?.ok && facilityAirportInfo.runwayDetails.data.runways.length > 0 && (
                    <div className="rounded-xl border border-aviation-border bg-black/10 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-aviation-muted">Runways</p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {facilityAirportInfo.runwayDetails.data.runways.map((rwy) => (
                          <div key={rwy.designator} className="rounded-lg border border-aviation-border bg-black/10 px-3 py-2">
                            <p className="font-data text-sm text-aviation-text">{rwy.designator}</p>
                            <p className="break-words font-data text-xs text-aviation-muted">
                              {rwy.lengthFeet ? `${rwy.lengthFeet.toLocaleString()}×${rwy.widthFeet ?? "?"}ft` : ""}
                              {rwy.surface ? ` · ${rwy.surface}` : ""}
                            </p>
                            {rwy.lighting && <p className="break-words font-data text-xs text-aviation-muted">{rwy.lighting}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagram link */}
                  {facilityAirportInfo.diagram?.ok && facilityAirportInfo.diagram.data && (
                    <a
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-4 py-3 transition hover:border-cyan-300/40 hover:bg-cyan-500/10"
                      href={facilityAirportInfo.diagram.data.chartUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Airport Diagram</p>
                        <p className="mt-1 text-sm text-aviation-text">{facilityAirportInfo.diagram.data.procedureName}</p>
                      </div>
                      <span className="text-cyan-400">↗</span>
                    </a>
                  )}
                </div>
              </ResultCard>
            </div>
          </section>
        )}
      </div>

      <StatusBar liveStatus={autoRefreshConfig?.label ?? null} referenceTime={initialNow} sources={sourceStatuses} warnings={warnings} />
    </main>
  );
}
