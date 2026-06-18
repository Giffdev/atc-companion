import { formatRelativeTime, formatTimestamp } from "@/lib/utils";
import type { DataSource } from "@/types/api";

type SourceBadgeProps = {
  source: Pick<DataSource, "name" | "url">;
  fetchedAt: string;
  isStale?: boolean;
  referenceTime?: string;
};

const getFreshnessTone = (fetchedAt: string, referenceTime?: string, isStale?: boolean): string => {
  if (isStale) {
    return "bg-aviation-red";
  }

  const referenceMs = referenceTime ? new Date(referenceTime).getTime() : Date.now();
  const ageMs = referenceMs - new Date(fetchedAt).getTime();

  if (ageMs > 15 * 60 * 1000) {
    return "bg-aviation-amber";
  }

  return "bg-aviation-green";
};

const isNavigableSource = (url: string): boolean => /^https?:\/\//u.test(url);

export function SourceBadge({ source, fetchedAt, isStale, referenceTime }: SourceBadgeProps) {
  const content = (
    <>
      <span className={`h-2.5 w-2.5 rounded-full ${getFreshnessTone(fetchedAt, referenceTime, isStale)}`} />
      <span className="truncate text-aviation-text">{source.name}</span>
      <span aria-hidden="true" className="text-slate-600">
        /
      </span>
      <time
        className="font-data text-[11px] text-aviation-muted"
        dateTime={fetchedAt}
        title={formatTimestamp(fetchedAt)}
      >
        {formatRelativeTime(fetchedAt, referenceTime)}
      </time>
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-2 rounded-full border border-aviation-border bg-aviation-panelAlt px-3 py-1.5 text-xs";

  if (!isNavigableSource(source.url)) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a className={className} href={source.url} rel="noreferrer" target="_blank" title={formatTimestamp(fetchedAt)}>
      {content}
    </a>
  );
}
