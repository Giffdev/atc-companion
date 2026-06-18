import { SourceBadge } from "@/components/SourceBadge";
import { PlateViewer } from "@/components/PlateViewer";
import type { ProcedureType } from "@/types/intents";
import type { ApproachPlate } from "@/types/aviation";

type PlatesListProps = {
  plates: ApproachPlate[];
  referenceTime?: string;
  compact?: boolean;
  mode?: "list" | "viewer";
  selectedProcedureType?: ProcedureType;
  selectedRunway?: string;
};

export function PlatesList({
  plates,
  referenceTime,
  compact = false,
  mode = "list",
  selectedProcedureType,
  selectedRunway
}: PlatesListProps) {
  if (mode === "viewer") {
    return (
      <PlateViewer
        plates={plates}
        referenceTime={referenceTime}
        selectedProcedureType={selectedProcedureType}
        selectedRunway={selectedRunway}
      />
    );
  }

  return (
    <div className="space-y-3">
      {plates.map((plate) => (
        <div key={`${plate.airportIcao}-${plate.procedureName}-${plate.chartUrl}`} className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 font-data text-xs tracking-[0.2em] text-violet-300">
                  {plate.procedureType}
                </span>
                {plate.runway ? (
                  <span className="rounded-full border border-aviation-border bg-black/20 px-2.5 py-1 font-data text-xs tracking-[0.2em] text-aviation-text">
                    RWY {plate.runway}
                  </span>
                ) : null}
              </div>
              <div>
                <p className="data-label">Procedure</p>
                <p className="mt-2 text-base font-semibold text-aviation-text md:text-lg">{plate.procedureName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <a
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
                href={plate.chartUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open PDF chart
              </a>
              {!compact ? <SourceBadge fetchedAt={plate.fetchedAt} isStale={plate.isStale} referenceTime={referenceTime} source={plate.source} /> : null}
            </div>
          </div>

          {compact ? (
            <div className="mt-3 border-t border-aviation-border pt-3">
              <p className="data-label">Source</p>
              <p className="mt-1 text-xs text-aviation-muted">{plate.source.name}</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
