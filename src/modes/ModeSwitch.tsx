"use client";

import { Mode, setVisualMode, useVisualMode } from "./modes";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "day", label: "DAY", hint: "Bright editorial" },
  { id: "night", label: "NIGHT", hint: "Dark cinematic" },
  { id: "cinema", label: "CINEMA", hint: "Full immersion" },
];

/**
 * Three-state mode control. Rendered inside the nav chrome.
 * Keyboard accessible; current mode announced via aria-pressed.
 */
export function ModeSwitch() {
  const mode = useVisualMode();

  return (
    <div
      role="group"
      aria-label="Visual mode"
      className="flex items-center gap-1 rounded-full border border-line bg-canvas/60 p-1 backdrop-blur-md"
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={active}
            title={m.hint}
            onClick={() => setVisualMode(m.id)}
            className={`rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.18em] transition-all duration-500 [transition-timing-function:var(--ease-luxe)] ${
              active ? "bg-accent text-canvas" : "text-ink-dim hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
