"use client";

import { useEffect, useRef } from "react";
import { identity } from "@/content/identity";
import { site } from "@/content/site";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 05 — THE SIGNATURE. The end-card of the film.
 * ANIRX, enormous, hollow until the scroll signs it.
 * Then the person under the name, then the line under the name.
 * Reduced motion / no-JS read the signed composition immediately.
 */
export function SceneSignature() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const st = { trigger: el, start: "top 80%", end: "center 44%", scrub: 0.6 };

      gsap.fromTo(
        q("[data-s-word]"),
        { autoAlpha: 0.2, scale: 0.95 },
        { autoAlpha: 1, scale: 1, ease: "none", scrollTrigger: st },
      );
      gsap.fromTo(
        q("[data-s-fill]"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 62%", end: "center 40%", scrub: 0.6 } },
      );
      gsap.fromTo(
        q("[data-s-name], [data-s-statement]"),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "center 58%", end: "center 36%", scrub: 0.6 } },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      aria-label="ANIRX"
      className="relative flex min-h-[96svh] flex-col items-center justify-center overflow-hidden border-t border-line px-[var(--spacing-gutter)] py-20 text-center"
    >
      <div data-s-word className="relative select-none will-change-transform">
        <span className="u-hollow block font-display text-[clamp(5.5rem,24vw,26rem)] font-extrabold leading-[0.92] tracking-tight">
          ANIRX<span className="u-hollow-accent">.</span>
        </span>
        <span
          data-s-fill
          aria-hidden
          className="absolute inset-0 block font-display text-[clamp(5.5rem,24vw,26rem)] font-extrabold leading-[0.92] tracking-tight text-ink"
        >
          ANIRX<span className="text-accent-hi">.</span>
        </span>
      </div>
      <p data-s-name className="mt-10 font-display text-base font-bold tracking-[0.28em] text-ink md:text-xl">
        {identity.fullName}
      </p>
      <p data-s-statement className="mt-3 font-edit text-lg italic text-ink-dim md:text-xl">
        {site.statement}
      </p>
    </section>
  );
}
