"use client";

import { useEffect, useRef } from "react";
import { identity } from "@/content/identity";
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
        { yPercent: 100 },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 62%", end: "center 40%", scrub: 0.6 } },
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
    <>
      <section
        ref={ref}
        id="anirx-signature"
        aria-label="ANIRX"
        className="relative flex min-h-[96svh] flex-col items-center justify-center overflow-hidden border-t border-line px-[var(--spacing-gutter)] py-20 text-center"
      >
        {/*
          Single overflow:hidden container — one ANIRX. exists in the DOM.
          Starts hollow (u-hollow class). GSAP fades the whole word in via
          autoAlpha on data-s-word. The "signing" effect comes from the
          container reveal: the fill text slides up from translateY(100%)
          inside an overflow:hidden clip container.
          Zero chance of a second ANIRX. leaking into view.
        */}
        <div data-s-word className="relative select-none will-change-transform">
          {/* The hollow outline — always present, always readable (no-JS / reduced-motion) */}
          <span className="u-hollow block font-display text-[clamp(5.5rem,24vw,26rem)] font-extrabold leading-[0.92] tracking-tight">
            ANIRX<span className="u-hollow-accent">.</span>
          </span>
          {/* The filled overlay — clipped by overflow:hidden on its wrapper.
              Slides up from below on scroll. aria-hidden so screen readers
              only see the hollow span above. */}
          <span aria-hidden className="absolute inset-0 overflow-hidden">
            <span
              data-s-fill
              className="block font-display text-[clamp(5.5rem,24vw,26rem)] font-extrabold leading-[0.92] tracking-tight text-ink"
              style={{ transform: "translateY(100%)" }}
            >
              ANIRX<span className="text-accent-hi">.</span>
            </span>
          </span>
        </div>
        <p data-s-name className="mt-10 font-display text-base font-bold tracking-[0.28em] text-ink md:text-xl">
          {identity.fullName}
        </p>
        <p data-s-statement className="mt-3 font-edit text-lg italic text-ink-dim md:text-xl">
          Creative technologist. This is the world.
        </p>
      </section>

      {/* the small print — the last line after the closing title */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[var(--spacing-gutter)] py-5">
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
          © {new Date().getFullYear()} ANIRUDH SHARMA — ANIRX.IN
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">ANIRX — ALL RIGHTS RESERVED</p>
      </footer>
    </>
  );
}
