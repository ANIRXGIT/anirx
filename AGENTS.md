<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# ANIRX.IN — PROJECT CONTEXT (above is Next.js-managed; below is project truth)

Personal digital universe of **Anirudh Sharma** → anirx.in.
Three worlds: ANIRX (public) / THE VAULT (auth gate) / ANIERA (private OS).

Read `docs/architecture.md` before structural changes. Core rules:

- **Never invent personal facts.** Unknowns = `[ADD …]` placeholders (spec §50).
- **Never fake security.** The Vault must be real server-side auth (Phase 3).
- **Never fake footage. Never show placeholder boxes.** Missing media renders beautiful *derived* visuals via `MediaSlot` — no `[ADD …]` boxes, ever. Asset specs live only in `public/media/ASSETS.md`.
- Public content lives in `src/content/*.ts` (typed, DB-shaped) — not hardcoded in JSX.
- Styling via tokens in `src/app/globals.css` (`--canvas/--ink/--accent`, `data-mode`). No raw hex in components; no generic SaaS UI.
- Animation: single GSAP registry `src/motion/gsap.ts`; Lenis via `SmoothScroll`; `prefers-reduced-motion` must always leave content fully readable.
- The number 7 recurs silently. Do not mention it in UI copy.
- Verify before finishing: `npm run build` + `npx eslint` + dev-server smoke test.
