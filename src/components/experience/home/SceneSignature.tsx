"use client";

import { useEffect, useRef } from "react";
import { identity } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 05 — THE SIGNATURE. The end-card of the film.
 *
 * One ANIRX. in the DOM — the hollow u-hollow version.
 * No fill overlay, no two-span trick, no translateY hack.
 * CSS overflow:hidden cannot clip transform-shifted elements
 * (clips pre-transform position only), so any two-span approach
 * produces a duplicate. Single element = zero risk.
 *
 * Scroll animation: the word fades + scales in; name and statement
 * rise in after. Reduced motion / no-JS reads everything immediately.
 */
export function SceneSignature() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      gsap.fromTo(
        q("[data-s-word]"),
        { autoAlpha: 0.2, scale: 0.95 },
        {
          autoAlpha: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "center 44%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        q("[data-s-name], [data-s-statement]"),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "center 58%", end: "center 36%", scrub: 0.6 },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <>
      <section
        ref={ref}
        id="anirx-signature"
        aria-label="ANIRX"
        className="relative flex min-h-[96svh] flex-col items-center justify-center overflow-hidden border-t border-line px-[var(--spacing-gutter)] py-20 text-center"
      >
        {/*
          Single element — no overlay, no duplicate.
          u-hollow renders ANIRX. as a stroke/outline letterform.
          GSAP animates autoAlpha + scale on data-s-word only.
        */}
        <div data-s-word className="select-none will-change-transform">
          <span className="u-hollow block font-display text-[clamp(5.5rem,24vw,26rem)] font-extrabold leading-[0.92] tracking-tight">
            ANIRX<span className="u-hollow-accent">.</span>
          </span>
        </div>

        <p data-s-name className="mt-10 font-display text-base font-bold tracking-[0.28em] text-ink md:text-xl">
          {identity.fullName}
        </p>
        <p data-s-statement className="mt-3 font-edit text-lg italic text-ink-dim md:text-xl">
          Creative technologist. This is the world.
        </p>
      </section>

      {/* the small print */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[var(--spacing-gutter)] py-5">
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
          © {new Date().getFullYear()} ANIRUDH SHARMA — ANIRX.IN
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">ANIRX — ALL RIGHTS RESERVED</p>
      </footer>
    </>
  );
}
