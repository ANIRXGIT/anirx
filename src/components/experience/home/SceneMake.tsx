"use client";

import { useEffect, useRef } from "react";
import { site, socials } from "@/content/site";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 04 — MAKE SOMETHING. A full-screen end-title for contact.
 * Slow scroll sequence: MAKE → SOMETHING → WITH ME. → the invitation
 * → hello@anirx.in and the channels. Reduced motion / no-JS read the
 * complete invitation immediately.
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
      gsap.set(q("[data-m-actions] span"), { autoAlpha: 0, y: 16 });
      gsap.set(q("[data-m-contact]"), { autoAlpha: 0, y: 18 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });

      tl.to(w0, { autoAlpha: 1, yPercent: 0, duration: 0.14 }, 0.02)
        .to(w0, { autoAlpha: 0, yPercent: -18, duration: 0.1 }, 0.26)
        .to(w1, { autoAlpha: 1, yPercent: 0, duration: 0.14 }, 0.32)
        .to(w1, { autoAlpha: 0, yPercent: -18, duration: 0.1 }, 0.52)
        .to(w2, { autoAlpha: 1, yPercent: 0, duration: 0.14 }, 0.58)
        .to(q("[data-m-actions] span"), { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.1 }, 0.74)
        .to(q("[data-m-contact]"), { autoAlpha: 1, y: 0, duration: 0.14 }, 0.85)
        .to({}, { duration: 0.08 });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="make-something" aria-label="Make something" className="relative h-[235svh] border-t border-line">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-[var(--spacing-gutter)] text-center">
        {/* the slow insistence */}
        <div className="relative flex min-h-[1em] items-center justify-center font-display text-[clamp(3.6rem,14vw,13rem)] font-extrabold leading-none tracking-tight text-ink">
          <span data-m-word-0 aria-hidden className="absolute opacity-0">MAKE</span>
          <span data-m-word-1 aria-hidden className="absolute opacity-0">SOMETHING</span>
          <span data-m-word-2 className="absolute">WITH&nbsp;ME.</span>
        </div>

        {/* the invitation */}
        <p data-m-actions aria-hidden className="mt-12 flex max-w-[86vw] flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.4em] text-ink-dim md:text-xs">
          {ACTIONS.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </p>

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
