"use client";

import { useEffect, useRef, useState } from "react";
import { AIRPORT_REFERENCES } from "@/data/airports";
import type { TrafficTarget } from "@/types/aviation";

type TrafficMapProps = {
  traffic: TrafficTarget[];
  airportIcao?: string;
  airportPosition?: { latitude: number; longitude: number };
  defaultRangeNm?: number;
};

const getAltitudeTone = (altitudeFeet: number | null): string => {
  if (!altitudeFeet) return "#94a3b8";
  if (altitudeFeet < 3000) return "#22c55e";
  if (altitudeFeet < 6000) return "#06b6d4";
  if (altitudeFeet < 10000) return "#3b82f6";
  return "#f59e0b";
};

const AIRCRAFT_SVG = (trackDeg: number, color: string) =>
  `<svg width="24" height="24" viewBox="-12 -12 24 24" xmlns="http://www.w3.org/2000/svg">
    <g transform="rotate(${trackDeg ?? 0})">
      <path d="M0,-9 L3.5,8 L0,5.5 L-3.5,8 Z" fill="${color}" stroke="#0f172a" stroke-width="1"/>
    </g>
  </svg>`;

export function TrafficMap({ traffic, airportIcao, airportPosition, defaultRangeNm = 10 }: TrafficMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<TrafficTarget | null>(null);

  const center: [number, number] = airportPosition
    ? [airportPosition.latitude, airportPosition.longitude]
    : traffic.length > 0 && traffic[0].position
      ? [traffic[0].position.latitude, traffic[0].position.longitude]
      : [39.8283, -98.5795];

  // Initialize map once (or when airport changes)
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        center,
        zoom: defaultRangeNm <= 10 ? 11 : defaultRangeNm <= 20 ? 10 : 9,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19
      }).addTo(map);

      if (airportPosition) {
        const airportIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;border:2px solid #22c55e;border-radius:50%;background:rgba(34,197,94,0.2);"></div>`,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([airportPosition.latitude, airportPosition.longitude], { icon: airportIcon })
          .addTo(map)
          .bindTooltip(airportIcao ?? "Airport", { permanent: true, direction: "right", className: "leaflet-tooltip-airport" });

        // Show other airports within the visible range
        const rangeDegreesLat = (defaultRangeNm * 1.15) / 60;
        const cosLat = Math.cos((airportPosition.latitude * Math.PI) / 180);
        const rangeDegreesLon = rangeDegreesLat / (cosLat || 1);

        const nearbyAirports = AIRPORT_REFERENCES.filter((apt) => {
          if (apt.icao === airportIcao) return false;
          const dLat = Math.abs(apt.latitude - airportPosition.latitude);
          const dLon = Math.abs(apt.longitude - airportPosition.longitude);
          return dLat <= rangeDegreesLat && dLon <= rangeDegreesLon;
        });

        const nearbyIcon = L.divIcon({
          html: `<div style="width:8px;height:8px;border:1.5px solid #94a3b8;border-radius:50%;background:rgba(148,163,184,0.15);"></div>`,
          className: "",
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        });

        nearbyAirports.forEach((apt) => {
          L.marker([apt.latitude, apt.longitude], { icon: nearbyIcon })
            .addTo(map)
            .bindTooltip(apt.icao, { permanent: true, direction: "right", className: "leaflet-tooltip-nearby", offset: [4, 0] });
        });
      }

      leafletMapRef.current = map;
    };

    initMap();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airportPosition?.latitude, airportPosition?.longitude]);

  // Update traffic markers without resetting map view
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      traffic.forEach((target) => {
        if (!target.position) return;
        const color = getAltitudeTone(target.altitudeFeet);
        const icon = L.divIcon({
          html: AIRCRAFT_SVG(target.trackDegrees ?? 0, color),
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([target.position.latitude, target.position.longitude], { icon })
          .addTo(map)
          .on("click", () => setSelectedTarget(target));

        const label = target.callsign ?? target.icao24.toUpperCase();
        marker.bindTooltip(
          `<strong>${label}</strong><br/>${target.altitudeFeet?.toLocaleString() ?? "UNK"} ft · ${target.groundspeedKnots ?? "--"} kt`,
          { direction: "top", className: "leaflet-tooltip-traffic" }
        );
        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [traffic]);

  const centerOnTarget = (target: TrafficTarget) => {
    if (!target.position || !leafletMapRef.current) return;
    leafletMapRef.current.panTo([target.position.latitude, target.position.longitude], { animate: true });
    setSelectedTarget(target);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-aviation-border bg-black/20">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <span className="font-data text-xs text-aviation-muted">
              {traffic.length} target{traffic.length !== 1 ? "s" : ""} · ~{defaultRangeNm} NM
            </span>
            {airportIcao && (
              <span className="font-data text-xs text-cyan-300">⊕ {airportIcao}</span>
            )}
          </div>
        </div>

        <div ref={mapRef} className="h-[320px] w-full sm:h-[400px]" />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs text-aviation-muted">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />{"<3k"}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#06b6d4" }} />3-6k</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />6-10k</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />{">10k ft"}</span>
          <span className="hidden sm:inline sm:ml-auto">Click a target for details</span>
        </div>
      </div>

      {/* Selected target detail */}
      {selectedTarget && (
        <div className="rounded-2xl border border-cyan-400/30 bg-black/30 p-3">
          <div className="flex items-center justify-between">
            <p className="font-data text-sm font-semibold text-aviation-text">
              {selectedTarget.callsign ?? selectedTarget.icao24.toUpperCase()}
            </p>
            <button
              className="text-xs text-aviation-muted hover:text-aviation-text"
              onClick={() => setSelectedTarget(null)}
              type="button"
            >✕</button>
          </div>
          <p className="mt-1 font-data text-xs text-aviation-muted">
            {selectedTarget.altitudeFeet?.toLocaleString() ?? "Unknown"} ft ·{" "}
            {selectedTarget.groundspeedKnots ?? "--"} kt ·{" "}
            HDG {selectedTarget.trackDegrees ?? "--"}° ·{" "}
            {selectedTarget.verticalRateFpm ? `${selectedTarget.verticalRateFpm > 0 ? "+" : ""}${selectedTarget.verticalRateFpm} fpm` : "level"}
            {selectedTarget.onGround ? " · GND" : ""}
          </p>
        </div>
      )}

      {/* Traffic list */}
      {traffic.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...traffic].sort((a, b) => (a.altitudeFeet ?? -1) - (b.altitudeFeet ?? -1)).map((target) => (
            <button
              key={`${target.icao24}-legend`}
              className="rounded-2xl border border-aviation-border bg-black/15 p-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
              onClick={() => centerOnTarget(target)}
              type="button"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate font-data text-sm text-aviation-text">{target.callsign ?? target.icao24.toUpperCase()}</p>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getAltitudeTone(target.altitudeFeet) }} />
              </div>
              <p className="mt-2 text-xs text-aviation-muted">
                {target.altitudeFeet?.toLocaleString() ?? "Unknown"} ft • {target.groundspeedKnots ?? "--"} kt
                {target.onGround ? " • GND" : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

