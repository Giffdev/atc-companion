"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { searchFacilities } from "@/data/facilities";
import type { ControllerFacility } from "@/types/facility";

type FacilitySelectorProps = {
  selectedFacility: ControllerFacility | null;
  onSelect: (facility: ControllerFacility | null) => void;
};

const GROUP_LABELS = {
  tower: "Towers",
  approach: "Approach",
  center: "Center"
} as const;

const FACILITY_TYPE_BADGE = {
  tower: "TWR",
  approach: "APP",
  center: "ARTCC"
} as const;

const facilityIcon = (facility: ControllerFacility | null): string => {
  if (!facility) {
    return "⌁";
  }

  switch (facility.type) {
    case "tower":
      return "🗼";
    case "approach":
      return "◉";
    case "center":
      return "⬢";
    default:
      return "⌁";
  }
};

export function FacilitySelector({ selectedFacility, onSelect }: FacilitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(() => searchFacilities(query).filter((facility) => facility.type === "tower" || facility.type === "approach" || facility.type === "center"), [query]);

  const groupedResults = useMemo(
    () => ({
      tower: results.filter((facility) => facility.type === "tower").slice(0, 12),
      approach: results.filter((facility) => facility.type === "approach").slice(0, 8),
      center: results.filter((facility) => facility.type === "center").slice(0, 8)
    }),
    [results]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <section className="aviation-panel relative z-20 px-4 py-4 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="data-label">Controller Facility</p>
          <p className="mt-1 text-sm text-aviation-muted">Set your working position to personalize queries like &ldquo;weather at my facility.&rdquo;</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFacility ? (
            <button
              className="rounded-full border border-aviation-border bg-black/20 px-3 py-1.5 text-xs text-aviation-muted transition hover:border-cyan-400/35 hover:text-cyan-200"
              onClick={() => onSelect(null)}
              type="button"
            >
              Clear
            </button>
          ) : null}
          <div className="relative" ref={containerRef}>
            <button
              aria-expanded={isOpen}
              className="flex min-w-[280px] items-center justify-between gap-3 rounded-2xl border border-aviation-border bg-[#0b1526] px-4 py-3 text-left transition hover:border-cyan-400/35"
              onClick={() => setIsOpen((current) => !current)}
              type="button"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium text-aviation-text">
                  <span aria-hidden="true">{facilityIcon(selectedFacility)}</span>
                  <span className="truncate">
                    {selectedFacility
                      ? selectedFacility.type === "center"
                        ? selectedFacility.name
                        : `${selectedFacility.primaryAirport ?? selectedFacility.id} ${selectedFacility.type === "approach" ? "Approach" : "Tower"}`
                      : "No facility selected"}
                  </span>
                </p>
                <p className="mt-1 truncate text-xs text-aviation-muted">
                  {selectedFacility ? `${selectedFacility.name}${selectedFacility.primaryAirport ? ` • ${selectedFacility.primaryAirport}` : ""}` : "Choose tower, approach, or center context"}
                </p>
              </div>
              <span className="font-data text-xs text-aviation-muted">{isOpen ? "CLOSE" : "SELECT"}</span>
            </button>

            {isOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[min(38rem,90vw)] rounded-3xl border border-aviation-border bg-[#08101d] p-4 shadow-2xl shadow-black/60">
                <div className="space-y-3">
                  <label className="block">
                    <span className="sr-only">Search facilities</span>
                    <input
                      autoFocus
                      className="h-12 w-full rounded-2xl border border-aviation-border bg-[#0b1526] px-4 font-data text-sm text-aviation-text placeholder:text-aviation-muted/70"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search by ICAO, airport, city, or type"
                      type="text"
                      value={query}
                    />
                  </label>

                  <div className="max-h-[26rem] space-y-4 overflow-y-auto pr-1">
                    {(Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((group) =>
                      groupedResults[group].length ? (
                        <div key={group} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="data-label">{GROUP_LABELS[group]}</p>
                            <span className="text-[11px] text-aviation-muted">{groupedResults[group].length} shown</span>
                          </div>
                          <div className="space-y-2">
                            {groupedResults[group].map((facility) => (
                              <button
                                key={facility.id}
                                className="w-full rounded-2xl border border-aviation-border bg-[#0d1a2e] px-4 py-3 text-left transition hover:border-cyan-400/35 hover:bg-cyan-500/10"
                                onClick={() => {
                                  onSelect(facility);
                                  setIsOpen(false);
                                  setQuery("");
                                }}
                                type="button"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-aviation-text">{facility.name}</p>
                                    <p className="mt-1 truncate font-data text-xs text-aviation-muted">
                                      {facility.id}
                                      {facility.primaryAirport ? ` • ${facility.primaryAirport}` : ""}
                                    </p>
                                  </div>
                                  <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] tracking-[0.18em] text-cyan-200">
                                    {FACILITY_TYPE_BADGE[group]}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}

                    {!results.length ? <p className="rounded-2xl border border-aviation-border bg-[#0d1a2e] px-4 py-4 text-sm text-aviation-muted">No facilities matched that search.</p> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
