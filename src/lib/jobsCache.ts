import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

const PAGE_SIZE  = 50;
const BATCH_SIZE = 8;
const RETRY_DELAY = 800;
// Every time this window expires, the NEXT request has to trigger a live Ceipal
// pull — and if Ceipal happens to answer badly at that exact moment, that one
// visitor sees an empty/partial result (confirmed live). A longer window means
// fewer chances per hour to roll that dice, at the cost of slightly staler data
// — an easy trade for a jobs board where 15-minute-old postings are irrelevant.
const CACHE_TTL_SECONDS = 15 * 60;
const CACHE_TAG = 'ceipal-public-jobs';

// ceipalFetch's own internal timeout is 20s — meaning one slow/hanging page
// (first attempt 20s + retry-delay 800ms + retry attempt 20s ≈ 41s) can, all
// by itself, blow past the between-rounds TIME_BUDGET_MS check below, since
// that check only runs BEFORE starting a new round, not during one already
// in flight. Racing each individual attempt against a much shorter 8s here
// caps a single page's worst case at ~17s instead of ~41s, so one bad page
// can no longer single-handedly push the whole function past Vercel's 60s
// hard limit.
const PAGE_ATTEMPT_TIMEOUT_MS = 8_000;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

async function fetchPage(page: number): Promise<unknown[] | null> {
  try {
    const res  = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
    const data    = JSON.parse(text);
    const results = Array.isArray(data?.results) ? data.results : [];
    return results;
  } catch { return null; }
}

// Returns null when the page genuinely could not be fetched (timed out /
// errored on both attempts) — this must stay distinguishable from a
// successful response containing zero results (which legitimately means
// "past the last page, stop paginating"). Collapsing the two into the same
// `[]` value was the actual bug: a single transient timeout on an early page
// used to be indistinguishable from "no more jobs", silently truncating (or
// completely zeroing) the whole result for that fetch cycle.
async function fetchPageWithRetry(page: number): Promise<unknown[] | null> {
  const first = await raceTimeout(fetchPage(page), PAGE_ATTEMPT_TIMEOUT_MS, null);
  if (first !== null) return first;
  await sleep(RETRY_DELAY);
  return raceTimeout(fetchPage(page), PAGE_ATTEMPT_TIMEOUT_MS, null);
}

// Vercel's free (Hobby) plan hard-kills a serverless function at 60s no
// matter what `maxDuration` says (confirmed live on this deployment). Ceipal's
// own response time for the full paginated pull has been observed anywhere
// from ~50s to 2 minutes, so an unbounded fetch WILL eventually get killed
// mid-request — and a killed function never gets to populate the cache, so
// every subsequent request just retries the same losing race forever.
// Stopping early and returning whatever's been collected so far means the
// function always finishes successfully; worst case on a slow Ceipal day is a
// shorter-than-usual (but real, valid, cached) job list instead of a hard
// failure on every single request.
const TIME_BUDGET_MS = 40_000;

async function fetchAllJobs(): Promise<unknown[]> {
  const startedAt = Date.now();
  const all: unknown[] = [];

  for (let start = 1; start <= 300; start += BATCH_SIZE) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      console.warn(`[jobs] time budget exceeded after ${all.length} raw jobs — returning partial results this cycle`);
      break;
    }

    const pages   = Array.from({ length: BATCH_SIZE }, (_, i) => start + i);
    const results = await Promise.all(pages.map(fetchPageWithRetry));

    let reachedEnd = false;
    for (const pageResults of results) {
      // A hard failure (both attempts timed out/errored) is NOT the same as
      // "no more jobs" — skip it and keep going instead of wrongly treating
      // one bad page as the end of the whole list.
      if (pageResults === null) {
        console.warn('[jobs] a page failed to fetch after retry — skipping it, not treating as end of data');
        continue;
      }
      all.push(...pageResults);
      if (pageResults.length < PAGE_SIZE) { reachedEnd = true; break; }
    }
    if (reachedEnd) break;
  }

  const seen = new Set<string>();
  const jpc = all.filter(j => {
    const code = String((j as Record<string, unknown>).job_code ?? '');
    if (!code.startsWith('JPC')) return false;
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  jpc.sort((a, b) =>
    jobCodeNum((b as Record<string, unknown>).job_code) -
    jobCodeNum((a as Record<string, unknown>).job_code)
  );

  console.log(`[jobs] fetched ${all.length} total, ${jpc.length} JPC jobs`);

  // Next's Data Cache flatly refuses to store any single cached value over 2MB
  // ("Failed to set Next.js data cache... items over 2MB can not be cached") —
  // confirmed live: the raw job list (66 fields/job, including
  // job_description/public_job_description) runs ~17-18MB, so it was NEVER
  // actually being persisted between requests this whole time, silently
  // falling back to a fresh live Ceipal pull on every single cache miss.
  // Trimming to just the fields the UI (list view + admin/portal detail
  // modals) actually reads directly off this object gets the full ~1,500-job
  // list to ~1MB — comfortably cacheable, with room to grow. The two
  // description fields are the big ones dropped here; they're fetched
  // on-demand per job instead (see /api/jobs/description + JobDetailModal.tsx).
  const KEEP_FIELDS = [
    'job_code', 'job_title', 'client', 'city', 'states', 'zip_code', 'country', 'location',
    'pay_rate___salary', 'career_portal_published_date', 'job_type', 'job_status',
    'number_of_positions', 'remote_job', 'experience', 'primary_skills', 'industry',
    'work_authorization', 'Modified', 'modified',
    'end_client', 'priority', 'client_manager', 'sales_manager', 'tax_terms', 'duration',
    'job_start_date', 'job_end_date', 'client_bill_rate___salary', 'secondary_skills',
  ];
  const trimmed = jpc.map(j => {
    const src = j as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of KEEP_FIELDS) if (src[key] !== undefined) out[key] = src[key];
    return out;
  });

  // A totally empty result means the fetch failed outright (e.g. every page
  // request errored) — this is never a legitimate answer, this site always
  // has active jobs. Throwing instead of returning `[]` stops unstable_cache
  // from caching that failure as if it were a valid result: a bad "0 jobs"
  // answer getting cached would otherwise sit there being served fast to
  // every visitor for the full revalidate window, which is worse than the
  // slow-but-real answer this exists to avoid.
  if (jpc.length === 0) {
    throw new Error('[jobs] fetchAllJobs returned zero jobs — refusing to cache this as a valid result');
  }

  return trimmed;
}

// unstable_cache persists its result via Next's Data Cache, which on Vercel is
// backed by shared infrastructure — NOT plain in-process memory. That's the
// difference that matters: a hand-rolled `let cache = ...` module variable
// resets on every fresh serverless invocation (confirmed live: two
// consecutive requests to /api/jobs on Vercel got zero benefit from each
// other, the second one cold-fetching from scratch and timing out).
const getCachedAllJobs = unstable_cache(fetchAllJobs, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

// Single-flight guard: unstable_cache does NOT coalesce concurrent calls that
// land before the first one finishes populating the Data Cache — confirmed
// live, every request that hit a cold/expired cache launched its own
// independent ~300-page Ceipal pull in parallel, each one competing for the
// same rate-limited/slow API (causing far more per-page timeouts than a
// single pull would) and each landing on a DIFFERENT partial job count
// (seen: 284, 610, 660, 684, 784 jobs across 5 overlapping requests in under
// a minute), with whichever fetch finished last silently overwriting the
// cache regardless of which one actually got further. Coalescing concurrent
// callers onto one shared in-flight promise (same pattern as the token
// single-flight guards in ceipal.ts) removes that race.
let inflightAllJobs: Promise<unknown[]> | null = null;
function getCachedAllJobsSingleFlight(): Promise<unknown[]> {
  if (!inflightAllJobs) {
    inflightAllJobs = getCachedAllJobs().finally(() => { inflightAllJobs = null; });
  }
  return inflightAllJobs;
}

// Shared by /api/jobs (client-side refetches, force-refresh) and any Server
// Component that wants to prefetch jobs before first paint (see
// src/app/get-hired/page.tsx).
export async function getCachedJobs(opts?: { forceRefresh?: boolean }): Promise<{
  jobs: unknown[];
  cachedAt: number;
  stale: boolean;
}> {
  try {
    if (opts?.forceRefresh) revalidateTag(CACHE_TAG, 'max');
    const jobs = await getCachedAllJobsSingleFlight();
    return { jobs, cachedAt: Date.now(), stale: false };
  } catch (err) {
    console.error('[jobs] getCachedJobs error:', err);
    return { jobs: [], cachedAt: Date.now(), stale: true };
  }
}
