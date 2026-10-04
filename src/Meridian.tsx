import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  gsap,
  ScrollTrigger,
  scrollToTarget,
  useBodyBg,
  useClock,
  useFontsRefresh,
  useLenis,
  usePointerFine,
  useReducedMotion,
  type Lenis,
} from "./shared/motion";
import { Magnetic, SplitChars } from "./shared/ui";
import Nebula from "./Nebula";
import Art from "./Art";
import { depths, manifesto, missions, stats, windows } from "./data";

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function fmtKm(v: number) {
  if (v < 1e7) return Math.round(v).toLocaleString("en-US");
  const e = Math.floor(Math.log10(v));
  const m = v / Math.pow(10, e);
  return `${m.toFixed(2)}×10${String(e)
    .split("")
    .map((d) => SUP[Number(d)])
    .join("")}`;
}

/* ================================================================
   BOOT SEQUENCE
   ================================================================ */

function Boot({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const dur = reduced ? 250 : 1600;
    let start: number | null = null;
    let raf = 0;
    let fired = false;
    let timer = 0;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      setN(Math.floor(p * p * (3 - 2 * p) * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!fired) {
        fired = true;
        setOut(true);
        onDone();
        timer = window.setTimeout(() => setGone(true), reduced ? 40 : 950);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [reduced, onDone]);

  if (gone) return null;
  const lines = [
    [8, "Cooling detectors to 40 K"],
    [40, "Locking star tracker"],
    [72, "Aligning five observatories"],
    [96, "First light"],
  ] as const;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-void px-6 py-8 font-mono text-[11px] tracking-[0.22em] text-ash uppercase md:px-10"
      style={{
        clipPath: out ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
        transition: "clip-path 0.95s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div className="flex justify-between">
        <span className="text-snow">Meridian OS 4.2</span>
        <span>Orbital Imaging</span>
      </div>
      <div>
        <p className="font-grot text-[clamp(5rem,22vw,18rem)] leading-none font-medium tracking-[-0.06em] text-snow tabular">
          {String(n).padStart(3, "0")}
        </p>
        <div className="mt-6 h-px w-full bg-white/10">
          <div className="h-full bg-ember" style={{ width: `${n}%` }} />
        </div>
      </div>
      <ul className="space-y-1.5">
        {lines.map(([at, txt]) => (
          <li key={txt} className={`transition-opacity duration-300 ${n >= at ? "opacity-100" : "opacity-15"}`}>
            <span className={n >= at ? "text-ion" : ""}>{n >= at ? "●" : "○"}</span> {txt}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   RETICLE CURSOR
   ================================================================ */

function Reticle() {
  const fine = usePointerFine();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const lab = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (lab.current)
        lab.current.textContent = `${(e.clientX / window.innerWidth).toFixed(3)} · ${(e.clientY / window.innerHeight).toFixed(3)}`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90] text-white mix-blend-difference"
      style={{ transform: "translate3d(-100px,-100px,0)" }}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1" className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
        <path d="M15 2v9M15 19v9M2 15h9M19 15h9" />
      </svg>
      <span ref={lab} className="absolute top-3 left-5 font-mono text-[9px] tracking-widest whitespace-nowrap" />
    </div>
  );
}

/* ================================================================
   NAV
   ================================================================ */

function MNav({ lenis }: { lenis: RefObject<Lenis | null> }) {
  const utc = useClock("UTC");
  const links: [string, string][] = [
    ["Manifesto", "#m-manifesto"],
    ["Descent", "#m-descent"],
    ["Posts", "#m-missions"],
    ["Access", "#m-access"],
  ];
  const go = (e: React.MouseEvent, sel: string) => {
    e.preventDefault();
    scrollToTarget(lenis.current, sel);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-[1700px] items-center justify-between px-6 md:px-10">
        <a href="#m-top" onClick={(e) => go(e, "#m-top")} className="flex items-center gap-3 text-snow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="9.5" stroke="currentColor" />
            <ellipse cx="11" cy="11" rx="9.5" ry="3.6" stroke="currentColor" strokeOpacity=".6" transform="rotate(-30 11 11)" />
            <circle cx="17.2" cy="7.2" r="1.6" fill="#ff5b2e" />
          </svg>
          <span className="font-grot text-[13px] font-semibold tracking-[0.32em] uppercase">Meridian</span>
        </a>
        <nav className="hidden items-center gap-10 md:flex" aria-label="Meridian sections">
          {links.map(([l, h]) => (
            <a
              key={h}
              href={h}
              onClick={(e) => go(e, h)}
              className="link-sweep font-mono text-[11px] tracking-[0.25em] text-ash uppercase transition-colors hover:text-snow"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <span className="hidden font-mono text-[11px] tracking-[0.2em] text-ash tabular sm:block">UTC {utc}</span>
          <a
            href="#m-access"
            onClick={(e) => go(e, "#m-access")}
            className="rounded-full border border-white/25 px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-snow uppercase transition-colors duration-300 hover:border-ember hover:bg-ember hover:text-void"
          >
            Request access
          </a>
        </div>
      </div>
    </header>
  );
}

/* ================================================================
   HERO
   ================================================================ */

function Hero({ ready, lenis }: { ready: boolean; lenis: RefObject<Lenis | null> }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const utc = useClock("UTC");

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-char]", { yPercent: 118 });
      gsap.set("[data-fade]", { opacity: 0, y: 28 });
      gsap.to("[data-hero-inner]", {
        yPercent: -12,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    if (!ready || reduced) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-char]", { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.03 });
      gsap.to("[data-fade]", { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.55 });
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section ref={root} id="m-top" className="relative flex min-h-[100svh] flex-col px-6 pt-28 pb-8 md:px-10">
      {/* HUD corner marks */}
      {["top-24 left-4 border-t border-l", "top-24 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={`pointer-events-none absolute h-5 w-5 border-white/30 md:h-7 md:w-7 ${c}`} />
      ))}

      <div data-hero-inner className="relative flex flex-1 flex-col justify-center">
        <p data-fade className="font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
          <span className="mr-3 inline-block h-1.5 w-1.5 rounded-full bg-ember align-middle" aria-hidden />
          Meridian Orbital Imaging — Est. 2019
        </p>
        <h1
          aria-label="Beyond the visible sky."
          className="mt-6 font-grot text-[clamp(3.5rem,14vw,14.5rem)] leading-[0.86] font-medium tracking-[-0.055em] text-snow"
        >
          <span aria-hidden className="block">
            <SplitChars text="Beyond the" />
          </span>
          <span aria-hidden className="block font-serifi font-normal tracking-[-0.03em] text-ember italic">
            <SplitChars text="visible sky." />
          </span>
        </h1>
      </div>

      <div data-fade className="relative grid grid-cols-12 items-end gap-x-6 gap-y-8">
        <p className="col-span-12 max-w-md text-[15px] leading-relaxed text-ash md:col-span-5 md:text-base">
          Five observatories. One continuous gaze. We turn the sky into a dataset — and the dataset into wonder.
        </p>
        <div className="col-span-12 flex flex-wrap items-center gap-4 md:col-span-4">
          <Magnetic>
            <a
              href="#m-access"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget(lenis.current, "#m-access");
              }}
              className="inline-flex items-center gap-3 rounded-full bg-ember px-7 py-4 font-mono text-[11px] tracking-[0.25em] text-void uppercase transition-transform duration-300 hover:scale-[1.04]"
            >
              Request a window
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                <path d="M0 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </a>
          </Magnetic>
          <a
            href="#m-descent"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(lenis.current, "#m-descent");
            }}
            className="link-sweep font-mono text-[11px] tracking-[0.25em] text-snow uppercase"
          >
            Begin the descent ↓
          </a>
        </div>
        <ul className="col-span-12 space-y-1.5 font-mono text-[11px] tracking-[0.2em] text-ash uppercase md:col-span-3 md:text-right">
          <li>
            <span className="text-ion">●</span> 5 / 5 posts online
          </li>
          <li className="tabular">UTC {utc}</li>
          <li>Sky coverage — 100%</li>
        </ul>
      </div>
    </section>
  );
}

/* ================================================================
   MANIFESTO — words light up with scroll
   ================================================================ */

function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-w]");
      if (reduced) {
        gsap.set(words, { opacity: 1 });
        return;
      }
      gsap.fromTo(
        words,
        { opacity: 0.13 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.15,
          scrollTrigger: { trigger: "[data-p]", start: "top 80%", end: "bottom 45%", scrub: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="m-manifesto" className="relative bg-void/60 px-6 py-[22vh] backdrop-blur-[2px] md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <p className="mb-10 font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
          <span className="text-ember">(01)</span> &nbsp; Manifesto
        </p>
        <p
          data-p
          className="max-w-[1300px] font-grot text-[clamp(2rem,5.6vw,5.8rem)] leading-[1.06] font-medium tracking-[-0.035em] text-snow"
        >
          {manifesto.map((w, i) => (
            <span
              key={i}
              data-w
              className={`mr-[0.24em] inline-block ${w.em ? "font-serifi font-normal text-ember italic tracking-[-0.02em]" : ""}`}
            >
              {w.t}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ================================================================
   DESCENT — sticky scene driven by scroll progress
   ================================================================ */

function Descent({ depthRef }: { depthRef: { current: number } }) {
  const root = useRef<HTMLElement>(null);
  const stageEls = useRef<(HTMLDivElement | null)[]>([]);
  const tickEls = useRef<(HTMLLIElement | null)[]>([]);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const N = depths.length;
    const logs = depths.map((d) => Math.log(d.at));
    const apply = (p: number) => {
      const x = p * (N - 1);
      depthRef.current = p;
      stageEls.current.forEach((el, i) => {
        if (!el) return;
        const d = x - i;
        const a = Math.max(0, 1 - Math.abs(d) * 1.7);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(0, ${d * -70}px, 0)`;
        el.style.filter = a >= 0.995 ? "none" : `blur(${Math.min(9, Math.abs(d) * 12).toFixed(1)}px)`;
        el.style.visibility = a <= 0.001 ? "hidden" : "visible";
      });
      tickEls.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = String(0.45 + 0.55 * Math.max(0, 1 - Math.abs(x - i) * 1.4));
      });
      const seg = Math.min(N - 2, Math.floor(x));
      const t = x - seg;
      const e = t * t * (3 - 2 * t);
      const v = Math.exp(logs[seg] + (logs[seg + 1] - logs[seg]) * e);
      if (numRef.current) numRef.current.textContent = fmtKm(v);
      if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
    };
    apply(0);
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => apply(s.progress),
    });
    return () => {
      st.kill();
      depthRef.current = 0;
    };
  }, [depthRef]);

  return (
    <section ref={root} id="m-descent" className="relative h-[560vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void/70" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-between px-6 pt-24 pb-8 md:px-10 md:pt-28">
          <div className="flex items-start justify-between font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
            <p>
              <span className="text-ember">(02)</span> &nbsp; The Descent
            </p>
            <p className="hidden sm:block">Scroll to travel outward</p>
          </div>

          <div className="relative flex flex-1 items-center gap-6 md:gap-14">
            {/* progress rail */}
            <div className="relative hidden h-[52%] w-40 shrink-0 md:block">
              <div className="absolute top-0 left-0 h-full w-px bg-white/15" />
              <div ref={barRef} className="absolute top-0 left-0 h-full w-px origin-top bg-ember" style={{ transform: "scaleY(0)" }} />
              <ol className="flex h-full flex-col justify-between pl-6">
                {depths.map((d, i) => (
                  <li
                    key={d.label}
                    ref={(el) => {
                      tickEls.current[i] = el;
                    }}
                    className="font-mono text-[10px] tracking-[0.25em] text-snow uppercase"
                  >
                    {d.tag.split(" — ")[0]} <span className="text-ash">{d.tag.split(" — ")[1]}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* stage stack */}
            <div className="relative h-full min-h-[280px] flex-1">
              {depths.map((d, i) => (
                <div
                  key={d.label}
                  ref={(el) => {
                    stageEls.current[i] = el;
                  }}
                  className="absolute inset-0 flex flex-col justify-center will-change-transform"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <p className="font-mono text-[11px] tracking-[0.3em] text-ember uppercase md:hidden">{d.tag}</p>
                  <h2 className="mt-3 font-grot text-[clamp(2.6rem,9.5vw,9.5rem)] leading-[0.92] font-medium tracking-[-0.05em] text-snow md:mt-0">
                    {d.label}
                  </h2>
                  <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ash md:text-lg">{d.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 border-t border-white/10 pt-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-ash uppercase">Distance from surface</p>
              <p className="mt-2 flex items-baseline gap-3 font-grot text-[clamp(2.2rem,7vw,6.5rem)] leading-none font-medium tracking-[-0.04em] text-snow tabular">
                <span ref={numRef}>1</span>
                <span className="font-mono text-sm font-normal tracking-[0.2em] text-ash uppercase">km</span>
              </p>
            </div>
            <p className="hidden pb-2 font-mono text-[10px] tracking-[0.3em] text-ash uppercase sm:block">
              <span className="blink text-ion">●</span> &nbsp;Live telemetry
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   MISSIONS — horizontal journey
   ================================================================ */

function Missions({ pausedRef }: { pausedRef: { current: boolean } }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sec = root.current!;
    const tr = track.current!;
    let dist = 0;
    const measure = () => {
      dist = Math.max(0, tr.offsetWidth - window.innerWidth);
      sec.style.height = `${dist + window.innerHeight}px`;
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (s) => {
        tr.style.transform = `translate3d(${-s.progress * dist}px, 0, 0)`;
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
      },
    });
    // once this opaque section covers the viewport, stop rendering the shader
    const cover = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "max",
      onToggle: (s) => {
        pausedRef.current = s.isActive;
      },
    });
    return () => {
      st.kill();
      cover.kill();
      pausedRef.current = false;
    };
  }, [pausedRef]);

  return (
    <section ref={root} id="m-missions" className="relative bg-void" style={{ height: "300vh" }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div ref={track} className="flex w-max items-center gap-6 pr-[16vw] pl-6 will-change-transform md:gap-10 md:pl-10">
          <div className="w-[84vw] shrink-0 md:w-[34vw]">
            <p className="font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
              <span className="text-ember">(03)</span> &nbsp; The Posts
            </p>
            <h2 className="mt-6 font-grot text-[clamp(2.8rem,7.4vw,7.6rem)] leading-[0.92] font-medium tracking-[-0.05em] text-snow">
              Five posts.
              <br />
              <span className="font-serifi font-normal text-ember italic">One gaze.</span>
            </h2>
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-ash">
              Each observatory is a different way of being patient. Keep scrolling — the journey runs sideways.
            </p>
            <p className="mt-10 font-mono text-[11px] tracking-[0.3em] text-snow uppercase">Scroll →</p>
          </div>

          {missions.map((m) => (
            <article
              key={m.id}
              className="group flex h-[72svh] max-h-[680px] w-[82vw] shrink-0 flex-col border border-white/10 bg-deep/70 backdrop-blur-sm transition-colors duration-500 hover:border-ember/70 md:w-[34vw] md:max-w-[560px]"
            >
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-[1400ms] ease-out group-hover:scale-105">
                  <Art kind={m.art} />
                </div>
                <span className="absolute top-5 left-5 font-mono text-[11px] tracking-[0.3em] text-snow">{m.n} / 05</span>
                <span className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.25em] text-ash uppercase">{m.specs[2][1]}</span>
              </div>
              <div className="border-t border-white/10 p-6 md:p-7">
                <h3 className="font-grot text-3xl font-medium tracking-[-0.03em] text-snow md:text-4xl">{m.name}</h3>
                <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-ember uppercase">{m.orbit}</p>
                <p className="mt-4 text-sm leading-relaxed text-ash">{m.blurb}</p>
                <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                  {m.specs.map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[9px] tracking-[0.25em] text-ash uppercase">{k}</dt>
                      <dd className="mt-1 text-[13px] text-snow">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
        <div aria-hidden className="absolute right-6 bottom-8 left-6 h-px bg-white/15 md:right-10 md:left-10">
          <div ref={bar} className="h-full origin-left bg-ember" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   STATS
   ================================================================ */

function Stats() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? "";
        if (reduced) {
          el.textContent = target.toLocaleString("en-US") + suffix;
          return;
        }
        const o = { v: 0 };
        el.textContent = "0" + suffix;
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: target,
              duration: 2.4,
              ease: "power3.out",
              onUpdate: () => {
                el.textContent = Math.round(o.v).toLocaleString("en-US") + suffix;
              },
            }),
        });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} className="relative bg-void px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1500px]">
        <p className="mb-14 font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
          <span className="text-ember">(04)</span> &nbsp; The Record
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-t border-white/15 pt-5">
              <p className="font-grot text-[clamp(2.8rem,6.6vw,6.8rem)] leading-none font-medium tracking-[-0.045em] text-snow tabular">
                <span data-count={s.v} data-suffix={s.suffix}>
                  {s.v.toLocaleString("en-US")}
                  {s.suffix}
                </span>
              </p>
              <p className="mt-4 font-mono text-[10px] tracking-[0.25em] text-ash uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SCROLL-DRIVEN MARQUEE
   ================================================================ */

function Ticker() {
  const root = useRef<HTMLElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
      gsap.fromTo(r1.current, { xPercent: 0 }, { xPercent: -25, ease: "none", scrollTrigger: st });
      gsap.fromTo(r2.current, { xPercent: -25 }, { xPercent: 0, ease: "none", scrollTrigger: st });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const copies = [0, 1, 2, 3];
  return (
    <section ref={root} aria-hidden className="relative overflow-hidden border-y border-white/10 bg-void py-10 select-none">
      <div ref={r1} className="flex w-max whitespace-nowrap">
        {copies.map((i) => (
          <span key={i} className="stroke-text px-8 font-grot text-[clamp(4rem,13vw,13rem)] leading-none font-medium tracking-[-0.05em] uppercase" style={{ ["--stroke" as string]: "rgba(238,241,248,0.45)" }}>
            Listen longer <span className="text-ember">✺</span>
          </span>
        ))}
      </div>
      <div ref={r2} className="flex w-max whitespace-nowrap">
        {copies.map((i) => (
          <span key={i} className="px-8 font-serifi text-[clamp(4rem,13vw,13rem)] leading-none text-snow italic">
            the universe is patient <span className="text-ember">✺</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   ACCESS
   ================================================================ */

function Access() {
  const [post, setPost] = useState(windows[0]);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [ref, setRef] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState("error");
      return;
    }
    const rnd = () => Math.random().toString(36).slice(2, 6).toUpperCase();
    setRef(`MRD-${rnd()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setState("done");
  };

  return (
    <section id="m-access" className="relative bg-void px-6 pt-24 pb-28 md:px-10 md:pt-36 md:pb-40">
      <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-x-6 gap-y-14">
        <div className="col-span-12 lg:col-span-7">
          <p className="mb-8 font-mono text-[11px] tracking-[0.32em] text-ash uppercase">
            <span className="text-ember">(05)</span> &nbsp; Access
          </p>
          <h2 className="font-grot text-[clamp(3rem,9vw,9.5rem)] leading-[0.9] font-medium tracking-[-0.055em] text-snow">
            Request a<br />
            <span className="font-serifi font-normal text-ember italic">window.</span>
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-ash md:text-base">
            Universities, studios and the merely curious can book observation time on any post. Tell us where to
            look — we will confirm within two orbits.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-5 lg:pt-16">
          {state === "done" ? (
            <div role="status" className="fade-swap border border-ion/40 bg-deep/80 p-8">
              <p className="font-mono text-[10px] tracking-[0.3em] text-ion uppercase">● Window reserved</p>
              <p className="mt-5 font-grot text-4xl font-medium tracking-[-0.03em] text-snow">{ref}</p>
              <p className="mt-4 text-sm leading-relaxed text-ash">
                Your slot on <span className="text-snow">{post}</span> is provisionally held. A confirmation is on its
                way to <span className="text-snow">{email}</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setState("idle");
                  setEmail("");
                }}
                className="link-sweep mt-7 font-mono text-[11px] tracking-[0.25em] text-snow uppercase"
              >
                Book another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <fieldset>
                <legend className="mb-4 font-mono text-[10px] tracking-[0.3em] text-ash uppercase">Choose a post</legend>
                <div role="radiogroup" aria-label="Observatory" className="flex flex-wrap gap-2.5">
                  {windows.map((w) => (
                    <button
                      key={w}
                      type="button"
                      role="radio"
                      aria-checked={post === w}
                      onClick={() => setPost(w)}
                      className={`rounded-full border px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                        post === w ? "border-ember bg-ember text-void" : "border-white/20 text-snow hover:border-white/60"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-10 block">
                <span className="font-mono text-[10px] tracking-[0.3em] text-ash uppercase">Your email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  placeholder="name@institute.org"
                  className="mt-2 w-full border-b border-white/25 bg-transparent py-3 font-grot text-2xl text-snow placeholder:text-white/20 focus:border-ember focus:outline-none"
                />
              </label>
              {state === "error" && <p className="mt-3 text-sm text-ember">That address doesn't look right — try again.</p>}
              <div className="mt-10">
                <Magnetic>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-3 rounded-full bg-snow px-8 py-4 font-mono text-[11px] tracking-[0.25em] text-void uppercase transition-colors duration-300 hover:bg-ember"
                  >
                    Reserve window
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                      <path d="M0 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </button>
                </Magnetic>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   FOOTER
   ================================================================ */

function MFooter({ lenis }: { lenis: RefObject<Lenis | null> }) {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-void">
      <div className="mx-auto flex max-w-[1500px] flex-wrap justify-between gap-8 px-6 pt-12 font-mono text-[11px] tracking-[0.2em] text-ash uppercase md:px-10">
        <p>
          © 2026 Meridian Orbital Imaging
          <br />
          <span className="text-white/30">A fictional concept — made for Folio/26</span>
        </p>
        <p>
          Operations — Geneva
          <br />
          Ground station — Atacama
        </p>
        <button
          type="button"
          onClick={() => (lenis.current ? lenis.current.scrollTo(0, { duration: 2 }) : window.scrollTo(0, 0))}
          className="link-sweep self-start text-snow"
        >
          Back to the ground ↑
        </button>
      </div>
      <p
        aria-hidden
        className="stroke-text -mb-[0.2em] pt-8 text-center font-grot text-[21vw] leading-none font-medium tracking-[-0.06em] select-none"
        style={{ ["--stroke" as string]: "rgba(238,241,248,0.28)" }}
      >
        MERIDIAN
      </p>
    </footer>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function Meridian() {
  useBodyBg("#04050a");
  const lenis = useLenis();
  useFontsRefresh();
  const depth = useRef(0);
  const paused = useRef(false);
  const [ready, setReady] = useState(false);
  const onBooted = useCallback(() => setReady(true), []);

  return (
    <div className="relative min-h-screen bg-void font-grot text-snow selection:bg-ember selection:text-void">
      <Nebula depthRef={depth} pausedRef={paused} />
      <Boot onDone={onBooted} />
      <Reticle />
      <MNav lenis={lenis} />
      <main className="relative z-10">
        <Hero ready={ready} lenis={lenis} />
        <Manifesto />
        <Descent depthRef={depth} />
        <Missions pausedRef={paused} />
        <Stats />
        <Ticker />
        <Access />
      </main>
      <div className="relative z-10">
        <MFooter lenis={lenis} />
      </div>
    </div>
  );
}
