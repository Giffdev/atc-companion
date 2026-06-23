import { useEffect, useMemo, useState } from "react";

import { formatTimestamp } from "@/lib/utils";
import type { Notam, NotamCategory } from "@/types/aviation";
import { isNotamActive, isNotamUpcoming } from "@/services/notams";

type NotamListProps = {
  notams: Notam[];
  type_filter?: string;
};

/** Severity order for sorting within a group (lower = more severe). */
const CATEGORY_SEVERITY: Record<NotamCategory, number> = {
  AIRPORT_CLOSURE: 0,
  RUNWAY_CLOSURE: 1,
  TFR: 2,
  FDC: 3,
  NAV_OUTAGE: 4,
  OBSTACLE: 5,
  OTHER: 6
};

/** Tailwind classes for category chip (border + bg + text). */
export const CATEGORY_CHIP_TONE: Record<NotamCategory, string> = {
  AIRPORT_CLOSURE: "border-red-500/30 bg-red-500/15 text-red-200",
  RUNWAY_CLOSURE: "border-orange-500/30 bg-orange-500/15 text-orange-200",
  TFR: "border-amber-500/30 bg-amber-500/15 text-amber-200",
  FDC: "border-amber-600/20 bg-amber-600/10 text-amber-300",
  NAV_OUTAGE: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  OBSTACLE: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  OTHER: "border-slate-600/20 bg-slate-600/10 text-slate-300"
};

const CATEGORY_LABEL: Record<NotamCategory, string> = {
  AIRPORT_CLOSURE: "AD CLSD",
  RUNWAY_CLOSURE: "RWY CLSD",
  TFR: "TFR",
  FDC: "FDC",
  NAV_OUTAGE: "NAV OUTAGE",
  OBSTACLE: "OBSTACLE",
  OTHER: "NOTAM"
};

const sortActive = (a: Notam, b: Notam): number => {
  if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
  const catDiff = CATEGORY_SEVERITY[a.category] - CATEGORY_SEVERITY[b.category];
  if (catDiff !== 0) return catDiff;
  return Date.parse(a.effectiveAt) - Date.parse(b.effectiveAt);
};

const sortUpcoming = (a: Notam, b: Notam): number =>
  Date.parse(a.effectiveAt) - Date.parse(b.effectiveAt);

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

function NotamRow({ notam }: { notam: Notam }) {
  const chipClass = CATEGORY_CHIP_TONE[notam.category];
  const headline = notam.summary ?? CATEGORY_LABEL[notam.category];
  const alertBorder = notam.isCritical
    ? "border-red-500/30 bg-red-500/5"
    : "border-aviation-border bg-black/15";

  return (
    <details
      key={notam.notamId}
      className={`rounded-2xl border ${alertBorder}`}
      {...(notam.isCritical ? { "aria-live": "polite" } : {})}
    >
      <summary className="min-h-[44px] cursor-pointer list-none px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${chipClass}`}>
                {CATEGORY_LABEL[notam.category]}
              </span>
              {notam.isCritical && (
                <span className="inline-flex rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                  CRITICAL
                </span>
              )}
              <span className="font-data text-xs text-aviation-muted">{notam.affectedFacility}</span>
            </div>
            <p className={`font-data text-sm font-medium ${notam.isCritical ? "text-red-100" : "text-aviation-text"}`}>
              {headline}
            </p>
            <p className="break-words text-xs leading-5 text-aviation-muted">
              {notam.text.slice(0, 120)}{notam.text.length > 120 ? "…" : ""}
            </p>
          </div>

          <div className="grid gap-2 shrink-0 text-left lg:text-right">
            <div>
              <p className="data-label">Effective</p>
              <p className="font-data text-xs text-aviation-text">{formatTimestamp(notam.effectiveAt)}</p>
            </div>
            <div>
              <p className="data-label">Expires</p>
              <p className="font-data text-xs text-aviation-text">
                {notam.expiresAt ? formatTimestamp(notam.expiresAt) : "Until further notice"}
              </p>
            </div>
          </div>
        </div>
      </summary>

      <div className="border-t border-aviation-border px-4 py-4">
        <p className="mb-1 data-label">NOTAM ID: {notam.notamId}</p>
        <p className="break-words font-data text-sm leading-7 text-aviation-text">{notam.text}</p>
      </div>
    </details>
  );
}

export function NotamList({ notams, type_filter }: NotamListProps) {
  const notamEvaluationTimeMs = useNotamEvaluationTime();

  const { active, upcoming } = useMemo(() => {
    const filtered = type_filter
      ? notams.filter((n) => n.type === type_filter.toUpperCase())
      : notams;

    return {
      active: filtered.filter((n) => isNotamActive(n, notamEvaluationTimeMs)).sort(sortActive),
      upcoming: filtered.filter((n) => isNotamUpcoming(n, notamEvaluationTimeMs)).sort(sortUpcoming)
    };
  }, [notams, notamEvaluationTimeMs, type_filter]);

  if (active.length === 0 && upcoming.length === 0) {
    return (
      <p className="text-sm text-aviation-muted">No active NOTAMs.</p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="data-label">Active</p>
        {active.length === 0 ? (
          <p className="text-sm text-aviation-muted">No active NOTAMs.</p>
        ) : (
          active.map((notam) => <NotamRow key={notam.notamId} notam={notam} />)
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <p className="data-label">Upcoming</p>
          {upcoming.map((notam) => <NotamRow key={notam.notamId} notam={notam} />)}
        </div>
      )}
    </div>
  );
}
