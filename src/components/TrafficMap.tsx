import type { TrafficTarget } from "@/types/aviation";

type TrafficMapProps = {
  traffic: TrafficTarget[];
};

const getAltitudeTone = (altitudeFeet: number | null): string => {
  if (!altitudeFeet) {
    return "#94a3b8";
  }

  if (altitudeFeet < 5000) {
    return "#22c55e";
  }

  if (altitudeFeet < 10000) {
    return "#06b6d4";
  }

  return "#f59e0b";
};

const normalizeTraffic = (traffic: TrafficTarget[]) => {
  const positions = traffic
    .map((target) => target.position)
    .filter((position): position is NonNullable<TrafficTarget["position"]> => position !== null);

  if (!positions.length) {
    return [];
  }

  const latitudes = positions.map((position) => position.latitude);
  const longitudes = positions.map((position) => position.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return traffic.map((target) => {
    if (!target.position) {
      return { target, x: 160, y: 120 };
    }

    const x = ((target.position.longitude - minLon) / Math.max(maxLon - minLon, 0.0001)) * 240 + 30;
    const y = 210 - ((target.position.latitude - minLat) / Math.max(maxLat - minLat, 0.0001)) * 160;

    return { target, x, y };
  });
};

const AircraftGlyph = ({ trackDegrees }: { trackDegrees: number | null }) => (
  <g style={{ transform: `rotate(${trackDegrees ?? 0}deg)`, transformOrigin: "center" }}>
    <path d="M0 -10 3 -2 10 0 3 2 0 10 -3 2 -10 0 -3 -2Z" fill="currentColor" />
  </g>
);

export function TrafficMap({ traffic }: TrafficMapProps) {
  const normalizedTraffic = normalizeTraffic(traffic);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-aviation-border bg-black/20 p-3">
        <svg className="h-[260px] w-full" role="img" viewBox="0 0 320 240">
          <title>ADS-B traffic placeholder map</title>
          <rect fill="#050914" height="240" rx="18" width="320" />
          <circle cx="160" cy="120" fill="none" r="88" stroke="rgba(34,197,94,0.18)" />
          <circle cx="160" cy="120" fill="none" r="58" stroke="rgba(34,197,94,0.14)" />
          <circle cx="160" cy="120" fill="none" r="28" stroke="rgba(34,197,94,0.12)" />
          <path d="M160 18v204M24 120h272" stroke="rgba(34,197,94,0.12)" />
          <path d="M160 120 234 54" stroke="rgba(6,182,212,0.22)" strokeWidth="3" />
          {normalizedTraffic.map(({ target, x, y }) => (
            <g key={target.icao24} style={{ color: getAltitudeTone(target.altitudeFeet) }} transform={`translate(${x} ${y})`}>
              <AircraftGlyph trackDegrees={target.trackDegrees} />
              <text className="font-data" fill="#e2e8f0" fontSize="10" x="14" y="-2">
                {target.callsign ?? target.icao24.toUpperCase()}
              </text>
              <text className="font-data" fill="#94a3b8" fontSize="9" x="14" y="11">
                {target.altitudeFeet?.toLocaleString() ?? "UNK"} ft
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {traffic.map((target) => (
          <div key={`${target.icao24}-legend`} className="rounded-2xl border border-aviation-border bg-black/15 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-data text-sm text-aviation-text">{target.callsign ?? target.icao24.toUpperCase()}</p>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getAltitudeTone(target.altitudeFeet) }} />
            </div>
            <p className="mt-2 text-xs text-aviation-muted">
              {target.altitudeFeet?.toLocaleString() ?? "Unknown"} ft • {target.groundspeedKnots ?? "--"} kt
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
