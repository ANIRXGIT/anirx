import Image from "next/image";
import type { MediaAsset } from "@/content/types";

/**
 * MediaSlot — one window into ANIRX media.
 *
 * Real asset available → it renders, sharply.
 * Not yet available → a derived studio visual: an empty stage,
 * lit and waiting. Never a placeholder box, never instructions,
 * never noise. Missing media is a dev concern (public/media/ASSETS.md).
 */
export function MediaSlot({
  asset,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  hold = false,
  preload = "metadata",
}: {
  asset: MediaAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Video behavior: play the shot ONCE and rest on its final frame.
   * Used by the hero — the move ends on the face, and the face stays.
   */
  hold?: boolean;
  /** Hero media is the LCP — raise to "auto". Everything else stays "metadata". */
  preload?: "auto" | "metadata" | "none";
}) {
  if (asset.available && asset.kind === "image") {
    return (
      <span className={`u-plate block ${className}`}>
        <Image src={asset.src} alt={asset.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </span>
    );
  }

  if (asset.available && asset.kind === "video") {
    return (
      <span className={`u-plate block ${className}`}>
        <video
          src={asset.src}
          aria-label={asset.alt}
          autoPlay
          muted
          loop={!hold}
          playsInline
          preload={preload}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

  return (
    <span className={`u-plate block ${className}`} role="img" aria-label={asset.alt}>
      <span className="derived absolute inset-0" />
    </span>
  );
}
