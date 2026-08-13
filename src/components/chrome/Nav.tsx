"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navItems } from "@/content/navigation";
import { site } from "@/content/site";
import { lenisStore } from "@/motion/lenisStore";
import { ModeSwitch } from "@/modes/ModeSwitch";
import { Mark } from "@/components/ui/Mark";

/**
 * ANIRX navigation chrome.
 * A quiet persistent bar + a full-screen overlay index.
 * Active/hover states morph (expanding accent bar + sliding label)
 * instead of simply changing color.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Pause smooth scroll while the index is open; restore on close.
  useEffect(() => {
    if (open) {
      lenisStore.stop();
      firstLinkRef.current?.focus();
    } else {
      lenisStore.start();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Links close the index themselves via onClick — no effect needed.

  return (
    <>
      <header className="chrome-ui fixed inset-x-0 top-0 z-40 flex items-center justify-between px-[var(--spacing-gutter)] py-4">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label={`${site.name} — home`}
        >
          <Mark size={30} />
          <span className="font-mono text-[11px] tracking-[0.3em] text-ink transition-colors group-hover:text-accent-hi">
            ANIRX<span className="text-accent-hi">.IN</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ModeSwitch />
          </div>
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls="anx-index"
            aria-label={open ? "Close index" : "Open index"}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center border border-line bg-canvas/60 backdrop-blur-md transition-colors hover:border-accent"
          >
            <span
              aria-hidden
              className={`absolute h-px w-4 bg-ink transition-all duration-500 [transition-timing-function:var(--ease-snap)] ${
                open ? "rotate-45" : "-translate-y-[3px]"
              }`}
            />
            <span
              aria-hidden
              className={`absolute h-px w-4 bg-ink transition-all duration-500 [transition-timing-function:var(--ease-snap)] ${
                open ? "-rotate-45" : "translate-y-[3px]"
              }`}
            />
          </button>
        </div>
      </header>

      {/* Full-screen index overlay */}
      <div
        id="anx-index"
        role="dialog"
        aria-modal="true"
        aria-label="Site index"
        className={`fixed inset-0 z-30 flex flex-col justify-between bg-canvas transition-[clip-path] duration-700 [transition-timing-function:var(--ease-snap)] ${
          open ? "[clip-path:inset(0_0_0%_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <nav className="mt-24 flex flex-col px-[var(--spacing-gutter)]" aria-label="Primary">
          {navItems.map((item, i) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                ref={i === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={close}
                style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}
                className={`group relative flex items-baseline gap-4 overflow-hidden border-b border-line py-3 transition-all duration-500 [transition-timing-function:var(--ease-luxe)] sm:gap-8 sm:py-4 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                {/* morphing accent bar */}
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 w-1 origin-top bg-accent transition-transform duration-500 [transition-timing-function:var(--ease-snap)] ${
                    active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 group-focus-visible:scale-y-100"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] tracking-[0.25em] transition-colors duration-300 ${
                    active ? "text-accent-hi" : "text-ink-faint group-hover:text-accent-hi"
                  }`}
                >
                  {item.index}
                </span>
                <span
                  className={`font-display text-2xl font-bold tracking-tight transition-all duration-500 [transition-timing-function:var(--ease-luxe)] group-hover:translate-x-3 sm:text-4xl md:text-5xl ${
                    item.restricted
                      ? "text-accent-hi"
                      : active
                        ? "text-ink"
                        : "text-ink-dim group-hover:text-ink"
                  }`}
                >
                  {item.label}
                </span>
                {item.restricted && (
                   <span className="ml-auto hidden rounded-full border border-accent px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-accent-hi sm:inline-block">
                    RESTRICTED
                  </span>
                )}

              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4 px-[var(--spacing-gutter)] pb-8">
          <div className="sm:hidden">
            <ModeSwitch />
          </div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-ink-faint">
            {site.statement}
          </p>
          <p className="font-mono text-[10px] tracking-[0.22em] text-ink-faint">
            ANIRX.IN — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}
