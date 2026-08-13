"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useVisualMode } from "@/modes/modes";
import { gsap, ScrollTrigger } from "./gsap";
import { lenisStore } from "./lenisStore";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger
 * and Lenis share one clock. Skipped entirely for reduced motion.
 * CINEMA mode slows the scroll slightly for a heavier, filmic feel.
 */
export function SmoothScroll() {
  const mode = useVisualMode();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: mode === "cinema" ? 1.6 : 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisStore.set(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisStore.set(null);
    };
  }, [reduced, mode]);

  return null;
}
