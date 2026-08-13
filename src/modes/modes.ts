"use client";

import { useSyncExternalStore } from "react";

export type BaseMode = "day" | "night";
export type Mode = BaseMode | "cinema";

const STORAGE_KEY = "anirx-mode";
const ATTRIBUTE = "data-mode";

/**
 * The visual mode's single source of truth is the `data-mode`
 * attribute on <html> (set before paint by the bootstrap script
 * in the root layout). Components subscribe to that — no React
 * state copy, no hydration drift.
 */

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [ATTRIBUTE],
  });
  return () => observer.disconnect();
}

/** Subscribe to data-mode changes (for any useSyncExternalStore consumer). */
export const subscribeToMode = subscribe;

function getSnapshot(): Mode {
  const mode = document.documentElement.dataset.mode;
  return mode === "day" || mode === "cinema" ? mode : "night";
}

const getServerSnapshot = (): Mode => "night";

/** Current visual mode. Re-renders only when data-mode changes. */
export function useVisualMode(): Mode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * DAY/NIGHT are themes and persist. CINEMA is an experience:
 * it changes the room but never overwrites your stored theme.
 */
export function setVisualMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  if (mode !== "cinema") {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage unavailable (private mode) — session-only is fine
    }
  }
}

export { STORAGE_KEY as MODE_STORAGE_KEY };
