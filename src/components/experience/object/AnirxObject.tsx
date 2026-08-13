import { portrait } from "@/content/identity";
import { MediaSlot } from "@/components/ui/MediaSlot";

/**
 * THE PORTRAIT PANELS — the hero's layered composition.
 * One upright portrait standing between two tilted dark plates.
 * The arrangement is the SSR resting state; the intro only brings
 * the panels in from the dark and lifts the veil off the portrait.
 */

export const PANEL_COUNT = 3;
export const PORTRAIT_PANEL = 1;

export type PanelPose = {
  /** percent of the panel's own width */
  x: number;
  /** px offset within the stack */
  y: number;
  z: number;
  ry: number;
  rz: number;
};

export function restPose(i: number): PanelPose {
  switch (i) {
    case 0:
      return { x: -58, y: -18, z: -130, ry: 0, rz: -3.2 };
    case 2:
      return { x: 58, y: -6, z: -165, ry: 0, rz: 2.4 };
    default:
      return { x: 0, y: 0, z: 0, ry: 0, rz: 0.6 };
  }
}

export function poseToTransform(p: PanelPose): string {
  return `translateX(${p.x}%) translateY(${p.y}px) translateZ(${p.z}px) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`;
}

export function AnirxObject({ className = "" }: { className?: string }) {
  return (
    <div className={`obj-stage ${className}`} data-obj-stage aria-hidden="true">
      <div className="obj-tilt" data-obj-tilt>
        <div className="obj-spin" data-obj-spin>
          {/* the pool of light the panels stand in */}
          <div className="obj-floor" data-obj-floor />
          {Array.from({ length: PANEL_COUNT }, (_, i) => (
            <div
              key={i}
              className={`obj-plate${i !== PORTRAIT_PANEL ? " obj-plate--dark" : ""}`}
              data-obj-plate={i}
              style={{ transform: poseToTransform(restPose(i)) }}
            >
              {i !== PORTRAIT_PANEL && <span className="obj-panel-cut" aria-hidden="true" />}
              {i === PORTRAIT_PANEL && (
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
