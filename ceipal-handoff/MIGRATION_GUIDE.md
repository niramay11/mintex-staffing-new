# Ceipal Integration Migration — Handoff Guide

Give this whole `ceipal-handoff` folder to the Claude Code session working inside
`D:\Mintex-Staffing_New`. Tell it to read this file first, then execute the steps below.
Every file it needs to copy is already sitting in `reference-source/` next to this guide —
it does **not** need access to the old project at `d:\mintex-staffing`.

## Context

`d:\mintex-staffing` (old site) has a working Ceipal ATS integration: an admin panel for
viewing synced jobs and managing client-portal accounts, a client portal where each client
logs in and sees only their own jobs/submissions/placements, and a public "apply to jobs"
flow that emails the team and posts candidate applications to Ceipal-adjacent storage.

`D:\Mintex-Staffing_New` (new site) is a freshly designed Next.js 16 / React 19 / Tailwind v4
project (`src/` layout, navy/tan brand) with the visual design mostly done but **no backend
at all** — jobs are static dummy data in `src/content/jobs.ts`, no Supabase, no admin, no
client portal.

Goal: port the Ceipal-related backend + frontend into the new site, adapted to its file
structure and design — scoped to jobs + clients only (not the old site's unrelated CMS tabs
for hero sections/social links/media/etc.).

**Good news discovered during prep:** both projects are already on the same Next.js major
version (16.2.x) and the old project's route handlers already use the modern async
`params: Promise<{...}>` convention. That means almost every backend file below can be
copied **verbatim, byte-for-byte, with zero code changes** — no Next-version adaptation
needed. Only three pieces genuinely need rewriting: the admin page (trim out 6 unrelated
tabs), the public jobs/apply flow (fold into the existing `/get-hired` page instead of a
separate route), and the client portal (new route path).

## Decisions already made (don't re-litigate these)

- **New Supabase project** for the new site (not shared with the old site) — user will
  create this themselves.
- **Admin panel scope**: only Jobs tab + Clients tab. Drop Media/Hero/Social/Impact/History/
  Messages tabs entirely (they call APIs — `/api/hero-cards`, `/api/social-links`, `/api/insights`,
  `/api/history-images`, `/api/messages`, `/api/statistics` — that are not being ported).
- **Jobs UX**: replace `src/components/jobs/JobBoard.tsx`'s static dummy data with live Ceipal
  jobs, and add the full apply flow (multi-select, resume upload, e-signature) inline on the
  existing `/get-hired` page — no new dedicated jobs route like the old site's `/candidates/jobs`.
- **Client portal**: new route at `/client-portal`, linked from the Seek Talent page and the
  footer (new nav has no portal link yet).

## Step 1 — Dependencies

Add to `D:\Mintex-Staffing_New\package.json`:
- `dependencies`: `@supabase/supabase-js` (^2.106.0), `nodemailer` (^8.0.7)
- `devDependencies`: `@types/nodemailer` (^7.0.9)

Run `npm install`.

## Step 2 — Env vars

Create `D:\Mintex-Staffing_New\.env.local` (already gitignored via the `.env*` rule) with:

```
CEIPAL_EMAIL=
CEIPAL_PASSWORD=
CEIPAL_API_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Mintex Staffing
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The user needs to fill in real values:
- `CEIPAL_*` — can reuse the same values from `d:\mintex-staffing\.env.local` (same Ceipal account).
- Supabase vars — from a **new** Supabase project the user creates at supabase.com (Project
  Settings → API for the URL/anon key/service role key).
- `SMTP_*` — a Gmail account + app password (same pattern as the old site), or reuse the old
  site's SMTP creds if the user wants portal-credential emails to come from the same address.
- `ADMIN_PASSWORD` — user's choice, this gates `/admin`.

**Do not fabricate or guess these values — leave them blank for the user to fill in.**

## Step 3 — Supabase schema

Copy `reference-source/supabase/migrations/001_portal_clients.sql` and `002_add_username.sql`
into `D:\Mintex-Staffing_New\supabase\migrations\` unchanged. These create the `clients` and
`client_sessions` tables (client-portal accounts + session tokens) with an `update_updated_at`
trigger. Run them against the new Supabase project via its SQL editor (or `supabase db push`
if the CLI is linked). Note migration 002 alters columns created in 001, so run them in order.

## Step 4 — Copy lib files verbatim

Copy every file in `reference-source/lib/` into `D:\Mintex-Staffing_New\src\lib\` with **no
changes**:

| Source | Purpose |
|---|---|
| `ceipal.ts` | Ceipal auth token fetch/cache + `ceipalFetch`/`ceipalFetchV2` helpers |
| `ceipal-job-map.ts` | `job_code` → Ceipal v2 id map + normalized job list cache |
| `ceipal-client-map.ts` | Ceipal client name → id map |
| `data-cache.ts` | Shared in-memory cache for `getAllJobs()`/`getAllPlacements()` |
| `supabase.ts` | `supabase` (anon) + `supabaseAdmin` (service role) clients |
| `portal-auth.ts` | pbkdf2 password hashing, Supabase-backed session tokens, `verifyAdminPassword` |
| `mailer.ts` | `sendPortalCredentials()` via nodemailer/Gmail SMTP |

`@/lib/...` import paths already match (`@/*` → `./src/*` in both projects), so nothing to
rewrite.

## Step 5 — Copy API routes verbatim

Copy every route file below into the equivalent path under `D:\Mintex-Staffing_New\src\app\api\`.
**No code changes needed** — same Next.js version, same `@/lib` alias, `NextRequest.cookies`
(not `next/headers` `cookies()`) is used throughout so nothing is affected by the async-cookies
change.

Public:
- `reference-source/api/jobs/route.ts` → `src/app/api/jobs/route.ts`
- `reference-source/api/apply/route.ts` → `src/app/api/apply/route.ts`
- `reference-source/api/placements/route.ts` → `src/app/api/placements/route.ts`

Admin (all unauthenticated except `clients*`, which check `x-admin-password` header via
`verifyAdminPassword` — that's the existing pattern, keep it as-is):
- `reference-source/api/admin/clients/route.ts` → `src/app/api/admin/clients/route.ts`
- `reference-source/api/admin/clients/[id]/route.ts` → `src/app/api/admin/clients/[id]/route.ts`
- `reference-source/api/admin/ceipal-clients/route.ts` → `src/app/api/admin/ceipal-clients/route.ts`
- `reference-source/api/admin/job-details/route.ts` → `src/app/api/admin/job-details/route.ts`
- `reference-source/api/admin/job-submissions/route.ts` → `src/app/api/admin/job-submissions/route.ts`
- `reference-source/api/admin/submission-details/route.ts` → `src/app/api/admin/submission-details/route.ts`
- `reference-source/api/admin/applicant-details/route.ts` → `src/app/api/admin/applicant-details/route.ts`
- `reference-source/api/admin/users-map/route.ts` → `src/app/api/admin/users-map/route.ts`
- `reference-source/api/admin/v2-job-map/route.ts` → `src/app/api/admin/v2-job-map/route.ts`

Portal (all cookie-gated via `portal_token` + `verifySession` from `lib/portal-auth.ts`):
- `reference-source/api/portal/login/route.ts` → `src/app/api/portal/login/route.ts`
- `reference-source/api/portal/logout/route.ts` → `src/app/api/portal/logout/route.ts`
- `reference-source/api/portal/me/route.ts` → `src/app/api/portal/me/route.ts`
- `reference-source/api/portal/jobs/route.ts` → `src/app/api/portal/jobs/route.ts`
- `reference-source/api/portal/job-details/route.ts` → `src/app/api/portal/job-details/route.ts`
- `reference-source/api/portal/job-submissions/route.ts` → `src/app/api/portal/job-submissions/route.ts`
- `reference-source/api/portal/placements/route.ts` → `src/app/api/portal/placements/route.ts`
- `reference-source/api/portal/submissions/route.ts` → `src/app/api/portal/submissions/route.ts`

## Step 6 — Admin frontend (`src/app/admin/page.tsx`) — needs trimming, not verbatim copy

Full original is at `reference-source/frontend/admin/page.tsx` (2159 lines, 8 tabs). Build a
new `src/app/admin/page.tsx` that keeps:
- The outer shell: password gate (`x-admin-password` stored in `localStorage`, same
  `STORAGE_KEY` pattern), header, tab bar.
- **Only** the `jobs` and `clients` tabs in the `TABS` array/labels.
- The `JobsTab` component and everything it depends on (`JobDetailModal`, `SnapshotTab`,
  `DetailsTab`, `SubmissionsTab`, `SubmissionDetailModal`, `PipelineBar`, `PipelineDots`,
  pipeline-stage helpers, `QuickStat`/`InfoCard`/`ModalSpinner`) — calls `/api/jobs`,
  `/api/admin/v2-job-map`, `/api/admin/job-details`, `/api/admin/job-submissions`,
  `/api/admin/users-map`, `/api/admin/applicant-details`, `/api/admin/submission-details`.
- The `ClientsTab` and `ClientForm` components — calls `/api/admin/ceipal-clients` and
  `/api/admin/clients` (+ `[id]`). Keep `DEFAULT_PERMISSIONS` constant.

Drop entirely: `MediaTab`, `HeroTab`, `SocialTab`, `ImpactTab`, `HistoryImagesTab`,
`MessagesTab`, and their imports/types (they reference APIs that aren't being ported).

Internal dark theme (`bg-gray-950` etc.) is fine to keep as-is — this is an internal tool,
doesn't need to match the public navy/tan brand.

## Step 7 — Client portal (`src/app/client-portal/page.tsx`)

Reference: `reference-source/frontend/clients-portal/PortalClient.tsx` (1178 lines) +
`page.tsx` (trivial wrapper). Port this logic as-is into a new route at
`src/app/client-portal/page.tsx` (client component). It already does login + dashboard in one
component: checks `/api/portal/me` on mount, shows a login form posting to
`/api/portal/login` if unauthenticated, otherwise fetches `/api/portal/jobs` and
`/api/portal/submissions?job_codes=...`, renders a searchable/filterable dashboard with a job
detail modal and a logout button (`/api/portal/logout`). No SSR cookie-gating needed — the
`/api/portal/me` 401 check handles it client-side, same as the original.

Note: the old repo also has a second, older client-portal implementation at
`app/portal/*` (login page + SSR dashboard). It's dead/orphaned — nothing in the old site's
nav or CTAs links to it, only `/clients/portal` (the `PortalClient.tsx` referenced above) is
live. It was **not** copied into this handoff folder — don't try to port it.

## Step 8 — Live jobs + apply flow on `/get-hired`

Reference: `reference-source/frontend/candidates-jobs/JobsClient.tsx` (1233 lines) and
`ApplyView.tsx` (723 lines) — full old implementation of the job board + apply form
(candidate fields, in-browser signature pad, resume upload, `POST /api/apply` with
`multipart/form-data` including a `jobs` JSON field of `{job_code, job_title, location,
pay_rate}`).

Target: rewrite `src/components/jobs/JobBoard.tsx` to fetch `/api/jobs` instead of importing
`src/content/jobs.ts`, keeping the new design's look (reuse `src/components/ui/JobTile.tsx`
where the shape fits) but bringing over: loading state, search, industry/type/location
filters, multi-select checkboxes, and an "Apply" action. Add a new
`src/components/jobs/ApplyModal.tsx` (or similar) porting `ApplyView.tsx`'s form/validation/
signature-pad/submit logic, opened as a modal from `JobBoard` for the selected job(s) instead
of the old site's separate `/candidates/jobs` route + `display:none` toggle.

Leave `ResumeForm.tsx` and `JobAlertForm.tsx` (currently stubbed with `TODO` comments) alone —
those are separate, non-Ceipal features already scaffolded on `/get-hired`, out of scope here.

## Step 9 — Nav/footer links

Add a "Client Login" link to `/client-portal` in `src/components/layout/Footer.tsx`, and a
CTA/mention on `src/app/seek-talent/page.tsx` (e.g. near "Contract Talent"/"How We Work"
sections, matching that page's existing `Section`/`Button` component usage).

## Verification checklist

1. `npm install && npm run dev` — confirm no build/type errors.
2. With real env vars filled in: load `/get-hired`, confirm live Ceipal jobs render (not
   dummy data), select 1-2 jobs, submit the apply flow end-to-end including a resume file,
   confirm the notification email arrives.
3. Visit `/admin`, log in with `ADMIN_PASSWORD`. Jobs tab loads + syncs from Ceipal, job
   detail modal's snapshot/details/submissions sub-tabs load. In Clients tab, create a new
   client-portal account with a couple of `allowed_job_codes`, confirm the portal-credentials
   email sends.
4. Visit `/client-portal`, log in with that client's username/password — confirm only the
   assigned jobs appear, job detail + submissions load, and permission-gated fields (e.g.
   bill rate) are hidden/shown per that client's permission flags.
5. Confirm `/client-portal` logout clears the session (subsequent `/api/portal/me` returns 401).
