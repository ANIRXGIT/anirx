import { portrait } from "@/content/identity";
import { MediaSlot } from "@/components/ui/MediaSlot";

/**
 * THE OBJECT — the visual identity of ANIRX. (v5)
 *
 * Seven plates standing in depth: a monolith that can open.
 * The person lives inside the stack and only appears when the
 * object opens — never a photo pinned to the page.
 *
 * Rendered by the server, fully formed (SSR/no-JS = closed monolith).
 * GSAP only transforms it from the poses below — one source of truth.
 */

export const PLATE_COUNT = 7;
export const CENTER = 3; // plate 04 of 07 — the person within the stack

export type PlatePose = { x: number; z: number; ry: number };

/** At rest — the closed monolith. */
export function closedPose(i: number): PlatePose {
  return { x: (i - CENTER) * 9, z: (CENTER - i) * 17, ry: 0 };
}

/** The shrine opens — outer plates part, the portrait advances. */
export function openPose(i: number): PlatePose {
  if (i === CENTER) return { x: 0, z: 110, ry: 0 };
  if (i < CENTER) {
    return { x: -(CENTER - i) * 46 - 30, z: (CENTER - i) * 17, ry: -(6 + (CENTER - i) * 4) };
  }
  return { x: (i - CENTER) * 46 + 30, z: (CENTER - i) * 17, ry: 6 + (i - CENTER) * 4 };
}

/** CUT — the object physically separates along its seam. */
export function cutPose(i: number): PlatePose {
  if (i === CENTER) return { x: 0, z: -70, ry: 0 };
  if (i < CENTER) return { x: -(CENTER - i) * 48 - 40, z: (CENTER - i) * 17, ry: 0 };
  return { x: (i - CENTER) * 48 + 40, z: (CENTER - i) * 17, ry: 0 };
}

/** STORY — resolved: tighter than rest, all faces true. */
export function tightPose(i: number): PlatePose {
  return { x: (i - CENTER) * 8, z: (CENTER - i) * 14, ry: 0 };
}

export function poseToTransform(p: PlatePose): string {
  return `translateX(${p.x}px) translateZ(${p.z}px) rotateY(${p.ry}deg)`;
}

export function AnirxObject({ className = "" }: { className?: string }) {
  return (
    <div className={`obj-stage ${className}`} data-obj-stage aria-hidden="true">
      {/* the X of light the monolith stands against */}
      <div className="obj-light-blade obj-light-a" data-obj-blade-a />
      <div className="obj-light-blade obj-light-b" data-obj-blade-b />

      <div className="obj-tilt" data-obj-tilt>
        <div className="obj-spin" data-obj-spin>
          {/* the pool of light the object stands in */}
          <div className="obj-floor" data-obj-floor />
          {Array.from({ length: PLATE_COUNT }, (_, i) => (
            <div
              key={i}
              className="obj-plate"
              data-obj-plate={i}
              style={{
                transform: poseToTransform(closedPose(i)),
                ["--i" as string]: i,
                ["--g" as string]: 1 - Math.abs(i - CENTER) / CENTER,
              }}
            >
              {i === 0 && (
                <span className="obj-x" aria-hidden="true">
                  <span />
                  <span />
                </span>
              )}
              {i === CENTER && (
                <span className="obj-portrait" data-obj-portrait>
                  <MediaSlot
                    asset={portrait}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 768px) 62vw, 24vw"
                    priority
                  />
                  <span className="obj-veil" data-obj-veil />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
