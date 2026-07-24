# Ceipal Integration — Actual Current Status

Updated 2026-07-15 after the continuation session verified every item below on disk and
completed the remaining code work. The guide (`MIGRATION_GUIDE.md`) describes the intended
end state; this file describes ground truth right now.

## Done and verified

- **Dependencies** — `@supabase/supabase-js`, `nodemailer` (+ `@types/nodemailer`) in
  `package.json`; `npm install` HAS run (node_modules + package-lock present, all deps
  resolve). `framer-motion` was investigated: it IS used (by
  `src/app/client-portal/PortalClient.tsx` for its animations) — kept.
- **`src/lib/`** — all 7 Ceipal/Supabase/mailer files copied verbatim; type-check clean.
- **`src/app/api/`** — all 20 route files copied verbatim; type-check clean, all appear in
  the build's route table.
- **`supabase/migrations/`** — `001_portal_clients.sql` + `002_add_username.sql` in place
  (still NOT run against the Supabase project — see blockers below).
- **Admin panel** — `src/app/admin/page.tsx` built (1551 lines) from the 2159-line
  reference: password gate + Jobs tab (full detail-modal tree) + Clients tab only; the six
  CMS tabs and their types/imports dropped. One deliberate adaptation: login verifies the
  password via `GET /api/admin/clients` with the `x-admin-password` header (the reference
  used `DELETE /api/insights`, which isn't ported).
- **Client portal** — `src/app/client-portal/page.tsx` wrapper added; `PortalClient.tsx`
  was complete except it used `Link`/`Image`/`Logo` without importing them (the old site's
  `public/logo.svg` doesn't exist here). Fixed: imports `next/link` and renders the new
  site's text brand (M mark + "Mintex") styled for the dark theme.
- **Jobs board + apply flow** — `JobBoard.tsx` fetches `/api/jobs`, prop-less default
  export, so the untouched `get-hired/page.tsx` needed NO changes (its existing
  `<JobBoard />` import wires up correctly). `ApplyModal.tsx`/`types.ts` type-check clean.
- **Nav links** — "Client Login" → `/client-portal` present in `Footer.tsx` and on
  `seek-talent/page.tsx`.
- **Layout chrome** — new `src/components/layout/SiteChrome.tsx` (used by `layout.tsx`)
  hides the public Header/Footer on `/client-portal` and `/admin`, which render their own
  full-screen dark UIs.
- **Build & smoke test** — `npx tsc --noEmit` clean; `npm run build` passes (with Supabase
  keys present — see blockers); served app returns 200 for `/client-portal`, `/admin`,
  `/get-hired` with correct chrome on each.

## Known non-blocking issues

- `npm run lint` reports 11 errors / 8 warnings — all `react-hooks/set-state-in-effect`
  (fetch-on-mount patterns ported from the old site) plus unused-var warnings, across
  `admin/page.tsx`, `PortalClient.tsx`, `JobBoard.tsx`. `next build` does not run ESLint,
  so these don't block anything. Fix opportunistically if refactoring those files.

## Blocked on the user (cannot be done from this machine)

1. **Supabase API keys** — `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` are still blank. Get them from Supabase
   dashboard → Project Settings → API (project `kabhawzfolnnhlqyhszl`). Note: with these
   blank, `npm run build` fails at page-data collection ("supabaseKey is required") —
   that's expected, not a code bug.
2. **Run the migrations** — execute `001_portal_clients.sql` then `002_add_username.sql`
   (in order) in the Supabase SQL Editor.
3. **Change `ADMIN_PASSWORD`** — still the placeholder `admin123`; change before go-live.
4. **Live verification** — after 1–3, run the checklist at the bottom of
   `MIGRATION_GUIDE.md` (live jobs on `/get-hired`, apply flow + email, admin login +
   client creation, portal login + permission gating, logout).
