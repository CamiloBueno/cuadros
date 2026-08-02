# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

This is a Next.js web app for a school reunion event ("Einheit 2026", Colegio Alemán de Cali,
ASODECA — the alumni association). The app is a gamified experience organized around a wall
metaphor: alumni complete "misiones" (missions) that progressively "tear down" a digital Berlin
Wall-style wall as engagement grows. `README.md` contains the original creative/marketing brief
(gamification concept, mission ideas, event narrative) — read it for *why* a mission exists, not
for engineering guidance.

This repo hosts multiple independent missions/mini-games, each living under `app/misiones/<name>`.
Work usually arrives as a delegated spec for one mission at a time (see `docs/superpowers/specs/`
and `docs/superpowers/plans/` for how past missions were scoped and planned). Treat each mission
as a self-contained feature: its own route, its own components under `components/<mission>/`, its
own game logic under `lib/<mission>/` (or `lib/game/` if reused), and its own Supabase table.

Mission 3 (`app/misiones/memorama`) is the only mission implemented so far — a Supabase-backed
memory-matching game. `MISSION_3_GUIDE.md` documents how to port that mission's logic into a
different Supabase project; read it if you're extracting or replicating game logic, not for
day-to-day work on this repo.

## Commands

```bash
npm run dev      # start dev server (Turbopack) on :3001
npm run build    # production build (Turbopack)
npm run start    # start production server on :3001
npm run lint      # eslint (next/core-web-vitals, next/typescript)
npm test          # vitest run (all tests, once)
npx vitest        # vitest watch mode
npx vitest run path/to/File.test.tsx   # run a single test file
npx tsc --noEmit  # type-check without emitting
```

The dev/start ports are pinned to `3001` in `package.json` (`-p 3001`) so this project doesn't
collide with another project running on the default `localhost:3000`.

Tests live next to the code they test (`Foo.tsx` + `Foo.test.tsx`), use Vitest with `jsdom` and
`@testing-library/react` (see `vitest.config.ts` / `vitest.setup.ts`). The `@/*` import alias
resolves to the repo root (`tsconfig.json` and `vitest.config.ts` both define it).

## Architecture

**Stack**: Next.js 15 (App Router, TypeScript), Tailwind v4, shadcn/ui (`style: base-nova`,
component alias config in `components.json`), Supabase (`@supabase/supabase-js`) as the only
backend.

**Per-mission structure** (established by mission 3, follow it for new missions):
- `app/misiones/<mission>/page.tsx` — an async **Server Component**. Fetches mission data from
  Supabase server-side (anon key, public-read RLS policy — see below) and passes plain
  props into a client component. Uses `export const dynamic = 'force-dynamic'` to avoid caching
  stale rows.
- `components/<mission>/` — the interactive **Client Component** tree (`'use client'`).
- `lib/game/` (or a per-mission lib dir) — framework-free game logic: types, a `useReducer`-style
  reducer for state transitions, pure helper functions (shuffling, mapping DB rows to domain
  types, validation). Keep this free of React/Next imports so it's independently testable and
  portable — `MISSION_3_GUIDE.md` documents exactly this separation for reuse in other repos.
- `lib/supabase/server.ts` — creates a Supabase client from `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Always the anon/publishable key, never `service_role` — real
  data protection comes from RLS policies, not key secrecy, since these are `NEXT_PUBLIC_*` vars.
- `lib/supabase/types.ts` — row types matching each mission's Supabase table(s).

**Hydration-safety pattern (important, easy to get wrong)**: game boards that need
randomization (e.g. card shuffling) must render an unshuffled/deterministic initial state during
SSR and first client render, then shuffle inside a `useEffect` with `[]` deps after mount. Doing
`Math.random()`-based work during the initial render (including inside a reducer's `init`
function) causes a server/client hydration mismatch. See `lib/game/shuffle.ts` +
`components/memory/MemoryGame.tsx` for the reference implementation, and the note in
`MISSION_3_GUIDE.md` §1.

**Supabase conventions**:
- One table per mission's dataset, RLS enabled, with a public **read-only** `select` policy
  (missions are consumed anonymously from server components, no user auth in the game itself).
  Never widen a mission's table for other data — create a new table instead.
- After schema changes, run advisors (`mcp__supabase__get_advisors type=security`) to confirm no
  table is exposed without RLS.
- Table access also requires the Data API to expose the table to `anon`/`authenticated`
  (`grant select on <table> to anon, authenticated;`) — RLS alone controls rows, not reachability.
- The Supabase MCP server is configured in `.mcp.json` (project-scoped) for direct DB/migration
  access from Claude Code.

**Mission-specific constants are intentionally hardcoded** per mission (e.g. mission 3's
`MISSION_ID`, `EXPECTED_PAIR_COUNT`, grid column count, `TIME_LIMIT_SECONDS`) rather than made
generic/configurable — each mission is a distinct, scoped deliverable, not a templated system.
When adding a new mission, add its own constants rather than parameterizing an existing mission's
code.
