"use client";

import { useState } from "react";

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
const MAP_CENTER_X = SVG_WIDTH / 2;
const MAP_CENTER_Y = SVG_HEIGHT / 2;
const OUTER_RING_RADIUS = 90;
const PLOT_RADIUS = OUTER_RING_RADIUS * 0.85;
const DEFAULT_VISIBLE_RANGE_NM = 8;

type NormalizedTarget = { target: TrafficTarget; x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeTraffic = (
  traffic: TrafficTarget[],
  zoom: number,
  anchorPosition?: { latitude: number; longitude: number }
): { targets: NormalizedTarget[]; airportPx: { x: number; y: number } | null; nmPerPx: number } => {
  const positions = traffic
    .map((target) => target.position)
    .filter((position): position is NonNullable<typeof position> => position !== null);

  if (!anchorPosition && positions.length === 0) {
    return { targets: [], airportPx: null, nmPerPx: 0 };
  }

  const referencePosition = anchorPosition ?? {
    latitude: positions.reduce((sum, position) => sum + position.latitude, 0) / positions.length,
    longitude: positions.reduce((sum, position) => sum + position.longitude, 0) / positions.length
  };

  const cosLatitude = Math.cos((referencePosition.latitude * Math.PI) / 180);
  const targetVectors = traffic.map((target) => {
    if (!target.position) {
      return { target, distanceNm: 0, xNm: 0, yNm: 0 };
    }

    const yNm = (target.position.latitude - referencePosition.latitude) * 60;
    const xNm = (target.position.longitude - referencePosition.longitude) * 60 * cosLatitude;

    return {
      target,
      distanceNm: Math.hypot(xNm, yNm),
      xNm,
      yNm
    };
  });

  const farthestTargetNm = targetVectors.reduce((maxDistance, { distanceNm }) => Math.max(maxDistance, distanceNm), 0);
  const baseVisibleRangeNm = Math.max(DEFAULT_VISIBLE_RANGE_NM, farthestTargetNm / 0.85);
  const visibleRangeNm = Math.max(1, baseVisibleRangeNm / zoom);
  const nmPerPx = visibleRangeNm / OUTER_RING_RADIUS;
  const pxPerNm = PLOT_RADIUS / visibleRangeNm;

  const targets = targetVectors
    .filter(({ target, distanceNm }) => !target.position || distanceNm <= visibleRangeNm)
    .map(({ target, xNm, yNm }) => ({
      target,
      x: MAP_CENTER_X + xNm * pxPerNm,
      y: MAP_CENTER_Y - yNm * pxPerNm
    }));

  return {
    targets,
    airportPx: { x: MAP_CENTER_X, y: MAP_CENTER_Y },
    nmPerPx
  };
};

const AircraftGlyph = ({ trackDegrees }: { trackDegrees: number | null }) => (
  <g style={{ transform: `rotate(${trackDegrees ?? 0}deg)`, transformOrigin: "center" }}>
    <path d="M0,-11 L4.5,10 L0,6.5 L-4.5,10 Z" fill="currentColor" stroke="rgba(15,23,42,0.9)" strokeWidth="1.2" />
  </g>
);

export function TrafficMap({ traffic, airportIcao, airportPosition }: TrafficMapProps) {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const { targets: normalizedTraffic, airportPx, nmPerPx } = normalizeTraffic(traffic, zoom, airportPosition);
  const hoveredTraffic = normalizedTraffic.find(({ target }) => target.icao24 === hoveredTarget) ?? null;

  const ringNm = nmPerPx > 0 ? (OUTER_RING_RADIUS * nmPerPx).toFixed(0) : "";

  const resetView = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setHoveredTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-aviation-border bg-black/20 p-3">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-data text-xs text-aviation-muted">
              {zoom}x{ringNm ? ` · ~${ringNm} NM outer ring` : ""}
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
          className="h-[260px] w-full touch-none"
          onPointerDown={() => setHoveredTarget(null)}
          role="img"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        >
          <title>ADS-B traffic map{airportIcao ? ` centered on ${airportIcao}` : ""}</title>
          <rect fill="#050914" height={SVG_HEIGHT} rx="18" width={SVG_WIDTH} />

          {/* Range rings — centered on airport or SVG center */}
          {(() => {
            const cx = airportPx?.x ?? MAP_CENTER_X;
            const cy = airportPx?.y ?? MAP_CENTER_Y;
            return (
              <>
                <circle cx={cx} cy={cy} fill="none" r="90" stroke="rgba(34,197,94,0.15)" strokeDasharray="4 3" />
                <circle cx={cx} cy={cy} fill="none" r="60" stroke="rgba(34,197,94,0.12)" strokeDasharray="4 3" />
                <circle cx={cx} cy={cy} fill="none" r="30" stroke="rgba(34,197,94,0.10)" strokeDasharray="4 3" />
                <path d={`M${cx} ${cy - OUTER_RING_RADIUS}v${OUTER_RING_RADIUS * 2}`} stroke="rgba(34,197,94,0.10)" />
                <path d={`M${cx - OUTER_RING_RADIUS} ${cy}h${OUTER_RING_RADIUS * 2}`} stroke="rgba(34,197,94,0.10)" />
              </>
            );
          })()}

          {/* Compass labels */}
          {(() => {
            const cx = airportPx?.x ?? MAP_CENTER_X;
            const cy = airportPx?.y ?? MAP_CENTER_Y;
            return (
              <>
                <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="middle" x={cx} y={Math.max(10, cy - OUTER_RING_RADIUS - 6)}>N</text>
                <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="middle" x={cx} y={Math.min(SVG_HEIGHT - 4, cy + OUTER_RING_RADIUS + 14)}>S</text>
                <text fill="rgba(34,197,94,0.35)" fontSize="12" textAnchor="end" x={Math.max(10, cx - OUTER_RING_RADIUS - 6)} y={cy + 3}>W</text>
                <text fill="rgba(34,197,94,0.35)" fontSize="12" x={Math.min(SVG_WIDTH - 10, cx + OUTER_RING_RADIUS + 6)} y={cy + 3}>E</text>
              </>
            );
          })()}

          {/* Airport reference marker */}
          {airportPx && (airportPosition || airportIcao) && (
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
          {normalizedTraffic.map(({ target, x, y }) => {
            const isHovered = hoveredTarget === target.icao24;
            return (
              <g
                key={target.icao24}
                style={{ color: getAltitudeTone(target.altitudeFeet) }}
                transform={`translate(${x} ${y})`}
                onPointerEnter={() => setHoveredTarget(target.icao24)}
                onPointerLeave={() => setHoveredTarget(null)}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  setHoveredTarget(target.icao24);
                }}
                className="cursor-pointer"
              >
                <circle r="14" fill="transparent" />
                <AircraftGlyph trackDegrees={target.trackDegrees} />
                {isHovered && <circle r="16" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />}
              </g>
            );
          })}

          {hoveredTraffic && (() => {
            const label = hoveredTraffic.target.callsign ?? hoveredTraffic.target.icao24.toUpperCase();
            const detail = `${hoveredTraffic.target.altitudeFeet?.toLocaleString() ?? "UNK"} ft · ${hoveredTraffic.target.groundspeedKnots ?? "--"} kt`;
            const tooltipWidth = Math.max(116, Math.max(label.length * 7.2 + 20, detail.length * 6.4 + 20));
            const tooltipHeight = 40;
            const tooltipX = clamp(
              hoveredTraffic.x + 14 > SVG_WIDTH - tooltipWidth - 8 ? hoveredTraffic.x - tooltipWidth - 14 : hoveredTraffic.x + 14,
              8,
              SVG_WIDTH - tooltipWidth - 8
            );
            const tooltipY = clamp(hoveredTraffic.y - tooltipHeight - 12, 8, SVG_HEIGHT - tooltipHeight - 8);

            return (
              <g pointerEvents="none">
                <rect
                  x={tooltipX}
                  y={tooltipY}
                  width={tooltipWidth}
                  height={tooltipHeight}
                  rx="6"
                  fill="#0f172a"
                  fillOpacity="0.95"
                  stroke="rgba(34,197,94,0.35)"
                  strokeWidth="0.75"
                />
                <text className="font-data" fill="#e2e8f0" fontSize="11" x={tooltipX + 10} y={tooltipY + 15}>
                  {label}
                </text>
                <text className="font-data" fill="#94a3b8" fontSize="10" x={tooltipX + 10} y={tooltipY + 29}>
                  {detail}
                </text>
              </g>
            );
          })()}

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
          <span className="w-full sm:ml-auto sm:w-auto">Hover or tap a target for details</span>
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
