export const depths = [
  {
    label: "The Ground",
    at: 1,
    tag: "00 — Surface",
    body: "Every image begins as a compromise. Air shimmers, cities glow, weather intervenes. So we leave.",
  },
  {
    label: "Low Earth Orbit",
    at: 412,
    tag: "01 — Kestrel",
    body: "Ninety-six minutes per lap. From here the whole sky passes beneath a single wide-field eye, once per orbit.",
  },
  {
    label: "Geostationary",
    at: 35786,
    tag: "02 — Halcyon",
    body: "Fixed above one longitude, watching one patch of sky without blinking. Patience, at industrial scale.",
  },
  {
    label: "Lagrange L2",
    at: 1500000,
    tag: "03 — Pale Blue",
    body: "A gravitational balance point, shaded from the sun. Infrared detectors cooled to forty kelvin see through dust.",
  },
  {
    label: "Deep Field",
    at: 1.24e23,
    tag: "04 — Obol",
    body: "The oldest light there is, still travelling. We do not point at anything. We simply stay very still.",
  },
];

export const missions = [
  {
    id: "kestrel",
    n: "01",
    name: "Kestrel",
    orbit: "Low Earth Orbit — 412 km",
    blurb: "A wide-field survey instrument that images the entire sky every ninety-six minutes.",
    specs: [
      ["Aperture", "1.4 m"],
      ["Band", "Visible / NIR"],
      ["Launch", "2019"],
    ],
    art: "orbits",
  },
  {
    id: "halcyon",
    n: "02",
    name: "Halcyon",
    orbit: "Geostationary — 35,786 km",
    blurb: "One fixed gaze. Halcyon has watched the same forty square degrees of sky, unbroken, since 2021.",
    specs: [
      ["Aperture", "2.4 m"],
      ["Band", "Optical"],
      ["Launch", "2021"],
    ],
    art: "arcs",
  },
  {
    id: "lodestar",
    n: "03",
    name: "Lodestar",
    orbit: "Lunar far side — 384,400 km",
    blurb: "Radio-silent by design. The quietest place we can reach, shielded from every human signal.",
    specs: [
      ["Aperture", "Array — 32 dipoles"],
      ["Band", "Low-freq radio"],
      ["Launch", "2023"],
    ],
    art: "stars",
  },
  {
    id: "pale",
    n: "04",
    name: "Pale Blue",
    orbit: "Sun–Earth L2 — 1.5 M km",
    blurb: "Infrared eyes cooled to forty kelvin, peering through dust to the places stars are born.",
    specs: [
      ["Aperture", "3.1 m"],
      ["Band", "Mid-IR"],
      ["Launch", "2024"],
    ],
    art: "sphere",
  },
  {
    id: "obol",
    n: "05",
    name: "Obol",
    orbit: "Heliocentric — 2.1 AU",
    blurb: "Less a telescope than a patient question about the oldest light. Currently mid-flight.",
    specs: [
      ["Aperture", "4.0 m"],
      ["Band", "Full spectrum"],
      ["Launch", "2026"],
    ],
    art: "galaxy",
  },
];

export const stats = [
  { v: 5, suffix: "", label: "Observatories in orbit" },
  { v: 2118, suffix: "", label: "Consecutive days, no gap" },
  { v: 40, suffix: " K", label: "Detector temperature" },
  { v: 312, suffix: "", label: "Papers built on our data" },
];

export const manifesto: { t: string; em?: boolean }[] = [
  { t: "Most" },
  { t: "telescopes" },
  { t: "look" },
  { t: "at" },
  { t: "the" },
  { t: "sky." },
  { t: "We" },
  { t: "listen", em: true },
  { t: "to" },
  { t: "it." },
  { t: "Across" },
  { t: "five" },
  { t: "orbits," },
  { t: "in" },
  { t: "every" },
  { t: "wavelength" },
  { t: "the" },
  { t: "universe" },
  { t: "will" },
  { t: "lend" },
  { t: "us," },
  { t: "Meridian" },
  { t: "builds" },
  { t: "one" },
  { t: "patient", em: true },
  { t: "instrument" },
  { t: "—" },
  { t: "one" },
  { t: "that" },
  { t: "has" },
  { t: "never" },
  { t: "blinked.", em: true },
];

export const windows = ["Kestrel", "Halcyon", "Lodestar", "Pale Blue", "Obol"];
