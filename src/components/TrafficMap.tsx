"use client";

import { useCallback, useRef, useState } from "react";

import type { TrafficTarget } from "@/types/aviation";

type TrafficMapProps = {
  traffic: TrafficTarget[];
  airportIcao?: string;
  airportPosition?: { latitude: number; longitude: number };
};

const getAltitudeTone = (altitudeFeet: number | null): string => {
  if (!altitudeFeet) return "#94a3b8";
  if (altitudeFeet < 3000) return "#22c55e";   // Green — pattern altitude
  if (altitudeFeet < 6000) return "#06b6d4";   // Cyan — low approach
  if (altitudeFeet < 10000) return "#3b82f6";  // Blue — mid
  return "#f59e0b";                            // Amber — high
};

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2, 3] as const;
const DEFAULT_ZOOM_INDEX = 2;

const SVG_WIDTH = 320;
const SVG_HEIGHT = 240;
const PADDING = 30;

type NormalizedTarget = { target: TrafficTarget; x: number; y: number };

const normalizeTraffic = (
  traffic: TrafficTarget[],
  zoom: number,
  panOffset: { x: number; y: number },
  anchorPosition?: { latitude: number; longitude: number }
): { targets: NormalizedTarget[]; airportPx: { x: number; y: number } | null; nmPerPx: number } => {
  const positions = traffic
    .map((t) => t.position)
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Determine center — prefer airport position, fall back to traffic centroid
  let centerLat: number;
  let centerLon: number;

  if (anchorPosition) {
    centerLat = anchorPosition.latitude;
    centerLon = anchorPosition.longitude;
  } else if (positions.length) {
    const lats = positions.map((p) => p.latitude);
    const lons = positions.map((p) => p.longitude);
    centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  } else {
    return { targets: [], airportPx: null, nmPerPx: 0 };
  }

  // Apply pan offset (in degrees)
  centerLat -= panOffset.y;
  centerLon += panOffset.x;

  // Compute span to fit all traffic, then apply zoom
  let spanLat = 0.15; // ~9 NM default
  let spanLon = 0.20;

  if (positions.length) {
    const lats = positions.map((p) => p.latitude);
    const lons = positions.map((p) => p.longitude);
    spanLat = Math.max(Math.max(...lats) - Math.min(...lats), 0.08);
    spanLon = Math.max(Math.max(...lons) - Math.min(...lons), 0.10);
    // Add padding
    spanLat *= 1.4;
    spanLon *= 1.4;
  }

  spanLat /= zoom;
  spanLon /= zoom;

  const usableW = SVG_WIDTH - 2 * PADDING;
  const usableH = SVG_HEIGHT - 2 * PADDING;
  const nmPerDegLat = 60;
  const nmPerPx = (spanLat * nmPerDegLat) / usableH;

  const toX = (lon: number) => PADDING + ((lon - (centerLon - spanLon / 2)) / spanLon) * usableW;
  const toY = (lat: number) => SVG_HEIGHT - PADDING - ((lat - (centerLat - spanLat / 2)) / spanLat) * usableH;

  const targets = traffic.map((target) => {
    if (!target.position) return { target, x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
    return { target, x: toX(target.position.longitude), y: toY(target.position.latitude) };
  });

  const airportPx = anchorPosition ? { x: toX(anchorPosition.longitude), y: toY(anchorPosition.latitude) } : null;

  return { targets, airportPx, nmPerPx };
};

const AircraftGlyph = ({ trackDegrees }: { trackDegrees: number | null }) => (
  <g style={{ transform: `rotate(${trackDegrees ?? 0}deg)`, transformOrigin: "center" }}>
    <path d="M0 -10 3 -2 10 0 3 2 0 10 -3 2 -10 0 -3 -2Z" fill="currentColor" />
  </g>
);

export function TrafficMap({ traffic, airportIcao, airportPosition }: TrafficMapProps) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const { targets: normalizedTraffic, airportPx, nmPerPx } = normalizeTraffic(traffic, zoom, panOffset, airportPosition);

  // Approximate NM for the range ring radii
  const ringRadiusPx = 60;
  const ringNm = nmPerPx > 0 ? (ringRadiusPx * nmPerPx).toFixed(0) : "";

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;

    const dx = (e.clientX - dragStart.current.x) * scaleX;
    const dy = (e.clientY - dragStart.current.y) * scaleY;

    // Convert pixel delta to degree offset (rough)
    const degPerPxX = 0.20 / (zoom * (SVG_WIDTH - 2 * PADDING));
    const degPerPxY = 0.15 / (zoom * (SVG_HEIGHT - 2 * PADDING));

    setPanOffset((prev) => ({
      x: prev.x - dx * degPerPxX,
      y: prev.y + dy * degPerPxY
    }));

    dragStart.current = { x: e.clientX, y: e.clientY };
  }, [zoom]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const resetView = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-aviation-border bg-black/20 p-3">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-data text-xs text-aviation-muted">
              {zoom}x{ringNm ? ` · ~${ringNm} NM ring` : ""}
            </span>
            {airportIcao && (
              <span className="font-data text-xs text-cyan-300">
                ⊕ {airportIcao}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-aviation-border bg-black/30 font-data text-sm text-aviation-muted transition hover:border-cyan-400/40 hover:text-cyan-200"
              onClick={resetView}
              title="Reset view"
              type="button"
            >
              ⟳
            </button>
            <button
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-aviation-border bg-black/30 font-data text-sm text-aviation-text transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:opacity-30"
              disabled={zoomIndex === 0}
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              title="Zoom out"
              type="button"
            >
              −
            </button>
            <button
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-aviation-border bg-black/30 font-data text-sm text-aviation-text transition hover:border-cyan-400/40 hover:text-cyan-200 disabled:opacity-30"
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
              title="Zoom in"
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <svg
          ref={svgRef}
          className="h-[260px] w-full cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="img"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        >
          <title>ADS-B traffic map{airportIcao ? ` centered on ${airportIcao}` : ""}</title>
          <rect fill="#050914" height={SVG_HEIGHT} rx="18" width={SVG_WIDTH} />

          {/* Range rings */}
          <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} fill="none" r="90" stroke="rgba(34,197,94,0.15)" strokeDasharray="4 3" />
          <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} fill="none" r="60" stroke="rgba(34,197,94,0.12)" strokeDasharray="4 3" />
          <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} fill="none" r="30" stroke="rgba(34,197,94,0.10)" strokeDasharray="4 3" />

          {/* Crosshair */}
          <path d={`M${SVG_WIDTH / 2} ${PADDING}v${SVG_HEIGHT - 2 * PADDING}`} stroke="rgba(34,197,94,0.10)" />
          <path d={`M${PADDING} ${SVG_HEIGHT / 2}h${SVG_WIDTH - 2 * PADDING}`} stroke="rgba(34,197,94,0.10)" />

          {/* Compass labels */}
          <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="middle" x={SVG_WIDTH / 2} y={PADDING - 4}>N</text>
          <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="middle" x={SVG_WIDTH / 2} y={SVG_HEIGHT - PADDING + 12}>S</text>
          <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="end" x={PADDING - 5} y={SVG_HEIGHT / 2 + 3}>W</text>
          <text fill="rgba(34,197,94,0.35)" fontSize="12" x={SVG_WIDTH - PADDING + 5} y={SVG_HEIGHT / 2 + 3}>E</text>

          {/* Airport reference marker */}
          {airportPx && (
            <g>
              {/* Runway-style cross */}
              <line x1={airportPx.x - 8} y1={airportPx.y} x2={airportPx.x + 8} y2={airportPx.y} stroke="#22c55e" strokeWidth="2" strokeOpacity="0.6" />
              <line x1={airportPx.x} y1={airportPx.y - 8} x2={airportPx.x} y2={airportPx.y + 8} stroke="#22c55e" strokeWidth="2" strokeOpacity="0.6" />
              <circle cx={airportPx.x} cy={airportPx.y} r="4" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.5" />
              <text fill="#22c55e" fillOpacity="0.7" fontSize="12" fontFamily="monospace" x={airportPx.x + 10} y={airportPx.y - 6}>
                {airportIcao}
              </text>
            </g>
          )}

          {/* Traffic targets */}
          {normalizedTraffic.map(({ target, x, y }) => (
            <g key={target.icao24} style={{ color: getAltitudeTone(target.altitudeFeet) }} transform={`translate(${x} ${y})`}>
              <AircraftGlyph trackDegrees={target.trackDegrees} />
              <text className="font-data" fill="#e2e8f0" fontSize="12" x="14" y="-2">
                {target.callsign ?? target.icao24.toUpperCase()}
              </text>
              <text className="font-data" fill="#94a3b8" fontSize="12" x="14" y="12">
                {target.altitudeFeet?.toLocaleString() ?? "UNK"} ft
              </text>
            </g>
          ))}

          {/* Empty state */}
          {normalizedTraffic.length === 0 && (
            <text fill="#64748b" fontSize="12" textAnchor="middle" x={SVG_WIDTH / 2} y={SVG_HEIGHT / 2}>
              No traffic targets
            </text>
          )}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-aviation-muted">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />{"<3k"}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#06b6d4" }} />3-6k</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />6-10k</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />{">10k ft"}</span>
          <span className="w-full sm:ml-auto sm:w-auto">Drag to pan</span>
        </div>
      </div>

      {traffic.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...traffic].sort((a, b) => (a.altitudeFeet ?? -1) - (b.altitudeFeet ?? -1)).map((target) => (
            <div key={`${target.icao24}-legend`} className="rounded-2xl border border-aviation-border bg-black/15 p-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate font-data text-sm text-aviation-text">{target.callsign ?? target.icao24.toUpperCase()}</p>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getAltitudeTone(target.altitudeFeet) }} />
              </div>
              <p className="mt-2 text-xs text-aviation-muted">
                {target.altitudeFeet?.toLocaleString() ?? "Unknown"} ft • {target.groundspeedKnots ?? "--"} kt
                {target.onGround ? " • GND" : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
