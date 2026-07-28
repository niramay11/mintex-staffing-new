import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';
import { supabaseAdmin } from '@/lib/supabase';

// Vercel sets this automatically; it's absent in local `next dev`/`next
// start`. Several budgets below are only tight because of Vercel's 60s
// serverless hard-kill — that constraint doesn't exist locally, so those
// budgets are relaxed there instead of applying unconditionally everywhere.
const RUNNING_ON_VERCEL = !!process.env.VERCEL;

const PAGE_SIZE  = 50;
// Measured live against Ceipal's actual API (2026-07-28): one request at a
// time answers in ~1.4s every time, but firing 8 concurrent requests makes
// Ceipal itself degrade — latency climbed batch over batch from ~4s to ~15s
// to one page taking 84s, entirely on Ceipal's side, not ours.
//
// The right trade-off differs by environment, though. Locally (5-minute
// budget, see TIME_BUDGET_MS below) there's no reason to race Ceipal at all
// — lower concurrency avoids nearly all of the "a page failed to fetch
// after retry" spam at effectively zero cost, since there's plenty of time
// to finish slower-but-reliably. On Vercel (hard-capped at 40s, see below)
// the opposite is true: total pages COVERED before the clock runs out is
// what matters, since Ceipal's own full-pull time has been observed at
// 50s-2min even in the best case — meaning some truncation on a bad cycle
// is unavoidable either way, and the only lever we have is maximizing how
// far it gets. Dropping concurrency there (confirmed live) made that WORSE:
// the public jobs list started consistently stopping around the same job
// code every cycle instead of reaching newer postings, because
// slower-but-reliable per page covers strictly less ground in the same
// fixed 40s window. (The merge-into-Supabase strategy below is what
// actually fixes the user-visible consequence of that truncation — this
// constant just controls how much of each cycle's slice gets covered.)
const BATCH_SIZE = RUNNING_ON_VERCEL ? 8 : 3;
// Same reasoning: Vercel can't afford to spend its scarce 40s budget waiting
// out a cooldown between retries, so it keeps the original short delay and
// just moves on to the next page instead. Locally, a longer delay costs
// nothing and gives Ceipal a moment to recover from the concurrency-caused
// slowdown before retrying the same page.
const RETRY_DELAY = RUNNING_ON_VERCEL ? 800 : 2500;
// Every time this window expires, the NEXT request has to trigger a live Ceipal
// pull — and if Ceipal happens to answer badly at that exact moment, that one
// visitor sees an empty/partial result (confirmed live). A longer window means
// fewer chances per hour to roll that dice, at the cost of slightly staler data
// — an easy trade for a jobs board where a new posting appearing an hour late
// is a total non-issue. Stretched from 15 min to 1 hour specifically to cut
// down how often ANY visitor (not just right after a deploy) has to be the
// one who pays the cold-start cost — the sanity floor further down still
// catches a bad cycle immediately regardless of how long this window is, so
// lengthening it doesn't trade away correctness, just how often a fetch
// happens at all. `npm run warm-cache` (or the admin "Sync Now" button)
// still forces an immediate refresh whenever genuinely-fresh data is needed
// sooner than that.
const CACHE_TTL_SECONDS = 60 * 60;
const CACHE_TAG = 'ceipal-public-jobs';

// ceipalFetch's own internal timeout is 20s — meaning one slow/hanging page
// (first attempt 20s + retry-delay 800ms + retry attempt 20s ≈ 41s) can, all
// by itself, blow past the between-rounds TIME_BUDGET_MS check below, since
// that check only runs BEFORE starting a new round, not during one already
// in flight. Racing each individual attempt against a much shorter budget
// here caps a single page's worst case, so one bad page can no longer
// single-handedly push the whole function past Vercel's 60s hard limit.
//
// On Vercel this stays tight (8s) to protect that hard limit. Locally it
// only made things worse: measured Ceipal itself taking 8-12+ seconds for a
// perfectly normal, successful page response (confirmed live, direct to the
// API, outside this app entirely) — an 8s local cutoff was aborting real,
// eventually-successful responses as "failed" before they finished, which
// is exactly why a local fetch could run for minutes and still land on 0
// jobs: nearly every page kept getting cut off just before it would have
// succeeded. Locally there's no 60s kill to protect, so give individual
// attempts the same 20s ceipalFetch itself already allows internally.
const PAGE_ATTEMPT_TIMEOUT_MS = RUNNING_ON_VERCEL ? 8_000 : 20_000;

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
// function always finishes successfully; worst case on a slow Ceipal day is
// this cycle's slice covering fewer jobs than usual — which, thanks to the
// Supabase merge below, no longer means those OTHER jobs disappear from the
// site, just that they don't get freshened this particular cycle.
//
// That 60s kill only exists on Vercel — `next dev`/`next start` on a local
// machine has no such limit, so truncating early there was pure downside
// (confirmed live: the exact same partial-job-list bug this budget exists to
// contain on Vercel was also reproducible locally, purely because this
// budget applied unconditionally everywhere).
const TIME_BUDGET_MS = RUNNING_ON_VERCEL ? 40_000 : 5 * 60_000;

type JobRecord = Record<string, unknown>;

// Pages through Ceipal's job list within TIME_BUDGET_MS, returning whatever
// it manages to fetch THIS cycle. On a slow Ceipal day that may be a partial
// slice of the real ~1,500-2,300+ total, not the full list — that's fine now:
// fetchAllJobs() below merges this into the durable `ceipal_jobs_cache`
// table instead of treating it as the whole truth, so an incomplete cycle
// just leaves untouched jobs stale rather than making them (or their
// description, on the job detail page) disappear from the site.
async function fetchLiveJobsSlice(): Promise<JobRecord[]> {
  const startedAt = Date.now();
  const all: JobRecord[] = [];

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
      all.push(...(pageResults as JobRecord[]));
      if (pageResults.length < PAGE_SIZE) { reachedEnd = true; break; }
    }
    if (reachedEnd) break;
  }

  const seen = new Set<string>();
  const jpc = all.filter(j => {
    const code = String(j.job_code ?? '');
    if (!code.startsWith('JPC')) return false;
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  console.log(`[jobs] live pull this cycle: ${all.length} raw, ${jpc.length} JPC jobs`);

  // Next's Data Cache flatly refuses to store any single cached value over 2MB
  // ("Failed to set Next.js data cache... items over 2MB can not be cached") —
  // confirmed live: the raw job list (66 fields/job, including
  // job_description/public_job_description) runs ~17-18MB, so it was NEVER
  // actually being persisted between requests this whole time, silently
  // falling back to a fresh live Ceipal pull on every single cache miss.
  // Trimming to just the fields the UI (list view + admin/portal detail
  // modals) actually reads directly off this object keeps every row small —
  // comfortably cacheable/storable, with room to grow. The two description
  // fields are the big ones dropped here; they're fetched on-demand per job
  // instead (see /api/jobs/description + the /get-hired/jobs/[job_code] page).
  const KEEP_FIELDS = [
    'job_code', 'job_title', 'client', 'city', 'states', 'zip_code', 'country', 'location',
    'pay_rate___salary', 'career_portal_published_date', 'job_type', 'job_status',
    'number_of_positions', 'remote_job', 'experience', 'primary_skills', 'industry',
    'work_authorization', 'Modified', 'modified',
    'end_client', 'priority', 'client_manager', 'sales_manager', 'tax_terms', 'duration',
    'job_start_date', 'job_end_date', 'client_bill_rate___salary', 'secondary_skills',
  ];
  return jpc.map(src => {
    const out: JobRecord = {};
    for (const key of KEEP_FIELDS) if (src[key] !== undefined) out[key] = src[key];
    return out;
  });
}

const SUPABASE_TABLE = 'ceipal_jobs_cache';
const SUPABASE_UPSERT_CHUNK = 500;
const SUPABASE_READ_CHUNK = 1000;

// Persists this cycle's fetched jobs into the durable, incrementally-merged
// store — an UPDATE for job codes already seen before, an INSERT for new
// ones. Never deletes: Ceipal marks postings Closed/Filled in place rather
// than removing them, so once a job's page IS re-fetched some future cycle,
// its status field simply updates here too. Best-effort — a write failure
// logs but doesn't fail the whole cycle, since readAllJobsFromSupabase()
// below still has whatever was already durably stored from earlier cycles.
async function upsertJobsToSupabase(jobs: JobRecord[]): Promise<void> {
  const syncedAt = new Date().toISOString();
  for (let i = 0; i < jobs.length; i += SUPABASE_UPSERT_CHUNK) {
    const chunk = jobs.slice(i, i + SUPABASE_UPSERT_CHUNK).map(job => ({
      job_code: String(job.job_code),
      data: job,
      synced_at: syncedAt,
    }));
    const { error } = await supabaseAdmin.from(SUPABASE_TABLE).upsert(chunk, { onConflict: 'job_code' });
    if (error) console.error('[jobs] supabase upsert failed for a chunk:', error.message);
  }
}

// Reads back the FULL accumulated job list — the union of every cycle's
// successful fetches, not just this cycle's slice. This is what makes an
// incomplete live pull safe to serve: whatever this cycle missed just keeps
// whatever it had from the last cycle that DID reach it, instead of
// vanishing from the site the way a wholesale-replace cache would.
async function readAllJobsFromSupabase(): Promise<JobRecord[]> {
  const all: JobRecord[] = [];
  for (let from = 0; ; from += SUPABASE_READ_CHUNK) {
    const { data, error } = await supabaseAdmin
      .from(SUPABASE_TABLE)
      .select('data')
      .range(from, from + SUPABASE_READ_CHUNK - 1);
    if (error) {
      console.error('[jobs] supabase read failed:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data.map(row => row.data as JobRecord));
    if (data.length < SUPABASE_READ_CHUNK) break;
  }
  return all;
}

async function fetchAllJobs(): Promise<JobRecord[]> {
  let fresh: JobRecord[] = [];
  try {
    fresh = await fetchLiveJobsSlice();
  } catch (err) {
    // A totally failed live pull (e.g. Ceipal auth down) no longer fails the
    // whole cycle — readAllJobsFromSupabase() below still serves whatever
    // was durably persisted from previous successful cycles.
    console.error('[jobs] live Ceipal pull failed entirely this cycle:', err);
  }

  if (fresh.length > 0) {
    await upsertJobsToSupabase(fresh);
  }

  const merged = await readAllJobsFromSupabase();

  if (merged.length === 0) {
    // Supabase read came back empty — either genuinely nothing has ever
    // been synced yet, or Supabase itself is unreachable. If this cycle DID
    // get a fresh live batch, use it directly rather than losing it.
    if (fresh.length > 0) return fresh;
    // Truly nothing anywhere. Throwing (instead of returning `[]`) stops
    // unstable_cache from caching that failure as if it were valid data —
    // this is never a legitimate answer, this site always has active jobs.
    throw new Error('[jobs] no jobs available from live Ceipal pull or persisted cache — refusing to cache this as a valid result');
  }

  merged.sort((a, b) => jobCodeNum(b.job_code) - jobCodeNum(a.job_code));
  return merged;
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
let inflightAllJobs: Promise<JobRecord[]> | null = null;
function getCachedAllJobsSingleFlight(): Promise<JobRecord[]> {
  if (!inflightAllJobs) {
    inflightAllJobs = getCachedAllJobs().finally(() => { inflightAllJobs = null; });
  }
  return inflightAllJobs;
}

// This site has had 1,000+ JPC job postings for as long as it's been
// tracked — a cycle that comes back with far fewer isn't "the job market
// shrank," it's a sign something's wrong. Now that fetchAllJobs() merges
// into ceipal_jobs_cache instead of replacing the list wholesale, a single
// slow/partial live cycle can no longer shrink the served list the way it
// used to — the accumulated total only drops this low if Supabase itself is
// unreachable and fetchAllJobs() fell back to a bare fresh batch. Kept as a
// tripwire for that specific case, not the primary defense it used to be.
const MIN_PLAUSIBLE_JPC_JOBS = 1300;

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
    // This check (and the revalidateTag it triggers) has to live out here,
    // not inside fetchAllJobs — Next.js does not allow revalidateTag to be
    // called from inside a function that's itself wrapped by unstable_cache
    // (confirmed live: it throws "used ... during render ... unsupported"),
    // and that throw was being silently swallowed by this same try/catch,
    // discarding the partial-but-real job list and returning completely
    // empty instead — worse than doing nothing.
    if (jobs.length < MIN_PLAUSIBLE_JPC_JOBS) {
      console.warn(
        `[jobs] only ${jobs.length} JPC jobs in cache (expected ${MIN_PLAUSIBLE_JPC_JOBS}+) — looks like Supabase is unreachable or freshly empty; marking the cache stale so the next request retries instead of trusting this for the full ${CACHE_TTL_SECONDS}s window`
      );
      revalidateTag(CACHE_TAG, 'max');
    }
    return { jobs, cachedAt: Date.now(), stale: false };
  } catch (err) {
    console.error('[jobs] getCachedJobs error:', err);
    return { jobs: [], cachedAt: Date.now(), stale: true };
  }
}
