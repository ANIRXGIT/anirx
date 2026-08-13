# ANIRX.IN

The personal digital universe of **Anirudh Sharma** — Creative Technologist.

> TOO CURIOUS TO STAY IN ONE LANE.

Three worlds: **ANIRX** (public identity) · **THE VAULT** (the door) ·
**ANIERA** (the private operating system). See `docs/architecture.md` for how
it hangs together.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
(design tokens) · GSAP + ScrollTrigger · Lenis · `next/font` (Syne, Space
Grotesk, JetBrains Mono, Instrument Serif)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in what's needed for the phase you're in
npm run dev                  # http://localhost:3000
```

> **Git:** this project expects Git for version control but it isn't installed
> on the current machine yet. Install Git, then `git init && git add -A` —
> `.gitignore` is already correct and secrets stay uncommitted.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server (Turbopack) |
| `npm run build` | Production build + typecheck |
| `npm start` | Serve the production build |
| `npx eslint` | Lint |

## Project structure

```
src/
  app/            routes: / (public universe), /vault (sealed, Phase 3)
  components/
    chrome/       navigation, persistent UI
    experience/   cinematic scenes (opening sequence, reveals)
    ui/           primitives (Mark, PlaceholderMedia)
  content/        TYPED PUBLIC CONTENT — the interim CMS. Edit here, not JSX.
  modes/          DAY / NIGHT / CINEMA
  motion/         GSAP registry, Lenis smooth scroll, reduced-motion
docs/             architecture notes (WHAT / WHY / HOW)
public/media/     all imagery & footage — see ASSETS.md before adding
```

## Editing content

Almost everything public lives in `src/content/*.ts` — identity, disciplines,
projects, journey, right-now, socials. Unknowns are explicit `[ADD …]`
placeholders. Nothing personal is ever invented (master spec §50).

## Modes

DAY (warm editorial) · NIGHT (technical cinematic, default) · CINEMA — an
interaction mode, not a theme: chrome fades, scroll slows, [data-cine] moments
letterbox contextually, frames go edge-to-edge, the cursor becomes a control.
Toggle lives top-right. DAY/NIGHT persist; CINEMA never overwrites your theme.

## Media budget

The homepage needs exactly **three** personal assets — one hero video, one
portrait, one optional candid. Specs: `public/media/ASSETS.md`. Drop the files
in, flip `available` in `src/content/identity.ts`, everything upgrades.

## Deploying (Vercel)

1. Push to GitHub. 2. Import in Vercel. 3. Set `NEXT_PUBLIC_SITE_URL` to
`https://anirx.in`. 4. Add the `anirx.in` domain in Vercel → point DNS at
Vercel. Database/auth env vars arrive with Phase 3/7; `.env.example` documents
every variable.

## Roadmap (phases)

1. **Visual foundation + cinematic homepage + modes** ← *you are here*
2. Public sections: WHO'S ANI, FRAME BY FRAME, THE ERA, RIGHT NOW, THE RECORD, MAKE SOMETHING
3. THE VAULT — real authentication (password + email OTP)
4. ANIERA — TODAY, MISSIONS, rewards, finance, planner, journal
5. BODY LAB, nutrition, study, analytics
6. Admin / CMS + dynamic RIGHT NOW + CV
7. Production: Postgres/Supabase, hardening, Vercel + anirx.in
8. Mobile app readiness
