"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/motion/gsap";

/**
 * The scroll cue, grown up.
 * The vertical line that invited the first scroll becomes the
 * fixed progress hairline that tracks the whole experience.
 */
export function ProgressHairline() {
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (fillRef.current) {
          fillRef.current.style.transform = `scaleY(${self.progress})`;
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-3 top-1/2 z-30 hidden h-[34vh] -translate-y-1/2 md:block"
    >
      <span className="block h-full w-px bg-line">
        <span
          ref={fillRef}
          className="block h-full w-px origin-top bg-accent-hi"
          style={{ transform: "scaleY(0)" }}
        />
      </span>
    </div>
  );
}
