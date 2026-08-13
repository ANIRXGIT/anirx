"use client";

import { useEffect, useRef } from "react";
import { disciplines, heroVideo, identity } from "@/content/identity";
import { gsap, ScrollTrigger } from "@/motion/gsap";
import { lenisStore } from "@/motion/lenisStore";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { MediaSlot } from "@/components/ui/MediaSlot";

const SEEN_KEY = "anirx-intro";
const INTRO_ATTR = "data-intro";

/**
 * ACT 01 — ENTERING ANIRX. (v4)
 *
 * Not a hero section — a door.
 *
 *   0–1.3   THE ROOM. Darkness. One point of light. ANIRX.IN.
 *   1.2–2.4 THE SLIT. The point opens into a vertical sliver —
 *           the real footage already living inside it.
 *   2.4–3.7 THE WORLD. The slit widens until the video is the room.
 *   3.6–5.0 DISCOVERY. The seven worlds drift along the bottom edge.
 *   4.6–6.6 MAIN TITLES. ANIRUDH SHARMA / CREATIVE TECHNOLOGIST /
 *           the statement — set in the lower-left light of the frame.
 *   6.9     REST. Scroll returns; the video holds its final frame:
 *           the face is the subject.
 *
 * Leaving the hero physically recedes the room (scale + light fall).
 * Skippable by any input, once per session. Chrome steps outside
 * while the sequence plays (html[data-intro="playing"]).
 * No-JS / reduced motion / seen-in-session = the open resting state.
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

    const media = section.querySelector<HTMLElement>("[data-h-media]");
    media?.classList.add("js-closed");
    let detach: () => void = () => {};

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      /* EXIT — scrolling leaves the room behind. Always armed (JS, full motion). */
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.5 },
        })
        .fromTo(
          q("[data-h-drift]"),
          { scale: 1, filter: "brightness(1)" },
          { scale: 1.07, filter: "brightness(0.45)", ease: "none", duration: 1 },
          0,
        )
        .fromTo(q("[data-h-identity]"), { y: 0, autoAlpha: 1 }, { y: -34, autoAlpha: 0, ease: "none", duration: 0.55 }, 0)
        .to(q("[data-h-lanes], [data-h-cue]"), { autoAlpha: 0, ease: "none", duration: 0.25 }, 0);

      if (seen) {
        media?.classList.remove("js-closed");
        return;
      }

      /* THE OPENING — stages: room → slit → world → discovery → titles */
      document.documentElement.setAttribute(INTRO_ATTR, "playing");

      gsap.set(media, { clipPath: "inset(50% 50% 50% 50%)" });
      gsap.set(q("[data-h-inner]"), { scale: 1.09, filter: "brightness(0.45) saturate(0.75)" });
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
        /* the point opens into a slit of footage */
        .to(media, { clipPath: "inset(0% 49.85% 0% 49.85%)", duration: 1.05, ease: "power2.inOut" }, 1.25)
        .to(q("[data-h-inner]"), { filter: "brightness(0.7) saturate(0.9)", duration: 1.0 }, 1.35)
        /* the room is entered; the wordmark has done its job */
        .to(q("[data-h-dot]"), { autoAlpha: 0, duration: 0.4 }, 2.3)
        .to(q("[data-h-wordmark]"), { autoAlpha: 0, y: -14, duration: 0.55 }, 2.45)
        .to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power2.inOut" }, 2.5)
        .to(q("[data-h-inner]"), { filter: "brightness(1) saturate(1)", duration: 1.6, ease: "power1.out" }, 2.5)
        /* one slow settle — the camera finds its mark */
        .to(q("[data-h-inner]"), { scale: 1, duration: 3.2, ease: "power1.out" }, 2.5)
        /* the worlds drift through */
        .to(q("[data-h-lane]"), { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.5 }, 3.6)
        /* main titles */
        .to(q("[data-h-name-1]"), { yPercent: 0, duration: 0.65 }, 4.6)
        .to(q("[data-h-name-2]"), { yPercent: 0, duration: 0.65 }, 4.95)
        .to(q("[data-h-role]"), { autoAlpha: 1, y: 0, duration: 0.45 }, 5.5)
        .to(q("[data-h-rule]"), { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 5.6)
        .to(q("[data-h-statement]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 5.9)
        .to(q("[data-h-cue]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 6.4)
        .to(q("[data-h-lane]"), { autoAlpha: 0.5, duration: 0.8 }, 6.4)
        .to({}, { duration: 0.4 });

      lockScroll();
      const skip = () => tl.progress(1);
      window.addEventListener("wheel", skip, { once: true, passive: true });
      window.addEventListener("touchmove", skip, { once: true, passive: true });
      window.addEventListener("keydown", skip, { once: true });
      window.addEventListener("pointerdown", skip, { once: true });
      const safety = window.setTimeout(() => tl.progress(1), 10000);
      detach = () => {
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
      detach();
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute(INTRO_ATTR);
      lenisStore.start();
      ctx.revert();
      media?.classList.remove("js-closed");
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="Anirudh Sharma" data-cine className="relative">
      <div className="relative h-svh overflow-hidden bg-canvas">
        {/* THE WORLD — one continuous shot. media > light. */}
        <div
          data-h-media
          data-cine-scale={heroVideo.available ? true : undefined}
          className="hero-media absolute inset-0 z-10"
        >
          <div data-h-inner className="absolute inset-0 will-change-transform">
            <div data-h-drift className="absolute inset-0 will-change-transform">
              <MediaSlot
                asset={heroVideo}
                className="absolute inset-0 h-full w-full"
                sizes="100vw"
                priority
                hold
                preload="auto"
              />
              {/* light design — the grades that let the titles live in the frame */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.52), transparent 46%)" }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(100deg, rgb(0 0 0 / 0.45), transparent 55%)" }}
              />
            </div>
          </div>
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
        <div data-h-lanes aria-hidden className="absolute inset-x-0 bottom-[12svh] z-20 hidden justify-center md:flex">
          <p className="flex flex-wrap justify-center gap-x-7 gap-y-2 px-[var(--spacing-gutter)] font-mono text-[9px] tracking-[0.35em]">
            {disciplines.map((d) => (
              <span key={d.id} data-h-lane className="text-[var(--color-ink-media)]/60">
                {d.label}
              </span>
            ))}
          </p>
        </div>

        {/* IDENTITY — main titles, set in the frame's lower-left light */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-[var(--spacing-gutter)] pb-[15svh] md:pb-[17svh]">
          <div data-h-identity className="max-w-[min(92vw,660px)]">
            <h1 className="font-display font-extrabold leading-[0.95] tracking-tight text-[var(--color-ink-media)]">
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
              className="mt-5 flex items-center gap-4 font-mono text-[10px] tracking-[0.5em] text-[var(--color-ink-media)]/85 md:text-[11px]"
            >
              <span data-h-rule aria-hidden className="block h-px w-10 bg-maroon-400" />
              {identity.role}
            </p>
            <p
              data-h-statement
              className="mt-4 max-w-[34ch] font-edit text-lg italic leading-snug text-[var(--color-ink-media)]/90 md:text-xl"
            >
              Too <span className="text-maroon-300">{identity.statementAccent}</span> to stay in one lane.
            </p>
          </div>
        </div>

        {/* CUE — appears only at rest */}
        <div data-h-cue aria-hidden className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.35em] text-[var(--color-ink-media)]/70">SCROLL</span>
          <span className="h-6 w-px overflow-hidden bg-[var(--color-ink-media)]/25">
            <span className="block h-2 w-px bg-maroon-300 [animation:hero-cue_2.2s_var(--ease-luxe)_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
