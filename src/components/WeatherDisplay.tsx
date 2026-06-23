import { formatTimestamp } from "@/lib/utils";
import { toHHMMZ } from "@/components/AtisStrip";
import type { FlightCategory, TafForecastGroup, WeatherBundle } from "@/types/aviation";

/** Extended type to accept Aaron's upcoming weather staleness contract fields gracefully. */
type WeatherBundleWithStaleness = WeatherBundle & {
  observedAt?: string;
  ageMinutes?: number;
  stale?: boolean;
};

type WeatherDisplayProps = {
  weather: WeatherBundleWithStaleness;
};

const FLIGHT_CATEGORY_TONE: Record<FlightCategory, string> = {
  VFR: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  MVFR: "border-sky-500/20 bg-sky-500/10 text-sky-200",
  IFR: "border-red-500/20 bg-red-500/10 text-red-200",
  LIFR: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-200",
  UNKNOWN: "border-slate-500/20 bg-slate-500/10 text-slate-200"
};

const formatCeiling = (ceilingFeet: number | null | undefined): string =>
  ceilingFeet ? `${ceilingFeet.toLocaleString()} ft` : "Unspecified";

const formatVisibility = (visibility: number | null | undefined): string =>
  visibility ? `${visibility} SM` : "Unknown";

const formatWind = (directionDegrees: number | null, speedKnots: number, gustKnots?: number): string => {
  const direction = directionDegrees ? directionDegrees.toString().padStart(3, "0") : "VRB";
  const gust = gustKnots ? `G${gustKnots}` : "";
  return `${direction}° / ${speedKnots}KT${gust}`;
};

const WindArrow = ({ heading }: { heading: number | null | undefined }) => (
  <svg
    aria-hidden="true"
    className="h-10 w-10 text-aviation-green"
    fill="none"
    style={{ transform: `rotate(${heading ?? 0}deg)` }}
    viewBox="0 0 40 40"
  >
    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeOpacity="0.28" />
    <path d="M20 9v18m0-18-4.5 5M20 9l4.5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

const ForecastBlock = ({ group }: { group: TafForecastGroup }) => (
  <div className="rounded-2xl border border-aviation-border bg-black/15 p-3">
  <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="font-data text-xs text-cyan-300">{group.groupType}</span>
      <span className="font-data text-xs text-aviation-muted">{formatTimestamp(group.validFrom)}</span>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div>
        <p className="data-label">Wind</p>
        <p className="break-words data-readout">{group.wind ? formatWind(group.wind.directionDegrees, group.wind.speedKnots) : "Calm / N/A"}</p>
      </div>
      <div>
        <p className="data-label">Ceiling / Vis</p>
        <p className="break-words data-readout">
          {formatCeiling(group.ceiling?.minimumBrokenOrOvercastFeetAgl)} • {formatVisibility(group.visibility?.prevailingStatuteMiles)}
        </p>
      </div>
    </div>
  </div>
);

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const metar = weather.metar;
  const taf = weather.taf;
  const staleWeather = weather.stale === true;
  const observedHHMM = toHHMMZ(metar?.observedAt ?? null);

  if (!metar) {
    return <div className="text-sm text-aviation-muted">No METAR staged for this preview.</div>;
  }

  return (
    <div className="space-y-5">
      {weather.nearestStationNote ? (
        <div className="rounded-xl border border-aviation-amber/30 bg-aviation-amber/10 px-4 py-2.5 text-sm text-aviation-amber">
          ⚠ {weather.nearestStationNote}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[auto,1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-aviation-border bg-black/15 p-4">
          <WindArrow heading={metar.wind?.directionDegrees} />
          <p className="mt-3 data-label">Surface Wind</p>
          <p className="mt-2 break-words text-center data-readout">{metar.wind ? formatWind(metar.wind.directionDegrees, metar.wind.speedKnots, metar.wind.gustKnots) : "Unavailable"}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-aviation-border bg-black/15 p-4">
            <p className="data-label">Flight Category</p>
            <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${FLIGHT_CATEGORY_TONE[metar.flightCategory]}`}>
              {metar.flightCategory}
            </div>
          </div>
          <div className="rounded-2xl border border-aviation-border bg-black/15 p-4">
            <p className="data-label">Visibility</p>
            <p className="mt-3 data-readout">{formatVisibility(metar.visibility?.prevailingStatuteMiles)}</p>
          </div>
          <div className="rounded-2xl border border-aviation-border bg-black/15 p-4">
            <p className="data-label">Ceiling</p>
            <p className="mt-3 data-readout">{formatCeiling(metar.ceiling?.minimumBrokenOrOvercastFeetAgl)}</p>
          </div>
          <div className="rounded-2xl border border-aviation-border bg-black/15 p-4">
            <p className="data-label">Temp / Dewpoint</p>
            <p className="mt-3 data-readout">
              {metar.temperatureC ?? "--"}°C / {metar.dewpointC ?? "--"}°C
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${staleWeather ? "border-amber-400/30 bg-amber-500/5 ring-2 ring-amber-400/70" : "border-aviation-border bg-black/15"}`}>
        {staleWeather && (
          <p className="mb-2 text-xs font-semibold text-amber-300" role="alert">
            ⚠ METAR observation{weather.ageMinutes != null ? ` ${weather.ageMinutes} min old` : ""} — verify against live source.{" "}
            <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300" aria-label="Stale METAR">
              STALE
            </span>
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="data-label">Latest METAR</p>
            <p className="mt-2 break-words font-data text-sm leading-7 text-aviation-text">{metar.rawText}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`shrink-0 rounded-full border px-3 py-1 font-data text-xs ${staleWeather ? "border-amber-400/30 bg-amber-500/10 text-amber-300" : "border-aviation-border bg-black/20 text-aviation-muted"}`}>
              Observed {observedHHMM ?? formatTimestamp(metar.observedAt)}
            </div>
            <div className="shrink-0 rounded-full border border-aviation-border bg-black/20 px-3 py-1 font-data text-xs text-aviation-muted">
              Checked {new Date(weather.fetchedAt).toISOString().slice(11, 16)}Z
            </div>
          </div>
        </div>
      </div>

      {taf ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="data-label">TAF Trend</p>
            <span className="font-data text-xs text-aviation-muted">{formatTimestamp(taf.issuedAt)}</span>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {taf.forecastGroups.slice(0, 2).map((group) => (
              <ForecastBlock key={`${group.groupType}-${group.validFrom}`} group={group} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
