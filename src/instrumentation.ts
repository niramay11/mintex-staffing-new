// This file intentionally does nothing anymore. It used to run cache warm-up
// and job-alert checks on a bare setTimeout/setInterval loop, but Next's
// unstable_cache (used by src/lib/jobsCache.ts, data-cache.ts, etc.) throws
// "Invariant: incrementalCache missing" the moment it's called outside a real
// request — a background timer here has no request context, so every single
// tick of that old loop was failing (confirmed live in the dev server log).
//
// Both jobs now live in GET /api/cron/warm-cache, which IS a real request and
// therefore works correctly. See that route's comment for how to schedule it.
export async function register() {}
