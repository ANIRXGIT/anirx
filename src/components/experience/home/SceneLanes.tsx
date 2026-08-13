"use client";

import { useState } from "react";
import { candid, disciplines, heroVideo, portrait } from "@/content/identity";
import { projects } from "@/content/projects";
import { MediaSlot } from "@/components/ui/MediaSlot";

/**
 * ACT 03 — THE WORLD. The list is the remote; the panel is the room.
 * Rests on FILM. Each lane lights its own world — real media or
 * real project information, nothing invented.
 */

const astra = projects.find((p) => p.id === "astra");
const hostelmart = projects.find((p) => p.id === "hostelmart");

function LaneWorld({ id }: { id: string }) {
  switch (id) {
    case "film":
      return (
        <div className="absolute inset-0 flex items-center bg-black">
          <MediaSlot asset={heroVideo} className="relative aspect-[2.39/1] w-full" sizes="(max-width: 1024px) 100vw, 40vw" />
        </div>
      );
    case "edit":
      return (
        <div className="absolute inset-0">
          <div className="absolute inset-0 origin-top-left" style={{ clipPath: "polygon(0 0, 100% 0, 62% 100%, 0 100%)" }}>
            <MediaSlot asset={portrait} className="absolute inset-0 h-full w-full" sizes="(max-width: 1024px) 100vw, 40vw" />
          </div>
          <span aria-hidden className="absolute bottom-[16%] left-[62%] top-0 w-px rotate-[16deg] bg-accent-hi" />
        </div>
      );
    case "code":
      return (
        <div className="absolute inset-0 flex flex-col justify-between bg-canvas-2 p-6 md:p-8">
          <p className="font-mono text-[9px] tracking-[0.3em] text-ink-dim">
            {astra?.category} — {astra?.status.toUpperCase()}
          </p>
          <div>
            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{astra?.title}</p>
            <p className="mt-2 font-mono text-[9px] tracking-[0.3em] text-ink-dim">
              {astra?.subtitle.toUpperCase()} — {astra?.year}
            </p>
          </div>
        </div>
      );
    case "ai":
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas-2">
          <span className="u-hollow-accent font-display text-5xl font-extrabold tracking-tight md:text-6xl">ASTRA</span>
          <span className="font-mono text-[9px] tracking-[0.35em] text-ink-dim">AI COMPANION — IN DEVELOPMENT</span>
        </div>
      );
    case "build":
      return (
        <div className="absolute inset-0 flex flex-col justify-between bg-canvas-2 p-6 md:p-8">
          <p className="font-mono text-[9px] tracking-[0.3em] text-ink-dim">{hostelmart?.category}</p>
          <div>
            <p className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{hostelmart?.title}</p>
            <p className="mt-2 font-mono text-[9px] tracking-[0.3em] text-ink-dim">
              {hostelmart?.subtitle.toUpperCase()} — {hostelmart?.year}
            </p>
          </div>
        </div>
      );
    case "create":
      return (
        <div className="absolute inset-0">
          <MediaSlot asset={portrait} className="absolute inset-0 h-full w-full saturate-[1.15] contrast-[1.12]" sizes="(max-width: 1024px) 100vw, 40vw" />
          <span aria-hidden className="absolute inset-0 bg-accent mix-blend-multiply opacity-[0.22]" />
        </div>
      );
    default:
      return <MediaSlot asset={candid} className="absolute inset-0 h-full w-full contrast-[1.15]" sizes="(max-width: 1024px) 100vw, 40vw" />;
  }
}

export function SceneLanes() {
  const [active, setActive] = useState(0);

  return (
    <section aria-label="The world" className="rule-double relative border-t border-line py-20 md:py-28">
      <div className="px-[var(--spacing-gutter)] pb-12">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.6rem)] font-bold tracking-tight">
          THE WORLD<span className="text-accent-hi">.</span>
        </h2>
      </div>

      <div className="grid gap-10 px-[var(--spacing-gutter)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* the remote */}
        <ul className="order-2 border-t border-line lg:order-1">
          {disciplines.map((d, i) => {
            const isActive = active === i;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group relative flex w-full items-baseline gap-x-5 border-b border-line py-4 text-left md:py-5"
                >
                  <span
                    className={`font-mono text-[10px] tracking-[0.25em] transition-colors duration-300 ${
                      isActive ? "text-accent-hi" : "text-ink-faint"
                    }`}
                  >
                    [ {String(i + 1).padStart(2, "0")} ]
                  </span>
                  <span
                    className={`font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-none tracking-tight transition-all duration-500 [transition-timing-function:var(--ease-luxe)] ${
                      isActive ? "translate-x-2 text-ink" : "text-ink-dim group-hover:text-ink"
                    }`}
                  >
                    {d.label}
                  </span>
                  <span
                    className={`ml-auto pl-4 text-right font-edit text-sm italic transition-opacity duration-500 ${
                      isActive ? "text-ink-dim opacity-100" : "text-ink-faint opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {d.note}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* the room */}
        <div className="order-1 h-fit self-start lg:sticky lg:top-24 lg:order-2 lg:mt-[4.5rem]" aria-hidden>
          <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ boxShadow: "var(--lift)" }}>
            {disciplines.map((d, i) => (
              <div
                key={d.id}
                className="absolute inset-0 transition-all duration-500 [transition-timing-function:var(--ease-luxe)]"
                style={{ opacity: active === i ? 1 : 0, transform: active === i ? "scale(1)" : "scale(1.03)" }}
              >
                <LaneWorld id={d.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
