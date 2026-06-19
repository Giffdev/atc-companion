import { SourceBadge } from "@/components/SourceBadge";
import type { DataSource } from "@/types/api";

type ResultKind = "weather" | "notam" | "traffic" | "navigation" | "frequency" | "plates" | "regulatory" | "facility";

type ResultCardProps = {
  kind: ResultKind;
  title: string;
  subtitle: string;
  source: DataSource;
  fetchedAt: string;
  isStale?: boolean;
  stalenessWarning?: string;
  rawData?: unknown;
  referenceTime?: string;
  isActive?: boolean;
  className?: string;
  children: React.ReactNode;
};

const KIND_STYLES: Record<
  ResultKind,
  {
    label: string;
    pillClassName: string;
    icon: React.ReactNode;
  }
> = {
  weather: {
    label: "WEATHER",
    pillClassName: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M6 16.5A4.5 4.5 0 0 1 6.9 7.6a5.5 5.5 0 0 1 10.66 1.9A3.8 3.8 0 1 1 18 17H6Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  notam: {
    label: "NOTAM",
    pillClassName: "border-amber-500/25 bg-amber-500/10 text-amber-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 21 19H3L12 3Zm0 6.75v3.75m0 3.75h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    )
  },
  traffic: {
    label: "TRAFFIC",
    pillClassName: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="m11.5 3 2.3 6.7 5.7 2.3-5.7 2.3-2.3 6.7-2.3-6.7L3.5 12l5.7-2.3L11.5 3Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  navigation: {
    label: "NAVIGATION",
    pillClassName: "border-teal-500/25 bg-teal-500/10 text-teal-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 3 15.5 20 12 16.5 8.5 20 12 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    )
  },
  frequency: {
    label: "FREQUENCY",
    pillClassName: "border-sky-500/25 bg-sky-500/10 text-sky-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M7 9.5a7 7 0 0 1 10 0M4 6.5a11 11 0 0 1 16 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    )
  },
  plates: {
    label: "PLATES",
    pillClassName: "border-violet-500/25 bg-violet-500/10 text-violet-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M7 4.75h7.5L18 8.25V19a1.25 1.25 0 0 1-1.25 1.25h-9.5A1.25 1.25 0 0 1 6 19V6A1.25 1.25 0 0 1 7.25 4.75Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14.5 4.75V8.5H18M8.75 12h6.5M8.75 15.5h6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    )
  },
  regulatory: {
    label: "REGULATORY",
    pillClassName: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 4 5 7.5V11c0 4.22 2.9 8.15 7 9 4.1-.85 7-4.78 7-9V7.5L12 4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 12.25 11 13.75l3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    )
  },
  facility: {
    label: "FACILITY",
    pillClassName: "border-slate-400/25 bg-slate-500/10 text-slate-300",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1.5M13.5 9H15M9 12.5h1.5M13.5 12.5H15M9 16h1.5M13.5 16H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    )
  }
};

export function ResultCard({
  kind,
  title,
  subtitle,
  source,
  fetchedAt,
  isStale,
  stalenessWarning,
  rawData,
  referenceTime,
  isActive,
  className,
  children
}: ResultCardProps) {
  const style = KIND_STYLES[kind];

  return (
    <article
      className={[
        "aviation-panel focus-line flex h-full flex-col gap-5 p-5 md:p-6",
        isActive ? "border-cyan-400/45 shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_20px_48px_rgba(8,47,73,0.35)]" : "",
        className ?? ""
      ].join(" ")}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-[0.24em] ${style.pillClassName}`}>
            {style.icon}
            <span>{style.label}</span>
          </div>
          <div>
            <h2 className="break-words text-xl font-semibold text-aviation-text md:text-2xl">{title}</h2>
            <p className="mt-1 break-words text-sm leading-6 text-aviation-muted">{subtitle}</p>
          </div>
        </div>
        <SourceBadge fetchedAt={fetchedAt} isStale={isStale} referenceTime={referenceTime} source={source} />
      </header>

      {isStale && stalenessWarning ? (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {stalenessWarning}
        </div>
      ) : null}

      <div className="flex-1">{children}</div>

      {rawData ? (
        <details className="rounded-2xl border border-aviation-border bg-black/20">
          <summary className="min-h-[44px] cursor-pointer list-none px-4 py-3 text-sm font-medium text-aviation-muted">
            Reveal raw data
          </summary>
          <pre className="max-h-72 overflow-auto border-t border-aviation-border px-4 py-3 font-data text-xs leading-6 text-slate-300">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  );
}
