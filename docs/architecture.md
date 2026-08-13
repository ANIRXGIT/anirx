# ANIRX — ARCHITECTURE NOTES

Major decisions, explained simply: WHAT / WHY / HOW. (Spec §48)

---

## Next.js 16 (App Router) + TypeScript

**WHAT** — The site is a Next.js 16.3 app (React 19.2, Turbopack default).
**WHY** — Server Components keep private data off the public client by default;
Vercel deploys it natively; metadata/SEO conventions are built in.
**HOW** — Routes live in `src/app`. Server Components render content; small
`'use client'` islands own animation. Breaking conventions of this version
(async `cookies()`/`headers()`/`params`, `proxy` instead of `middleware`) are
respected everywhere — see `node_modules/next/dist/docs/`.

## Tailwind CSS v4 + design tokens

**WHAT** — All styling runs through `src/app/globals.css` tokens, not ad-hoc values.
**WHY** — The brand (deep maroon, off-white, cyan, blue, ember, gold) must stay
controlled; modes must retheme everything from one switch.
**HOW** — `@theme` defines static brand colors; `@theme inline` maps semantic
tokens (`--canvas`, `--ink`, `--accent`) to CSS variables. `<html data-mode>`
flips the variables; every component recolors automatically.

## Modes — DAY / NIGHT / CINEMA

**WHAT** — Three visual modes via `src/modes/modes.ts` + `CinemaDirector` + `CineCursor`.
**WHY** — DAY/NIGHT are themes; CINEMA is an *interaction mode*, not a colorway.
**HOW** — `data-mode` on `<html>` is the single source of truth (set pre-paint
by a bootstrap script; subscribed via `useSyncExternalStore`). DAY/NIGHT persist.
CINEMA changes behavior: chrome fades away, Lenis slows, `CinemaDirector` watches
`[data-cine]` moments and slides contextual letterbox bars in/out via
`data-cine="active"`, frames expand edge-to-edge, metadata steps back, and
`CineCursor` turns the pointer into a cinematic control. CINEMA never overwrites
the stored theme.

## GSAP + ScrollTrigger + Lenis

**WHAT** — Cinematic scroll engine (`src/motion/`).
**WHY** — The homepage is a scroll-controlled narrative, not a page with
decorations. GSAP gives precise scrub control; Lenis makes the glide feel expensive.
**HOW** — One GSAP registry (`motion/gsap.ts`), one Lenis instance driven by
GSAP's ticker (`motion/SmoothScroll.tsx`). Scenes own their timelines inside
`gsap.context()` and clean up on unmount. `prefers-reduced-motion` skips all
pinning — content stays fully visible without JS by design
(animation only ever *enhances* a readable document).

## Content layer — `src/content/`

**WHAT** — Typed TS modules are the interim CMS (§36–37).
**WHY** — Anirudh edits real files today; the same shapes become DB rows later.
**HOW** — `types.ts` holds the models (`Project`, `EraChapter`, `NowItem`…).
Components read from modules, not hardcoded markup. Anything unknown is a
`[ADD …]` placeholder — fabricating personal facts is forbidden (§50).

## Media slots — derived visuals, never placeholders

**WHAT** — `components/ui/MediaSlot.tsx` + `public/media/ASSETS.md`.
**WHY** — The public UI must never look unfinished; fake footage is forbidden.
**HOW** — Each `MediaAsset` has an `available` flag. True → real image/video.
False → a composed *derived visual* (eclipse, light shaft, engineering grid,
grain). Asset specs live ONLY in ASSETS.md — never in the UI.

## THE VAULT (Phase 3) — security direction

**WHAT** — Password + email OTP, server-side sessions, proxy-guarded routes.
**WHY** — Spec §22: the gate must be real; no CSS-only secrecy, ever.
**HOW** (planned) — `proxy.ts` (Next 16's middleware) checks a signed session
cookie for `/vault` and `/aniera`; API routes re-verify server-side; private
data never seeds public bundles; `robots.ts` already disallows indexing.

## The number 7

Present, unannounced, as intended: THE 7 FRAMES (FRAME / LIGHT / MOTION / CUT /
COLOR / SOUND / STORY) — filmmaking as a system; seven lanes; the seventh index
entry is THE VAULT. More will surface. No footnotes anywhere.

## Homepage composition (v3)

**WHAT** — Four acts: hero → 7 frames → lanes → doors.
**WHY** — The person lands within ~8 seconds; everything after deepens craft.
**HOW** — The hero is THE OBJECT (`components/experience/object/
AnirxObject.tsx`): seven plates in CSS-3D depth with the portrait sealed
inside, ANIRUDH SHARMA at ~10.5vw around it; timed opening, skippable,
once per session (approved composition — do not replace). After it, no
single system carries the page: `SceneWorlds` is one continuous
environment — seven full-viewport rooms (letterboxed field, aligned
strata, ruled grid, breathing word, assembling bars, expressive crop,
lateral streaks) in the worlds' token light, closing on the statement.
`SceneArtifacts` turns ASTRA / HOSTELMART / ANIRX into 100svh chapters
with per-project tone atmospheres (only real repo data). `SceneMake` is
a sticky 235svh contact end-title (MAKE → SOMETHING → WITH ME. →
invitation → email + channels). `SceneSignature` signs the end-card:
ANIRX ~24vw, hollow → filled by scroll. `SceneVaultDoor` is a 235svh
collapse into the sealed door + the small-print footer.
Reduced/no-JS always read every chapter complete. ≤ 3 personal assets
(budget: `public/media/ASSETS.md`; the 7 stays silent).
