"use client";

import { useEffect } from "react";
import { useVisualMode } from "./modes";

/**
 * CinemaDirector — CINEMA is an interaction mode, not a theme.
 *
 * While cinema is active it watches [data-cine] moments (hero,
 * frames, project media) and switches the room:
 * letterbox bars slide in only while a cinematic moment owns the
 * screen, chrome steps away, and the cursor becomes a control.
 */
export function CinemaDirector() {
  const mode = useVisualMode();

  useEffect(() => {
    const root = document.documentElement;
    if (mode !== "cinema") {
      delete root.dataset.cine;
      return;
    }

    const moments = Array.from(document.querySelectorAll<HTMLElement>("[data-cine]"));
    if (moments.length === 0) return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0.3) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        if (visible.size > 0) root.dataset.cine = "active";
        else delete root.dataset.cine;
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );
    moments.forEach((m) => observer.observe(m));

    return () => {
      observer.disconnect();
      delete root.dataset.cine;
    };
  }, [mode]);

  return null;
}
