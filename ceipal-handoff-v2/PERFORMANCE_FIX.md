# Loading-time fix — diagnosis and setup (no database used)

## The complaint

Pages that show Ceipal jobs (`/get-hired`, `/client-portal`) take a very long time to load,
inconsistently — sometimes instant, sometimes tens of seconds.

## Root cause

This app already went through one round of fixing Ceipal caching for Vercel (see the
"Why `unstable_cache`" section in `CEIPAL_INTEGRATION.md` — a plain in-memory `let cache = ...`
variable doesn't survive Vercel's serverless invocations, so it was replaced with
`unstable_cache`, which does). That fix is correct and still in place.

The gap it left behind: **`unstable_cache` only recomputes when something calls the cached
function *after* its 5-minute revalidate window has passed.** Nothing was reliably making that
call on a schedule:

- `src/instrumentation.ts` starts a `setInterval` to warm the cache every 3 minutes — but
  that only works for as long as a given Vercel function instance happens to stay alive.
  Vercel can freeze or recycle a serverless instance the moment its last response finishes;
  there's no guarantee that background loop is still running by the time the cache would
  actually go stale.
- The client-side fallback fetch in `JobBoard.tsx` (`fetch("/api/jobs")`, no timeout) and the
  `/api/jobs` route itself have no bound on how long they'll wait for a cold Ceipal pull —
  which `jobsCache.ts`'s own comments document as taking up to ~40s (its internal time
  budget) on a genuinely cold cache.

Net effect: whenever the 5-minute cache window happened to lapse with no warm-up in flight,
the next real visitor was the one who paid for a full, slow, live Ceipal pull — sometimes
tens of seconds — which reads as "the site takes forever to load."

**Why this can't be fixed with a database:** the correct fix is making sure the cache gets
refreshed proactively on a schedule, before it goes stale — that's a *scheduling* problem, not
a storage problem. The storage side (`unstable_cache` / Next's Data Cache) is already right
and already doesn't use a database. Adding a database here would just be a second place to
keep the same Ceipal data in sync — more moving parts, not a faster answer.

## The fix (already implemented in `D:\Mintex-Staffing_New`)

1. **`src/lib/warmCaches.ts`** (new) — one shared `warmAllJobCaches()` that refreshes jobs,
   placements, and portal jobs together.
2. **`src/app/api/cron/warm-cache/route.ts`** (new) — a `GET` endpoint that calls
   `warmAllJobCaches()`. Gated by a shared secret (`CRON_SECRET`) so it can't be hit by anyone
   who guesses the URL — checked either as `Authorization: Bearer <secret>` (what Vercel's own
   cron sends automatically when `CRON_SECRET` is set) or a `?secret=` query param (for
   external pingers that can't set custom headers).
3. **`vercel.json`** (new) — registers that route as a Vercel Cron running every 5 minutes,
   as a best-effort native option.
4. **`src/instrumentation.ts`** — now calls the same shared `warmAllJobCaches()`, and its
   comment no longer incorrectly implies this process behaves like a persistent Railway
   server (it was a leftover from the code this was ported from — the old site's Railway
   deployment really did make that assumption correctly; this one doesn't).

## What you still need to do

### 1. Set a real `CRON_SECRET`

A blank placeholder was added to `.env.local`. Generate a random value and set it in **two**
places:
- `.env.local` (local dev) — replace the blank `CRON_SECRET=` line.
- Vercel dashboard → your project → Settings → Environment Variables → add `CRON_SECRET` with
  the same value, for Production (and Preview if you want the cron working there too).

Any long random string works, e.g. generate one with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Confirm whether Vercel's own Cron will actually run

The code (`jobsCache.ts` comments) confirms this project has run on Vercel's **Hobby** (free)
plan at some point. Hobby-tier projects have historically been restricted to at most one cron
run per day, regardless of what schedule is in `vercel.json` — a `*/5 * * * *` schedule may be
silently capped or ignored. After your next deploy, check **Vercel dashboard → your project →
Cron Jobs** to see what schedule Vercel is actually honoring. If it's not running every ~5
minutes, do step 3 instead (or in addition).

### 3. Set up a free external pinger (works regardless of Vercel plan)

This is the reliable option and needs no paid plan and no database:

1. Go to a free scheduled-HTTP-ping service, e.g. **cron-job.org** (free, no credit card).
2. Create an account, add a new cron job:
   - URL: `https://<your-production-domain>/api/cron/warm-cache?secret=<your CRON_SECRET>`
   - Schedule: every 4 minutes (anything under the 5-minute cache TTL works; 4 min leaves a
     safety margin).
   - Method: `GET`.
3. Save, and trigger it once manually to confirm it returns `{"ok":true,...}` and not a 401
   (wrong/missing secret) or 500 (check Vercel function logs if so).

Either mechanism (Vercel Cron or the external pinger) independently keeps the cache warm —
you don't need both, but it's harmless to leave both configured since they just call the same
idempotent endpoint.

## How to verify the fix worked

1. Deploy these changes.
2. Wait ~5-10 minutes after the last deploy (past one full cache cycle) with the external
   pinger (or Vercel Cron) running.
3. Load `/get-hired` in an incognito window and time it — it should render with real jobs
   essentially immediately, not after a multi-second spinner.
4. Hit `/api/jobs` directly a few times a couple minutes apart — `cached_at` in the response
   should stay recent (within the last ~5 min) rather than jumping by large gaps, which would
   indicate the cache went cold between requests.
5. If it's still slow: check Vercel function logs for `[jobs] time budget exceeded` (Ceipal
   itself is unusually slow that cycle — not a bug in this fix) versus no such log at all
   (the warm-cache endpoint isn't actually being called — recheck steps 1-3 above).
