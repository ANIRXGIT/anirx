"use client";

import { useEffect, useRef } from "react";
import { disciplines } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 02 — THE WORLD.
 *
 * PART A: WHO IS ANIRUDH — an editorial identity grid.
 * Discipline blocks at readable scale, each with tag, status, note,
 * and a tone-colour accent. Not giant words; real information.
 *
 * PART B: WHAT I DO — a capability grid.
 * Six disciplines at body scale with left-border colour accents.
 *
 * No giant-word-only panels. Every block has actual content.
 * Staggered reveal on scroll. Reduced motion reads everything static.
 */

/* tone colours per discipline — pulled from CSS custom props */
const TONE_VARS: Record<string, string> = {
  film:   "var(--accent-hi)",
  edit:   "var(--tone-data)",
  code:   "var(--tone-tech)",
  ai:     "var(--tone-tech)",
  build:  "var(--tone-gold)",
  create: "var(--tone-gold)",
  sport:  "var(--tone-ember)",
};

const CAPABILITIES = [
  { label: "Video Editing",       note: "Long-form, short-form, reels. 4+ years freelance.", tone: "var(--tone-data)" },
  { label: "Filmmaking",          note: "Direction, DP, storytelling — one continuous practice.", tone: "var(--accent-hi)" },
  { label: "Websites & Apps",     note: "Fast, intentional. From brief to deployment.", tone: "var(--tone-tech)" },
  { label: "Creative Technology", note: "Where making films and writing code feel the same.", tone: "var(--tone-gold)" },
  { label: "AI & Automation",     note: "Building tools, not just using them. See: ASTRA.", tone: "var(--tone-tech)" },
  { label: "Building Products",   note: "Full product thinking — ideas that ship. See: HOSTELMART.", tone: "var(--tone-gold)" },
];

export function SceneWorlds() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      /* stagger all data-w-reveal elements as they enter the viewport */
      section.querySelectorAll<HTMLElement>("[data-w-block]").forEach((block) => {
        const items = block.querySelectorAll<HTMLElement>("[data-w-reveal]");
        gsap.set(items, { autoAlpha: 0, y: 22 });
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: block,
            start: "top 76%",
            toggleActions: "restart none none reverse",
          },
        });
      });

      /* closing statement */
      const stmt = section.querySelector<HTMLElement>("[data-w-statement]");
      if (stmt) {
        const spans = stmt.querySelectorAll("span");
        gsap.set(spans, { autoAlpha: 0, y: 18 });
        gsap.to(spans, {
          autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: stmt, start: "top 74%", toggleActions: "restart none none reverse" },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="whos-ani" aria-label="The world" className="relative border-t border-line">

      {/* ─── PART A — WHO IS ANIRUDH ─────────────────────────────────────── */}
      <div
        data-w-block
        className="relative min-h-[100svh] overflow-hidden px-[var(--spacing-gutter)] py-24"
        style={{ background: "var(--atmosphere)" }}
      >
        {/* section label */}
        <p data-w-reveal className="mb-14 font-mono text-[10px] tracking-[0.5em] text-ink-faint">
          WHO IS ANIRUDH SHARMA
        </p>

        {/* identity header row */}
        <div data-w-reveal className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:gap-16">
          <div>
            <p className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink md:text-6xl">
              ANIRUDH
            </p>
            <p className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink md:text-6xl">
              SHARMA
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[10px] tracking-[0.4em] text-ink-faint">CREATIVE TECHNOLOGIST</p>
            <p className="font-mono text-[10px] tracking-[0.4em] text-ink-faint">CSE — THAPAR INSTITUTE</p>
            <p className="font-mono text-[10px] tracking-[0.4em] text-ink-faint">CURRENTLY — BUILDING ANIRX</p>
          </div>
        </div>

        {/* discipline grid */}
        <div className="grid grid-cols-1 gap-px border border-line sm:grid-cols-2 lg:grid-cols-3 lg:gap-px">
          {disciplines.map((d) => (
            <div
              key={d.id}
              data-w-reveal
              className="group relative flex flex-col gap-3 border-b border-line bg-canvas/40 p-6 backdrop-blur-sm last:border-b-0 sm:border-b md:last:border-b"
              style={{ borderLeftColor: TONE_VARS[d.id], borderLeftWidth: "2px" }}
            >
              {/* discipline name */}
              <p
                className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink transition-colors duration-300 md:text-3xl"
                style={{ color: "var(--ink)" }}
              >
                {d.label}
              </p>

              {/* tag + status row */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="border px-2 py-0.5 font-mono text-[8px] tracking-[0.3em]"
                  style={{ borderColor: TONE_VARS[d.id], color: TONE_VARS[d.id] }}
                >
                  {d.tag}
                </span>
                <span className="font-mono text-[8px] tracking-[0.25em] text-ink-faint">
                  {d.status}
                </span>
              </div>

              {/* note */}
              <p className="font-edit text-base italic leading-snug text-ink-dim md:text-lg">
                {d.note}
              </p>
            </div>
          ))}
        </div>

        {/* identity footnotes */}
        <div data-w-reveal className="mt-12 flex flex-wrap gap-x-10 gap-y-2">
          {[
            "4+ YEARS FREELANCE EDITING",
            "BUILDING — ASTRA",
            "BUILDING — HOSTELMART",
            "FOOTBALL · CRICKET · SWIMMING · CHESS",
          ].map((fact) => (
            <span key={fact} className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
              {fact}
            </span>
          ))}
        </div>
      </div>

      {/* ─── PART B — WHAT I DO ──────────────────────────────────────────── */}
      <div
        id="what-i-do"
        data-w-block
        className="relative min-h-[70svh] overflow-hidden px-[var(--spacing-gutter)] py-24"
      >
        {/* ambient light */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 70% at 12% 50%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%)",
          }}
        />

        <p data-w-reveal className="relative mb-14 font-mono text-[10px] tracking-[0.5em] text-ink-faint">
          WHAT I DO
        </p>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-20 md:gap-y-10 lg:grid-cols-3">
          {CAPABILITIES.map(({ label, note, tone }) => (
            <div
              key={label}
              data-w-reveal
              className="group relative pl-5"
              style={{ borderLeftColor: tone, borderLeftWidth: "2px", borderLeftStyle: "solid" }}
            >
              <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-hi md:text-2xl">
                {label}
              </p>
              <p className="mt-2 font-edit text-sm italic leading-snug text-ink-dim md:text-base">
                {note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CLOSING ─────────────────────────────────────────────────────── */}
      <div
        data-w-statement
        className="flex min-h-[50svh] flex-col items-center justify-center px-[var(--spacing-gutter)] text-center"
      >
        <span className="max-w-[20ch] font-edit text-2xl italic leading-snug text-ink md:text-4xl">
          This is how the work gets made.
        </span>
      </div>
    </section>
  );
}
