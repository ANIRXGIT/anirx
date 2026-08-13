/**
 * ANIRX content models.
 *
 * These types are the single source of truth for public content.
 * Today the data lives in typed TS modules (src/content/*).
 * Later the same shapes map 1:1 onto database rows (Phase 6/7),
 * so no component has to change when a real CMS lands.
 */

export type Visibility = "PUBLIC" | "PRIVATE";

export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export interface MediaAsset {
  /** Path under /public, e.g. /media/identity/portrait.jpg */
  src: string;
  /** Flip to true once the real file exists in /public. Placeholders render until then. */
  available: boolean;
  kind: "image" | "video";
  alt: string;
  /** Production note for Anirudh — what to shoot/provide. */
  spec: string;
}

export interface Discipline {
  id: string;
  label: string;
  tag: string;
  /** Semantic color key from the token system. */
  tone: "accent" | "tech" | "data" | "ember" | "gold";
  note: string;
  /** Live status shown as system metadata — must stay true. */
  status: string;
}

/** One of the 7 FRAMES — the filmmaking device, not a website screen. */
export interface FilmFrame {
  index: string;
  word: string;
  /** Craft metadata (fps, shutter, nodes…) — language of the process. */
  readout: string;
  /** One authored line about what this element means to Anirudh. */
  copy: string;
  /** Which visual treatment the frame uses. */
  treatment: "frame" | "light" | "motion" | "cut" | "color" | "sound" | "story";
}

export interface Project {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  role: string;
  technologies: string[];
  description: string;
  featured: boolean;
  status: "active" | "building" | "draft";
  links: { label: string; href: string }[];
}

export interface EraChapter {
  id: string;
  year: string;
  title: string;
  summary: string;
  placeholder: boolean;
}

export interface NowItem {
  id: string;
  label: string;
  value: string;
  visibility: Visibility;
}
