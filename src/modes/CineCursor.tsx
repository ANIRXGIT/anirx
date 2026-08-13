"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { useVisualMode } from "./modes";

/**
 * In CINEMA the cursor reduces to a minimal point of light —
 * a projection lantern, not a widget. Never rendered outside cinema.
 */
export function CineCursor() {
  const mode = useVisualMode();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);

  const active = mode === "cinema" && !reduced;

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot || !active) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.28, ease: "power3.out" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.28, ease: "power3.out" });
    gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      xTo(event.clientX);
      yTo(event.clientY);
      const overMedia = (event.target as HTMLElement | null)?.closest?.("[data-cine]");
      gsap.to(dot, { autoAlpha: 1, scale: overMedia ? 3 : 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    };
    const onLeave = () => gsap.to(dot, { autoAlpha: 0, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] h-1.5 w-1.5 rounded-full bg-[var(--color-ink-media)] opacity-0 mix-blend-difference"
    />
  );
}
