import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch } from '@/lib/ceipal';
import { supabaseAdmin } from '@/lib/supabase';

type JobMap = Record<string, string>; // job_code → v2 id
type JobMapEntry = { job_code: string; id: string };

const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

// See jobsCache.ts for the full reasoning — several budgets below are only
// tight because of Vercel's 60s serverless hard-kill, which doesn't exist
// locally.
const RUNNING_ON_VERCEL = !!process.env.VERCEL;

// Requested purely for clarity/documentation — confirmed live that Ceipal
// ignores this value for this endpoint and always sends back 20 per page
// regardless. End-of-list is now detected from Ceipal's own `num_pages`
// field, not from comparing against this number (see fetchLiveV2Slice).
const PAGE_SIZE = 20;
// Same Ceipal concurrency degradation confirmed for the main jobs list
// applies here too (same account, same API family) — see jobsCache.ts's own
// comment for the measured numbers. Same per-environment trade-off: Vercel
// needs raw throughput within its hard time ceiling even at the cost of a
// few skipped pages; local dev has all the time in the world, so it favors
// fewer concurrent requests and fewer noisy retries instead.
const BATCH_SIZE = RUNNING_ON_VERCEL ? 8 : 3;
const RETRY_DELAY = RUNNING_ON_VERCEL ? 800 : 2500;
const PAGE_ATTEMPT_TIMEOUT_MS = RUNNING_ON_VERCEL ? 8_000 : 20_000;
const TIME_BUDGET_MS = RUNNING_ON_VERCEL ? 40_000 : 5 * 60_000;
// Matches jobsCache.ts's window — this map and the public jobs list are
// used together (a job's page needs both), so keeping them on the same
// freshness cadence avoids one being far staler than the other.
const CACHE_TTL_SECONDS = 20 * 60;
const CACHE_TAG = 'ceipal-v2-job-map';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

function toMapEntry(j: Record<string, unknown>): JobMapEntry {
  return {
    job_code: String(j.job_code ?? '').trim(),
    id: String(j.id ?? '').trim(),
  };
}

type PageResult = { results: JobMapEntry[]; numPages: number | null };

// Confirmed live (2026-07-29): unlike the v1 API jobsCache.ts uses (oldest
// first), Ceipal's v2 job list returns NEWEST jobs first on page 1 — and
// supports jumping straight to any page number directly (`?page=N`), no
// need to walk its `next` cursor sequentially. Both matter: it means a
// plain forward walk here already prioritizes the newest postings (most
// likely to be clicked, least likely to already be resolved from a
// previous cycle), so this doesn't need jobsCache.ts's backward-pagination
// trick — and batching by page number lets this cover far more ground per
// cycle than the old one-page-at-a-time `next`-cursor walk did (confirmed
// live: that old approach was stuck at ~100 of 1,534 jobs every cycle).
async function fetchPage(page: number): Promise<PageResult | null> {
  try {
    const res = await ceipalFetch(`${V2_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const data = await res.json();
    const results = Array.isArray(data?.results)
      ? (data.results as Record<string, unknown>[]).map(toMapEntry).filter((e) => e.job_code && e.id)
      : [];
    const numPages = typeof data?.num_pages === 'number' ? data.num_pages : null;
    return { results, numPages };
  } catch { return null; }
}

async function fetchPageWithRetry(page: number): Promise<PageResult | null> {
  const first = await raceTimeout(fetchPage(page), PAGE_ATTEMPT_TIMEOUT_MS, null);
  if (first !== null) return first;
  await sleep(RETRY_DELAY);
  return raceTimeout(fetchPage(page), PAGE_ATTEMPT_TIMEOUT_MS, null);
}

// Pages through Ceipal's v2 job list within TIME_BUDGET_MS, returning
// whatever it manages to fetch THIS cycle — on a slow Ceipal day that may be
// a partial slice of the real ~1,500+ total, not the full map. That's fine:
// fetchAllV2Jobs() below merges this into the durable ceipal_v2_job_map
// table instead of treating it as the whole truth, so an incomplete cycle
// just leaves untouched entries stale rather than making them (and every
// job's description that depends on resolving its id) disappear.
//
// Confirmed live (2026-07-29): this endpoint IGNORES the requested
// paging_length entirely and always returns exactly 20 results per page,
// no matter what's asked for. The old "results.length < PAGE_SIZE means
// we've hit the last page" check was written assuming PAGE_SIZE (100) would
// match what Ceipal actually sends — since it never does, every single page
// looked like "the last page," so this stopped after page 1 every cycle,
// discarding the other 7 pages of a BATCH_SIZE=8 batch that had ALREADY been
// fetched successfully. Using Ceipal's own `num_pages` value (present on
// every response) instead of guessing from page length is what actually
// fixes this.
async function fetchLiveV2Slice(): Promise<JobMapEntry[]> {
  const startedAt = Date.now();
  const all: JobMapEntry[] = [];
  let knownLastPage: number | null = null;

  for (let start = 1; start <= 300; start += BATCH_SIZE) {
    if (knownLastPage !== null && start > knownLastPage) break;
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      console.warn(`[v2-job-map] time budget exceeded after ${all.length} jobs — returning partial results this cycle`);
      break;
    }

    const pages = Array.from({ length: BATCH_SIZE }, (_, i) => start + i)
      .filter((p) => knownLastPage === null || p <= knownLastPage);
    const results = await Promise.all(pages.map(fetchPageWithRetry));

    for (const pageResult of results) {
      if (pageResult === null) {
        console.warn('[v2-job-map] a page failed to fetch after retry — skipping it, not treating as end of data');
        continue;
      }
      all.push(...pageResult.results);
      if (pageResult.numPages !== null) knownLastPage = pageResult.numPages;
    }
  }

  return all;
}

const SUPABASE_TABLE = 'ceipal_v2_job_map';
const SUPABASE_UPSERT_CHUNK = 500;
const SUPABASE_READ_CHUNK = 1000;

// Persists this cycle's fetched entries into the durable, incrementally-
// merged store — an UPDATE for job codes already seen, an INSERT for new
// ones. Best-effort — a write failure logs but doesn't fail the whole
// cycle, since readAllFromSupabase() below still has whatever was already
// durably stored from earlier cycles.
async function upsertToSupabase(entries: JobMapEntry[]): Promise<void> {
  const syncedAt = new Date().toISOString();
  for (let i = 0; i < entries.length; i += SUPABASE_UPSERT_CHUNK) {
    const chunk = entries.slice(i, i + SUPABASE_UPSERT_CHUNK).map((e) => ({
      job_code: e.job_code,
      v2_id: e.id,
      synced_at: syncedAt,
    }));
    const { error } = await supabaseAdmin.from(SUPABASE_TABLE).upsert(chunk, { onConflict: 'job_code' });
    if (error) console.error('[v2-job-map] supabase upsert failed for a chunk:', error.message);
  }
}

// Reads back the FULL accumulated map — the union of every cycle's
// successful fetches, not just this cycle's slice. This is what makes an
// incomplete live pull safe: whatever this cycle missed just keeps whatever
// it had from the last cycle that DID reach it, instead of vanishing.
async function readAllFromSupabase(): Promise<JobMapEntry[]> {
  const all: JobMapEntry[] = [];
  for (let from = 0; ; from += SUPABASE_READ_CHUNK) {
    const { data, error } = await supabaseAdmin
      .from(SUPABASE_TABLE)
      .select('job_code, v2_id')
      .range(from, from + SUPABASE_READ_CHUNK - 1);
    if (error) {
      console.error('[v2-job-map] supabase read failed:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data.map((row) => ({ job_code: row.job_code as string, id: row.v2_id as string })));
    if (data.length < SUPABASE_READ_CHUNK) break;
  }
  return all;
}

async function fetchAllV2Jobs(): Promise<JobMapEntry[]> {
  let fresh: JobMapEntry[] = [];
  try {
    fresh = await fetchLiveV2Slice();
  } catch (err) {
    console.error('[v2-job-map] live pull failed entirely this cycle:', err);
  }

  if (fresh.length > 0) {
    await upsertToSupabase(fresh);
  }

  const merged = await readAllFromSupabase();

  if (merged.length === 0) {
    if (fresh.length > 0) return fresh;
    // Truly nothing anywhere. Throwing (instead of returning []) stops
    // unstable_cache from caching that failure as if it were valid data.
    throw new Error('[v2-job-map] no jobs available from live pull or persisted map — refusing to cache this as a valid result');
  }

  return merged;
}

// unstable_cache persists via Next's shared Data Cache, which on Vercel is
// backed by shared infrastructure — NOT plain in-process memory (same
// reasoning as jobsCache.ts).
const getCachedV2Jobs = unstable_cache(fetchAllV2Jobs, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

// Single-flight guard — same reasoning as jobsCache.ts's identical guard:
// without it, every caller that finds a cold/expired cache launches its own
// independent pull in parallel, each competing with the others for the same
// rate-limited Ceipal API.
let inflightV2Jobs: Promise<JobMapEntry[]> | null = null;
function getCachedV2JobsSingleFlight(): Promise<JobMapEntry[]> {
  if (!inflightV2Jobs) {
    inflightV2Jobs = getCachedV2Jobs().finally(() => { inflightV2Jobs = null; });
  }
  return inflightV2Jobs;
}

// Now mostly a backup safeguard: since fetchAllV2Jobs merges into
// ceipal_v2_job_map instead of replacing the map wholesale, a single
// slow/partial live cycle can no longer shrink the served map the way it
// used to — the count only drops this low if Supabase itself is
// unreachable and fetchAllV2Jobs fell back to a bare fresh batch.
const MIN_PLAUSIBLE_JOBS = 1200;

// revalidateTag throws when called during a page render (it's only allowed
// from Route Handlers/Server Actions) — confirmed live: this function gets
// called both ways (route handlers like /api/admin/v2-job-map, AND page
// renders like /get-hired/jobs/[job_code] via getJobMap()). When called
// during a render, the throw used to be caught by an outer try/catch that
// discarded the real (if partial) jobs list entirely and returned []
// instead — turning "not enough jobs cached" into "zero jobs, can't resolve
// ANY job's id." Isolating it in its own try/catch means a failed "mark
// this stale for next time" no longer destroys valid data for THIS request.
function markStaleIfPossible() {
  try {
    revalidateTag(CACHE_TAG, 'max');
  } catch (err) {
    console.error('[v2-job-map] revalidateTag failed (likely called during a page render, not a route handler) — continuing with the data already fetched:', err);
  }
}

export async function getV2Jobs(opts?: { forceRefresh?: boolean }): Promise<JobMapEntry[]> {
  if (opts?.forceRefresh) markStaleIfPossible();
  try {
    const jobs = await getCachedV2JobsSingleFlight();
    if (jobs.length < MIN_PLAUSIBLE_JOBS) {
      console.warn(
        `[v2-job-map] only ${jobs.length} jobs in cache (expected ${MIN_PLAUSIBLE_JOBS}+) — looks like Supabase is unreachable or freshly empty; marking the cache stale so the next request retries`
      );
      markStaleIfPossible();
    }
    return jobs;
  } catch (err) {
    console.error('[v2-job-map] getV2Jobs error:', err);
    return [];
  }
}

// Returns job_code → v2 encoded id map (used for detail/submissions API)
export async function getJobMap(opts?: { forceRefresh?: boolean }): Promise<JobMap> {
  const jobs = await getV2Jobs(opts);
  const map: JobMap = {};
  for (const j of jobs) {
    if (j.job_code && j.id) map[j.job_code] = j.id;
  }
  return map;
}

// Called by src/lib/warmCaches.ts so the cron warmer keeps this hot too.
export async function warmV2JobMapCache(): Promise<void> {
  await getV2Jobs();
}
