import type { Discipline, FilmFrame, MediaAsset } from "./types";

/**
 * Identity layer — who Anirudh is, expressed as data.
 * Personal copy only; nothing here may be invented.
 *
 * MEDIA BUDGET: the whole homepage runs on THREE real assets
 * (one hero video, one portrait, one optional candid). They are
 * reused via crops, masks, filters and framing — never faked.
 * Shoot specs: public/media/ASSETS.md
 */

export const identity = {
  fullName: "ANIRUDH SHARMA",
  firstName: "ANIRUDH",
  lastName: "SHARMA",
  role: "CREATIVE TECHNOLOGIST",
  statement: "TOO CURIOUS TO STAY IN ONE LANE.",
  statementAccent: "curious",
  roleNote: "Film × Edit × Code × AI",
};

/** 01 — the hero video. The face of the opening. */
export const heroVideo: MediaAsset = {
  src: "/media/hero/hero-main.mp4",
  available: true,
  kind: "video",
  alt: "Anirudh at work — between screen, camera and code",
  spec: "HERO VIDEO — see ASSETS.md §01",
};

/** 02 — the main portrait. */
export const portrait: MediaAsset = {
  src: "/media/identity/portrait.jpg",
  available: true,
  kind: "image",
  alt: "Portrait of Anirudh Sharma",
  spec: "MAIN PORTRAIT — see ASSETS.md §02",
};

/** 03 — optional candid / action still. */
export const candid: MediaAsset = {
  src: "/media/identity/candid.jpg",
  available: false,
  kind: "image",
  alt: "Anirudh, candid",
  spec: "SECONDARY IMAGE (optional) — see ASSETS.md §03",
};

/**
 * THE 7 FRAMES — filmmaking as a system.
 * Not biography; the grammar everything else is built from.
 * FRAME / LIGHT / MOTION / CUT / COLOR / SOUND / STORY.
 */
export const sevenFrames: FilmFrame[] = [
  {
    index: "01",
    word: "FRAME",
    readout: "24 FPS · 4K · T2.8",
    copy: "Composition is deciding what to leave out.",
    treatment: "frame",
  },
  {
    index: "02",
    word: "LIGHT",
    readout: "KEY 45° · RATIO 4:1",
    copy: "You don't shoot subjects. You shoot light.",
    treatment: "light",
  },
  {
    index: "03",
    word: "MOTION",
    readout: "SHUTTER 1/50 · 180°",
    copy: "Stillness is a choice too.",
    treatment: "motion",
  },
  {
    index: "04",
    word: "CUT",
    readout: "TIMELINE 07 · RIPPLE",
    copy: "The edit is where honesty happens.",
    treatment: "cut",
  },
  {
    index: "05",
    word: "COLOR",
    readout: "NODE 03 · LUT ANIRX-01",
    copy: "Grade the feeling, not the footage.",
    treatment: "color",
  },
  {
    index: "06",
    word: "SOUND",
    readout: "-12 LUFS · 48 kHz",
    copy: "Half of what you see is what you hear.",
    treatment: "sound",
  },
  {
    index: "07",
    word: "STORY",
    readout: "RUNTIME — CONTINUES",
    copy: "Everything above is technique. This is the reason.",
    treatment: "story",
  },
];

/**
 * THE LANES — seven doors. The story continues here.
 * Status lines are system metadata and must stay true.
 */
export const disciplines: Discipline[] = [
  { id: "film", label: "FILM", tag: "DIRECTION", tone: "accent", note: "Stories told at 24fps.", status: "ACTIVE" },
  { id: "edit", label: "EDIT", tag: "POST", tone: "data", note: "Rhythm, pacing, restraint.", status: "ACTIVE — 4+ YRS FREELANCE" },
  { id: "code", label: "CODE", tag: "SYSTEMS", tone: "tech", note: "Software as a creative material.", status: "ACTIVE" },
  { id: "ai", label: "AI", tag: "EXPERIMENT", tone: "tech", note: "Curiosity with a compiler.", status: "BUILDING — ASTRA" },
  { id: "build", label: "BUILD", tag: "PRODUCT", tone: "gold", note: "Ideas that ship.", status: "ACTIVE — HOSTELMART · ANIRX" },
  { id: "create", label: "CREATE", tag: "MAKING", tone: "gold", note: "The default state.", status: "ALWAYS" },
  { id: "sport", label: "SPORT", tag: "PLAY + DISCIPLINE", tone: "ember", note: "Football, cricket, swimming, chess, the gym.", status: "DAILY" },
];
