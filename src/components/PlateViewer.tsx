"use client";

import { useMemo, useState } from "react";

import { SourceBadge } from "@/components/SourceBadge";
import type { ProcedureType } from "@/types/intents";
import type { ApproachPlate } from "@/types/aviation";

type PlateViewerProps = {
  plates: ApproachPlate[];
  referenceTime?: string;
  selectedProcedureType?: ProcedureType;
  selectedRunway?: string;
};

const normalizeValue = (value?: string | null): string => value?.trim().toUpperCase() ?? "";

const getPlateKey = (plate: ApproachPlate): string => `${plate.airportIcao}-${plate.procedureName}-${plate.chartUrl}`;

const getPlateUrl = (plate: ApproachPlate): string => plate.pdfUrl ?? plate.chartUrl;

export const getPlateMatchScore = (
  plate: ApproachPlate,
  selectedProcedureType?: ProcedureType,
  selectedRunway?: string
): number => {
  const normalizedProcedureType = normalizeValue(selectedProcedureType);
  const normalizedRunway = normalizeValue(selectedRunway);
  const procedureMatches = normalizedProcedureType.length > 0 && normalizeValue(plate.procedureType) === normalizedProcedureType;
  const runwayMatches = normalizedRunway.length > 0 && normalizeValue(plate.runway) === normalizedRunway;

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

export function PlateViewer({ plates, referenceTime, selectedProcedureType, selectedRunway }: PlateViewerProps) {
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

  if (!bestMatch) {
    return <div className="text-sm text-aviation-muted">No approach plates available for this airport.</div>;
  }

  return (
    <PlateViewerBody
      key={viewerKey}
      bestMatch={bestMatch}
      plates={plates}
      referenceTime={referenceTime}
      selectedProcedureType={selectedProcedureType}
      selectedRunway={selectedRunway}
    />
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
  const hasProcedureHint = Boolean(selectedProcedureType);
  const hasRunwayHint = Boolean(selectedRunway);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 font-data text-[11px] tracking-[0.2em] text-emerald-200">
              {selectedPlate.procedureType}
            </span>
            {selectedPlate.runway ? (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 font-data text-[11px] tracking-[0.2em] text-cyan-200">
                RWY {selectedPlate.runway}
              </span>
            ) : null}
            <span className="rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-[11px] tracking-[0.2em] text-aviation-muted">
              {selectedPlate.airportIcao}
            </span>
          </div>

          <div>
            <p className="data-label">Displayed plate</p>
            <p className="mt-2 text-lg font-semibold text-aviation-text">{selectedPlate.procedureName}</p>
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
            className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
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

      <div className="aviation-panel overflow-hidden rounded-2xl border border-aviation-border bg-black/20">
        <div className="relative min-h-[600px]">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-data text-xs tracking-[0.2em] text-cyan-100">
                LOADING PLATE PDF…
              </div>
            </div>
          ) : null}

          <iframe
            key={selectedPlateUrl}
            className="h-[min(75vh,900px)] min-h-[600px] w-full bg-slate-950"
            onError={() => setIsLoading(false)}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-same-origin allow-scripts"
            src={selectedPlateUrl}
            title={`${selectedPlate.procedureName} PDF`}
          />
        </div>
      </div>

      <p className="text-xs text-aviation-muted">
        Your browser doesn&apos;t support inline PDF viewing.{" "}
        <a href={selectedPlateUrl} rel="noreferrer" target="_blank">
          Open the chart in a new tab
        </a>
        .
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="data-label">Alternative plates</p>
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
                  "min-w-[220px] rounded-2xl border px-4 py-3 text-left transition",
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
                  <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 font-data text-[10px] tracking-[0.2em] text-violet-300">
                    {plate.procedureType}
                  </span>
                  {plate.runway ? (
                    <span className="rounded-full border border-aviation-border bg-black/20 px-2 py-1 font-data text-[10px] tracking-[0.2em] text-aviation-text">
                      RWY {plate.runway}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold text-aviation-text">{plate.procedureName}</p>
                <p className="mt-1 text-xs text-aviation-muted">{plate.source.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
