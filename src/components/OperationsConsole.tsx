"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FacilitySelector } from "@/components/FacilitySelector";
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
const RESULT_ORDER: DashboardResultType[] = ["weather", "frequency", "traffic", "notam", "plates", "navigation", "regulatory"];

/** Format a rich airport label like "KSEA — Seattle-Tacoma Intl, WA" */
const formatAirportLabel = (icao: string, name?: string | null, city?: string | null, state?: string | null): string => {
  if (!name) {
    const ref = findAirportReference(icao);
    if (ref) return `${icao} — ${ref.name}, ${ref.city}, ${ref.state}`;
    return icao;
  }
  const loc = [city, state].filter(Boolean).join(", ");
  return loc ? `${icao} — ${name}, ${loc}` : `${icao} — ${name}`;
};

/** Shorter version for card titles */
const formatAirportTitle = (icao: string, name?: string | null): string => {
  if (!name) {
    const ref = findAirportReference(icao);
    if (ref) return `${icao} — ${ref.name}`;
    return icao;
  }
  return `${icao} — ${name}`;
};

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
  sids: [] as ApproachPlate[],
  stars: [] as ApproachPlate[],
  odps: [] as ApproachPlate[],
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

    if (intent.detail === "runways" || intent.detail === "supplement") {
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
    case "plates": {
      const plateData = liveResult.response.data as ApproachPlate[];
      const procType = liveResult.intent.type === "plates" ? liveResult.intent.procedure_type : undefined;
      if (procType === "SID") return { ...dashboardData, sids: plateData };
      if (procType === "STAR") return { ...dashboardData, stars: plateData };
      if (procType === "ODP") return { ...dashboardData, odps: plateData };
      return { ...dashboardData, plates: plateData };
    }
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
        plates: airportInfo.plates.ok ? airportInfo.plates.data : dashboardData.plates,
        sids: airportInfo.sids?.ok ? airportInfo.sids.data : dashboardData.sids,
        stars: airportInfo.stars?.ok ? airportInfo.stars.data : dashboardData.stars,
        odps: airportInfo.odps?.ok ? airportInfo.odps.data : dashboardData.odps
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

const OVERLYING_FREQUENCY_TYPES = new Set(["APP", "CENTER", "DEL"]);

const buildFacilityOverviewData = (
  airportInfo: AirportInfoQueryPayload,
  facilityAirportInfo?: AirportInfoQueryPayload | null
) => {
  const supplemental = facilityAirportInfo?.airport === airportInfo.airport ? facilityAirportInfo : null;
  const primaryFrequencies = airportInfo.frequencies.ok ? airportInfo.frequencies.data : [];
  const supplementalFrequencies = supplemental?.frequencies?.ok ? supplemental.frequencies.data : [];
  const frequencies = [...primaryFrequencies];
  const frequencyKeys = new Set(primaryFrequencies.map((freq) => `${freq.type}|${freq.valueMHz}|${freq.name}`));

  supplementalFrequencies.forEach((freq) => {
    const key = `${freq.type}|${freq.valueMHz}|${freq.name}`;
    if (!frequencyKeys.has(key)) {
      frequencyKeys.add(key);
      frequencies.push(freq);
    }
  });

  const primaryRunways = airportInfo.runwayDetails?.ok ? airportInfo.runwayDetails.data.runways : [];
  const supplementalRunways = supplemental?.runwayDetails?.ok ? supplemental.runwayDetails.data.runways : [];
  const runways = [...primaryRunways];
  const runwayDesignators = new Set(primaryRunways.map((runway) => runway.designator));

  supplementalRunways.forEach((runway) => {
    if (!runwayDesignators.has(runway.designator)) {
      runwayDesignators.add(runway.designator);
      runways.push(runway);
    }
  });

  return {
    hours: airportInfo.hours?.ok ? airportInfo.hours.data : supplemental?.hours?.ok ? supplemental.hours.data : null,
    frequencies,
    overlyingFrequencies: frequencies.filter((freq) => OVERLYING_FREQUENCY_TYPES.has(freq.type)),
    runways
  };
};

const renderQuerySummary = (
  liveResult: LiveQueryResult | null,
  isSubmitting: boolean,
  submittedQuery: string,
  referenceTime: string,
  facilityAirportInfo?: AirportInfoQueryPayload | null,
  onFollowUp?: (query: string) => void
) => {
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
    const isNotamSearch = liveResult.response.error.code === "NOTAM_EMBEDDED_SEARCH";
    if (isNotamSearch) {
      const searchUrl = liveResult.response.error.details ?? "https://notams.aim.faa.gov/notamSearch/";
      return (
        <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-4 text-sm text-cyan-100">
          <p>{liveResult.response.error.message}</p>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
            href={searchUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open FAA NOTAM Search ↗
          </a>
        </div>
      );
    }
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
        return <p className="text-sm text-aviation-text">Weather card updated for {formatAirportTitle(weather.stationIcao)} with live METAR, TAF, and PIREP data.</p>;
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
    case "navigation":
      return null;
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
      const approachCount = airportInfo.plates.ok ? airportInfo.plates.data.length : 0;
      const sidCount = airportInfo.sids?.ok ? airportInfo.sids.data.length : 0;
      const starCount = airportInfo.stars?.ok ? airportInfo.stars.data.length : 0;
      const odpCount = airportInfo.odps?.ok ? airportInfo.odps.data.length : 0;
      const { hours, frequencies, overlyingFrequencies, runways } = buildFacilityOverviewData(airportInfo, facilityAirportInfo);
      const freqCount = frequencies.length;
      const diagram = airportInfo.diagram?.ok ? airportInfo.diagram.data : null;
      const airportLabel = formatAirportLabel(airportInfo.airport, airportInfo.airportName, airportInfo.airportCity, airportInfo.airportState);
      const procedureTotal = approachCount + sidCount + starCount + odpCount + (diagram ? 1 : 0);
      const subtitle = [
        hours ? "Tower hours" : null,
        runways.length > 0 || airportInfo.runways.length > 0 ? "runway configuration" : null,
        overlyingFrequencies.length > 0 ? "overlying frequencies" : null,
        procedureTotal > 0 ? "procedures" : null
      ].filter(Boolean).join(", ");

      return (
        <ResultCard
          fetchedAt={liveResult.response.fetchedAt}
          isActive={false}
          isStale={liveResult.response.isStale}
          kind="facility"
          referenceTime={referenceTime}
          source={liveResult.response.source}
          stalenessWarning={liveResult.response.stalenessWarning}
          subtitle={`${subtitle || "Facility overview"} from live FAA-backed airport data.`}
          title={`${formatAirportTitle(airportInfo.airport, airportInfo.airportName)} facility overview`}
        >
          <div className="space-y-3">
            {/* Identity row */}
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-data text-base font-semibold text-aviation-text">{airportLabel}</p>
              {hours && (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  hours.isTowered === true
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : hours.isTowered === false
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                }`}>
                  {hours.isTowered === true ? "✦ Towered" : hours.isTowered === false ? "Non-Towered" : "⟳ Loading…"}
                </span>
              )}
              {hours?.airportUse && (
                <span className="rounded-full border border-aviation-border bg-black/20 px-2 py-0.5 font-data text-xs text-aviation-muted">{hours.airportUse}</span>
              )}
            </div>

            {/* Tower hours + timezone + runways + overlying in a compact grid */}
            <div className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {hours?.towerSchedule ? (
                <div>
                  <p className="text-xs text-aviation-muted">Tower</p>
                  <p className="font-data text-aviation-text">
                    {hours.towerSchedule.is24Hour
                      ? "24hr"
                      : `${hours.towerSchedule.openLocal}–${hours.towerSchedule.closeLocal} ${hours.timezone?.abbreviation ?? "LCL"}`}
                  </p>
                  {!hours.towerSchedule.is24Hour && (
                    <p className="font-data text-xs text-cyan-300/70">
                      {hours.towerSchedule.openZulu}–{hours.towerSchedule.closeZulu}Z
                    </p>
                  )}
                </div>
              ) : hours?.towerHours ? (
                <div>
                  <p className="text-xs text-aviation-muted">Tower</p>
                  <p className="font-data text-aviation-text">{hours.towerHours}</p>
                  {hours.timezone && (() => {
                    const zuluMatch = hours.towerHours!.match(/(\d{4})Z?\s*[-–]\s*(\d{4})Z?/);
                    if (!zuluMatch) return null;
                    const offsetH = parseFloat(hours.timezone!.utcOffset.replace("UTC", ""));
                    if (isNaN(offsetH)) return null;
                    const toLocal = (hhmm: string) => {
                      const h = parseInt(hhmm.slice(0, 2), 10) + offsetH;
                      const m = hhmm.slice(2);
                      const norm = ((h % 24) + 24) % 24;
                      return `${Math.floor(norm).toString().padStart(2, "0")}${m}`;
                    };
                    return (
                      <p className="font-data text-xs text-cyan-300/70">
                        ≈ {toLocal(zuluMatch[1])}–{toLocal(zuluMatch[2])} {hours.timezone!.abbreviation}
                      </p>
                    );
                  })()}
                </div>
              ) : hours?.isTowered === false ? (
                <div>
                  <p className="text-xs text-aviation-muted">Tower</p>
                  <p className="font-data text-aviation-text">
                    Non-towered ·{" "}
                    <a className="text-cyan-400 hover:text-cyan-300 underline" href={`https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${hours.airportIcao.replace(/^K/, "")}`} rel="noreferrer" target="_blank">
                      Chart Supplement ↗
                    </a>
                  </p>
                </div>
              ) : null}

              {hours?.timezone && (
                <div>
                  <p className="text-xs text-aviation-muted">Timezone</p>
                  <p className="font-data text-aviation-text">{hours.timezone.abbreviation} ({hours.timezone.utcOffset}){hours.timezone.isDst ? " DST" : ""}</p>
                </div>
              )}

              {hours?.attendanceSchedule && (
                <div>
                  <p className="text-xs text-aviation-muted">Attendance</p>
                  <p className="font-data text-aviation-text">{hours.attendanceSchedule}</p>
                </div>
              )}

              {hours?.lightingSchedule && (
                <div>
                  <p className="text-xs text-aviation-muted">Lighting</p>
                  <p className="font-data text-aviation-text">{hours.lightingSchedule}</p>
                </div>
              )}

              {(runways.length > 0 || airportInfo.runways.length > 0) && (
                <div className={runways.length > 2 ? "sm:col-span-2 lg:col-span-3" : ""}>
                  <p className="text-xs text-aviation-muted">Runways</p>
                  {runways.length > 0 ? (
                    <p className="font-data text-aviation-text">
                      {runways.map((rwy) => {
                        const dim = rwy.lengthFeet ? `${rwy.lengthFeet.toLocaleString()}×${rwy.widthFeet ?? "?"}ft` : "";
                        return `${rwy.designator}${dim ? ` (${dim}${rwy.surface ? ` ${rwy.surface}` : ""})` : ""}`;
                      }).join(" · ")}
                    </p>
                  ) : (
                    <p className="font-data text-aviation-text">{airportInfo.runways.join(" · ")}</p>
                  )}
                </div>
              )}
            </div>

            {/* Overlying frequencies — inline table */}
            {overlyingFrequencies.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-aviation-muted">Overlying Frequencies</p>
                <div className="flex flex-wrap gap-2">
                  {overlyingFrequencies.map((freq) => (
                    <span key={`${freq.type}-${freq.valueMHz}-${freq.name}`} className="inline-flex items-center gap-1.5 rounded-full border border-aviation-border bg-black/15 px-2.5 py-1 font-data text-xs">
                      <span className={
                        freq.type === "APP" ? "text-violet-300"
                          : freq.type === "CENTER" ? "text-blue-300"
                            : "text-amber-300"
                      }>{freq.type}</span>
                      <span className="text-cyan-100">{freq.valueMHz.toFixed(3)}</span>
                      <span className="text-aviation-muted">{freq.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Procedures + Frequencies action row */}
            <div className="grid gap-2 sm:grid-cols-2">
              {onFollowUp ? (
                <button
                  className="flex items-center justify-between rounded-lg border border-aviation-border bg-black/10 px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                  onClick={() => onFollowUp(`approach plates at ${airportInfo.airport}`)}
                  type="button"
                >
                  <span className="font-data text-sm text-aviation-text">
                    Procedures{procedureTotal > 0 ? ` (${procedureTotal})` : ""}
                  </span>
                  <span className="text-xs text-cyan-400">→ view</span>
                </button>
              ) : (
                <div className="rounded-lg border border-aviation-border bg-black/10 px-3 py-2">
                  <span className="font-data text-sm text-aviation-text">Procedures: {procedureTotal}</span>
                </div>
              )}
              {onFollowUp ? (
                <button
                  className="flex items-center justify-between rounded-lg border border-aviation-border bg-black/10 px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
                  onClick={() => onFollowUp(`frequencies at ${airportInfo.airport}`)}
                  type="button"
                >
                  <span className="font-data text-sm text-aviation-text">
                    Frequencies{freqCount > 0 ? ` (${freqCount})` : ""}
                  </span>
                  <span className="text-xs text-cyan-400">→ view</span>
                </button>
              ) : (
                <div className="rounded-lg border border-aviation-border bg-black/10 px-3 py-2">
                  <span className="font-data text-sm text-aviation-text">Frequencies: {freqCount}</span>
                </div>
              )}
            </div>

            {hours && (
              <p className="text-xs text-aviation-muted">Source: {hours.source}{hours.timezone?.isDst ? " · DST active" : ""}</p>
            )}
          </div>
        </ResultCard>
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
  const [supplementaryProcedures, setSupplementaryProcedures] = useState<{
    sids: ApproachPlate[];
    stars: ApproachPlate[];
    odps: ApproachPlate[];
    approaches: ApproachPlate[];
  }>({ sids: [], stars: [], odps: [], approaches: [] });
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Hydrate facility from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const storedFacilityId = window.localStorage.getItem(FACILITY_STORAGE_KEY);
    if (storedFacilityId && getFacilityById(storedFacilityId)) {
      setSelectedFacilityId(storedFacilityId);
    }

    // Warm up serverless functions on page load so the first real query is fast
    fetch("/api/weather?station=KSEA&warmup=1", { priority: "low" as RequestPriority }).catch(() => {});
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

  const handleHomeClick = () => {
    setActiveIntent(null);
    setSubmittedQuery("Awaiting query");
    setLiveResult(null);
    setVisiblePanels(new Set());
    setLoadingPanels(new Set());
    setSubmitError(null);
    setFacilityResults(new Map());
    setFacilityAirportInfo(null);
  };

  const dashboardData = useMemo(() => {
    let merged = { ...EMPTY_DASHBOARD };

    // Detect if the live query targets a different airport than the facility
    const liveAirport = liveResult?.intent.type === "plates" ? liveResult.intent.airport
      : liveResult?.intent.type === "airport_info" ? liveResult.intent.airport
      : null;
    const facilityAirport = selectedFacility?.primaryAirport;
    const isLiveQueryForDifferentAirport = liveAirport && facilityAirport &&
      liveAirport.toUpperCase() !== facilityAirport.toUpperCase();

    // Apply facility results first (baseline for selected facility)
    for (const [key, result] of facilityResults) {
      // Skip facility plate data when live query targets a different airport
      if (isLiveQueryForDifferentAirport && key === "plates") continue;
      merged = mergeLiveDashboardData(merged, result);
    }

    // Layer the active live query result on top
    if (liveResult && liveResult.response.ok) {
      const liveType = mapIntentToDashboardType(liveResult.intent);
      const isFacilityResult = facilityResults.has(liveType as DashboardResultType) &&
        facilityResults.get(liveType as DashboardResultType) === liveResult;
      if (!isFacilityResult) {
        merged = mergeLiveDashboardData(merged, liveResult);
      }
    }

    // Pull SIDs/STARs/ODPs from facilityAirportInfo only if same airport
    if (facilityAirportInfo && !isLiveQueryForDifferentAirport) {
      if (!merged.sids.length && facilityAirportInfo.sids?.ok) {
        merged = { ...merged, sids: facilityAirportInfo.sids.data };
      }
      if (!merged.stars.length && facilityAirportInfo.stars?.ok) {
        merged = { ...merged, stars: facilityAirportInfo.stars.data };
      }
      if (!merged.odps.length && facilityAirportInfo.odps?.ok) {
        merged = { ...merged, odps: facilityAirportInfo.odps.data };
      }
    }

    // Merge supplementary procedure data fetched in the background
    if (!merged.plates.length && supplementaryProcedures.approaches.length) {
      merged = { ...merged, plates: supplementaryProcedures.approaches };
    }
    if (!merged.sids.length && supplementaryProcedures.sids.length) {
      merged = { ...merged, sids: supplementaryProcedures.sids };
    }
    if (!merged.stars.length && supplementaryProcedures.stars.length) {
      merged = { ...merged, stars: supplementaryProcedures.stars };
    }
    if (!merged.odps.length && supplementaryProcedures.odps.length) {
      merged = { ...merged, odps: supplementaryProcedures.odps };
    }

    return merged;
  }, [liveResult, facilityResults, facilityAirportInfo, supplementaryProcedures, selectedFacility]);
  const sourceStatuses = useMemo(() => mergeSourceStatuses(EMPTY_DASHBOARD.sourceStatuses, liveResult), [liveResult]);
  const selectedPlateProcedureType = liveResult?.intent.type === "plates" ? liveResult.intent.procedure_type : undefined;
  const selectedProcedureName = liveResult?.intent.type === "plates" ? liveResult.intent.procedure_name : undefined;
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
  const plateDiagram = useMemo(() => {
    if (liveResult?.intent.type === "airport_info" && liveResult.response.ok) {
      const info = liveResult.response.data as AirportInfoQueryPayload;
      return info.diagram?.ok ? info.diagram.data : null;
    }
    return null;
  }, [liveResult]);
  const fallbackSource = PLACEHOLDER_SOURCE;
  const fallbackFetchedAt = initialNow;

  const trafficAirportIcao = useMemo(() => {
    if (activeIntent?.type === "traffic" && activeIntent.airport) return activeIntent.airport;
    return selectedFacility?.primaryAirport ?? undefined;
  }, [activeIntent, selectedFacility]);
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

  const fetchAllProcedureTypes = useCallback(async (airport: string) => {
    const queries = [
      { key: "approaches" as const, query: `approach plates at ${airport}` },
      { key: "sids" as const, query: `SIDs at ${airport}` },
      { key: "stars" as const, query: `STARs at ${airport}` },
      { key: "odps" as const, query: `ODPs at ${airport}` }
    ];
    const results = await Promise.allSettled(queries.map(async (q) => {
      const payload = await fetchLiveQuery(q.query);
      return { key: q.key, data: payload.response.ok ? (payload.response.data as ApproachPlate[]) : [] };
    }));
    const merged = { sids: [] as ApproachPlate[], stars: [] as ApproachPlate[], odps: [] as ApproachPlate[], approaches: [] as ApproachPlate[] };
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.data.length > 0) {
        merged[result.value.key] = result.value.data;
      }
    }
    setSupplementaryProcedures(merged);
  }, [fetchLiveQuery]);

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
        // Set active card based on what the user actually asked about
        const detailCard = mapIntentToDashboardType(payload.intent);
        setActiveCard(detailCard ?? "weather");
        setVisiblePanels(new Set(airportInfoPanels));
      } else if (returnedCard) {
        setActiveCard(returnedCard);
        setVisiblePanels(new Set([returnedCard]));
      }

      // When a plates-related query returns for a specific airport,
      // fetch all other procedure types so every PlateViewer tab is populated
      const platesAirport = payload.intent.type === "plates" ? payload.intent.airport
        : payload.intent.type === "airport_info" ? payload.intent.airport
        : null;
      if (platesAirport) {
        fetchAllProcedureTypes(platesAirport);
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
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        <header className="aviation-panel relative overflow-hidden px-5 py-4 md:px-7">
          <div className="absolute inset-y-0 right-[-8rem] hidden w-80 rounded-full bg-cyan-500/10 blur-3xl xl:block" />
           <div className="flex items-center justify-start gap-4">
              <button
                type="button"
                onClick={handleHomeClick}
                className="group flex items-center gap-4 focus:outline-none"
                title="Return to home"
              >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-black/25 transition-colors group-hover:border-emerald-400/40">
                <div className="absolute inset-1.5 rounded-full border border-emerald-400/20" />
                <div className="radar-sweep absolute left-1/2 top-1/2 h-[1px] w-5 origin-left bg-gradient-to-r from-cyan-300 to-transparent" />
                <div className="h-2 w-2 rounded-full bg-aviation-green shadow-[0_0_18px_rgba(34,197,94,0.75)]" />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight text-aviation-text transition-colors group-hover:text-aviation-green md:text-2xl">ATC Assist</h1>
                <p className="text-xs text-aviation-muted md:text-sm">Voice &amp; text-powered reference tool for controllers — official FAA data on demand.</p>
              </div>
              </button>
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
              {renderQuerySummary(liveResult, isSubmitting, submittedQuery, initialNow, facilityAirportInfo, (followUpQuery) => {
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
            const isSinglePanel = visiblePanels.size === 1;
            switch (cardType) {
              case "weather":
                return (
                  <div key="weather" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-7"}`}>
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
                      title={`${formatAirportTitle(dashboardData.weather.stationIcao)} weather brief`}
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
                  <div key="notam" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-5"}`}>
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
                        <div className="space-y-3 text-sm text-aviation-muted">
                          <p>View NOTAMs via the official FAA portal:</p>
                          <a
                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/15"
                            href={`https://notams.aim.faa.gov/notamSearch/${activeIntent?.type === "notam" && activeIntent.airport ? `?designatorsForLocation=${activeIntent.airport.replace(/^K/, "")}` : ""}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Open FAA NOTAM Search ↗
                          </a>
                          <a
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:border-amber-400/50 hover:bg-amber-500/15 ml-2"
                            href="https://tfr.faa.gov/tfr2/list.html"
                            rel="noreferrer"
                            target="_blank"
                          >
                            View Active TFRs ↗
                          </a>
                        </div>
                      )}
                    </ResultCard>
                  </div>
                );
              case "traffic":
                return (
                  <div key="traffic" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-7"}`}>
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
                  <div key="navigation" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-5"}`}>
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
                  <div key="frequency" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-5"}`}>
                    <ResultCard
                      className="h-full"
                      fetchedAt={dashboardData.frequencies[0]?.fetchedAt ?? liveResult?.response.fetchedAt ?? fallbackFetchedAt}
                      isActive={activeCard === "frequency"}
                      kind="frequency"
                      rawData={dashboardData.frequencies}
                      referenceTime={initialNow}
                      source={dashboardData.frequencies[0]?.source ?? liveResult?.response.source ?? fallbackSource}
                      subtitle="High-contrast FAA field frequencies in a terminal-style list for quick eyes-on validation."
                      title={`${formatAirportTitle(activeIntent?.type === "frequency" ? activeIntent.facility : dashboardData.weather.stationIcao)} core frequencies`}
                    >
                      {loadingPanels.has("frequency") ? (
                        <div className="flex items-center gap-2 text-sm text-aviation-muted">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                          Loading frequencies…
                        </div>
                      ) : dashboardData.frequencies.length ? (
                        <div className="min-w-0 space-y-3 overflow-x-auto">
                          {dashboardData.frequencies.map((frequency) => (
                            <div
                              key={`${frequency.type}-${frequency.valueMHz}`}
                              className="min-w-0 rounded-2xl border border-aviation-border bg-black/15 px-3 py-3 sm:px-4"
                            >
                              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                <div className="flex min-w-0 items-start justify-between gap-3 sm:block sm:flex-1">
                                  <div className="min-w-0">
                                    <p className="data-label">{frequency.type}</p>
                                    <p className="mt-1 break-all text-xs text-aviation-muted sm:mt-2 sm:break-words sm:text-sm">
                                      {frequency.name}
                                    </p>
                                  </div>
                                  <p className="shrink-0 font-data text-sm text-aviation-text sm:hidden">
                                    {frequency.valueMHz.toFixed(2)}
                                  </p>
                                </div>
                                <p className="hidden shrink-0 font-data text-lg text-aviation-text sm:block">
                                  {frequency.valueMHz.toFixed(2)}
                                </p>
                              </div>
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
                  <div key="plates" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-7"}`}>
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
                      title={`${formatAirportTitle(platePanelAirport)} charts & references`}
                    >
                      <PlateViewer
                        airportCode={platePanelAirport !== "Field" ? platePanelAirport : undefined}
                        defaultTab={
                          liveResult?.intent.type === "airport_info" && liveResult.intent.detail === "supplement" ? "supplement"
                          : liveResult?.intent.type === "airport_info" && liveResult.intent.detail === "runways" ? "diagram"
                          : liveResult?.intent.type === "plates" && liveResult.intent.procedure_type === "SID" ? "departures"
                          : liveResult?.intent.type === "plates" && liveResult.intent.procedure_type === "STAR" ? "arrivals"
                          : liveResult?.intent.type === "plates" && liveResult.intent.procedure_type === "ODP" ? "odps"
                          : undefined
                        }
                        diagram={plateDiagram}
                        odps={dashboardData.odps}
                        plates={dashboardData.plates}
                        referenceTime={initialNow}
                        selectedProcedureType={selectedPlateProcedureType}
                        selectedProcedureName={selectedProcedureName}
                        selectedRunway={selectedPlateRunway}
                        sids={dashboardData.sids}
                        stars={dashboardData.stars}
                      />
                    </ResultCard>
                  </div>
                );
              case "regulatory":
                return (
                  <div key="regulatory" className={`min-w-0 ${isSinglePanel ? "xl:col-span-12" : "xl:col-span-5"}`}>
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

      </div>

      <StatusBar liveStatus={autoRefreshConfig?.label ?? null} referenceTime={initialNow} sources={sourceStatuses} warnings={warnings} />
    </main>
  );
}
