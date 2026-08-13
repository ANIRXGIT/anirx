"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site, socials } from "@/content/site";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 04 — END TITLES. The signature.
 *
 * ANIRX arrives hollow and fills as the visitor scrolls it into view —
 * the end-title of the whole experience. Then the person under the name,
 * then the statement, then the two doors. The Vault stays sealed.
 * Reduced motion / no-JS read the filled signature immediately.
 */
export function SceneEnd() {
  const titleRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = titleRef.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      gsap.fromTo(
        q("[data-end-word]"),
        { autoAlpha: 0.25, scale: 0.94 },
        {
          autoAlpha: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 85%", end: "center 50%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        q("[data-end-fill]"),
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 70%", end: "center 42%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        q("[data-end-name], [data-end-statement]"),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "center 60%", end: "center 38%", scrub: 0.6 },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section aria-label="End titles" className="rule-double relative border-t border-line">
      {/* THE SIGNATURE */}
      <div
        ref={titleRef}
        className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-[var(--spacing-gutter)] py-20 text-center"
      >
        <div data-end-word className="relative select-none will-change-transform">
          <span className="u-hollow block font-display text-[clamp(5rem,22vw,22rem)] font-extrabold leading-[0.92] tracking-tight">
            ANIRX<span className="u-hollow-accent">.</span>
          </span>
          <span
            data-end-fill
            aria-hidden="true"
            className="absolute inset-0 block font-display text-[clamp(5rem,22vw,22rem)] font-extrabold leading-[0.92] tracking-tight text-ink"
          >
            ANIRX<span className="text-accent-hi">.</span>
          </span>
        </div>
        <p data-end-name className="mt-10 font-display text-base font-bold tracking-[0.28em] text-ink md:text-xl">
          {site.owner.toUpperCase()}
        </p>
        <p data-end-statement className="mt-3 font-edit text-lg italic text-ink-dim md:text-xl">
          {site.statement}
        </p>
      </div>

      {/* THE TWO DOORS */}
      <div className="grid border-t border-line md:grid-cols-2">
        <span aria-hidden className="absolute left-1/2 top-0 hidden h-full w-px bg-accent/50 md:block" />

        <div id="make-something" className="flex flex-col gap-8 px-[var(--spacing-gutter)] py-20 md:py-24">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-tight">
            MAKE SOMETHING<span className="text-accent-hi">.</span>
          </h2>
          <p className="max-w-[38ch] text-sm leading-relaxed text-ink-dim">
            If you have something interesting to build, film, launch or fix —
            I&apos;d rather hear about it than not.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="w-fit border-b border-accent pb-1 font-mono text-sm tracking-[0.2em] text-ink transition-colors hover:text-accent-hi"
          >
            {site.email}
          </a>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] tracking-[0.25em] text-ink-faint transition-colors hover:text-ink"
                >
                  {s.label.toUpperCase()} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8 border-t border-line px-[var(--spacing-gutter)] py-20 md:border-t-0 md:py-24">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-tight text-accent-hi">
            THE VAULT<span className="text-ink">.</span>
          </h2>
          <p className="max-w-[38ch] text-sm leading-relaxed text-ink-dim">
            Some things aren&apos;t for everyone. Behind this door runs ANIERA —
            the private operating system that runs the person.
          </p>
          <div>
            <Link
              href="/vault"
              className="group inline-flex items-center gap-3 border border-accent px-7 py-3.5 font-mono text-[11px] tracking-[0.3em] text-accent-hi transition-colors duration-500 hover:bg-accent hover:text-[var(--color-ink-media)]"
            >
              REQUEST ENTRY
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <p className="mt-3 font-mono text-[8px] tracking-[0.25em] text-ink-faint">ENTRY RESTRICTED</p>
          </div>
        </div>
      </div>

      {/* quiet signature line */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-[var(--spacing-gutter)] py-5">
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
          © {new Date().getFullYear()} ANIRUDH SHARMA — ANIRX.IN
        </p>
        <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">{site.statement}</p>
      </footer>
    </section>
  );
}
