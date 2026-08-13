import type { EraChapter, NowItem, Project } from "./types";

/**
 * Projects — data-driven, never hardcoded into page markup.
 * Descriptions marked [ADD …] are placeholders pending real copy (§50).
 */
export const projects: Project[] = [
  {
    id: "hostelmart",
    index: "01",
    title: "HOSTELMART",
    subtitle: "Commerce for hostel life",
    category: "PRODUCT / STARTUP",
    year: "2024",
    role: "[ADD REAL ROLE]",
    technologies: ["[ADD STACK]"],
    description: "[ADD REAL PROJECT DESCRIPTION]",
    featured: true,
    status: "active",
    links: [],
  },
  {
    id: "astra",
    index: "02",
    title: "ASTRA",
    subtitle: "A personal AI assistant",
    category: "AI / TECHNOLOGY",
    year: "2025",
    role: "[ADD REAL ROLE]",
    technologies: ["[ADD STACK]"],
    description: "[ADD REAL PROJECT DESCRIPTION]",
    featured: true,
    status: "building",
    links: [],
  },
  {
    id: "anirx",
    index: "03",
    title: "ANIRX",
    subtitle: "This universe",
    category: "IDENTITY / SYSTEM",
    year: "2026",
    role: "Design, engineering, everything",
    technologies: ["Next.js", "TypeScript", "GSAP", "Tailwind"],
    description: "A personal digital universe — public identity outside, private operating system inside.",
    featured: true,
    status: "building",
    links: [],
  },
];

/**
 * THE ERA — journey chapters.
 * placeholder:true means the year/title come from the spec skeleton
 * and still need real stories, media and facts (§16, §50).
 */
export const eraChapters: EraChapter[] = [
  { id: "2005", year: "2005", title: "THE BEGINNING", summary: "[ADD REAL STORY]", placeholder: true },
  { id: "2023", year: "2023", title: "THE FIRST CLIENT", summary: "[ADD REAL STORY]", placeholder: true },
  { id: "2024", year: "2024", title: "THE BUILDER", summary: "[ADD REAL STORY]", placeholder: true },
  { id: "2025", year: "2025", title: "THE EXPANSION", summary: "[ADD REAL STORY]", placeholder: true },
  { id: "2026", year: "2026", title: "TOO MANY LANES", summary: "[ADD REAL STORY]", placeholder: true },
  { id: "next", year: "NEXT", title: "UNKNOWN", summary: "Still being written.", placeholder: true },
];

/**
 * RIGHT NOW — will be driven by the private dashboard (§18).
 * PRIVATE items never reach the public bundle.
 */
export const rightNow: NowItem[] = [
  { id: "focus", label: "FOCUS", value: "ANIRX", visibility: "PUBLIC" },
  { id: "building", label: "BUILDING", value: "ASTRA", visibility: "PUBLIC" },
  { id: "creating", label: "CREATING", value: "[ADD CURRENT FILM PROJECT]", visibility: "PUBLIC" },
  { id: "training", label: "TRAINING", value: "PHYSIQUE", visibility: "PUBLIC" },
  { id: "learning", label: "LEARNING", value: "AI / PRODUCT ENGINEERING", visibility: "PUBLIC" },
];

export const publicNow = rightNow.filter((item) => item.visibility === "PUBLIC");
