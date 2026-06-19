"use client";

import { useMemo, useState } from "react";

import { SourceBadge } from "@/components/SourceBadge";
import { toFaaCode } from "@/data/airports";
import type { ProcedureType } from "@/types/intents";
import type { ApproachPlate } from "@/types/aviation";

type PlateViewerTab = "procedures" | "diagram" | "supplement";

type PlateViewerProps = {
  plates: ApproachPlate[];
  referenceTime?: string;
  selectedProcedureType?: ProcedureType;
  selectedRunway?: string;
  airportCode?: string;
  diagram?: ApproachPlate | null;
  defaultTab?: PlateViewerTab;
};

const normalizeValue = (value?: string | null): string => value?.trim().toUpperCase() ?? "";

/** Normalize runway for comparison — pad to 2 digits, uppercase side letter */
const normalizeRunway = (value?: string | null): string => {
  const raw = value?.trim().toUpperCase() ?? "";
  if (!raw) return "";
  const match = raw.match(/^(\d{1,2})([LRC]?)$/);
  if (!match) return raw;
  return `${match[1].padStart(2, "0")}${match[2]}`;
};

const getPlateKey = (plate: ApproachPlate): string => `${plate.airportIcao}-${plate.procedureName}-${plate.chartUrl}`;

const getPlateUrl = (plate: ApproachPlate): string => plate.pdfUrl ?? plate.chartUrl;

/** Route FAA PDF URLs through our proxy to avoid X-Frame-Options blocks */
const getProxiedPlateUrl = (plate: ApproachPlate): string => {
  const rawUrl = getPlateUrl(plate);
  // Only proxy FAA domains that block iframe embedding
  try {
    const parsed = new URL(rawUrl);
    if (["aeronav.faa.gov", "www.faa.gov", "nfdc.faa.gov"].includes(parsed.hostname)) {
      return `/api/plate-proxy?url=${encodeURIComponent(rawUrl)}`;
    }
  } catch {
    // If URL parsing fails, return raw
  }
  return rawUrl;
};

export const getPlateMatchScore = (
  plate: ApproachPlate,
  selectedProcedureType?: ProcedureType,
  selectedRunway?: string
): number => {
  const normalizedProcedureType = normalizeValue(selectedProcedureType);
  const normalizedRunway = normalizeRunway(selectedRunway);
  const procedureMatches = normalizedProcedureType.length > 0 && normalizeValue(plate.procedureType) === normalizedProcedureType;
  const runwayMatches = normalizedRunway.length > 0 && normalizeRunway(plate.runway) === normalizedRunway;

  if (procedureMatches && runwayMatches) {
    return 3;
  }

  if (procedureMatches) {
    return 2;
  }

  if (runwayMatches) {
    return 1;
  }

  return 0;
};

export const pickBestMatchingPlate = (
  plates: ApproachPlate[],
  selectedProcedureType?: ProcedureType,
  selectedRunway?: string
): ApproachPlate | undefined => {
  if (!plates.length) {
    return undefined;
  }

  let bestPlate = plates[0];
  let bestScore = getPlateMatchScore(bestPlate, selectedProcedureType, selectedRunway);

  for (const plate of plates.slice(1)) {
    const score = getPlateMatchScore(plate, selectedProcedureType, selectedRunway);

    if (score > bestScore) {
      bestPlate = plate;
      bestScore = score;
    }
  }

  return bestPlate;
};

export function PlateViewer({ plates, referenceTime, selectedProcedureType, selectedRunway, airportCode, diagram, defaultTab }: PlateViewerProps) {
  const bestMatch = useMemo(
    () => pickBestMatchingPlate(plates, selectedProcedureType, selectedRunway),
    [plates, selectedProcedureType, selectedRunway]
  );
  const viewerKey = useMemo(
    () =>
      [
        selectedProcedureType ?? "all-procedures",
        selectedRunway ?? "all-runways",
        ...plates.map((plate) => getPlateKey(plate))
      ].join("|"),
    [plates, selectedProcedureType, selectedRunway]
  );

  const initialTab = defaultTab ?? "procedures";
  const [activeTab, setActiveTab] = useState<PlateViewerTab>(initialTab);
  const [refLoading, setRefLoading] = useState(true);

  const faaCode = airportCode ? toFaaCode(airportCode) : null;
  const supplementUrl = faaCode ? `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${faaCode}` : null;
  const proxiedSupplementUrl = supplementUrl ? `/api/plate-proxy?url=${encodeURIComponent(supplementUrl)}` : null;
  const diagramUrl = diagram ? (diagram.pdfUrl ?? diagram.chartUrl) : null;
  const proxiedDiagramUrl = diagramUrl ? getProxiedPlateUrl(diagram!) : null;

  const tabs: { id: PlateViewerTab; label: string; available: boolean }[] = [
    { id: "procedures", label: `Procedures (${plates.length})`, available: plates.length > 0 },
    { id: "diagram", label: "Airport Diagram", available: Boolean(proxiedDiagramUrl) },
    { id: "supplement", label: "Chart Supplement", available: Boolean(proxiedSupplementUrl) }
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-aviation-border pb-2">
        {tabs.filter(t => t.available).map((tab) => (
          <button
            key={tab.id}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-cyan-400 text-cyan-200 bg-cyan-500/10"
                : "text-aviation-muted hover:text-aviation-text hover:bg-white/5"
            }`}
            onClick={() => { setActiveTab(tab.id); setRefLoading(true); }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Procedures tab */}
      {activeTab === "procedures" && (
        bestMatch ? (
          <PlateViewerBody
            key={viewerKey}
            bestMatch={bestMatch}
            plates={plates}
            referenceTime={referenceTime}
            selectedProcedureType={selectedProcedureType}
            selectedRunway={selectedRunway}
          />
        ) : (
          <div className="text-sm text-aviation-muted">No approach plates available for this airport.</div>
        )
      )}

      {/* Airport Diagram tab */}
      {activeTab === "diagram" && proxiedDiagramUrl && (
        <ReferenceIframe
          isLoading={refLoading}
          label="AIRPORT DIAGRAM"
          onLoad={() => setRefLoading(false)}
          rawUrl={diagramUrl!}
          src={proxiedDiagramUrl}
          title="Airport Diagram"
        />
      )}

      {/* Chart Supplement tab */}
      {activeTab === "supplement" && proxiedSupplementUrl && (
        <ReferenceIframe
          isLoading={refLoading}
          label="CHART SUPPLEMENT"
          onLoad={() => setRefLoading(false)}
          rawUrl={supplementUrl!}
          src={proxiedSupplementUrl}
          title="FAA Chart Supplement"
        />
      )}
    </div>
  );
}

function ReferenceIframe({ src, title, rawUrl, label, isLoading, onLoad }: {
  src: string; title: string; rawUrl: string; label: string; isLoading: boolean; onLoad: () => void;
}) {
  const isPdf = rawUrl.toLowerCase().endsWith(".pdf") || src.includes("plate-proxy");

  return (
    <>
      {/* Mobile: link out */}
      <div className="block sm:hidden">
        <a
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-data text-sm text-cyan-100 hover:bg-cyan-500/20 transition-colors"
          href={rawUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open {title} ↗
        </a>
      </div>
      {/* Desktop: inline viewer */}
      <div className="hidden sm:block overflow-hidden rounded-2xl border border-aviation-border bg-black/20">
        <div className="relative min-h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-data text-xs tracking-[0.2em] text-cyan-100">
                LOADING {label}…
              </div>
            </div>
          )}
          {isPdf ? (
            <object
              className="h-[min(75vh,900px)] min-h-[500px] w-full bg-slate-950"
              data={src}
              onLoad={onLoad}
              title={title}
              type="application/pdf"
            >
              {/* Fallback if browser can't render PDF inline */}
              <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-aviation-muted">PDF viewer unavailable in this browser.</p>
                <a
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-data text-sm text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                  href={rawUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open {title} in new tab ↗
                </a>
              </div>
            </object>
          ) : (
            <iframe
              className="h-[min(75vh,900px)] min-h-[500px] w-full bg-slate-950"
              onError={onLoad}
              onLoad={onLoad}
              src={src}
              title={title}
            />
          )}
        </div>
        {/* Always show direct link as escape hatch */}
        <div className="border-t border-aviation-border bg-black/30 px-3 py-2">
          <a
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
            href={rawUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open in new tab ↗
          </a>
        </div>
      </div>
    </>
  );
}

type PlateViewerBodyProps = PlateViewerProps & {
  bestMatch: ApproachPlate;
};

function PlateViewerBody({ bestMatch, plates, referenceTime, selectedProcedureType, selectedRunway }: PlateViewerBodyProps) {
  const [selectedPlateKey, setSelectedPlateKey] = useState<string>(getPlateKey(bestMatch));
  const [isLoading, setIsLoading] = useState(true);
  const selectedPlate = plates.find((plate) => getPlateKey(plate) === selectedPlateKey) ?? bestMatch;
  const selectedPlateUrl = getPlateUrl(selectedPlate);
  const selectedPlateProxiedUrl = getProxiedPlateUrl(selectedPlate);
  const hasProcedureHint = Boolean(selectedProcedureType);
  const hasRunwayHint = Boolean(selectedRunway);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 font-data text-xs tracking-[0.2em] text-emerald-200">
              {selectedPlate.procedureType}
            </span>
            {selectedPlate.runway ? (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 font-data text-xs tracking-[0.2em] text-cyan-200">
                RWY {selectedPlate.runway}
              </span>
            ) : null}
            <span className="rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-xs tracking-[0.2em] text-aviation-muted">
              {selectedPlate.airportIcao}
            </span>
          </div>

          <div>
            <p className="data-label">Displayed plate</p>
            <p className="mt-2 break-words text-lg font-semibold text-aviation-text">{selectedPlate.procedureName}</p>
            <p className="mt-2 text-sm text-aviation-muted">
              {hasProcedureHint || hasRunwayHint
                ? `Best match for ${selectedProcedureType ?? "any procedure"}${hasProcedureHint && hasRunwayHint ? " • " : ""}${
                    selectedRunway ? `RWY ${selectedRunway}` : ""
                  }`
                : `Showing the first available chart from ${plates.length} procedure${plates.length === 1 ? "" : "s"}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <a
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
            href={selectedPlateUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open in new tab
          </a>
          <SourceBadge
            fetchedAt={selectedPlate.fetchedAt}
            isStale={selectedPlate.isStale}
            referenceTime={referenceTime}
            source={selectedPlate.source}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="data-label">Available plates</p>
          <p className="font-data text-xs text-aviation-muted">
            {plates.length} option{plates.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {plates.map((plate) => {
            const plateKey = getPlateKey(plate);
            const isSelected = plateKey === selectedPlateKey;

            return (
              <button
                key={plateKey}
                className={[
                  "min-h-[44px] min-w-[min(220px,85vw)] rounded-2xl border px-4 py-3 text-left transition",
                  isSelected
                    ? "border-cyan-400/70 bg-cyan-500/10 shadow-[0_0_24px_rgba(6,182,212,0.18)]"
                    : "border-aviation-border bg-black/15 hover:border-cyan-400/40 hover:bg-cyan-500/5"
                ].join(" ")}
                onClick={() => {
                  setIsLoading(true);
                  setSelectedPlateKey(plateKey);
                }}
                type="button"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 font-data text-xs tracking-[0.2em] text-violet-300">
                    {plate.procedureType}
                  </span>
                  {plate.runway ? (
                    <span className="rounded-full border border-aviation-border bg-black/20 px-2 py-1 font-data text-xs tracking-[0.2em] text-aviation-text">
                      RWY {plate.runway}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 break-words text-sm font-semibold text-aviation-text">{plate.procedureName}</p>
                <p className="mt-1 truncate text-xs text-aviation-muted">{plate.source.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: open in new tab instead of iframe */}
      <div className="block sm:hidden">
        <a
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-data text-sm text-cyan-100 transition-colors hover:bg-cyan-500/20"
          href={selectedPlateUrl}
          rel="noreferrer"
          target="_blank"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
          </svg>
          <span className="break-words text-center">Open {selectedPlate.procedureName} chart</span>
        </a>
      </div>

      {/* Desktop: inline PDF iframe */}
      <div className="hidden sm:block aviation-panel overflow-hidden rounded-2xl border border-aviation-border bg-black/20">
        <div className="relative min-h-[600px]">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-data text-xs tracking-[0.2em] text-cyan-100">
                LOADING PLATE PDF…
              </div>
            </div>
          ) : null}

          <iframe
            key={selectedPlateProxiedUrl}
            className="h-[min(75vh,900px)] min-h-[600px] w-full bg-slate-950"
            onError={() => setIsLoading(false)}
            onLoad={() => setIsLoading(false)}
            src={selectedPlateProxiedUrl}
            title={`${selectedPlate.procedureName} PDF`}
          />
        </div>
      </div>

      <p className="hidden text-xs text-aviation-muted sm:block">
        Your browser doesn&apos;t support inline PDF viewing.{" "}
        <a className="underline underline-offset-2" href={selectedPlateUrl} rel="noreferrer" target="_blank">
          Open the chart in a new tab
        </a>
        .
      </p>
    </div>
  );
}
