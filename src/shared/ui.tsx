import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useReducedMotion, usePointerFine } from "./motion";

/* Magnetic wrapper: children drift toward the pointer */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = usePointerFine();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !fine) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [reduced, fine, strength]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/* Splits a phrase into words → chars, each char carrying data-char for GSAP */
export function SplitChars({
  text,
  charClass = "",
  wordClass = "",
}: {
  text: string;
  charClass?: string;
  wordClass?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, wi) => (
        <span key={wi} className={`inline-block whitespace-nowrap ${wordClass}`}>
          {Array.from(w).map((c, ci) => (
            <span key={ci} className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
              <span data-char className={`inline-block will-change-transform ${charClass}`}>
                {c}
              </span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block w-[0.25em]" aria-hidden />}
        </span>
      ))}
    </>
  );
}
