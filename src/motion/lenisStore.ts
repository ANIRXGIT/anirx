import type Lenis from "lenis";

/**
 * Tiny module-level store so any component (e.g. the nav overlay)
 * can pause/resume smooth scrolling without prop drilling.
 */
let instance: Lenis | null = null;

export const lenisStore = {
  set(lenis: Lenis | null) {
    instance = lenis;
  },
  stop() {
    instance?.stop();
  },
  start() {
    instance?.start();
  },
};
