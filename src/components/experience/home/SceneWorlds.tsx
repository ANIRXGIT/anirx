"use client";

import { useEffect, useRef } from "react";
import { disciplines } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 02 — THE WORLD. This is how Anirudh's brain moves.
 *
 * Not a skills list, not a morphing object: one continuous environment
 * the visitor walks through. Each world is a room built from light,
 * scale and typography alone — a letterboxed screen (FILM), strata of
 * the same word finding their cut (EDIT), ruled structure (CODE), a
 * word that breathes (AI), a structure assembling itself (BUILD),
 * an oversized expressive crop (CREATE), lateral speed (SPORT).
 *
 * Nothing is numbered, nothing is named twice, nothing explains itself.
 * Reduced motion / no-JS: every world stands still and read.
 */

const WORD = "font-display font-extrabold leading-[0.95] tracking-tight text-ink";

export function SceneWorlds() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-world]");

      panels.forEach((panel) => {
        const pq = gsap.utils.selector(panel);

        gsap.set(pq("[data-w-reveal]"), { autoAlpha: 0, yPercent: 26 });
        const enter = gsap.timeline({
          scrollTrigger: { trigger: panel, start: "top 72%", toggleActions: "restart none none reverse" },
        });
        enter.to(pq("[data-w-reveal]"), { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.07 }, 0);

        switch (panel.dataset.world) {
          case "edit":
            /* three strata finding the cut */
            enter.fromTo(
              pq("[data-slice]"),
              { xPercent: (i) => [-38, 26, -18][i] ?? 0 },
              { xPercent: 0, duration: 0.55, ease: "power2.out", stagger: 0.1 },
              0.08,
            );
            break;
          case "code":
            enter.fromTo(
              pq("[data-draw-v]"),
              { scaleY: 0, transformOrigin: "top" },
              { scaleY: 1, duration: 0.8, ease: "power2.out", stagger: 0.08 },
              0,
            );
            enter.fromTo(
              pq("[data-draw-h]"),
              { scaleX: 0, transformOrigin: "left" },
              { scaleX: 1, duration: 0.6, ease: "power2.out", stagger: 0.07 },
              0.2,
            );
            break;
          case "build":
            enter.fromTo(
              pq("[data-bar]"),
              { y: (i) => (i % 2 === 0 ? -30 : 30), scaleX: 0.3, autoAlpha: 0 },
              { y: 0, scaleX: 1, autoAlpha: 1, duration: 0.55, ease: "power3.out", stagger: 0.08 },
              0.15,
            );
            break;
          case "create":
            enter.fromTo(pq("[data-create-word]"), { rotation: -11 }, { rotation: -4, duration: 1.1, ease: "power2.out" }, 0);
            break;
          case "sport":
            gsap.fromTo(pq("[data-sport-word]"), { xPercent: 12 }, {
              xPercent: -12, ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: 0.6 },
            });
            gsap.fromTo(pq("[data-streak]"), { xPercent: -50 }, {
              xPercent: 70, ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: 0.4 },
            });
            break;
          default:
            break;
        }
      });

      /* chapter statements */
      gsap.utils.toArray<HTMLElement>("[data-w-statement]").forEach((el) => {
        gsap.set(el.querySelectorAll("span"), { autoAlpha: 0, y: 18 });
        gsap.to(el.querySelectorAll("span"), {
          autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 74%", toggleActions: "restart none none reverse" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} id="whos-ani" aria-label="The world" className="relative border-t border-line">
      {/* chapter entrance */}
      <div data-w-statement className="flex min-h-[80svh] flex-col items-center justify-center gap-6 px-[var(--spacing-gutter)] text-center">
        <span className="font-mono text-[10px] tracking-[0.45em] text-ink-faint">THE WORLD</span>
        <span className="max-w-[22ch] font-edit text-2xl italic leading-snug text-ink md:text-4xl">
          This is how my brain moves.
        </span>
      </div>

      {/* FILM — the letterboxed field */}
      <article data-world="film" aria-label="Film" className="relative flex min-h-[105svh] items-end justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-[11svh] bg-black" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-[11svh] bg-black" />
        <span
          aria-hidden
          className="absolute left-[-10%] right-[-10%] top-[36%] h-[34vh] opacity-[0.16] [animation:world-streak_9s_ease-in-out_infinite_alternate]"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--tone-accent) 34%, transparent) 50%, transparent)" }}
        />
        <h3 className="sr-only">Film</h3>
        <p data-w-reveal aria-hidden className={`mb-[21svh] ${WORD} text-[17vw]`}>
          FILM
        </p>
        <p data-w-reveal className="absolute bottom-[13.5svh] right-[var(--spacing-gutter)] font-edit text-lg italic text-ink-dim md:text-xl">
          {disciplines[0].note}
        </p>
      </article>

      {/* EDIT — the strata align */}
      <article data-world="edit" aria-label="Edit" className="relative flex min-h-[105svh] flex-col items-center justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        <h3 className="sr-only">Edit</h3>
        <div data-w-reveal aria-hidden className="relative">
          {[0, 1, 2].map((i) => (
            <div key={i} data-slice className="h-[0.34em] overflow-hidden">
              <span className={`${WORD} block text-[15vw]`} style={{ transform: `translateY(${(-0.334 * i).toFixed(3)}em)` }}>
                EDIT
              </span>
            </div>
          ))}
        </div>
        <p data-w-reveal className="mt-10 font-edit text-lg italic text-ink-dim md:text-xl">{disciplines[1].note}</p>
      </article>

      {/* CODE — ruled structure */}
      <article data-world="code" aria-label="Code" className="relative flex min-h-[105svh] items-center overflow-hidden px-[var(--spacing-gutter)]">
        <div className="world-env" aria-hidden />
        {[12, 33, 54, 75].map((leftPct) => (
          <span key={leftPct} data-draw-v aria-hidden className="absolute bottom-0 top-0 w-px bg-line" style={{ left: `${leftPct}%` }} />
        ))}
        <h3 className="sr-only">Code</h3>
        <div>
          <p data-w-reveal aria-hidden className={`${WORD} text-[14vw]`}>
            CODE
          </p>
          <p data-w-reveal className="mt-4 font-edit text-lg italic text-ink-dim md:text-xl">{disciplines[2].note}</p>
        </div>
        <div aria-hidden className="absolute right-[10%] top-1/2 hidden -translate-y-1/2 flex-col items-start gap-4 md:flex">
          {[150, 96, 60, 118].map((w, i) => (
            <span key={i} data-draw-h className="block h-px bg-ink-dim" style={{ width: w }} />
          ))}
        </div>
      </article>

      {/* AI — the word that thinks */}
      <article data-world="ai" aria-label="AI" className="relative flex min-h-[105svh] flex-col items-center justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        <h3 className="sr-only">AI</h3>
        <p data-w-reveal aria-hidden className={`${WORD} text-[26vw]`}>
          {"AI".split("").map((ch, i) => (
            <span key={i} data-letter style={{ ["--d" as string]: i }}>
              {ch}
            </span>
          ))}
        </p>
        <p data-w-reveal className="mt-6 font-edit text-lg italic text-ink-dim md:text-xl">{disciplines[3].note}</p>
      </article>

      {/* BUILD — the structure assembles */}
      <article data-world="build" aria-label="Build" className="relative flex min-h-[105svh] flex-col items-center justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        <h3 className="sr-only">Build</h3>
        <div className="flex flex-col items-center">
          <p data-w-reveal aria-hidden className={`${WORD} text-[15vw]`}>
            BUILD
          </p>
          <div aria-hidden className="mt-10 flex flex-col items-center gap-2.5">
            {[210, 150, 96, 54].map((w, i) => (
              <span
                key={i}
                data-bar
                className="block h-2"
                style={{ width: w, background: "var(--tone-gold)", opacity: 0.75 - i * 0.16 }}
              />
            ))}
          </div>
        </div>
        <p data-w-reveal className="mt-12 font-edit text-lg italic text-ink-dim md:text-xl">{disciplines[4].note}</p>
      </article>

      {/* CREATE — the expressive crop */}
      <article data-world="create" aria-label="Create" className="relative flex min-h-[105svh] items-center justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        <h3 className="sr-only">Create</h3>
        <div data-create-word>
          <p data-w-reveal aria-hidden className={`${WORD} text-[19vw]`} style={{ transform: "rotate(-4deg)" }}>
            CREATE
          </p>
        </div>
        <p data-w-reveal className="absolute bottom-[13svh] left-[var(--spacing-gutter)] font-edit text-lg italic text-accent-hi md:text-xl">
          {disciplines[5].note}
        </p>
      </article>

      {/* SPORT — lateral speed */}
      <article data-world="sport" aria-label="Sport" className="relative flex min-h-[105svh] flex-col items-center justify-center overflow-hidden">
        <div className="world-env" aria-hidden />
        {[16, 32, 48, 64, 80].map((top) => (
          <span key={top} data-streak aria-hidden className="absolute left-0 h-px w-[38vw] bg-line" style={{ top: `${top}%` }} />
        ))}
        <h3 className="sr-only">Sport</h3>
        <p data-sport-word aria-hidden className={`${WORD} text-[15vw]`}>
          SPORT
        </p>
        <p data-w-reveal className="mt-8 font-edit text-lg italic text-ink-dim md:text-xl">{disciplines[6].note}</p>
      </article>

      {/* WHAT I DO — the quiet editorial list, after the world rooms */}
      <article id="what-i-do" data-world="do" aria-label="What I do" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-[var(--spacing-gutter)]">
        <div className="world-env" aria-hidden />
        <h3 className="sr-only">What I do</h3>
        <div className="relative max-w-[860px]">
          <p data-w-reveal className="mb-14 font-mono text-[10px] tracking-[0.5em] text-ink-faint">WHAT I DO</p>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-20 md:gap-y-12">
            {[
              { label: "Video Editing", note: "Long-form, short-form, reels. 4+ years freelance." },
              { label: "Filmmaking", note: "Direction, DP, storytelling — one continuous practice." },
              { label: "Websites", note: "Fast, intentional, from brief to deployment." },
              { label: "Apps", note: "Native and web. Ideas that ship." },
              { label: "Creative Technology", note: "Where making films and writing code feel the same." },
              { label: "AI & Automation", note: "Building tools, not just using them." },
            ].map(({ label, note }) => (
              <div key={label} data-w-reveal className="group">
                <p className="font-display text-[clamp(1.6rem,4vw,3rem)] font-extrabold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-accent-hi">
                  {label}
                </p>
                <p className="mt-2 font-edit text-base italic leading-snug text-ink-dim md:text-lg">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* chapter close */}
      <div data-w-statement className="flex min-h-[85svh] flex-col items-center justify-center px-[var(--spacing-gutter)] text-center">
        <span className="max-w-[18ch] font-edit text-3xl italic leading-snug text-ink md:text-5xl">
          This is how the work gets made.
        </span>
      </div>
    </section>
  );
}
