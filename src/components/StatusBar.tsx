import { formatRelativeTime, formatTimestamp } from "@/lib/utils";
import type { SourceStatusItem } from "@/data/demo-results";

type StatusBarProps = {
  sources: SourceStatusItem[];
  warnings: string[];
  referenceTime: string;
  liveStatus?: string | null;
};

const STATUS_DOT: Record<SourceStatusItem["status"], string> = {
  online: "bg-aviation-green",
  standby: "bg-aviation-amber",
  degraded: "bg-aviation-red"
};

export function StatusBar({ sources, warnings, referenceTime, liveStatus }: StatusBarProps) {
  return (
    <footer className="sticky bottom-0 z-30 mt-auto border-t border-aviation-border/80 bg-[#08101d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 lg:px-8">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2 text-xs text-aviation-muted">
            {liveStatus ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-aviation-green" />
                <span>{liveStatus}</span>
              </div>
            ) : null}
            {sources.map((source) => (
              <div
                key={source.id}
                className="inline-flex items-center gap-2 rounded-full border border-aviation-border bg-aviation-panelAlt px-3 py-1.5"
                title={`${source.label} • ${formatTimestamp(source.fetchedAt)}`}
              >
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[source.status]}`} />
                <span className="text-aviation-text">{source.label}</span>
                <span className="hidden text-slate-600 md:inline">/</span>
                <span className="font-data hidden md:inline">{formatRelativeTime(source.fetchedAt, referenceTime)}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {warnings.length ? (
              warnings.map((warning) => (
                <div
                  key={warning}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-amber-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-aviation-amber" />
                  <span>{warning}</span>
                </div>
              ))
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-aviation-green" />
                <span>Sources within expected refresh windows.</span>
              </div>
            )}
          </div>
        </div>

        <div className="hidden grid-cols-4 gap-3 xl:grid">
          {sources.map((source) => (
            <div key={`${source.id}-detail`} className="truncate text-xs text-aviation-muted">
              <span className="text-aviation-text">{source.label}:</span> {source.detail}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
