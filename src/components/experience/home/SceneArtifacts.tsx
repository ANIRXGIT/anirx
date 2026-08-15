"use client";

import { useEffect, useRef } from "react";
import { projects } from "@/content/projects";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { Mark } from "@/components/ui/Mark";
import { MediaSlot } from "@/components/ui/MediaSlot";

/**
 * ACT 03 — THINGS I BUILD. Three artifact-chapters.
 *
 * Each project room has:
 * - category / year / status metadata
 * - the project title at editorial scale
 * - a visual artifact area: real image (if available) or a styled
 *   data-block in the project's tone colour — never a fake mockup
 * - subtitle, description, technology tags
 *
 * Only real repository data ever renders — [ADD …] fields are hidden.
 */

const ORDER = ["astra", "hostelmart", "anirx"] as const;

const TONES: Record<string, string> = {
  astra:      "var(--tone-tech)",
  hostelmart: "var(--tone-gold)",
  anirx:      "var(--accent-hi)",
};

const STATUS_LABEL: Record<string, string> = {
  building: "NOW BUILDING",
  active:   "ACTIVE",
  complete: "COMPLETE",
};

const real = (v: string) => !v.startsWith("[ADD");

/** Styled data-block shown when no project image is available */
function ArtifactCard({
  id,
  title,
  category,
  year,
  tone,
  technologies,
}: {
  id: string;
  title: string;
  category: string;
  year: string;
  tone: string;
  technologies: string[];
}) {
  const stack = technologies.filter(real);
  return (
    <div
      className="relative flex h-full min-h-[240px] w-full flex-col justify-between overflow-hidden border p-6 md:min-h-[300px]"
      style={{ borderColor: tone, background: `color-mix(in srgb, ${tone} 5%, transparent)` }}
    >
      {/* corner accent */}
      <span
        aria-hidden
        className="absolute right-0 top-0 h-16 w-16 opacity-30"
        style={{ background: `radial-gradient(circle at top right, ${tone}, transparent 70%)` }}
      />
      {/* top row */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[0.4em] text-ink-faint">{category}</p>
          <p className="mt-1.5 font-display text-3xl font-extrabold tracking-tight" style={{ color: tone }}>
            {title}
          </p>
        </div>
        <span className="font-mono text-[8px] tracking-[0.3em] text-ink-faint">{year}</span>
      </div>
      {/* tech stack (if real) */}
      {stack.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {stack.map((t) => (
            <span
              key={t}
              className="border px-2 py-1 font-mono text-[7px] tracking-[0.2em] text-ink-faint"
              style={{ borderColor: `color-mix(in srgb, ${tone} 40%, var(--line))` }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {/* id watermark */}
      <span
        aria-hidden
        className="absolute bottom-4 right-6 select-none font-mono text-[10px] tracking-[0.3em] text-ink-faint opacity-30"
      >
        {id.toUpperCase()}
      </span>
    </div>
  );
}

export function SceneArtifacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>("[data-art]").forEach((chapter) => {
        const cq = gsap.utils.selector(chapter);
        gsap.set(cq("[data-a-reveal]"), { autoAlpha: 0, yPercent: 24 });
        gsap.to(cq("[data-a-reveal]"), {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: chapter,
            start: "top 70%",
            toggleActions: "restart none none reverse",
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  const artifacts = ORDER.map((id) => projects.find((p) => p.id === id)).filter(
    (p): p is (typeof projects)[number] => Boolean(p),
  );

  return (
    <section
      ref={sectionRef}
      id="the-things-i-make"
      aria-label="The things I make"
      className="relative border-t border-line"
    >
      {/* chapter entrance */}
      <div className="flex min-h-[50svh] flex-col items-start justify-center px-[var(--spacing-gutter)] py-20">
        <p className="font-mono text-[10px] tracking-[0.5em] text-ink-faint">THINGS I BUILD</p>
        <p className="mt-5 max-w-[26ch] font-edit text-2xl italic leading-snug text-ink md:text-4xl">
          Artifacts from the work.
        </p>
      </div>

      {artifacts.map((p, idx) => {
        const flip = idx % 2 === 1;
        const tone = TONES[p.id];
        return (
          <article
            key={p.id}
            data-art={p.id}
            aria-label={p.title}
            className="relative min-h-[90svh] overflow-hidden border-t border-line px-[var(--spacing-gutter)] py-16"
            style={{ ["--art-tone" as string]: tone }}
          >
            {/* room light */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(80% 55% at ${flip ? "22%" : "78%"} 35%, color-mix(in srgb, var(--art-tone) 12%, transparent), transparent 60%)`,
              }}
            />

            {/* metadata row */}
            <p data-a-reveal className="relative mb-8 font-mono text-[9px] tracking-[0.45em] text-ink-faint">
              {p.category}&ensp;—&ensp;{p.year}&ensp;—&ensp;
              <span style={{ color: tone }}>{STATUS_LABEL[p.status] ?? p.status.toUpperCase()}</span>
            </p>

            {/* main grid: title + artifact */}
            <div
              className={`relative flex flex-col gap-10 lg:grid lg:items-start lg:gap-16 ${flip ? "lg:grid-cols-[1fr_2fr]" : "lg:grid-cols-[2fr_1fr]"}`}
            >
              {/* text side */}
              <div className={flip ? "lg:order-2" : ""}>
                <div className="flex items-start gap-4">
                  <h3
                    data-a-reveal
                    className="font-display text-[clamp(2.4rem,10vw,9rem)] font-extrabold leading-[0.93] tracking-tight text-ink"
                  >
                    {p.title}
                  </h3>
                  {p.id === "anirx" && (
                    <span data-a-reveal className="mt-3 shrink-0" style={{ color: tone }}>
                      <Mark size={28} />
                    </span>
                  )}
                </div>

                <p data-a-reveal className="mt-5 max-w-[44ch] font-edit text-xl italic leading-snug text-ink-dim md:text-2xl">
                  {p.subtitle}.
                </p>

                {real(p.description) && (
                  <p data-a-reveal className="mt-4 max-w-[50ch] text-sm leading-relaxed text-ink-dim">
                    {p.description}
                  </p>
                )}

                {p.technologies.filter(real).length > 0 && (
                  <ul data-a-reveal className="mt-8 flex flex-wrap gap-2">
                    {p.technologies.filter(real).map((t) => (
                      <li
                        key={t}
                        className="border border-line px-3 py-1.5 font-mono text-[8px] tracking-[0.2em] text-ink-dim"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* visual artifact side */}
              <div data-a-reveal className={`relative max-h-[420px] min-h-[240px] ${flip ? "lg:order-1" : ""}`}>
                {/* future: check for real project image — for now all use styled card */}
                <ArtifactCard
                  id={p.id}
                  title={p.title}
                  category={p.category}
                  year={p.year}
                  tone={tone}
                  technologies={p.technologies}
                />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
