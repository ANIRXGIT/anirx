"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark } from "@/components/ui/Mark";
import { useHydrated } from "@/motion/useHydrated";
import { useReducedMotion } from "@/motion/useReducedMotion";

const STEPS = ["SURFACE — LEFT BEHIND", "ACCESS — RESTRICTED", "THE VAULT"];
const SEEN_KEY = "anirx-vault";

/**
 * The transition into THE VAULT — quiet, staged, serious.
 * SSR / no-JS / reduced motion: the sealed panel, immediately.
 * Otherwise: surface → restriction → the door → the panel. Once.
 */
export function VaultIntro() {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(STEPS.length);

  /* decide on the client whether the transition plays */
  useEffect(() => {
    if (reduced) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    const id = window.requestAnimationFrame(() => setStep(0));
    return () => window.cancelAnimationFrame(id);
  }, [reduced]);

  /* advance the steps */
  useEffect(() => {
    if (step >= STEPS.length) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 1000 : 1200);
    return () => window.clearTimeout(id);
  }, [step]);

  /* remember the entry */
  useEffect(() => {
    if (step < STEPS.length) return;
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* session-only */
    }
  }, [step]);

  const done = !hydrated || reduced || step >= STEPS.length;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-black px-[var(--spacing-gutter)] text-center text-[#f0ece5]">
      {!done ? (
        <button
          type="button"
          onClick={() => setStep(STEPS.length)}
          className="flex flex-col items-center gap-8"
          aria-label="Skip transition"
        >
          <Mark size={40} />
          <span
            key={step}
            className="font-mono text-[11px] tracking-[0.45em] text-[#a09a90] [animation:vault-step_1s_var(--ease-luxe)_both]"
          >
            {STEPS[step]}
            <style>{`@keyframes vault-step { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
          </span>
        </button>
      ) : (
        <>
          <Mark size={44} />
          <p className="mt-10 font-mono text-[10px] tracking-[0.35em] text-[#c7566f]">ACCESS — RESTRICTED</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-6xl">THE VAULT</h1>
          <p className="mt-6 max-w-[46ch] font-edit text-lg italic leading-relaxed text-[#a09a90]">
            Some things aren&apos;t for everyone.
          </p>
          <div className="mt-10 border border-[#8b2940]/50 px-6 py-4">
            <p className="font-mono text-[10px] leading-relaxed tracking-[0.22em] text-[#a09a90]">
              SEALED.
              <br />
              <span className="text-[#54514b]">THE DOOR KNOWS ITS KEEPER.</span>
            </p>
          </div>
          <Link
            href="/"
            className="mt-12 border-b border-[#8b2940] pb-1 font-mono text-[10px] tracking-[0.3em] text-[#c7566f] transition-colors hover:text-[#f0ece5]"
          >
            ← BACK TO THE SURFACE
          </Link>
        </>
      )}
    </div>
  );
}
