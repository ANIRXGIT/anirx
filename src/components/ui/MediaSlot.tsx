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
}: {
  asset: MediaAsset;
  className?: string;
  sizes?: string;
  priority?: boolean;
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
          loop
          playsInline
          preload="metadata"
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
