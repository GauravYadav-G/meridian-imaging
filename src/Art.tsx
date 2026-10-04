/* Deterministic generative art for each mission — no image files needed */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const EMBER = "#ff5b2e";
const ION = "#7df9d0";
const SNOW = "#eef1f8";

function Orbits() {
  const rings = [46, 78, 112, 150, 192];
  return (
    <g>
      {rings.map((r, i) => (
        <ellipse
          key={r}
          cx="200"
          cy="200"
          rx={r}
          ry={r * 0.42}
          fill="none"
          stroke={i === 2 ? EMBER : SNOW}
          strokeOpacity={i === 2 ? 0.95 : 0.22}
          strokeWidth={i === 2 ? 1.6 : 1}
          transform={`rotate(${-24 + i * 6} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="16" fill={SNOW} fillOpacity="0.92" />
      <circle cx="200" cy="200" r="30" fill="none" stroke={SNOW} strokeOpacity="0.2" />
      <circle cx="298" cy="158" r="5" fill={EMBER} />
    </g>
  );
}

function Arcs() {
  return (
    <g fill="none">
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={i}
          d={`M ${40 + i * 4} 340 A ${160 - i * 9} ${160 - i * 9} 0 0 1 ${360 - i * 4} 340`}
          stroke={i === 9 ? ION : SNOW}
          strokeOpacity={i === 9 ? 1 : 0.14 + i * 0.03}
          strokeWidth={i === 9 ? 1.8 : 1}
        />
      ))}
      <line x1="30" y1="340" x2="370" y2="340" stroke={SNOW} strokeOpacity="0.4" />
      <circle cx="200" cy="200" r="4" fill={ION} />
    </g>
  );
}

function Stars() {
  const r = rng(11);
  const pts = Array.from({ length: 90 }).map(() => ({
    x: 20 + r() * 360,
    y: 20 + r() * 360,
    s: 0.6 + r() * 2.2,
    o: 0.25 + r() * 0.75,
  }));
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={SNOW} fillOpacity={p.o} />
      ))}
      <g stroke={EMBER} strokeWidth="1.2" fill="none">
        <circle cx="200" cy="196" r="34" />
        <path d="M200 140v34M200 218v34M144 196h34M222 196h34" />
      </g>
    </g>
  );
}

function Sphere() {
  return (
    <g>
      <defs>
        <radialGradient id="sph" cx="34%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#dfe8ff" />
          <stop offset="38%" stopColor="#5b6cff" />
          <stop offset="100%" stopColor="#07091f" />
        </radialGradient>
        <linearGradient id="ring" x1="0" x2="1">
          <stop offset="0%" stopColor={SNOW} stopOpacity="0" />
          <stop offset="50%" stopColor={SNOW} stopOpacity="0.85" />
          <stop offset="100%" stopColor={SNOW} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="98" fill="url(#sph)" />
      <ellipse cx="200" cy="208" rx="176" ry="30" fill="none" stroke="url(#ring)" strokeWidth="1.4" transform="rotate(-14 200 200)" />
      <ellipse cx="200" cy="208" rx="146" ry="22" fill="none" stroke="url(#ring)" strokeOpacity="0.5" strokeWidth="1" transform="rotate(-14 200 200)" />
    </g>
  );
}

function Galaxy() {
  const r = rng(7);
  const pts: { x: number; y: number; s: number; o: number; hot: boolean }[] = [];
  const arms = 3;
  for (let i = 0; i < 520; i++) {
    const arm = i % arms;
    const d = Math.pow(r(), 0.7) * 170;
    const ang = (d / 170) * 4.6 + (arm * Math.PI * 2) / arms + (r() - 0.5) * (0.5 + d / 220);
    const x = 200 + Math.cos(ang) * d * 1.0;
    const y = 200 + Math.sin(ang) * d * 0.62;
    pts.push({ x, y, s: 0.5 + r() * 1.5, o: 0.2 + r() * 0.8, hot: d < 46 });
  }
  return (
    <g transform="rotate(-18 200 200)">
      <circle cx="200" cy="200" r="22" fill={EMBER} fillOpacity="0.22" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.hot ? "#ffd2bd" : SNOW} fillOpacity={p.o} />
      ))}
      <circle cx="200" cy="200" r="6" fill="#fff" />
    </g>
  );
}

export default function Art({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden>
      {kind === "orbits" && <Orbits />}
      {kind === "arcs" && <Arcs />}
      {kind === "stars" && <Stars />}
      {kind === "sphere" && <Sphere />}
      {kind === "galaxy" && <Galaxy />}
    </svg>
  );
}
