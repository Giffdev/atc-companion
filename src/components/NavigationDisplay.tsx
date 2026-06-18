import type { NavigationResult } from "@/services/navigation";

type NavigationDisplayProps = {
  navigation: NavigationResult;
};

const ROUTE_WIDTH = 420;
const ROUTE_HEIGHT = 220;

const estimateMinutes = (distanceNm: number, speedKnots: number): string => ((distanceNm / speedKnots) * 60).toFixed(1);

const projectPoint = (
  latitude: number,
  longitude: number,
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
) => {
  const x = ((longitude - bounds.minLon) / Math.max(bounds.maxLon - bounds.minLon, 0.1)) * (ROUTE_WIDTH - 56) + 28;
  const y = ROUTE_HEIGHT - (((latitude - bounds.minLat) / Math.max(bounds.maxLat - bounds.minLat, 0.1)) * (ROUTE_HEIGHT - 56) + 28);
  return { x, y };
};

export function NavigationDisplay({ navigation }: NavigationDisplayProps) {
  const latitudes = [navigation.from.position.latitude, navigation.to.position.latitude];
  const longitudes = [navigation.from.position.longitude, navigation.to.position.longitude];
  const latitudePadding = Math.max(Math.abs(latitudes[0] - latitudes[1]) * 0.25, 0.8);
  const longitudePadding = Math.max(Math.abs(longitudes[0] - longitudes[1]) * 0.25, 0.8);
  const bounds = {
    minLat: Math.min(...latitudes) - latitudePadding,
    maxLat: Math.max(...latitudes) + latitudePadding,
    minLon: Math.min(...longitudes) - longitudePadding,
    maxLon: Math.max(...longitudes) + longitudePadding
  };

  const fromPoint = projectPoint(navigation.from.position.latitude, navigation.from.position.longitude, bounds);
  const toPoint = projectPoint(navigation.to.position.latitude, navigation.to.position.longitude, bounds);
  const midPoint = {
    x: (fromPoint.x + toPoint.x) / 2,
    y: (fromPoint.y + toPoint.y) / 2
  };
  const compassRotation = navigation.trueHeading - 90;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
          <p className="data-label">Mag heading</p>
          <p className="mt-2 font-data text-2xl text-aviation-text">{navigation.magneticHeading.toString().padStart(3, "0")}°</p>
        </div>
        <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
          <p className="data-label">True heading</p>
          <p className="mt-2 font-data text-2xl text-aviation-text">{navigation.trueHeading.toString().padStart(3, "0")}°</p>
        </div>
        <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
          <p className="data-label">Distance</p>
          <p className="mt-2 font-data text-2xl text-aviation-text">{navigation.distanceNm.toFixed(1)} NM</p>
          <p className="mt-1 text-xs text-aviation-muted">{navigation.distanceSm.toFixed(1)} statute miles</p>
        </div>
        <div className="rounded-2xl border border-aviation-border bg-black/15 px-4 py-3">
          <p className="data-label">Time enroute</p>
          <div className="mt-2 space-y-1 text-sm text-aviation-text">
            <p className="font-data">250 kt • {estimateMinutes(navigation.distanceNm, 250)} min</p>
            <p className="font-data">180 kt • {estimateMinutes(navigation.distanceNm, 180)} min</p>
            <p className="font-data">120 kt • {estimateMinutes(navigation.distanceNm, 120)} min</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
        <div className="rounded-3xl border border-aviation-border bg-black/20 p-4">
          <svg aria-label="Route schematic" className="h-auto w-full" viewBox={`0 0 ${ROUTE_WIDTH} ${ROUTE_HEIGHT}`}>
            <rect x="1" y="1" width={ROUTE_WIDTH - 2} height={ROUTE_HEIGHT - 2} rx="22" fill="rgba(2,6,23,0.55)" stroke="rgba(56,189,248,0.15)" />
            <path d={`M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`} stroke="rgba(34,211,238,0.9)" strokeWidth="3" strokeLinecap="round" />
            <circle cx={fromPoint.x} cy={fromPoint.y} r="7" fill="rgba(34,197,94,0.95)" />
            <circle cx={toPoint.x} cy={toPoint.y} r="7" fill="rgba(56,189,248,0.95)" />
            <text x={fromPoint.x + 10} y={fromPoint.y - 10} fill="#dbeafe" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, monospace">
              {navigation.from.icao}
            </text>
            <text x={toPoint.x + 10} y={toPoint.y - 10} fill="#dbeafe" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, monospace">
              {navigation.to.icao}
            </text>
            <text x={midPoint.x + 12} y={midPoint.y - 12} fill="#67e8f9" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, monospace">
              {navigation.magneticHeading.toString().padStart(3, "0")}°M • {navigation.distanceNm.toFixed(1)}NM
            </text>
            <text x="20" y="28" fill="#7dd3fc" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, monospace">
              N
            </text>
            <text x={ROUTE_WIDTH - 28} y={ROUTE_HEIGHT - 18} fill="#64748b" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, monospace">
              E
            </text>
            <text x="18" y={ROUTE_HEIGHT - 18} fill="#64748b" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, monospace">
              W
            </text>
            <text x={ROUTE_WIDTH / 2 - 4} y={ROUTE_HEIGHT - 18} fill="#64748b" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, monospace">
              S
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-aviation-border bg-black/20 p-4">
            <p className="data-label">Route</p>
            <p className="mt-2 font-data text-lg text-aviation-text">
              {navigation.from.icao} → {navigation.to.icao}
            </p>
            <p className="mt-2 text-sm text-aviation-muted">{navigation.from.name} to {navigation.to.name}</p>
          </div>

          <div className="rounded-3xl border border-aviation-border bg-black/20 p-4">
            <p className="data-label">Compass rose</p>
            <div className="mt-4 flex items-center justify-center">
              <svg aria-label="Compass rose" height="160" viewBox="0 0 160 160" width="160">
                <circle cx="80" cy="80" r="58" fill="rgba(2,6,23,0.45)" stroke="rgba(56,189,248,0.2)" />
                <path d="M80 18V34M80 126V142M18 80H34M126 80H142" stroke="#64748b" strokeLinecap="round" strokeWidth="2" />
                <text x="76" y="16" fill="#7dd3fc" fontSize="12">N</text>
                <text x="76" y="154" fill="#64748b" fontSize="12">S</text>
                <text x="8" y="84" fill="#64748b" fontSize="12">W</text>
                <text x="146" y="84" fill="#64748b" fontSize="12">E</text>
                <g transform={`rotate(${compassRotation} 80 80)`}>
                  <path d="M80 28 L92 82 L80 72 L68 82 Z" fill="#22d3ee" />
                  <path d="M80 132 L92 78 L80 88 L68 78 Z" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
                </g>
              </svg>
            </div>
            <p className="mt-2 text-center font-data text-sm text-aviation-text">{navigation.trueHeading.toString().padStart(3, "0")}° true</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-aviation-muted">
        Calculated from FAA airport reference coordinates bundled with the app; magnetic heading uses an approximate declination model for controller vectoring.
      </p>
    </div>
  );
}
