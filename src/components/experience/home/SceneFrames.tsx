"use client";

import { useEffect, useRef } from "react";
import { heroVideo, sevenFrames } from "@/content/identity";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";
import { MediaSlot } from "@/components/ui/MediaSlot";

const WAVE = Array.from({ length: 48 }, (_, i) => 16 + ((i * 37) % 43) + ((i % 3) * 6));

/**
 * ACT 02 — THE 7. One subject, one continuous transformation.
 * Discovered, not listed: one counter, one word, one image being
 * carried through FRAME → LIGHT → MOTION → CUT → COLOR → SOUND → STORY.
 * Every stage leaves something behind; nothing is a card.
 */
export function SceneFrames() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);
      const slices = q("[data-fslice]");
      const inners = q(".frame-media-inner");
      const words = q("[data-frame-word]");
      const counter = section.querySelector<HTMLElement>("[data-fcount]");
      let lastStop = 0;

      gsap.set(slices, { xPercent: 0, yPercent: 0 });
      gsap.set(q("[data-fsweep]"), { xPercent: -140, autoAlpha: 1 });
      gsap.set(words, { autoAlpha: 0, yPercent: 100 });
      gsap.set(words[0], { autoAlpha: 1, yPercent: 0 });

      const showStop = (to: number, from: number) => {
        if (counter) counter.textContent = `0${to + 1} / 07`;
        gsap.to(words[from], { autoAlpha: 0, yPercent: -110, duration: 0.18, ease: "power2.in", overwrite: "auto" });
        gsap.fromTo(
          words[to],
          { autoAlpha: 0, yPercent: 100 },
          { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: "power2.out", delay: 0.08, overwrite: "auto" },
        );
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=160%",
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

      /* FRAME — the composition lands */
      tl.fromTo(q("[data-fobject]"), { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0)
        .fromTo(q("[data-fcorners]"), { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05, duration: 0.25 }, 0.3);

      /* LIGHT — a key sweeps in and stays */
      tl.to(q("[data-fsweep]"), { xPercent: 140, duration: 0.9, ease: "power1.inOut" }, 0.85)
        .to(inners, { filter: "brightness(1.3) contrast(1.06)", duration: 0.4 }, 0.9)
        .to(inners, { filter: "brightness(1.08) contrast(1.03)", duration: 0.45 }, 1.35);

      /* MOTION — a slow push, a breath of focus */
      tl.to(q("[data-fstage]"), { scale: 1.1, xPercent: -1.6, duration: 0.9, ease: "power1.inOut" }, 1.85)
        .to(inners, { filter: "brightness(1.08) contrast(1.03) blur(0.5px)", duration: 0.35 }, 2.3)
        .to(inners, { filter: "brightness(1.08) contrast(1.03) blur(0px)", duration: 0.3 }, 2.65)
        .to(q("[data-fstage]"), { scale: 1, xPercent: 0, duration: 0.45, ease: "power2.inOut" }, 2.95);

      /* CUT — the halves separate like film, and hold */
      tl.to(slices[0], { yPercent: -20, xPercent: -0.6, duration: 0.32, ease: "power3.inOut" }, 3.3)
        .to(slices[1], { yPercent: 20, xPercent: 0.6, duration: 0.32, ease: "power3.inOut" }, 3.3)
        .fromTo(
          q("[data-fseam]"),
          { autoAlpha: 0, scaleX: 0.2 },
          { autoAlpha: 1, scaleX: 1, duration: 0.3, ease: "power2.out" },
          3.4,
        );
      /* the separation is held (~0.4 units) until COLOR rejoins at 4.02 */

      /* COLOR — flat first, then the grade, and it stays */
      tl.to(slices, { xPercent: 0, yPercent: 0, duration: 0.35, ease: "power3.inOut" }, 4.02)
        .to(q("[data-fseam]"), { autoAlpha: 0, duration: 0.2 }, 4.05)
        .to(inners, { filter: "grayscale(0.7) contrast(0.95) brightness(1.04)", duration: 0.3 }, 4.1)
        .to(q("[data-fgrade]"), { autoAlpha: 0.5, duration: 0.4 }, 4.45)
        .to(inners, { filter: "grayscale(0) contrast(1.14) saturate(1.18)", duration: 0.4 }, 4.55);

      /* SOUND — the mix prints below the picture */
      tl.to(q("[data-fstage]"), { yPercent: -8, duration: 0.35, ease: "power2.inOut" }, 5.0)
        .to(q("[data-fwave]"), { autoAlpha: 1, duration: 0.15 }, 5.05)
        .fromTo(
          q("[data-fbar]"),
          { scaleY: 0, transformOrigin: "center bottom" },
          { scaleY: 1, stagger: 0.008, duration: 0.28, ease: "power2.out" },
          5.08,
        )
        .fromTo(q("[data-fplayhead]"), { autoAlpha: 1, left: "0%" }, { left: "100%", duration: 0.5, ease: "power1.inOut" }, 5.1)
        .to(q("[data-fplayhead]"), { autoAlpha: 0, duration: 0.15 }, 5.6);

      /* STORY — everything resolves */
      tl.to(q("[data-fbar]"), { scaleY: 0.14, stagger: 0.004, duration: 0.22 }, 5.85)
        .to(q("[data-fstage]"), { yPercent: 0, duration: 0.35, ease: "power2.inOut" }, 5.9)
        .to(q("[data-fgrade]"), { autoAlpha: 0.22, duration: 0.4 }, 5.9)
        .to(q("[data-fcorners]"), { borderColor: "var(--accent-hi)", duration: 0.4 }, 6.0)
        .to(q("[data-fstory]"), { autoAlpha: 1, duration: 0.45 }, 6.15)
        .to({}, { duration: 0.25 });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  const sliceClips = ["inset(0 0 50% 0)", "inset(50% 0 0 0)"];

  return (
    <section ref={sectionRef} aria-label="The 7 frames" data-cine className="relative">
      <div className="relative flex h-svh flex-col justify-center overflow-hidden px-[var(--spacing-gutter)] md:flex-row md:items-center md:gap-[clamp(1.75rem,3vw,3rem)]">
        {/* the rail — one counter, one word, discovered in order */}
        <div className="relative z-20 mb-6 md:mb-0 md:shrink-0">
          <p className="font-mono text-[11px] tracking-[0.45em] text-ink-dim">
            <span data-fcount>01 / 07</span>
          </p>
          <div className="relative mt-4 h-[1.15em] overflow-hidden font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none tracking-tight">
            {sevenFrames.map((f) => (
              <span key={f.index} data-frame-word aria-hidden="true" className="absolute inset-x-0 top-0 text-ink">
                {f.word}
              </span>
            ))}
          </div>
        </div>

        {/* the object */}
        <div
          data-cine-scale={heroVideo.available ? true : undefined}
          data-fobject
          className="frame-object w-full md:min-w-0 md:max-w-[min(56vw,920px)] md:flex-1"
        >
          {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map(
            (pos) => (
              <span key={pos} data-fcorners aria-hidden className={`absolute z-20 h-3.5 w-3.5 border-ink-dim/80 ${pos}`} />
            ),
          )}

          <div data-fstage className="relative aspect-[16/10] max-md:min-h-[52svh] will-change-transform">
            {sliceClips.map((clip, i) => (
              <div key={i} data-fslice className="frame-slice" style={{ clipPath: clip }}>
                <div className="frame-media-inner absolute inset-0">
                  <MediaSlot asset={heroVideo} className="absolute inset-0 h-full w-full" sizes="(max-width: 768px) 92vw, 56vw" />
                </div>
              </div>
            ))}
            <div
              data-fsweep
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{ background: "linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.9) 50%, transparent 70%)" }}
            />
            <div data-fgrade aria-hidden className="pointer-events-none absolute inset-0 bg-accent mix-blend-multiply" />
            <div data-fseam aria-hidden className="absolute left-0 right-0 top-1/2 z-10 h-[4px] -translate-y-1/2 bg-accent-hi" />
          </div>

          {/* the printed mix */}
          <div data-fwave aria-hidden className="absolute inset-x-5 bottom-4 z-10 flex h-10 items-end gap-[2px]">
            {WAVE.map((h, i) => (
              <span key={i} data-fbar className="w-[2px] bg-[var(--color-ink-media)]/70" style={{ height: `${h}%` }} />
            ))}
            <span data-fplayhead aria-hidden className="absolute bottom-0 top-0 w-px bg-accent-hi" />
          </div>
        </div>

        {/* STORY — the reason, under the frame */}
        <p data-fstory className="absolute bottom-[7svh] left-1/2 w-max max-w-[86vw] -translate-x-1/2 text-center font-edit text-lg italic leading-snug text-ink-dim md:text-xl">
          Every film is made of these seven. <span className="text-ink">So is everything else I build.</span>
        </p>
      </div>
    </section>
  );
}
