import type { AtcReferenceCategory } from "@/data/atc-references";

export interface AimReference {
  id: string;
  chapter: string;
  category: AtcReferenceCategory;
  title: string;
  content: string;
  source: string;
  keywords: string[];
  relatedFarSections?: string[];
}

export const AIM_REFERENCES: AimReference[] = [
  {
    id: "aim-airport-lighting-aids",
    chapter: "2",
    category: "equipment",
    title: "AIM Chapter 2 - Airport lighting and visual aids",
    content:
      "AIM Chapter 2 explains the visual systems controllers and pilots reference around the runway environment: ALS, VASI, PAPI, REIL, runway edge lights, runway centerline lights, touchdown zone lights, land-and-hold-short lights, and Runway Status Lights. It also emphasizes that RWSL is an automated safety system and does not replace an ATC clearance.",
    source: "AIM 2-1-1 through 2-1-6",
    keywords: [
      "aim chapter 2",
      "airport lighting",
      "papi",
      "vasi",
      "reil",
      "runway status lights",
      "rwsl"
    ]
  },
  {
    id: "aim-controlled-airspace-overview",
    chapter: "3",
    category: "airspace",
    title: "AIM Chapter 3 - Controlled airspace overview",
    content:
      "AIM Chapter 3 summarizes controlled and uncontrolled airspace. It lays out Class A through E controlled airspace, Class G uncontrolled airspace, overlapping airspace hierarchy, and the communication/equipment expectations before entering Class B, C, or D airspace.",
    source: "AIM 3-1-1 through 3-2-4",
    keywords: [
      "aim chapter 3",
      "controlled airspace",
      "class a",
      "class b",
      "class c",
      "class d",
      "class e",
      "class g"
    ]
  },
  {
    id: "aim-basic-vfr-weather-minimums",
    chapter: "3",
    category: "weather-minima",
    title: "AIM Chapter 3 - Basic VFR weather minimums",
    content:
      "AIM 3-1-4 contains the controller-ready summary of basic VFR weather minima: Class B is 3 SM clear of clouds; Classes C, D, and E below 10,000 use 3 SM with 500 below, 1,000 above, and 2,000 horizontal; Class E at or above 10,000 uses 5 SM and 1-1-1; Class G varies by altitude and day/night.",
    source: "AIM 3-1-4",
    keywords: [
      "aim weather minima",
      "basic vfr weather minimums",
      "class b minima",
      "class g minima",
      "3-152"
    ],
    relatedFarSections: ["91.155"]
  },
  {
    id: "aim-radio-communications",
    chapter: "4",
    category: "phraseology",
    title: "AIM Chapter 4 - Radio communications and phraseology",
    content:
      "AIM 4-2 emphasizes that understanding is the core of pilot/controller communications. It covers initial contact format, acknowledgments, aircraft call signs, frequency changes, and the expectation that pilots read back critical runway, altitude, and vector instructions.",
    source: "AIM 4-2-1 through 4-2-7",
    keywords: [
      "aim chapter 4",
      "radio phraseology",
      "initial contact",
      "readback",
      "aircraft call sign"
    ]
  },
  {
    id: "aim-airport-operations",
    chapter: "4",
    category: "coordination",
    title: "AIM Chapter 4 - Airport operations and traffic patterns",
    content:
      "AIM 4-3 explains towered-airport communications, standard traffic-pattern legs, tower radar use, and controller/pilot expectations near airports. It reinforces that pilots need an appropriate clearance before landing at a towered airport and should avoid unexpected major maneuvers like an unannounced 360 in the pattern.",
    source: "AIM 4-3-2 through 4-3-5",
    keywords: [
      "airport operations",
      "traffic pattern",
      "downwind base final",
      "towered airport",
      "360 in the pattern"
    ]
  },
  {
    id: "aim-clearances-and-special-vfr",
    chapter: "4",
    category: "coordination",
    title: "AIM Chapter 4 - ATC clearances and Special VFR",
    content:
      "AIM 4-4 explains what an ATC clearance does and does not authorize, clarifies pilot responsibility, and summarizes Special VFR. Special VFR requires an ATC clearance, clear-of-clouds operation, and at least 1 SM visibility for fixed-wing aircraft; helicopters may operate clear of clouds with less than 1 SM.",
    source: "AIM 4-4-1 through 4-4-7",
    keywords: [
      "atc clearance",
      "special vfr",
      "svfr",
      "pilot responsibility",
      "clear of clouds"
    ],
    relatedFarSections: ["91.157"]
  },
  {
    id: "aim-departure-and-arrival-procedures",
    chapter: "5",
    category: "coordination",
    title: "AIM Chapter 5 - Departure and arrival procedures",
    content:
      "AIM Chapter 5 covers operational flow on SIDs, STARs, vectors to final, and published restrictions. It explains 'climb via SID' and 'descend via STAR' usage, reminds pilots that published speed restrictions remain mandatory unless canceled or amended by ATC, and describes how approach control vectors aircraft to the final approach course.",
    source: "AIM 5-2; AIM 5-4-1 through 5-4-4",
    keywords: [
      "sid",
      "star",
      "climb via",
      "descend via",
      "arrival procedure",
      "departure procedure",
      "vector to final"
    ]
  },
  {
    id: "aim-holding-clearances",
    chapter: "4",
    category: "coordination",
    title: "AIM holding clearances",
    content:
      "AIM 4-4-3 explains the elements of a holding clearance: the fix, direction, radial/course, leg length or time, altitude, and EFC when delay is expected. If the holding pattern is charted and the controller says 'as published,' the pilot is expected to hold as charted unless further instructions are issued.",
    source: "AIM 4-4-3",
    keywords: ["holding", "hold as published", "efc", "holding instructions", "clearance limit"]
  },
  {
    id: "aim-wake-turbulence",
    chapter: "7",
    category: "separation",
    title: "AIM Chapter 7 - Wake turbulence",
    content:
      "AIM 7-4 explains how wake vortices form, why heavy/clean/slow aircraft produce the strongest wakes, how vortices sink and drift, and the avoidance techniques pilots use on departure, arrival, and en route. It complements JO 7110.65 separation tables with the operational why behind the spacing.",
    source: "AIM 7-4-1 through 7-4-8",
    keywords: [
      "aim chapter 7",
      "wake turbulence",
      "vortex behavior",
      "wake avoidance",
      "heavy clean slow"
    ]
  }
];
