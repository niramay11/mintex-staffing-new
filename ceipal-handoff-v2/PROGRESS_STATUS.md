# Ceipal Integration — Actual Current Status (upgraded audit)

Supersedes `ceipal-handoff/PROGRESS_STATUS.md` (2026-07-15). That file is left untouched;
this is a fresh folder reflecting ground truth verified on disk on 2026-07-23. The original
migration described in `ceipal-handoff/MIGRATION_GUIDE.md` is **done and then some** — this
project now has significantly more built than that guide ever described, and a real
production performance incident (see `PERFORMANCE_FIX.md`) has already been diagnosed and
fixed once, then hardened further today.

## Confirmed done and verified today

- **Env vars** — every var in `.env.local` (`CEIPAL_*`, `ADMIN_PASSWORD`, Supabase, SMTP,
  `NEXT_PUBLIC_SITE_URL`) is filled in (not blank, values not inspected/printed for safety).
  This clears the biggest blocker the 07-15 status file flagged.
- **Deployed on Vercel**, project `mintex-staffing-new` (`.vercel/project.json`), not
  Railway. This matters — see below.
- **Type-check clean** — `npx tsc --noEmit` passes with zero errors as of this audit,
  including the new performance-fix files.
- **Ceipal/Supabase backend surface has grown well past the original scope**: beyond
  jobs/clients/portal, `src/app/api/` now also has `case-studies`, `client-stories`,
  `insights` (+ categories), `hiring-inquiries`, `messages`, `resumes`, `site-images`,
  `social-links`, `job-alerts` (+ unsubscribe), `industry-stats` — a full CMS, not just the
  jobs+clients slice the original handoff scoped. `src/app/admin/page.tsx` and the site's
  page tree (`case-studies`, `insights`, `resources`, `industries/[slug]`, `seek-talent`,
  etc.) reflect this.
- **Ceipal data layer has already been rebuilt once for Vercel**, replacing the naive
  in-memory caches the original migration copied verbatim from the old (Railway-hosted)
  site:
  - `src/lib/jobsCache.ts` — public jobs, via `unstable_cache` (Next's Data Cache), 5 min
    revalidate, 40s internal time budget, per-page 8s timeout with one retry, refuses to
    cache an all-empty result.
  - `src/lib/data-cache.ts` — placements via the same `unstable_cache` pattern; jobs
    delegate to `jobsCache.ts` (one shared fetch, not a duplicate).
  - `src/lib/portalJobsCache.ts` — client-portal job filtering, built on top of the same
    shared jobs cache instead of its own fetch.
  - `src/app/get-hired/page.tsx` and `src/app/client-portal/page.tsx` — SSR prefetch
    wrapped in a 3s `withTimeout`, falling back to an empty list + client-side refetch
    rather than blocking page load on a cold Ceipal pull.
  - Comments throughout these files document *why*: two consecutive requests on Vercel
    were confirmed getting zero benefit from a plain `let cache = ...` module variable
    (each serverless invocation is isolated), and the Hobby plan hard-kills functions at
    60s regardless of `maxDuration`.
- **New today** — the one gap that rework left behind: nothing was reliably re-populating
  those caches *before* they went stale in production (see `PERFORMANCE_FIX.md` for the
  full diagnosis). Added:
  - `src/lib/warmCaches.ts` — single shared `warmAllJobCaches()`.
  - `src/app/api/cron/warm-cache/route.ts` — secret-gated GET endpoint an external
    scheduler can hit to force a refresh before the 5-min TTL lapses.
  - `vercel.json` — a `crons` entry calling that route every 5 minutes (best-effort — see
    the Hobby-plan caveat in `PERFORMANCE_FIX.md`).
  - `src/instrumentation.ts` — corrected a leftover comment that incorrectly assumed this
    process runs persistently like the old Railway deployment; now accurately describes it
    as a best-effort bonus only, not the real warming mechanism.
  - `CRON_SECRET` placeholder added to `.env.local` (blank — needs a value, see below).

## Not verified by this audit (needs the user or a live check)

1. **Supabase migrations** — whether `001_portal_clients.sql` / `002_add_username.sql` (or
   any newer migrations added since — check `supabase/migrations/` for files beyond those
   two) have actually been run against the live Supabase project. Can't be confirmed from
   the filesystem alone.
2. **`ADMIN_PASSWORD`** — value not inspected; confirm it's no longer a placeholder like the
   old `admin123` before treating this as production-hardened.
3. **`CRON_SECRET`** — intentionally left blank by this change. Set a real random value in
   both `.env.local` (local dev) and the Vercel project's environment variables (dashboard →
   Settings → Environment Variables), otherwise `/api/cron/warm-cache` runs unauthenticated
   for anyone who finds the URL (harmless — it only re-warms a cache — but still worth
   locking down).
4. **Vercel plan / cron frequency** — the jobsCache.ts comments confirm Hobby plan was in
   use at some point. Vercel's Hobby tier has historically restricted cron jobs to at most
   once/day; a `*/5 * * * *` schedule in `vercel.json` may be silently ignored or rejected
   on that tier. Don't assume the Vercel-native cron is actually firing — verify via the
   Vercel dashboard's Cron Jobs tab after deploying, and set up the external pinger in
   `PERFORMANCE_FIX.md` regardless, since it works on any plan.
5. **End-to-end live verification** — actually loading `/get-hired`, `/client-portal`,
   `/admin` against live Ceipal + Supabase was not performed in this audit (no dev server
   was started). Recommended before considering this "done": run `npm run dev`, walk the
   checklist in `ceipal-handoff/MIGRATION_GUIDE.md`'s "Verification checklist" section, plus
   the cache-warm check in `PERFORMANCE_FIX.md`.
