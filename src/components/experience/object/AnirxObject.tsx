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

export type PlatePose = { x: number; y: number; z: number; ry: number };

/** At rest — the closed monolith. */
export function closedPose(i: number): PlatePose {
  return { x: (i - CENTER) * 9, y: 0, z: (CENTER - i) * 17, ry: 0 };
}

/** The shrine opens — outer plates part, the portrait advances. */
export function openPose(i: number): PlatePose {
  if (i === CENTER) return { x: 0, y: 0, z: 110, ry: 0 };
  if (i < CENTER) {
    return { x: -(CENTER - i) * 46 - 30, y: 0, z: (CENTER - i) * 17, ry: -(6 + (CENTER - i) * 4) };
  }
  return { x: (i - CENTER) * 46 + 30, y: 0, z: (CENTER - i) * 17, ry: 6 + (i - CENTER) * 4 };
}

export function poseToTransform(p: PlatePose): string {
  return `translateX(${p.x}px) translateY(${p.y}px) translateZ(${p.z}px) rotateY(${p.ry}deg)`;
}

/**
 * THE WORLDS — one body, seven minds.
 * The same seven plates continuously recompose as the visitor moves
 * through the worlds. Geometry authored per world; nothing numbered.
 */
export const WORLD_IDS = ["film", "edit", "code", "ai", "build", "create", "sport"] as const;
export type WorldId = (typeof WORLD_IDS)[number];

export function worldPose(world: WorldId, i: number): PlatePose {
  const c = i - CENTER;
  switch (world) {
    /* a curved screen of slivers — cinema as architecture */
    case "film":
      return { x: c * 48, y: 0, z: -Math.abs(c) * 10, ry: c * 6 };
    /* the cascade — frames falling through an edit */
    case "edit":
      return { x: c * 62, y: c * 14, z: (CENTER - i) * 10, ry: 0 };
    /* engineering — one precise vertical column */
    case "code":
      return { x: 0, y: c * 30, z: (CENTER - i) * 4, ry: 0 };
    /* the helix — a slow agent turning in space */
    case "ai": {
      const a = c * 0.8;
      return { x: Math.round(Math.sin(a) * 95), y: c * 28, z: Math.round(Math.cos(a) * 55) - 30, ry: c * 10 };
    }
    /* a shipped thing — dense, grounded, one solid slab */
    case "build":
      return { x: c * 4, y: 8, z: (CENTER - i) * 26, ry: 0 };
    /* the hand opens — a fan of material */
    case "create":
      return { x: c * 34, y: -Math.abs(c) * 6, z: (CENTER - i) * 12, ry: c * 9 };
    /* lean and kinetic — the body at speed */
    case "sport":
      return { x: c * 56, y: (i % 2 === 0 ? 12 : -12) + c * -4, z: (CENTER - i) * 14, ry: -8 };
  }
}

/** How the room itself leans for each world. */
export const WORLD_TILT: Record<WorldId, number> = {
  film: -8,
  edit: 8,
  code: 0,
  ai: 14,
  build: -5,
  create: 2,
  sport: -16,
};

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
