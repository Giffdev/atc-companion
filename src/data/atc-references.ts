export interface AtcReference {
  id: string;
  category: AtcReferenceCategory;
  title: string;
  content: string;
  source: string;
  keywords: string[];
  relatedFarSections?: string[];
}

export type AtcReferenceCategory =
  | "separation"
  | "phraseology"
  | "speed-restrictions"
  | "weather-minima"
  | "light-signals"
  | "emergency"
  | "airspace"
  | "equipment"
  | "coordination";

export const ATC_REFERENCES: AtcReference[] = [
  {
    id: "radar-separation-minima",
    category: "separation",
    title: "Radar separation minima",
    content:
      "Radar minima are not one-size-fits-all. Under JO 7110.65BB 5-5-4, terminal radar is generally 3 NM within 40 NM of the antenna (or within 60 NM when using MSSR) and 5 NM beyond that; STARS multi-sensor mode is 5 NM. ERAM is generally 5 NM below FL600 and 10 NM at/above FL600, with 3 NM only in specifically authorized areas up to FL230.",
    source: "FAA Order JO 7110.65BB, 5-5-4",
    keywords: [
      "radar separation",
      "3 miles",
      "3 nm",
      "5 miles",
      "5 nm",
      "10 miles",
      "eram",
      "stars",
      "mssr",
      "terminal radar"
    ]
  },
  {
    id: "vertical-separation-minima",
    category: "separation",
    title: "Vertical separation minima",
    content:
      "The controller rule of thumb is 1,000 feet where standard RVSM-capable vertical separation applies, and 2,000 feet where it does not. In current U.S. operations that means 1,000 feet below FL290 and also within RVSM airspace FL290 through FL410 for properly equipped aircraft; 2,000 feet applies above FL410 or whenever RVSM cannot be applied.",
    source: "FAA Order JO 7110.65BB, Chapter 4 Vertical Separation; AIM 4-4-10 / 4-4-11",
    keywords: [
      "vertical separation",
      "1000 feet",
      "1000 ft",
      "2000 feet",
      "2000 ft",
      "rvsm",
      "fl290",
      "fl410"
    ]
  },
  {
    id: "wake-turbulence-separation",
    category: "separation",
    title: "Wake turbulence separation",
    content:
      "JO 7110.65BB 5-5-4 requires added spacing when one aircraft follows another's flight path. Key controller references: behind a super, a heavy needs 6 NM, a large 7 NM, and a small 8 NM when the super is at or below FL240 and below 250 knots; behind a heavy, a heavy needs 4 NM and a large or small needs 5 NM; a small behind a B757 needs 4 NM; a small landing behind a heavy on the same runway needs 6 NM at the threshold.",
    source: "FAA Order JO 7110.65BB, 5-5-4 g-h; AIM 7-4-6",
    keywords: [
      "wake turbulence",
      "heavy",
      "super",
      "b757",
      "small behind heavy",
      "wake separation",
      "caution wake turbulence"
    ]
  },
  {
    id: "runway-crossing-and-arrival-separation",
    category: "separation",
    title: "Runway crossing and arrival/departure protection",
    content:
      "For runway crossings and other movement-area conflicts, JO 7110.65BB 3-7-2 requires controllers to protect the runway. During arrivals, a crossing must be completed before the arriving aircraft crosses the threshold, or the arrival must have completed the landing roll, acknowledged an exit/hold-short instruction, been seen exiting, or passed the crossing point. During departures, crossings wait until the controller observes the departure in a turn or past the crossing point unless another approved procedure applies.",
    source: "FAA Order JO 7110.65BB, 3-7-2",
    keywords: [
      "runway separation",
      "runway crossing",
      "arrival separation",
      "departure separation",
      "hold short",
      "cross runway"
    ]
  },
  {
    id: "approach-clearance-phraseology",
    category: "phraseology",
    title: "Approach clearance phraseology",
    content:
      "Approach clearances authorize the pilot to fly the named approach, not to descend below published minima. Standard U.S. phraseology uses forms such as 'cleared ILS runway two seven approach,' 'cleared RNAV runway one six approach,' or 'cleared visual approach runway three four.'",
    source: "FAA Order JO 7110.65BB, Chapter 4 Section 8; AIM 4-4-1",
    keywords: [
      "cleared for approach",
      "approach clearance",
      "cleared ils approach",
      "cleared visual approach",
      "instrument approach"
    ]
  },
  {
    id: "landing-clearance-phraseology",
    category: "phraseology",
    title: "Landing clearance phraseology",
    content:
      "A landing clearance is explicit. Standard tower phraseology is 'runway two seven, cleared to land.' Without the words 'cleared to land,' a landing clearance has not been issued even if the runway assignment or sequence has been given.",
    source: "FAA Order JO 7110.65BB, Airport Traffic Control phraseology; AIM 4-3-2",
    keywords: [
      "cleared to land",
      "landing clearance",
      "tower phraseology",
      "runway cleared to land"
    ]
  },
  {
    id: "line-up-and-wait",
    category: "phraseology",
    title: "Line up and wait",
    content:
      "The current FAA runway-entry phrase is 'line up and wait.' 'Position and hold' is obsolete in U.S. ATC phraseology. The instruction authorizes the aircraft to taxi onto the departure runway and hold in takeoff position pending takeoff clearance.",
    source: "FAA Order JO 7110.65BB, Pilot/Controller Glossary and runway operations phraseology",
    keywords: [
      "line up and wait",
      "position and hold",
      "luaw",
      "runway entry",
      "takeoff position"
    ]
  },
  {
    id: "go-around-phraseology",
    category: "phraseology",
    title: "Go around / missed approach instruction",
    content:
      "When a landing cannot continue safely, tower phraseology is direct and immediate: 'go around.' For IFR traffic already on an instrument approach, the pilot then flies the published missed approach unless ATC issues alternate instructions.",
    source: "FAA Order JO 7110.65BB, Airport Traffic Control phraseology; AIM 5-4-21",
    keywords: ["go around", "missed approach", "abort landing", "tower go around"]
  },
  {
    id: "hold-short-phraseology",
    category: "phraseology",
    title: "Hold short and runway crossing phraseology",
    content:
      "Taxi instructions must include explicit hold-short and crossing language. JO 7110.65BB 3-7-2 requires a specific crossing clearance for each runway crossed unless an approved multiple-crossing procedure applies. Pilots must read back runway hold short instructions.",
    source: "FAA Order JO 7110.65BB, 3-7-2",
    keywords: [
      "hold short",
      "cross runway",
      "runway crossing clearance",
      "read back hold short",
      "taxi hold short"
    ]
  },
  {
    id: "taxi-instruction-phraseology",
    category: "phraseology",
    title: "Taxi instruction phraseology",
    content:
      "Taxi clearances use 'taxi,' 'proceed,' or 'hold'—not 'cleared.' Controllers must issue a specific route, runway assignment, and any required hold short instructions. JO 7110.65BB specifically prohibits conditional instructions based on arriving or departing aircraft, such as 'line up and wait behind landing traffic.'",
    source: "FAA Order JO 7110.65BB, 3-7-1 and 3-7-2",
    keywords: [
      "taxi instructions",
      "taxi phraseology",
      "conditional clearance",
      "progressive taxi",
      "do not use cleared to taxi"
    ]
  },
  {
    id: "speed-restrictions",
    category: "speed-restrictions",
    title: "Core speed restrictions controllers quote most often",
    content:
      "14 CFR 91.117 sets the basic limits: 250 KIAS at or below 10,000 feet MSL; 200 KIAS at or below 2,500 feet above the surface within 4 NM of the primary airport of Class C or Class D airspace; and 200 KIAS in a Class B VFR corridor or in the airspace underlying a Class B shelf. Published STAR or SID speed restrictions remain mandatory unless ATC cancels or modifies them.",
    source: "14 CFR 91.117; AIM 3-2-4; AIM 5-4-1",
    keywords: [
      "250 knots below 10000",
      "200 knots class c",
      "200 knots class d",
      "200 knots below class b",
      "speed restriction",
      "91.117"
    ],
    relatedFarSections: ["91.117"]
  },
  {
    id: "basic-vfr-weather-minima",
    category: "weather-minima",
    title: "Basic VFR weather minima by airspace class",
    content:
      "AIM 3-1-4 mirrors 14 CFR 91.155. Class B requires 3 SM and clear of clouds. Classes C and D require 3 SM plus 500 below, 1,000 above, and 2,000 horizontal. Class E below 10,000 MSL uses the same 3-152 rule; at or above 10,000 MSL it becomes 5 SM, 1,000 below, 1,000 above, and 1 SM horizontal. Class G varies by altitude and day/night, with the common low-altitude daytime minimum being 1 SM and clear of clouds for airplanes.",
    source: "AIM 3-1-4; 14 CFR 91.155",
    keywords: [
      "vfr weather minima",
      "class b weather minima",
      "class c weather minima",
      "class d weather minima",
      "class e weather minima",
      "class g weather minima",
      "3-152",
      "clear of clouds"
    ],
    relatedFarSections: ["91.155"]
  },
  {
    id: "special-vfr-minima",
    category: "weather-minima",
    title: "Special VFR minima",
    content:
      "Special VFR requires an ATC clearance before operating in a Class B, C, D, or E surface area when weather is below basic VFR. Fixed-wing aircraft need at least 1 SM flight visibility, must remain clear of clouds, and at night the pilot must be instrument rated with an IFR-equipped aircraft. Helicopters may operate SVFR clear of clouds with less than 1 SM visibility.",
    source: "AIM 4-4-6; 14 CFR 91.157",
    keywords: [
      "special vfr",
      "svfr",
      "1 statute mile",
      "clear of clouds",
      "night special vfr"
    ],
    relatedFarSections: ["91.157"]
  },
  {
    id: "light-gun-signals",
    category: "light-signals",
    title: "ATC light gun signals",
    content:
      "JO 7110.65BB Table 3-2-1: steady green means cleared for takeoff on the ground or cleared to land in flight; flashing green means cleared to taxi on the ground or return for landing in flight; steady red means stop on the ground or give way and continue circling in flight; flashing red means taxi clear of the runway on the ground or airport unsafe—do not land in flight; flashing white means return to starting point on the airport; alternating red and green means general warning—exercise extreme caution.",
    source: "FAA Order JO 7110.65BB, 3-2-1 through 3-2-3",
    keywords: [
      "light gun",
      "nordo",
      "steady green",
      "flashing green",
      "steady red",
      "flashing red",
      "flashing white",
      "alternating red and green"
    ]
  },
  {
    id: "emergency-transponder-codes",
    category: "emergency",
    title: "Emergency transponder codes",
    content:
      "The standard emergency Mode 3/A codes are 7500 for hijacking/unlawful interference, 7600 for radio communications failure, and 7700 for a general emergency. Controllers should treat the code as meaningful even if the pilot does not use the corresponding words immediately on frequency.",
    source: "AIM 6-3 Distress and Urgency Procedures; FAA Order JO 7110.65BB, Chapter 10 Emergencies",
    keywords: [
      "7500",
      "7600",
      "7700",
      "squawk 7500",
      "squawk 7600",
      "squawk 7700",
      "hijack",
      "lost comm",
      "general emergency"
    ]
  },
  {
    id: "minimum-fuel-vs-emergency-fuel",
    category: "emergency",
    title: "Minimum fuel versus fuel emergency",
    content:
      "Minimum fuel is an advisory, not an emergency declaration. It tells ATC that the aircraft's fuel supply has reached a state where little or no delay can be accepted. If the remaining usable fuel suggests the aircraft will land with less than planned final reserve or otherwise requires priority handling, the pilot should declare an emergency rather than rely on 'minimum fuel' alone.",
    source: "AIM 6-1 Emergency Procedures guidance; FAA Order JO 7110.65BB, Chapter 10",
    keywords: [
      "minimum fuel",
      "emergency fuel",
      "fuel emergency",
      "priority handling",
      "little or no delay"
    ]
  },
  {
    id: "class-a-airspace",
    category: "airspace",
    title: "Class A airspace",
    content:
      "Class A is generally 18,000 feet MSL up to and including FL600. Operations are IFR only unless specifically authorized otherwise, and pilots and aircraft must meet the IFR, transponder, and ADS-B requirements referenced in the AIM.",
    source: "AIM 3-2-2",
    keywords: ["class a", "fl180", "flight level 600", "ifr only", "18,000 msl"]
  },
  {
    id: "class-b-airspace",
    category: "airspace",
    title: "Class B airspace",
    content:
      "Class B generally surrounds the nation's busiest airports from the surface to 10,000 feet MSL in individually tailored layers. Entry requires an explicit ATC clearance, two-way radio, transponder with Mode C, and ADS-B Out unless a deviation is authorized. VFR weather minimums are 3 SM and clear of clouds.",
    source: "AIM 3-2-3",
    keywords: [
      "class b",
      "surface to 10000",
      "atc clearance required",
      "mode c veil",
      "clear of clouds"
    ],
    relatedFarSections: ["91.131", "91.215", "91.225"]
  },
  {
    id: "class-c-airspace",
    category: "airspace",
    title: "Class C airspace",
    content:
      "Class C generally has a 5 NM surface core and a 10 NM shelf, both up to 4,000 feet above airport elevation. Two-way radio communication must be established before entry, and the aircraft normally needs a transponder with altitude reporting and ADS-B Out. Unless ATC authorizes otherwise, 200 KIAS applies at or below 2,500 feet above the surface within 4 NM of the primary airport.",
    source: "AIM 3-2-4",
    keywords: [
      "class c",
      "two-way radio communication",
      "5 nm core",
      "10 nm shelf",
      "200 knots"
    ],
    relatedFarSections: ["91.130", "91.117", "91.215", "91.225"]
  },
  {
    id: "class-d-airspace",
    category: "airspace",
    title: "Class D airspace",
    content:
      "Class D generally extends from the surface to 2,500 feet above airport elevation around an airport with an operating control tower unless individually charted otherwise. Two-way radio communication must be established before entry. Basic VFR minima are 3 SM with 500 below, 1,000 above, and 2,000 horizontal, and the 200-knot speed limit applies within 4 NM of the primary airport at or below 2,500 feet above the surface.",
    source: "AIM 3-2 Controlled Airspace overview; AIM 3-1-4; 14 CFR 91.129 and 91.117",
    keywords: [
      "class d",
      "surface to 2500",
      "control tower",
      "3 miles visibility",
      "200 knots"
    ],
    relatedFarSections: ["91.129", "91.117"]
  },
  {
    id: "class-e-airspace",
    category: "airspace",
    title: "Class E airspace",
    content:
      "Class E is controlled airspace that is not Class A, B, C, or D. It commonly begins at the surface, 700 feet AGL, or 1,200 feet AGL depending on the area. Below 10,000 feet MSL the basic VFR minimum is 3 SM and the 3-152 cloud clearance rule; at or above 10,000 feet MSL it becomes 5 SM, 1,000 below, 1,000 above, and 1 SM horizontal.",
    source: "AIM 3-1-4 and AIM 3-2 Controlled Airspace overview",
    keywords: [
      "class e",
      "700 agl",
      "1200 agl",
      "controlled airspace",
      "3-152",
      "5-111"
    ],
    relatedFarSections: ["91.155"]
  },
  {
    id: "class-g-airspace",
    category: "airspace",
    title: "Class G airspace",
    content:
      "Class G is uncontrolled airspace. The usual controller reference is that weather minima vary by altitude and time of day: for airplanes at 1,200 feet AGL or less in the daytime the minimum is often 1 SM and clear of clouds, while nighttime or higher-altitude operations generally require 3 SM and 500 below, 1,000 above, and 2,000 horizontal until 10,000 feet MSL, then 5 SM and 1-1-1.",
    source: "AIM 3-1-4 and AIM 3-3-1 through 3-3-2",
    keywords: [
      "class g",
      "uncontrolled airspace",
      "1 mile clear of clouds",
      "class g minima",
      "day vfr"
    ],
    relatedFarSections: ["91.155"]
  }
];
