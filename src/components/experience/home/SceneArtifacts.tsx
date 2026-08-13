"use client";

import { useEffect, useRef } from "react";
import { projects } from "@/content/projects";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { Mark } from "@/components/ui/Mark";

/**
 * ACT 03 — THE THINGS I MAKE. Three artifact-chapters, not cards.
 * Each project is a room with its own light: ASTRA in system's cyan,
 * HOSTELMART in foundry gold, ANIRX in the house maroon.
 * Only real repository data ever renders — `[ADD …]` fields stay home.
 */

const ORDER = ["astra", "hostelmart", "anirx"] as const;

const TONES: Record<string, string> = {
  astra: "var(--tone-tech)",
  hostelmart: "var(--tone-gold)",
  anirx: "var(--accent-hi)",
};

const real = (v: string) => !v.startsWith("[ADD");

export function SceneArtifacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>("[data-art]").forEach((chapter) => {
        const cq = gsap.utils.selector(chapter);
        gsap.set(cq("[data-a-reveal]"), { autoAlpha: 0, yPercent: 30 });
        gsap.to(cq("[data-a-reveal]"), {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: chapter, start: "top 68%", toggleActions: "restart none none reverse" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  const artifacts = ORDER.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is (typeof projects)[number] => Boolean(p),
  );

  return (
    <section ref={sectionRef} id="the-things-i-make" aria-label="The things I make" className="relative border-t border-line">
      {artifacts.map((p, idx) => {
        const flip = idx % 2 === 1;
        return (
          <article
            key={p.id}
            data-art={p.id}
            aria-label={p.title}
            className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[var(--spacing-gutter)]"
            style={{ ["--art-tone" as string]: TONES[p.id] }}
          >
            {/* the room's light */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(80% 60% at ${flip ? "24%" : "76%"} 40%, color-mix(in srgb, var(--art-tone) 13%, transparent), transparent 62%)`,
              }}
            />

            <p data-a-reveal className="relative font-mono text-[10px] tracking-[0.45em] text-ink-faint">
              {p.category} — {p.year}
            </p>

            <div className={`relative mt-6 flex items-start gap-5 ${flip ? "md:flex-row-reverse md:text-right" : ""}`}>
              <span className="mt-3 hidden font-mono text-[10px] tracking-[0.3em] text-ink-faint md:block">{p.index}</span>
              <h3 data-a-reveal className="art-title font-display text-[clamp(2.8rem,12.5vw,13rem)] font-extrabold leading-[0.95] tracking-tight">
                {p.title}
              </h3>
              {p.id === "anirx" && (
                <span data-a-reveal className="mt-4 shrink-0 text-accent-hi">
                  <Mark size={34} />
                </span>
              )}
            </div>

            <p data-a-reveal className={`relative mt-6 max-w-[46ch] font-edit text-xl italic leading-snug text-ink-dim md:text-2xl ${flip ? "md:self-end md:text-right" : ""}`}>
              {p.subtitle}.
            </p>

            {real(p.description) && (
              <p data-a-reveal className={`relative mt-5 max-w-[52ch] text-sm leading-relaxed text-ink-dim ${flip ? "md:self-end md:text-right" : ""}`}>
                {p.description}
              </p>
            )}

            {p.technologies.filter(real).length > 0 && (
              <ul data-a-reveal className={`relative mt-8 flex flex-wrap gap-2 ${flip ? "md:justify-end" : ""}`}>
                {p.technologies.filter(real).map((t) => (
                  <li key={t} className="border border-line px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] text-ink-dim">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </section>
  );
}
