# Ceipal Integration — Complete Reference (upgraded)

This replaces `ceipal-handoff/MIGRATION_GUIDE.md` as the doc to hand to anyone (human or
Claude Code) who needs to understand or modify the Ceipal integration in
`D:\Mintex-Staffing_New`. The old guide was a *port-this-over* checklist written before the
work started; this is a *how-it-actually-works* reference written after the port, a CMS
build-out well beyond the original scope, and a real production performance fix. The old
folder is left untouched — this is a fresh folder.

## What Ceipal is doing in this app

Ceipal is the external ATS (applicant tracking system) that owns the actual job/placement
data. This site never stores job data of its own — every job listing, job detail, submission,
and placement shown anywhere (public jobs board, client portal, admin panel) is fetched live
from Ceipal's REST API and cached in memory only (see "Caching architecture" below). Supabase
is used for everything Ceipal doesn't own: client-portal accounts/sessions and the site's CMS
content (case studies, insights, site images, etc.) — those two data stores are intentionally
separate.

## Auth (`src/lib/ceipal.ts`)

Ceipal has two API generations in play, each with its own auth token:
- **V1** (`getCeipalToken` / `ceipalFetch`) — used for the public jobs feed
  (`CEIPAL_JOBS_URL`, a custom job-posting-details endpoint).
- **V2** (`getCeipalTokenV2` / `ceipalFetchV2`) — used for placements
  (`CEIPAL_PLACEMENTS_URL`) and the V2 jobs list / client list used for id-mapping.

Both tokens are fetched via `POST /createAuthtoken/` with `{ email, password, api_key }` from
`CEIPAL_EMAIL` / `CEIPAL_PASSWORD` / `CEIPAL_API_KEY`, cached in a module-level variable for
50 minutes (5-minute safety buffer before actual expiry), and transparently re-fetched once on
a 401/403 from any authenticated call. Every outbound call goes through `fetchWithTimeout`
(20s default) so a hung connection fails fast instead of hanging the request indefinitely.

## Data layer — three cache modules, one shared jobs fetch

| Module | Owns | Backed by |
|---|---|---|
| `src/lib/jobsCache.ts` | Public "JPC"-prefixed jobs (paginated V1 pull, up to 300 pages) | `unstable_cache`, 5 min revalidate |
| `src/lib/data-cache.ts` | Placements (V2); jobs here just delegate to `jobsCache.ts` | `unstable_cache`, 5 min revalidate |
| `src/lib/portalJobsCache.ts` | Per-client-portal-account job filtering + field stripping by permission flags | Reuses `jobsCache.ts`'s cache, no separate fetch |
| `src/lib/ceipal-job-map.ts` | `job_code` → Ceipal V2 id, normalized V2 job list | Its own `unstable_cache`-free module cache (5 min) — used by admin job-details/submissions routes |
| `src/lib/ceipal-client-map.ts` | Client name → Ceipal company id, for matching portal clients to V2 jobs | Module-level cache, 30 min |

**Why `unstable_cache` and not a plain `let cache = ...` variable:** this app runs on Vercel
serverless, not a persistent process. A hand-rolled module variable resets on every fresh
invocation — confirmed live (two consecutive requests to `/api/jobs` got zero benefit from
each other). `unstable_cache` persists through Next's Data Cache, which on Vercel is backed by
shared platform infrastructure rather than per-instance memory, so it survives across cold
serverless invocations without needing a database. Full incident details and the reliability
gap this left behind (now fixed) are in `PERFORMANCE_FIX.md`.

**Why a 40s internal time budget and 8s per-page timeout inside `jobsCache.ts`:** Ceipal's
full paginated pull has been observed taking anywhere from ~50s to 2 minutes, and Vercel's
Hobby plan hard-kills a function at 60s no matter what `maxDuration` claims. `fetchAllJobs()`
stops early and returns whatever it's collected once 40s have elapsed, so the function always
completes successfully — worst case is a shorter-than-usual (but valid) job list for that
cache cycle, never a hard failure repeating on every request.

**Why an empty result is refused, not cached:** if every page request fails, `fetchAllJobs()`
throws instead of returning `[]`. This site always has active jobs, so an empty list is never
a legitimate answer — caching it anyway would serve "0 jobs" to every visitor for the full
revalidate window, which is worse than occasionally paying the cost of a slow real answer.

## API routes

Public:
- `GET /api/jobs` — `?refresh=1` forces a cache bypass. Backed by `jobsCache.ts`.
- `GET /api/placements?client_name=...` — backed by `data-cache.ts`.
- `POST /api/apply` — candidate application intake (resume upload, e-signature, notifies via
  `src/lib/mailer.ts`).
- `POST /api/job-alerts` / `POST /api/job-alerts/unsubscribe` — job-alert email subscriptions;
  polled by `src/lib/jobAlertNotifier.ts` (see below).

Admin (gated by `x-admin-password` header, verified against `ADMIN_PASSWORD` via
`src/lib/portal-auth.ts`'s `verifyAdminPassword`):
- `/api/admin/clients`, `/api/admin/clients/[id]` — client-portal account CRUD (Supabase).
- `/api/admin/ceipal-clients` — Ceipal's own client list, for the admin UI's client picker.
- `/api/admin/job-details`, `/api/admin/job-submissions`, `/api/admin/submission-details`,
  `/api/admin/applicant-details`, `/api/admin/users-map`, `/api/admin/v2-job-map` — Ceipal V2
  detail/submission lookups for the Jobs tab's drill-down modals.

Portal (cookie-gated via `portal_token` + `verifySession`, both in `src/lib/portal-auth.ts`):
- `/api/portal/login`, `/api/portal/logout`, `/api/portal/me`
- `/api/portal/jobs` — `getPortalJobsForClient`, permission-filtered.
- `/api/portal/job-details`, `/api/portal/job-submissions`, `/api/portal/placements`,
  `/api/portal/submissions`

Operational (new — see `PERFORMANCE_FIX.md`):
- `GET /api/cron/warm-cache` — secret-gated, forces all three job/placement caches to refresh.
  Meant to be called by an external scheduler, not by users.

## Background jobs (`src/instrumentation.ts`)

Two `setInterval` loops start on server boot, **best-effort only** — see the loud comment in
that file for why a Vercel serverless instance can't be relied on to keep these running:
1. `checkForNewJobsAndNotify` (`src/lib/jobAlertNotifier.ts`) every 15 min — emails job-alert
   subscribers about newly posted matching jobs.
2. `warmAllJobCaches` (`src/lib/warmCaches.ts`) every 3 min — best-effort cache refresh; the
   *reliable* version of this is the external cron hitting `/api/cron/warm-cache`.

## Env vars this integration needs

```
CEIPAL_EMAIL=
CEIPAL_PASSWORD=
CEIPAL_API_KEY=
ADMIN_PASSWORD=
CRON_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=
NEXT_PUBLIC_SITE_URL=
```

All of these are already present (filled in) in `.env.local` as of this audit, except
`CRON_SECRET` which this change added blank — see `PERFORMANCE_FIX.md` for what to put there.
Remember to mirror any new/changed var into the Vercel project's own Environment Variables
(dashboard → Settings), since `.env.local` only affects local `next dev`.

## If you need to change something here

- Adding a new Ceipal-derived field to jobs → normalize it in `ceipal-job-map.ts`'s
  `normalise()` (for V2-sourced fields) or wherever the V1 job shape is consumed directly.
- Adding a new cached Ceipal fetch → follow the `unstable_cache` pattern in `jobsCache.ts`,
  not a bare module variable — see "Why `unstable_cache`" above for why that matters here.
- Changing the revalidate window → keep the external cron interval shorter than it (see
  `PERFORMANCE_FIX.md`) or the reliability fix stops working.
