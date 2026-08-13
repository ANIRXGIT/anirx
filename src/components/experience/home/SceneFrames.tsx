"use client";

import { useEffect, useRef } from "react";
import { sevenFrames } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { AnirxObject, cutPose, tightPose } from "@/components/experience/object/AnirxObject";

/**
 * ACT 02 — THE SEVEN. One object, seven states, discovered by scroll.
 * The monolith the hero closed is this very body: FRAME establishes the
 * geometry, LIGHT travels across it, MOTION turns it, CUT separates it,
 * COLOR turns the light, SOUND gives it rhythm, STORY resolves it.
 * Only the current state is ever named. Reduced motion / no-JS read
 * the whole score as a quiet list beneath the standing object.
 */
export function SceneFrames() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    section.classList.add("js-seven");

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const plates = q("[data-obj-plate]");
      const tilt = q("[data-obj-tilt]");
      const stage = section.querySelector<HTMLElement>("[data-obj-stage]");
      const counter = section.querySelector<HTMLElement>("[data-sev-count]");
      const words = q("[data-sev-word]");
      const reads = q("[data-sev-read]");
      const copies = q("[data-sev-copy]");
      let lastStop = 0;

      gsap.set(words, { autoAlpha: 0, yPercent: 100 });
      gsap.set(words[0], { autoAlpha: 1, yPercent: 0 });
      gsap.set(reads, { autoAlpha: 0 });
      gsap.set(reads[0], { autoAlpha: 1 });
      gsap.set(copies, { autoAlpha: 0 });
      gsap.set(copies[0], { autoAlpha: 1 });
      gsap.set(q("[data-sev-final]"), { autoAlpha: 0, y: 16 });

      const showStop = (to: number, from: number) => {
        if (counter) counter.textContent = `${sevenFrames[to].index} / 07`;
        gsap.to(words[from], { autoAlpha: 0, yPercent: -110, duration: 0.18, ease: "power2.in", overwrite: "auto" });
        gsap.fromTo(
          words[to],
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: "power2.out", delay: 0.06, overwrite: "auto" },
        );
        gsap.to(reads[from], { autoAlpha: 0, duration: 0.15, overwrite: "auto" });
        gsap.to(reads[to], { autoAlpha: 1, duration: 0.25, delay: 0.06, overwrite: "auto" });
        gsap.to(copies[from], { autoAlpha: 0, duration: 0.18, overwrite: "auto" });
        gsap.to(copies[to], { autoAlpha: 1, duration: 0.3, delay: 0.06, overwrite: "auto" });
        stage?.classList.toggle("state-color", to === 4);
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=340%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const s = Math.min(6, Math.floor(self.progress * 7));
            if (s !== lastStop) {
              showStop(s, lastStop);
              lastStop = s;
            }
          },
        },
      });

      /* 01 FRAME — geometry establishes: the stack aligns, the floor wakes */
      tl.fromTo(plates, { x: (i) => (i - 3) * 9 }, { x: (i) => (i - 3) * 8, duration: 0.4, ease: "power2.out" }, 0.1)
        .fromTo(q("[data-obj-floor]"), { opacity: 0.55 }, { opacity: 0.85, duration: 0.4, ease: "power1.out" }, 0.15);

      /* 02 LIGHT — one blade travels across the body, the edges answer */
      tl.fromTo(q("[data-obj-blade-b]"), { x: () => -window.innerWidth * 0.36 }, { x: () => window.innerWidth * 0.36, duration: 0.95, ease: "power1.inOut" }, 0.92)
        .fromTo(plates, { filter: "brightness(1)" }, { filter: "brightness(1.4)", duration: 0.22, stagger: 0.045 }, 1.0)
        .to(plates, { filter: "brightness(1)", duration: 0.3, stagger: 0.045 }, 1.4);

      /* 03 MOTION — the object turns its shoulders */
      tl.fromTo(tilt, { rotationY: 0, rotationX: 0 }, { rotationY: 24, rotationX: 2, duration: 0.5, ease: "power2.inOut" }, 1.84)
        .to(tilt, { rotationY: -10, rotationX: 0, duration: 0.45, ease: "power2.inOut" }, 2.34);

      /* 04 CUT — the body physically separates along its seam */
      tl.to(
        plates,
        { x: (i) => cutPose(i).x, z: (i) => cutPose(i).z, rotationY: (i) => cutPose(i).ry, duration: 0.42, ease: "power3.inOut" },
        2.76,
      );

      /* 05 COLOR — the light turns; the material answers (class-driven grade) */
      tl.to(plates, { filter: "brightness(1.12)", duration: 0.4, ease: "power1.inOut" }, 3.6);

      /* 06 SOUND — rhythm through the body: three pulses down the stack */
      tl.to(plates, { z: "+=12", duration: 0.14, stagger: 0.03, ease: "sine.inOut" }, 4.36)
        .to(plates, { z: "-=12", duration: 0.14, stagger: 0.03, ease: "sine.inOut" }, 4.64)
        .to(plates, { z: "+=8", duration: 0.12, stagger: 0.03, ease: "sine.inOut" }, 4.92)
        .to(plates, { z: "-=8", duration: 0.12, stagger: 0.03, ease: "sine.inOut" }, 5.18)
        .to(q("[data-obj-blade-b]"), { x: 0, duration: 0.5, ease: "power1.inOut" }, 4.36);

      /* 07 STORY — everything resolves into the final composition */
      tl.to(
        plates,
        { x: (i) => tightPose(i).x, z: (i) => tightPose(i).z, rotationY: (i) => tightPose(i).ry, duration: 0.5, ease: "power2.inOut" },
        5.6,
      )
        .to(tilt, { rotationY: 0, rotationX: 0, duration: 0.5, ease: "power2.inOut" }, 5.6)
        .to(plates, { filter: "brightness(1)", duration: 0.4 }, 5.7)
        .to(q("[data-sev-final]"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 6.0)
        .to({}, { duration: 0.3 })
        /* leaving the installation room — handoff into THE WORLD */
        .to(q("[data-sev-stage]"), { autoAlpha: 0, scale: 0.94, duration: 0.35 }, 6.5);
    }, section);

    return () => {
      section.classList.remove("js-seven");
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="The 7 frames" data-cine className="relative">
      <div data-sev-stage className="relative h-svh overflow-hidden">
        <h2 className="sr-only">The 7 frames — FRAME, LIGHT, MOTION, CUT, COLOR, SOUND, STORY</h2>

        {/* the object itself */}
        <AnirxObject />

        {/* the score's header — only the current state is named */}
        <div className="absolute inset-x-0 top-[13svh] z-20 flex items-end justify-between px-[var(--spacing-gutter)] md:top-[15svh]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.45em] text-ink-dim md:text-[11px]">
              <span data-sev-count>01 / 07</span>
            </p>
            <div className="relative mt-3 h-[1.15em] overflow-hidden font-display text-[clamp(2.1rem,5vw,4.2rem)] font-extrabold leading-none tracking-tight">
              {sevenFrames.map((f, i) => (
                <span
                  key={f.index}
                  data-sev-word
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 block text-ink ${i === 0 ? "opacity-100" : "opacity-0"}`}
                >
                  {f.word}
                </span>
              ))}
            </div>
          </div>
          <div className="relative hidden h-[1.2em] overflow-hidden font-mono text-[10px] tracking-[0.3em] text-ink-faint md:block">
            {sevenFrames.map((f, i) => (
              <span key={f.index} data-sev-read aria-hidden="true" className={`absolute right-0 top-0 ${i === 0 ? "opacity-100" : "opacity-0"}`}>
                {f.readout}
              </span>
            ))}
          </div>
        </div>

        {/* the authored line of the current state */}
        <div className="absolute inset-x-0 bottom-[8svh] z-20 flex justify-center px-[var(--spacing-gutter)]">
          <div className="relative h-[3.4em] w-full max-w-[52ch] overflow-hidden text-center">
            {sevenFrames.map((f, i) => (
              <p
                key={f.index}
                data-sev-copy
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 font-edit text-base italic leading-snug text-ink-dim md:text-lg ${i === 0 ? "opacity-100" : "opacity-0"}`}
              >
                {f.copy}
              </p>
            ))}
          </div>
        </div>

        {/* STORY — the reason, resolving under everything */}
        <p
          data-sev-final
          aria-hidden="true"
          className="absolute bottom-[16svh] left-1/2 z-20 w-max max-w-[86vw] -translate-x-1/2 text-center font-edit text-xl italic leading-snug text-ink opacity-0 md:text-2xl"
        >
          Every film is made of these seven.<br />
          <span className="text-accent-hi">So is everything else I build.</span>
        </p>
      </div>

      {/* the score, readable — until the live object takes over (JS + full motion) */}
      <div data-sev-list className="border-t border-line px-[var(--spacing-gutter)] py-16 md:py-20">
        <ul className="flex flex-col gap-6">
          {sevenFrames.map((f) => (
            <li key={f.index} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line pb-6">
              <span className="font-mono text-[10px] tracking-[0.3em] text-accent-hi">{f.index}</span>
              <span className="font-display text-2xl font-bold tracking-tight text-ink">{f.word}</span>
              <span className="hidden font-mono text-[9px] tracking-[0.25em] text-ink-faint sm:inline">{f.readout}</span>
              <span className="w-full font-edit text-base italic text-ink-dim sm:w-auto sm:flex-1 sm:text-right">{f.copy}</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 font-edit text-xl italic leading-snug text-ink-dim">
          Every film is made of these seven. <span className="text-ink">So is everything else I build.</span>
        </p>
      </div>
    </section>
  );
}
