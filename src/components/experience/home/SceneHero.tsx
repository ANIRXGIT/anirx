"use client";

import { useEffect, useRef } from "react";
import { heroVideo, identity } from "@/content/identity";
import { gsap, ScrollTrigger } from "@/motion/gsap";
import { lenisStore } from "@/motion/lenisStore";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { Mark } from "@/components/ui/Mark";
import { MediaSlot } from "@/components/ui/MediaSlot";

const SEEN_KEY = "anirx-intro";

/**
 * ACT 01 — ARRIVAL. Person left, identity right.
 *
 *   0-1    the mark
 *   1-3    a slit of light opens into the hero frame; the edge light rides the wipe
 *   3-5    the frame wakes and pushes in, slowly, like a dolly
 *   4-5    ANIRUDH SHARMA rises beside the portrait
 *   5-6    role, shelf line, statement; scroll returns
 *
 * The face is the subject. Typography is the caption. Skippable,
 * once per session; reduced motion / no-JS = composed final state.
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
    if (seen) return;

    const media = section.querySelector<HTMLElement>("[data-hero-media]");
    media?.classList.add("js-closed");
    let detach: () => void = () => {};

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      gsap.set(q("[data-hero-word-1], [data-hero-word-2]"), { yPercent: 115, autoAlpha: 0 });
      gsap.set(q("[data-hero-role], [data-hero-statement], [data-hero-cue]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-hero-shelf]"), { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: unlock });

      tl.fromTo(q("[data-hero-mark]"), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0.1)
        .fromTo(
          q("[data-hero-brand]"),
          { autoAlpha: 0, letterSpacing: "0.9em" },
          { autoAlpha: 1, letterSpacing: "0.42em", duration: 0.8 },
          0.25,
        )
        /* the slit opens; the light rides its edge */
        .to(media, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.inOut" }, 0.8)
        .fromTo(q("[data-hero-edge]"), { left: "0%", autoAlpha: 1 }, { left: "100%", autoAlpha: 0, duration: 1.8, ease: "power2.inOut" }, 0.8)
        /* the frame wakes and pushes in — one slow move */
        .fromTo(
          q("[data-hero-inner]"),
          { scale: 1.14, filter: "brightness(0.55) saturate(0.6)" },
          { scale: 1, filter: "brightness(1) saturate(1)", duration: 2.6, ease: "power1.out" },
          1.2,
        )
        .to(q("[data-hero-mark], [data-hero-brand]"), { autoAlpha: 0, y: -12, duration: 0.45 }, 2.4)
        /* the name, beside the person */
        .to(q("[data-hero-word-1]"), { yPercent: 0, autoAlpha: 1, duration: 0.5 }, 4.2)
        .to(q("[data-hero-word-2]"), { yPercent: 0, autoAlpha: 1, duration: 0.5 }, 4.55)
        .to(q("[data-hero-role]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 5.0)
        .to(q("[data-hero-shelf]"), { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 5.2)
        .to(q("[data-hero-statement]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 5.7)
        .to(q("[data-hero-cue]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 6.1);

      lockScroll();
      const skip = () => tl.progress(1);
      window.addEventListener("wheel", skip, { once: true, passive: true });
      window.addEventListener("touchmove", skip, { once: true, passive: true });
      window.addEventListener("keydown", skip, { once: true });
      const safety = window.setTimeout(() => tl.progress(1), 9000);
      detach = () => {
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchmove", skip);
        window.removeEventListener("keydown", skip);
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
      lenisStore.start();
      ctx.revert();
      media?.classList.remove("js-closed");
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="Anirudh Sharma" data-cine className="relative">
      <div className="relative flex h-svh flex-col overflow-hidden md:block">
        {/* intro mark */}
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-5">
          <span data-hero-mark className="text-ink">
            <Mark size={48} />
          </span>
          <span data-hero-brand className="font-mono text-[11px] tracking-[0.42em] text-ink">
            ANIRX<span className="text-accent-hi">.IN</span>
          </span>
        </div>

        {/* THE FACE — the subject. Left, standing on the shelf line. */}
        <div
          data-cine-scale={heroVideo.available ? true : undefined}
          data-hero-media
          className="hero-media relative order-1 z-10 h-[46svh] w-full md:absolute md:bottom-[10svh] md:left-[7vw] md:h-[62svh] md:w-[min(46vw,660px)]"
        >
          <div data-hero-inner className="absolute inset-0 will-change-transform">
            <MediaSlot asset={heroVideo} className="absolute inset-0 h-full w-full" sizes="(max-width: 768px) 100vw, 46vw" priority />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgb(0 0 0 / 0.22), transparent 34%)" }}
            />
            {/* the light that rides the opening wipe */}
            <span
              data-hero-edge
              aria-hidden
              className="absolute inset-y-0 left-0 w-px bg-accent-hi shadow-[0_0_18px_2px_var(--accent-soft)]"
            />
          </div>
        </div>

        {/* the shelf — media stands on it; the name rhymes with it */}
        <span data-hero-shelf aria-hidden className="absolute bottom-[10svh] left-[7vw] right-[7vw] z-[5] hidden h-px bg-line md:block" />

        {/* THE IDENTITY — the caption. Right column, bottom-anchored. */}
        <div className="relative z-20 order-2 flex flex-1 flex-col justify-end px-[var(--spacing-gutter)] pb-[14svh] md:absolute md:inset-y-0 md:right-[7vw] md:w-[40vw] md:px-0 md:pb-[14svh]">
          <h1 className="font-display font-extrabold leading-[0.92] tracking-tight text-ink">
            <span className="block overflow-hidden">
              <span data-hero-word-1 className="block text-[clamp(3rem,7vw,6.5rem)]">{identity.firstName}</span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-word-2 className="block text-[clamp(3rem,7vw,6.5rem)]">{identity.lastName}</span>
            </span>
          </h1>
          <p data-hero-role className="mt-6 font-mono text-[11px] tracking-[0.5em] text-accent-hi">
            {identity.role}
          </p>
          <p data-hero-statement className="mt-4 max-w-[30ch] font-edit text-lg italic leading-snug text-ink-dim md:text-xl">
            Too <span className="text-accent-hi">curious</span> to stay in one lane.
          </p>
        </div>

        <div data-hero-cue className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.35em] text-ink-dim">SCROLL</span>
          <span aria-hidden className="h-6 w-px overflow-hidden bg-line">
            <span className="block h-2 w-px animate-bounce bg-accent-hi" />
          </span>
        </div>
      </div>
    </section>
  );
}
