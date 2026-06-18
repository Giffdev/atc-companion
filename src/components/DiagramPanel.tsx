"use client";

import { useState } from "react";
import type { ApproachPlate } from "@/types/aviation";
import { toFaaCode } from "@/data/airports";

interface DiagramPanelProps {
  diagram: ApproachPlate;
  airportCode: string;
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

export function DiagramPanel({ diagram, airportCode }: DiagramPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chartUrl = diagram.pdfUrl ?? diagram.chartUrl;
  const proxiedUrl = getProxiedUrl(chartUrl);
  const faaCode = toFaaCode(airportCode);
  const chartSupplementUrl = `https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=${faaCode}`;

  return (
    <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="data-label">Airport Diagram</p>
          <p className="mt-1 text-sm text-aviation-text">{diagram.procedureName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Desktop: toggle inline view */}
          <button
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
            onClick={() => { setExpanded(!expanded); setIsLoading(true); }}
            type="button"
          >
            {expanded ? "Hide diagram" : "View diagram"}
          </button>
          {/* Mobile: open in new tab */}
          <a
            className="sm:hidden inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
            href={chartUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open diagram ↗
          </a>
          <a
            className="inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-amber-300/50 hover:bg-amber-500/15"
            href={chartSupplementUrl}
            rel="noreferrer"
            target="_blank"
          >
            Chart Supplement ↗
          </a>
        </div>
      </div>

      {/* Inline iframe on desktop */}
      {expanded && (
        <div className="hidden sm:block overflow-hidden rounded-xl border border-aviation-border bg-black/20">
          <div className="relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-data text-xs tracking-[0.2em] text-cyan-100">
                  LOADING DIAGRAM…
                </div>
              </div>
            )}
            <iframe
              className="h-[min(70vh,800px)] min-h-[500px] w-full bg-slate-950"
              onError={() => setIsLoading(false)}
              onLoad={() => setIsLoading(false)}
              src={proxiedUrl}
              title={`${diagram.procedureName} Airport Diagram`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
