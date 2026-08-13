import type { SocialLink } from "./types";

export const site = {
  name: "ANIRX",
  domain: "anirx.in",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  owner: "Anirudh Sharma",
  role: "Creative Technologist",
  statement: "TOO CURIOUS TO STAY IN ONE LANE.",
  description:
    "ANIRX — the personal digital universe of Anirudh Sharma: filmmaking, editing, code, building, sport and everything in between.",
  /** [ADD REAL EMAIL] placeholder — replace with Anirudh's actual contact email. */
  email: "hello@anirx.in",
} as const;

export const socials: SocialLink[] = [
  // [ADD REAL PROFILE URLS] — placeholders below, replace before launch.
  { label: "GitHub", href: "https://github.com/", handle: "[ADD GITHUB HANDLE]" },
  { label: "LinkedIn", href: "https://linkedin.com/", handle: "[ADD LINKEDIN HANDLE]" },
  { label: "Instagram", href: "https://instagram.com/", handle: "[ADD INSTAGRAM HANDLE]" },
  { label: "YouTube", href: "https://youtube.com/", handle: "[ADD YOUTUBE HANDLE]" },
];
