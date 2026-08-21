"use client";

import { useEffect, useRef } from "react";
import { site, socials } from "@/content/site";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 04 — MAKE SOMETHING.
 *
 * Sticky scroll sequence:
 *   MAKE    → action words appear below
 *   SOMETHING → progress hairline grows across
 *   WITH ME.  → contact block reveals
 *
 * Each stage has visual content — not just a lone giant word.
 * Reduced motion / no-JS read the complete invitation immediately.
 */

const ACTIONS = ["BUILD", "FILM", "EDIT", "CREATE", "FIX", "LAUNCH"];

export function SceneMake() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const w0 = q("[data-m-word-0]");
      const w1 = q("[data-m-word-1]");
      const w2 = q("[data-m-word-2]");

      gsap.set(w0, { autoAlpha: 0, yPercent: 24 });
      gsap.set(w1, { autoAlpha: 0, yPercent: 24 });
      gsap.set(w2, { autoAlpha: 0, yPercent: 24 });
      gsap.set(q("[data-m-actions] span"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-m-hairline]"), { scaleX: 0, transformOrigin: "left" });
      gsap.set(q("[data-m-contact]"), { autoAlpha: 0, y: 18 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      tl
        /* MAKE appears */
        .to(w0, { autoAlpha: 1, yPercent: 0, duration: 0.12 }, 0.02)
        /* action words appear below MAKE */
        .to(q("[data-m-actions] span"), { autoAlpha: 1, y: 0, stagger: 0.015, duration: 0.08 }, 0.08)
        /* MAKE fades, SOMETHING rises */
        .to(w0, { autoAlpha: 0, yPercent: -18, duration: 0.1 }, 0.26)
        .to(q("[data-m-actions] span"), { autoAlpha: 0, y: -8, stagger: 0.01, duration: 0.06 }, 0.26)
        .to(w1, { autoAlpha: 1, yPercent: 0, duration: 0.14 }, 0.32)
        /* hairline grows while SOMETHING is shown */
        .to(q("[data-m-hairline]"), { scaleX: 1, duration: 0.2, ease: "none" }, 0.34)
        /* SOMETHING fades, WITH ME rises */
        .to(w1, { autoAlpha: 0, yPercent: -18, duration: 0.1 }, 0.52)
        .to(q("[data-m-hairline]"), { autoAlpha: 0, duration: 0.06 }, 0.52)
        .to(w2, { autoAlpha: 1, yPercent: 0, duration: 0.14 }, 0.58)
        /* contact reveals */
        .to(q("[data-m-contact]"), { autoAlpha: 1, y: 0, duration: 0.14 }, 0.76)
        .to({}, { duration: 0.1 });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="make-something"
      aria-label="Make something"
      className="relative h-[235svh] border-t border-line"
    >
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-[var(--spacing-gutter)] text-center">

        {/* progress hairline — grows during SOMETHING stage */}
        <span
          data-m-hairline
          aria-hidden
          className="absolute inset-x-0 top-[50svh] h-px origin-left bg-accent opacity-40"
        />

        {/* the word stage */}
        <div className="relative flex min-h-[1em] items-center justify-center font-display text-[clamp(3.6rem,14vw,13rem)] font-extrabold leading-none tracking-tight text-ink">
          <span data-m-word-0 aria-hidden className="absolute opacity-0">MAKE</span>
          <span data-m-word-1 aria-hidden className="absolute opacity-0">SOMETHING</span>
          <span data-m-word-2 className="absolute">WITH&nbsp;ME.</span>
        </div>

        {/* action words — visible during MAKE stage */}
        <p
          data-m-actions
          aria-hidden
          className="mt-10 flex max-w-[86vw] flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.4em] text-ink-dim md:text-xs"
        >
          {ACTIONS.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </p>

        {/* contact — visible at WITH ME stage */}
        <div data-m-contact className="mt-14 flex flex-col items-center gap-7">
          <a
            href={`mailto:${site.email}`}
            className="border-b border-accent pb-2 font-display text-[clamp(1.2rem,4.2vw,3rem)] font-bold tracking-tight text-ink transition-colors hover:text-accent-hi"
          >
            {site.email}
          </a>
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] tracking-[0.3em] text-ink-faint transition-colors hover:text-ink"
                >
                  {s.label.toUpperCase()} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
