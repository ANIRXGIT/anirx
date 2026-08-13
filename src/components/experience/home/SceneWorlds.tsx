"use client";

import { useEffect, useRef } from "react";
import { disciplines } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { AnirxObject, WORLD_IDS, WORLD_TILT, worldPose } from "@/components/experience/object/AnirxObject";

/**
 * ACT 02 — THE WORLDS. This is how Anirudh's brain moves.
 *
 * One body, seven minds: the same monolith the hero handed down is
 * continuously rebuilt as the visitor scrolls — a curved screen (FILM),
 * a cascade (EDIT), a column (CODE), a helix (AI), a slab (BUILD),
 * a fan (CREATE), a lean (SPORT). Its light follows each world.
 *
 * One world is ever named. Nothing is counted. Nothing is a card.
 * Reduced motion / no-JS read the worlds as a quiet list beneath the
 * standing monolith.
 */

const TONE_VAR: Record<string, string> = {
  accent: "--tone-accent",
  data: "--tone-data",
  tech: "--tone-tech",
  ember: "--tone-ember",
  gold: "--tone-gold",
};

export function SceneWorlds() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    section.classList.add("js-w");

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const plates = q("[data-obj-plate]");
      const tilt = q("[data-obj-tilt]");
      const stage = section.querySelector<HTMLElement>("[data-obj-stage]");
      const words = q("[data-w-word]");
      const notes = q("[data-w-note]");
      const metas = q("[data-w-meta]");
      let lastStop = 0;

      /* world light — read the mode's true token values once */
      const rootStyle = getComputedStyle(document.documentElement);
      const glows = disciplines.map((d) => {
        const v = rootStyle.getPropertyValue(TONE_VAR[d.tone] ?? "--tone-accent").trim();
        return v || "#c7566f";
      });
      stage?.style.setProperty("--world-glow", glows[0]);

      gsap.set(words, { autoAlpha: 0, yPercent: 100 });
      gsap.set(words[0], { autoAlpha: 1, yPercent: 0 });
      gsap.set(notes, { autoAlpha: 0 });
      gsap.set(notes[0], { autoAlpha: 1 });
      gsap.set(metas, { autoAlpha: 0 });
      gsap.set(metas[0], { autoAlpha: 1 });

      const showWorld = (to: number, from: number) => {
        gsap.to(words[from], { autoAlpha: 0, yPercent: -110, duration: 0.2, ease: "power2.in", overwrite: "auto" });
        gsap.fromTo(
          words[to],
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: "power2.out", delay: 0.05, overwrite: "auto" },
        );
        gsap.to(notes[from], { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
        gsap.to(notes[to], { autoAlpha: 1, duration: 0.3, delay: 0.07, overwrite: "auto" });
        gsap.to(metas[from], { autoAlpha: 0, duration: 0.15, overwrite: "auto" });
        gsap.to(metas[to], { autoAlpha: 1, duration: 0.25, delay: 0.1, overwrite: "auto" });
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=410%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const s = Math.min(WORLD_IDS.length - 1, Math.floor(self.progress * WORLD_IDS.length));
            if (s !== lastStop) {
              showWorld(s, lastStop);
              lastStop = s;
            }
          },
        },
      });

      /* the monolith the hero sealed resolves back to a clean stack… */
      tl.to(plates, {
        x: (i) => worldPose(WORLD_IDS[0], i).x,
        y: (i) => worldPose(WORLD_IDS[0], i).y,
        z: (i) => worldPose(WORLD_IDS[0], i).z,
        rotationY: (i) => worldPose(WORLD_IDS[0], i).ry,
        duration: 0.85,
        ease: "power2.inOut",
        stagger: 0.018,
      }, 0.15)
        .to(tilt, { rotationY: WORLD_TILT[WORLD_IDS[0]], duration: 0.9, ease: "power2.inOut" }, 0.15);

      /* …then each world rebuilds it */
      WORLD_IDS.forEach((world, w) => {
        if (w === 0) return;
        const at = w * 1.0;
        tl.to(
          plates,
          {
            x: (i) => worldPose(world, i).x,
            y: (i) => worldPose(world, i).y,
            z: (i) => worldPose(world, i).z,
            rotationY: (i) => worldPose(world, i).ry,
            duration: 0.85,
            ease: "power2.inOut",
            stagger: 0.018,
          },
          at,
        )
          .to(tilt, { rotationY: WORLD_TILT[world], duration: 0.9, ease: "power2.inOut" }, at)
          .to(stage, { "--world-glow": glows[w], duration: 0.85, ease: "power1.inOut" } as gsap.TweenVars, at);
      });

      tl.to({}, { duration: 0.5 });
    }, section);

    return () => {
      section.classList.remove("js-w");
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} id="whos-ani" aria-label="The worlds of Anirudh" data-cine className="relative">
      <div data-w-stage className="relative h-svh overflow-hidden">
        <h2 className="sr-only">
          The worlds — film, edit, code, AI, build, create, sport
        </h2>

        {/* the continuous body */}
        <AnirxObject className="obj-stage--worlds" />

        {/* the world being inhabited — bottom-left, never a counter */}
        <div className="absolute bottom-[12svh] left-[var(--spacing-gutter)] z-20 max-w-[80vw]">
          <div className="relative h-[1em] overflow-hidden font-mono text-[9px] tracking-[0.4em] text-ink-faint md:text-[10px]">
            {disciplines.map((d, i) => (
              <span key={d.id} data-w-meta aria-hidden="true" className={`absolute left-0 top-0 whitespace-nowrap ${i === 0 ? "opacity-100" : "opacity-0"}`}>
                {d.tag} — {d.status}
              </span>
            ))}
          </div>
          <div className="relative mt-3 h-[1.05em] overflow-hidden font-display text-[clamp(2.6rem,9vw,8.5rem)] font-extrabold leading-none tracking-tight">
            {disciplines.map((d, i) => (
              <span
                key={d.id}
                data-w-word
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 block text-ink ${i === 0 ? "opacity-100" : "opacity-0"}`}
              >
                {d.label}
              </span>
            ))}
          </div>
          <div className="relative mt-4 h-[3em] max-w-[30ch] overflow-hidden">
            {disciplines.map((d, i) => (
              <p
                key={d.id}
                data-w-note
                aria-hidden="true"
                className={`absolute left-0 top-0 font-edit text-base italic leading-snug text-ink-dim md:text-lg ${i === 0 ? "opacity-100" : "opacity-0"}`}
              >
                {d.note}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* the worlds, readable — until the live object takes over (JS + full motion) */}
      <div data-w-list className="border-t border-line px-[var(--spacing-gutter)] py-16 md:py-20">
        <ul className="flex flex-col gap-6">
          {disciplines.map((d) => (
            <li key={d.id} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line pb-6">
              <span className="font-mono text-[9px] tracking-[0.3em] text-accent-hi">{d.tag}</span>
              <span className="font-display text-2xl font-bold tracking-tight text-ink">{d.label}</span>
              <span className="hidden font-mono text-[9px] tracking-[0.25em] text-ink-faint sm:inline">{d.status}</span>
              <span className="w-full font-edit text-base italic text-ink-dim sm:w-auto sm:flex-1 sm:text-right">{d.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
