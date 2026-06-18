"use client";

import { useState } from "react";
import type { ApproachPlate } from "@/types/aviation";
import { toFaaCode } from "@/data/airports";

interface DiagramPanelProps {
  diagram: ApproachPlate | null;
  airportCode: string;
  autoExpand?: "diagram" | "supplement";
}

const getProxiedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (["aeronav.faa.gov", "www.faa.gov", "nfdc.faa.gov"].includes(parsed.hostname)) {
      return `/api/plate-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch { /* pass through */ }
  return url;
};

type PanelView = "none" | "diagram" | "supplement";

export function DiagramPanel({ diagram, airportCode, autoExpand }: DiagramPanelProps) {
  const [activeView, setActiveView] = useState<PanelView>(autoExpand && diagram ? autoExpand : "none");
  const [isLoading, setIsLoading] = useState(true);

  const faaCode = toFaaCode(airportCode);
  const chartSupplementUrl = `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${faaCode}`;
  const proxiedSupplementUrl = `/api/plate-proxy?url=${encodeURIComponent(chartSupplementUrl)}`;

  const chartUrl = diagram ? (diagram.pdfUrl ?? diagram.chartUrl) : null;
  const proxiedDiagramUrl = chartUrl ? getProxiedUrl(chartUrl) : null;

  const toggle = (view: PanelView) => {
    if (activeView === view) {
      setActiveView("none");
    } else {
      setActiveView(view);
      setIsLoading(true);
    }
  };

  return (
    <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="data-label">Airport References</p>
          {diagram && <p className="mt-1 text-xs text-aviation-muted">{diagram.procedureName}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {diagram && proxiedDiagramUrl && (
            <>
              <button
                className={`hidden sm:inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeView === "diagram"
                    ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-100"
                    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-300/50 hover:bg-cyan-500/15"
                }`}
                onClick={() => toggle("diagram")}
                type="button"
              >
                {activeView === "diagram" ? "Hide diagram" : "Airport diagram"}
              </button>
              <a
                className="sm:hidden inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200"
                href={chartUrl!}
                rel="noreferrer"
                target="_blank"
              >
                Diagram ↗
              </a>
            </>
          )}

          <button
            className={`hidden sm:inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeView === "supplement"
                ? "border-amber-300/50 bg-amber-500/20 text-amber-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-200 hover:border-amber-300/50 hover:bg-amber-500/15"
            }`}
            onClick={() => toggle("supplement")}
            type="button"
          >
            {activeView === "supplement" ? "Hide supplement" : "Chart Supplement"}
          </button>
          <a
            className="sm:hidden inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200"
            href={chartSupplementUrl}
            rel="noreferrer"
            target="_blank"
          >
            Chart Supplement ↗
          </a>
        </div>
      </div>

      {activeView !== "none" && (
        <div className="hidden sm:block overflow-hidden rounded-xl border border-aviation-border bg-black/20">
          <div className="relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-data text-xs tracking-[0.2em] text-cyan-100">
                  {activeView === "diagram" ? "LOADING DIAGRAM…" : "LOADING CHART SUPPLEMENT…"}
                </div>
              </div>
            )}
            <iframe
              className="h-[min(70vh,800px)] min-h-[500px] w-full bg-slate-950"
              key={activeView}
              onError={() => setIsLoading(false)}
              onLoad={() => setIsLoading(false)}
              src={activeView === "diagram" ? proxiedDiagramUrl! : proxiedSupplementUrl}
              title={activeView === "diagram" ? "Airport Diagram" : "FAA Chart Supplement"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
