"use client";

import { useEffect, useRef } from "react";
import { disciplines, identity } from "@/content/identity";
import { gsap, ScrollTrigger } from "@/motion/gsap";
import { lenisStore } from "@/motion/lenisStore";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { AnirxObject, closedPose, openPose } from "@/components/experience/object/AnirxObject";

const SEEN_KEY = "anirx-intro-2";
const INTRO_ATTR = "data-intro";

/**
 * ACT 01 — ENTERING ANIRX. (v5 — THE OBJECT)
 *
 * No video. No photograph on a wall. A dark room, then a sculpture
 * that was always standing there:
 *
 *   0–1.3   ROOM. Darkness, one point of light, ANIRX.IN.
 *   1.0–2.6 ASSEMBLY. Seven plates arrive out of deep space and
 *           stack into the monolith; the X light wakes behind it.
 *   2.9–4.4 THE OPENING. The shrine parts — and the person is inside.
 *   3.9–6.4 TITLES. The seven worlds trace past; ANIRUDH SHARMA /
 *           CREATIVE TECHNOLOGIST / the statement land in the lower-left light.
 *   6.9     REST. The monolith breathes; scroll returns.
 *
 * Leaving the hero closes the shrine again — the monolith it hands
 * to THE SEVEN. Skippable by any input, once per session.
 * No-JS = closed monolith; reduced motion / seen = open, still.
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

      /* EXIT — the shrine closes; the room recedes into THE SEVEN. */
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.5 },
        })
        .to(plates, {
          x: (i) => closedPose(i).x,
          z: (i) => closedPose(i).z,
          rotationY: (i) => closedPose(i).ry,
          ease: "none",
          duration: 0.8,
        }, 0)
        .fromTo(q("[data-obj-veil]"), { opacity: 0.1 }, { opacity: 0.88, ease: "none", duration: 0.7 }, 0)
        .fromTo(q("[data-obj-tilt]"), { rotationY: -8, rotationX: 3 }, { rotationY: 10, rotationX: 0, ease: "none", duration: 1 }, 0)
        .fromTo(q("[data-h-stage]"), { yPercent: 0 }, { yPercent: 7, ease: "none", duration: 1 }, 0)
        .fromTo(q("[data-h-ghost]"), { opacity: 0.055 }, { opacity: 0, ease: "none", duration: 0.6 }, 0)
        .fromTo(q("[data-h-identity]"), { y: 0, autoAlpha: 1 }, { y: -34, autoAlpha: 0, ease: "none", duration: 0.55 }, 0)
        .to(q("[data-h-lanes], [data-h-cue]"), { autoAlpha: 0, ease: "none", duration: 0.25 }, 0);

      /* Pointer parallax — the monolith acknowledges the hand. Desktop only. */
      if (window.matchMedia("(pointer: fine)").matches) {
        const tilt = section.querySelector<HTMLElement>("[data-obj-tilt]");
        if (tilt) {
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3.out" });
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            /* yield to the exit scrub once the room is being left */
            if (window.scrollY > section.offsetHeight * 0.6) return;
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            ry(-8 + nx * 6);
            rx(3 - ny * 4.5);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          detachPointer = () => window.removeEventListener("pointermove", onMove);
        }
      }

      if (seen) {
        /* returning within the session: the shrine stands open, still */
        gsap.set(plates, { x: (i) => openPose(i).x, z: (i) => openPose(i).z, rotationY: (i) => openPose(i).ry });
        gsap.set(q("[data-obj-veil]"), { opacity: 0.1 });
        return;
      }

      /* THE OPENING — room → object → the person inside → main titles */
      document.documentElement.setAttribute(INTRO_ATTR, "playing");

      /* re-arm the veil: the exit scrub pre-renders it lifted */
      gsap.set(q("[data-obj-veil]"), { opacity: 0.88 });
      gsap.set(plates, {
        x: (i) => (i - 3) * 160,
        z: (i) => (3 - i) * 17 - 700,
        rotationY: 0,
        autoAlpha: 0,
      });
      gsap.set(q("[data-obj-tilt]"), { rotationY: -52, rotationX: 8 });
      gsap.set(q("[data-obj-blade-a]"), { opacity: 0 });
      gsap.set(q("[data-obj-blade-b]"), { opacity: 0 });
      gsap.set(q("[data-obj-floor]"), { opacity: 0 });
      gsap.set(q("[data-h-ghost]"), { opacity: 0 });
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
        /* the object arrives out of deep space, back plate first */
        .fromTo(
          plates,
          {
            x: (i) => (i - 3) * 160,
            z: (i) => (3 - i) * 17 - 700,
            rotationY: 0,
            autoAlpha: 0,
          },
          {
            x: (i) => closedPose(i).x,
            z: (i) => closedPose(i).z,
            rotationY: (i) => closedPose(i).ry,
            autoAlpha: 1,
            stagger: { each: 0.075, from: "end" },
            duration: 1.15,
          },
          1.05,
        )
        .to(q("[data-obj-tilt]"), { rotationY: -8, rotationX: 3, duration: 1.7, ease: "power2.out" }, 1.2)
        .to(q("[data-obj-blade-a]"), { opacity: 0.55, duration: 1.4 }, 1.35)
        .to(q("[data-obj-blade-b]"), { opacity: 0.22, duration: 1.4 }, 1.7)
        .to(q("[data-obj-floor]"), { opacity: 0.85, duration: 1.3 }, 1.6)
        .to(q("[data-h-ghost]"), { opacity: 0.055, duration: 1.4 }, 2.3)
        /* the wordmark has done its job */
        .to(q("[data-h-dot]"), { autoAlpha: 0, duration: 0.4 }, 2.3)
        .to(q("[data-h-wordmark]"), { autoAlpha: 0, y: -14, duration: 0.55 }, 2.5)
        /* the shrine opens — the person was inside */
        .to(
          plates,
          {
            x: (i) => openPose(i).x,
            z: (i) => openPose(i).z,
            rotationY: (i) => openPose(i).ry,
            stagger: 0.04,
            duration: 1.5,
            ease: "power3.inOut",
          },
          2.9,
        )
        .to(q("[data-obj-veil]"), { opacity: 0.1, duration: 1.5, ease: "power2.out" }, 3.15)
        /* the worlds trace past */
        .to(q("[data-h-lane]"), { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.5 }, 3.9)
        /* main titles */
        .to(q("[data-h-name-1]"), { yPercent: 0, duration: 0.65 }, 4.5)
        .to(q("[data-h-name-2]"), { yPercent: 0, duration: 0.65 }, 4.85)
        .to(q("[data-h-role]"), { autoAlpha: 1, y: 0, duration: 0.45 }, 5.5)
        .to(q("[data-h-rule]"), { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 5.6)
        .to(q("[data-h-statement]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 5.95)
        .to(q("[data-h-cue]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 6.4)
        .to(q("[data-h-lane]"), { autoAlpha: 0.5, duration: 0.8 }, 6.4)
        .to({}, { duration: 0.5 });

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
    /* Reduced motion: the shrine stands open, still. No theater. */
    if (!reduced) return;
    const section = sectionRef.current;
    if (!section) return;
    section.querySelectorAll<HTMLElement>("[data-obj-plate]").forEach((el, i) => {
      const p = openPose(i);
      el.style.transform = `translateX(${p.x}px) translateZ(${p.z}px) rotateY(${p.ry}deg)`;
    });
    const veil = section.querySelector<HTMLElement>("[data-obj-veil]");
    if (veil) veil.style.opacity = "0.1";
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="Anirudh Sharma" data-cine className="relative">
      <div className="relative h-svh overflow-hidden bg-canvas">
        {/* the ghost word — depth typography behind the object */}
        <span
          data-h-ghost
          aria-hidden
          className="u-hollow absolute left-1/2 top-[42%] z-0 hidden -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(6rem,20vw,19rem)] font-extrabold tracking-tight opacity-[0.055] md:block"
        >
          ANIRX
        </span>

        {/* THE OBJECT — center-right on desktop, crown of the stage on mobile */}
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

        {/* THE WORLDS — the seven lanes, as a quiet index drifting through the room */}
        <div data-h-lanes aria-hidden className="absolute inset-x-0 bottom-[9svh] z-20 hidden justify-center md:flex">
          <p className="flex flex-wrap justify-center gap-x-7 gap-y-2 px-[var(--spacing-gutter)] font-mono text-[9px] tracking-[0.35em]">
            {disciplines.map((d) => (
              <span key={d.id} data-h-lane className="text-ink-dim">
                {d.label}
              </span>
            ))}
          </p>
        </div>

        {/* IDENTITY — main titles, set in the lower-left light */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-[var(--spacing-gutter)] pb-[15svh] md:pb-[17svh]">
          <div data-h-identity className="max-w-[min(92vw,660px)]">
            <h1 className="font-display font-extrabold leading-[0.95] tracking-tight text-ink">
              <span className="block overflow-hidden">
                <span data-h-name-1 className="block text-[clamp(2.4rem,5.4vw,4.8rem)]">
                  {identity.firstName}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-h-name-2 className="ml-[0.9em] block text-[clamp(2.4rem,5.4vw,4.8rem)]">
                  {identity.lastName}
                </span>
              </span>
            </h1>
            <p
              data-h-role
              className="mt-5 flex items-center gap-4 font-mono text-[10px] tracking-[0.5em] text-ink-dim md:text-[11px]"
            >
              <span data-h-rule aria-hidden className="block h-px w-10 bg-accent-hi" />
              {identity.role}
            </p>
            <p
              data-h-statement
              className="mt-4 max-w-[34ch] font-edit text-lg italic leading-snug text-ink-dim md:text-xl"
            >
              Too <span className="text-accent-hi">{identity.statementAccent}</span> to stay in one lane.
            </p>
          </div>
        </div>

        {/* CUE — appears only at rest */}
        <div data-h-cue aria-hidden className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.35em] text-ink-dim">SCROLL</span>
          <span className="h-6 w-px overflow-hidden bg-line">
            <span className="block h-2 w-px bg-accent-hi [animation:hero-cue_2.2s_var(--ease-luxe)_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
