"use client";

import { useEffect, useRef } from "react";
import { disciplines, identity } from "@/content/identity";
import { gsap, ScrollTrigger } from "@/motion/gsap";
import { lenisStore } from "@/motion/lenisStore";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { AnirxObject, poseToTransform, restPose } from "@/components/experience/object/AnirxObject";

const SEEN_KEY = "anirx-intro-4";
const INTRO_ATTR = "data-intro";

/**
 * ACT 01 — THE ARRIVAL. (approved composition)
 *
 * ANIRUDH SHARMA at poster scale, left; the portrait standing right
 * of it between two tilted dark plates — the name passing behind the
 * panels. Giant hollow A and X hold the background. Role and statement
 * sit beneath the name; the worlds line the bottom.
 *
 * The opening: dark room, ANIRX.IN, the panels arrive out of the dark,
 * the veil lifts off the portrait, the name lands. Skippable by any
 * input, once per session. Reduced motion / no-JS / seen-in-session
 * read the resting composition immediately.
 */
export function SceneHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }

    let detachSkip: () => void = () => {};
    let detachPointer: () => void = () => {};

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const plates = q("[data-obj-plate]");

      /* EXIT — the name approaches; the panels lean away and sink */
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.5 },
        })
        .to(plates, {
          xPercent: (i) => restPose(i).x * 1.18,
          z: (i) => restPose(i).z - 90,
          rotationZ: (i) => restPose(i).rz * 1.5,
          ease: "none",
          duration: 1,
        }, 0)
        .fromTo(q("[data-obj-tilt]"), { rotationY: -6, rotationX: 2 }, { rotationY: 9, rotationX: 0, ease: "none", duration: 1 }, 0)
        .fromTo(q("[data-h-stage]"), { yPercent: 0 }, { yPercent: 9, ease: "none", duration: 1 }, 0)
        .fromTo(q("[data-h-letter-a]"), { autoAlpha: 0.05 }, { autoAlpha: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(q("[data-h-letter-x]"), { autoAlpha: 0.04 }, { autoAlpha: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(
          q("[data-h-nameblock]"),
          { scale: 1, yPercent: 0, autoAlpha: 1 },
          { scale: 1.12, yPercent: -4, autoAlpha: 0, ease: "none", duration: 0.7 },
          0,
        )
        .to(q("[data-h-meta], [data-h-cue], [data-h-lanes]"), { autoAlpha: 0, ease: "none", duration: 0.3 }, 0);

      /* pointer parallax — the panels acknowledge the hand */
      if (window.matchMedia("(pointer: fine)").matches) {
        const tilt = section.querySelector<HTMLElement>("[data-obj-tilt]");
        if (tilt) {
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3.out" });
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            if (window.scrollY > section.offsetHeight * 0.6) return;
            ry(-6 + (e.clientX / window.innerWidth - 0.5) * 5);
            rx(2 - (e.clientY / window.innerHeight - 0.5) * 3.5);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          detachPointer = () => window.removeEventListener("pointermove", onMove);
        }
      }

      if (seen) {
        gsap.set(q("[data-obj-veil]"), { opacity: 0.08 });
        return;
      }

      /* THE OPENING */
      document.documentElement.setAttribute(INTRO_ATTR, "playing");

      gsap.set(q("[data-obj-veil]"), { opacity: 1 });
      gsap.set(q("[data-h-letter-a], [data-h-letter-x]"), { autoAlpha: 0 });
      gsap.set(plates, {
        xPercent: (i) => restPose(i).x * 1.7,
        y: (i) => restPose(i).y,
        z: (i) => restPose(i).z - 720,
        rotationY: 0,
        rotationZ: (i) => restPose(i).rz + (i - 1) * 7,
        autoAlpha: 0,
      });
      gsap.set(q("[data-obj-tilt]"), { rotationY: -30, rotationX: 6 });
      gsap.set(q("[data-obj-floor]"), { opacity: 0 });
      gsap.set(q("[data-h-prelude]"), { autoAlpha: 1 });
      gsap.set(q("[data-h-wordmark]"), { autoAlpha: 0, letterSpacing: "0.9em" });
      gsap.set(q("[data-h-dot]"), { autoAlpha: 0, scale: 0.6 });
      gsap.set(q("[data-h-lane]"), { autoAlpha: 0, y: 10 });
      gsap.set(q("[data-h-name-1], [data-h-name-2]"), { yPercent: 112 });
      gsap.set(q("[data-h-role], [data-h-statement], [data-h-cue]"), { autoAlpha: 0, y: 12 });
      gsap.set(q("[data-h-rule]"), { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: unlock });

      tl.fromTo(q("[data-h-dot]"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 0.9, scale: 1, duration: 0.6 }, 0.15)
        .fromTo(
          q("[data-h-wordmark]"),
          { autoAlpha: 0, letterSpacing: "0.9em" },
          { autoAlpha: 1, letterSpacing: "0.42em", duration: 1.0 },
          0.3,
        )
        /* the panels arrive out of the dark — flanks first, the portrait last */
        .to(
          plates,
          {
            xPercent: (i) => restPose(i).x,
            y: (i) => restPose(i).y,
            z: (i) => restPose(i).z,
            rotationY: (i) => restPose(i).ry,
            rotationZ: (i) => restPose(i).rz,
            autoAlpha: 1,
            stagger: { each: 0.12, from: "edges" },
            duration: 1.3,
          },
          1.05,
        )
        .to(q("[data-obj-tilt]"), { rotationY: -6, rotationX: 2, duration: 1.7, ease: "power2.out" }, 1.2)
        .to(q("[data-obj-floor]"), { opacity: 0.85, duration: 1.3 }, 1.6)
        .to(q("[data-h-letter-a]"), { autoAlpha: 0.05, duration: 1.7 }, 1.35)
        .to(q("[data-h-letter-x]"), { autoAlpha: 0.04, duration: 1.7 }, 1.5)
        /* the wordmark has done its job */
        .to(q("[data-h-dot]"), { autoAlpha: 0, duration: 0.4 }, 2.3)
        .to(q("[data-h-wordmark]"), { autoAlpha: 0, y: -14, duration: 0.55 }, 2.5)
        /* the veil lifts — the portrait was there all along */
        .to(q("[data-obj-veil]"), { opacity: 0.08, duration: 1.5, ease: "power2.out" }, 2.9)
        /* the worlds line the bottom */
        .to(q("[data-h-lane]"), { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.5 }, 3.9)
        /* the name, at poster scale */
        .to(q("[data-h-name-1]"), { yPercent: 0, duration: 0.7 }, 4.4)
        .to(q("[data-h-name-2]"), { yPercent: 0, duration: 0.7 }, 4.75)
        .to(q("[data-h-role]"), { autoAlpha: 1, y: 0, duration: 0.45 }, 5.4)
        .to(q("[data-h-rule]"), { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 5.5)
        .to(q("[data-h-statement]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 5.9)
        .to(q("[data-h-cue]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 6.3)
        .to(q("[data-h-lane]"), { autoAlpha: 0.55, duration: 0.8 }, 6.3)
        .to({}, { duration: 0.4 });

      lockScroll();
      const skip = () => tl.progress(1);
      window.addEventListener("wheel", skip, { once: true, passive: true });
      window.addEventListener("touchmove", skip, { once: true, passive: true });
      window.addEventListener("keydown", skip, { once: true });
      window.addEventListener("pointerdown", skip, { once: true });
      const safety = window.setTimeout(() => tl.progress(1), 10000);
      detachSkip = () => {
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchmove", skip);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
        window.clearTimeout(safety);
      };
    }, section);

    function lockScroll() {
      lenisStore.stop();
      document.documentElement.style.overflow = "hidden";
    }
    function unlock() {
      lenisStore.start();
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute(INTRO_ATTR);
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* session-only */
      }
      ScrollTrigger.refresh();
    }

    return () => {
      detachSkip();
      detachPointer();
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute(INTRO_ATTR);
      lenisStore.start();
      ctx.revert();
    };
  }, [reduced]);

  useEffect(() => {
    /* Reduced motion: the composition stands still, portrait clear. */
    if (!reduced) return;
    const section = sectionRef.current;
    if (!section) return;
    section.querySelectorAll<HTMLElement>("[data-obj-plate]").forEach((el, i) => {
      el.style.transform = poseToTransform(restPose(i));
    });
    const veil = section.querySelector<HTMLElement>("[data-obj-veil]");
    if (veil) veil.style.opacity = "0.08";
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="Anirudh Sharma" data-cine data-scene="hero" className="relative">
      <div className="relative h-svh overflow-hidden bg-canvas">
        {/* the background letterforms — ghost geometry, deep behind */}
        <span
          data-h-letter-a
          aria-hidden
          className="u-hollow absolute -left-[2vw] top-[16svh] select-none font-display text-[27vw] font-extrabold leading-none tracking-tight opacity-[0.05]"
        >
          A
        </span>
        <span
          data-h-letter-x
          aria-hidden
          className="u-hollow absolute -right-[2vw] top-[24svh] select-none font-display text-[24vw] font-extrabold leading-none tracking-tight opacity-[0.04]"
        >
          X
        </span>

        {/* THE NAME + META — the poster block, left */}
        <div className="absolute left-[var(--spacing-gutter)] top-[55%] z-0 -translate-y-1/2 md:top-1/2">
          <h1 data-h-nameblock className="font-display text-left font-extrabold leading-[0.88] tracking-tight text-ink will-change-transform">
            <span className="block overflow-hidden">
              <span data-h-name-1 className="block text-[clamp(3.5rem,13vw,7.5rem)] md:text-[clamp(5rem,14vw,17rem)]">
                {identity.firstName}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-h-name-2 className="block text-[clamp(3.5rem,13vw,7.5rem)] md:text-[clamp(5rem,14vw,17rem)]">
                {identity.lastName}
              </span>
            </span>
          </h1>
          <div data-h-meta className="mt-9 flex flex-col gap-3.5">
            <p data-h-role className="flex items-center gap-4 font-mono text-[10px] tracking-[0.5em] text-ink-dim md:text-[11px]">
              <span data-h-rule aria-hidden className="block h-px w-10 bg-accent-hi" />
              {identity.role}
            </p>
            <p data-h-statement className="max-w-[32ch] font-edit text-lg italic leading-snug text-ink-dim md:text-xl">
              Too <span className="text-accent-hi">{identity.statementAccent}</span> to stay in one lane.
            </p>
          </div>
        </div>

        {/* THE PORTRAIT PANELS — right of the name, over its tail */}
        <div data-h-stage className="absolute inset-0 z-10">
          <AnirxObject className="obj-stage--hero" />
        </div>

        {/* PRELUDE — the dark room: one wordmark, one point of light. JS-only theater. */}
        <div
          data-h-prelude
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 opacity-0"
        >
          <span data-h-wordmark className="font-mono text-[12px] tracking-[0.42em] text-ink">
            ANIRX<span className="text-accent-hi">.IN</span>
          </span>
          <span
            data-h-dot
            className="block h-[3px] w-[3px] rounded-full bg-accent-hi shadow-[0_0_16px_3px_var(--accent-soft)]"
          />
        </div>

        {/* THE WORLDS — a quiet index along the bottom edge */}
        <div data-h-lanes aria-hidden className="absolute inset-x-0 bottom-[6.5svh] z-20 flex justify-center">
          <p className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 px-[var(--spacing-gutter)] font-mono text-[8px] tracking-[0.3em] md:gap-x-7 md:text-[9px] md:tracking-[0.35em]">
            {disciplines.map((d) => (
              <span key={d.id} data-h-lane className="text-ink-dim">
                {d.label}
              </span>
            ))}
          </p>
        </div>

        {/* CUE — the small needle below the row */}
        <div data-h-cue aria-hidden className="absolute bottom-[1.4svh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center">
          <span className="block h-5 w-px overflow-hidden bg-line">
            <span className="block h-2 w-px bg-accent-hi [animation:hero-cue_2.2s_var(--ease-luxe)_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
