import { formatTimestamp } from "@/lib/utils";
import type { Notam } from "@/types/aviation";

type NotamListProps = {
  notams: Notam[];
};

const TYPE_PRIORITY: Record<Notam["type"], number> = {
  TFR: 0,
  FDC: 1,
  D: 2
};

const TYPE_TONE: Record<Notam["type"], string> = {
  TFR: "border-red-500/20 bg-red-500/10 text-red-200",
  FDC: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  D: "border-slate-500/20 bg-slate-500/10 text-slate-200"
};

export function NotamList({ notams }: NotamListProps) {
  const sortedNotams = [...notams].sort((left, right) => TYPE_PRIORITY[left.type] - TYPE_PRIORITY[right.type]);

  return (
    <div className="space-y-3">
      {sortedNotams.map((notam) => (
        <details key={notam.notamId} className="rounded-2xl border border-aviation-border bg-black/15">
          <summary className="cursor-pointer list-none px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${TYPE_TONE[notam.type]}`}>
                  {notam.type === "TFR" ? "TFR • HIGH PRIORITY" : `${notam.type} NOTAM`}
                </div>
                <div>
                  <p className="font-data text-sm text-aviation-text">{notam.notamId}</p>
                  <p className="mt-2 text-sm leading-6 text-aviation-muted">{notam.text.slice(0, 108)}...</p>
                </div>
              </div>

              <div className="grid gap-2 text-right">
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
            <p className="font-data text-sm leading-7 text-aviation-text">{notam.text}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
