import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
export type { Lenis };

/* ---------- reduced motion ---------- */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export function usePointerFine(): boolean {
  const [fine] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  return fine;
}

/* ---------- smooth scroll (Lenis, driven by GSAP's ticker) ---------- */

export function useLenis(): RefObject<Lenis | null> {
  const ref = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    ref.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ref.current = null;
    };
  }, [reduced]);

  return ref;
}

export function scrollToTarget(lenis: Lenis | null, selector: string, offset = 0) {
  if (lenis) {
    lenis.scrollTo(selector, { offset, duration: 1.5 });
  } else {
    document.querySelector(selector)?.scrollIntoView({ behavior: "auto" });
  }
}

/* ---------- page chrome ---------- */

export function useBodyBg(color: string) {
  useEffect(() => {
    const body = document.body.style.backgroundColor;
    const html = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = color;
    document.documentElement.style.backgroundColor = color;
    return () => {
      document.body.style.backgroundColor = body;
      document.documentElement.style.backgroundColor = html;
    };
  }, [color]);
}

/* refresh triggers once webfonts settle, so pinned/sticky math is correct */
export function useFontsRefresh() {
  useEffect(() => {
    let alive = true;
    const go = () => alive && ScrollTrigger.refresh();
    document.fonts?.ready.then(go);
    const id = window.setTimeout(go, 900);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, []);
}

/* clock helpers */
export function useClock(timeZone?: string) {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone,
    }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);
  return t;
}
