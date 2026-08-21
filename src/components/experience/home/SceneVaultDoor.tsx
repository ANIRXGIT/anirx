"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/motion/gsap";
import { useReducedMotion } from "@/motion/useReducedMotion";

/**
 * ACT 06 — THE DOOR. Leaving the public world.
 * A long, quiet sequence: the public world recedes, the light goes
 * out, the door states its rule, and the way in is offered.
 * 235svh of scroll for one restrained moment.
 * Reduced motion / no-JS read the sealed composition immediately.
 */
export function SceneVaultDoor() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      gsap.set(q("[data-v-1], [data-v-2], [data-v-3], [data-v-4]"), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.5 },
      });

      tl.to(q("[data-v-dark]"), { opacity: 0.92, ease: "none", duration: 0.9 }, 0)
        /* the public world, left behind */
        .to(q("[data-v-0]"), { autoAlpha: 0, y: -14, duration: 0.08 }, 0.14)
        /* the rule of the door */
        .fromTo(q("[data-v-1]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.3)
        .to(q("[data-v-1]"), { autoAlpha: 0, y: -12, duration: 0.08 }, 0.47)
        /* the name of the door */
        .fromTo(q("[data-v-2]"), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.12 }, 0.55)
        .fromTo(q("[data-v-3]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.67)
        .fromTo(q("[data-v-4]"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.78)
        .to({}, { duration: 0.1 });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-label="The Vault" className="relative h-[235svh] border-t border-line">
        <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-[var(--spacing-gutter)] text-center">
          {/* the light going out */}
          <span data-v-dark aria-hidden className="absolute inset-0 bg-black opacity-0" />

          <p data-v-0 className="relative font-mono text-[11px] tracking-[0.5em] text-ink-faint">
            SURFACE — LEFT BEHIND
          </p>
          <p data-v-1 className="absolute font-mono text-[11px] tracking-[0.45em] text-[#c7566f]">
            ACCESS — RESTRICTED
          </p>

          <div data-v-2 className="relative">
            <h2 className="font-display text-[clamp(3.4rem,13vw,12rem)] font-extrabold leading-[0.95] tracking-tight text-[#f0ece5]">
              THE VAULT
            </h2>
          </div>
          <p data-v-3 className="absolute bottom-[34svh] font-edit text-lg italic text-[#a09a90] md:text-xl">
            Some things aren&apos;t for everyone.
          </p>

          <div data-v-4 className="absolute bottom-[12svh] flex flex-col items-center gap-6">
            <div className="border border-[#8b2940]/50 px-6 py-4">
              <p className="font-mono text-[10px] leading-relaxed tracking-[0.22em] text-[#a09a90]">
                SEALED.
                <br />
                <span className="text-[#54514b]">THE DOOR KNOWS ITS KEEPER.</span>
              </p>
            </div>
            <Link
              href="/vault"
              className="group inline-flex items-center gap-3 border border-[#8b2940] px-7 py-3.5 font-mono text-[11px] tracking-[0.3em] text-[#c7566f] transition-colors duration-500 hover:bg-[#8b2940] hover:text-[#f0ece5]"
            >
              REQUEST ENTRY
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
  );
}
