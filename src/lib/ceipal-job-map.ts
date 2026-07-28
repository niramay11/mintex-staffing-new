import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch } from './ceipal';

type JobMap = Record<string, string>; // job_code → v2 id
type JobMapEntry = { job_code: string; id: string };
type JobData = Record<string, unknown>; // raw shape from Ceipal, used transiently while paginating

const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

// See src/lib/jobsCache.ts for the full reasoning — several budgets below
// are only tight because of Vercel's 60s serverless hard-kill, which doesn't
// exist locally, so they're relaxed there instead of applying everywhere.
const RUNNING_ON_VERCEL = !!process.env.VERCEL;

const PAGE_SIZE   = 100;
const RETRY_DELAY  = 800;
// Same reasoning as src/lib/jobsCache.ts: this used to be cached in a plain
// module-level variable, which does NOT survive between Vercel serverless
// invocations. Every cold request had to re-paginate the entire V2 job list
// from scratch just to look up one job's v2 id — and a single failed page in
// that walk silently truncated the map (no retry), so submissions/job-details
// for any job past the truncation point would come back empty even though
// real data existed. unstable_cache persists this across invocations, and the
// retry + time-budget below stop one bad page from nuking the whole map.
//
// Stretched from 30 min to 6 hours: a job's v2 id essentially never changes
// once assigned, so refreshing every 30 min bought almost nothing — but cost
// a lot, since without a recurring external warm-cache pinger actually
// configured, every ~30 min gap in traffic meant the NEXT visitor (however
// long after that happened to be — could be the very first visitor of the
// day) was the one stuck paying a live, multi-second-to-minutes Ceipal
// rebuild just to look up one job's id. A single warm-up (already automatic
// via `npm run deploy`) now keeps every visitor fast for hours afterward
// instead of only the first ~30 minutes. Trade-off: a job posted in the last
// few hours may not resolve until this next refreshes — acceptable, since
// the job list itself (jobsCache.ts, still 60 min) still shows it promptly;
// only its detail/description lookup lags briefly.
const CACHE_TTL_SECONDS = 6 * 60 * 60;
const CACHE_TAG = 'ceipal-v2-job-map';
// Ceipal has been measured taking 8-12+ seconds for a normal, successful
// page response — an 8s per-attempt cutoff was aborting real responses as
// "failed" before they finished. Only Vercel actually needs this tight (to
// protect its 60s hard kill); locally, give attempts the same 20s ceiling
// ceipalFetch itself already allows internally.
const PAGE_ATTEMPT_TIMEOUT_MS = RUNNING_ON_VERCEL ? 8_000 : 20_000;
const TIME_BUDGET_MS = RUNNING_ON_VERCEL ? 40_000 : 5 * 60_000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// Only job_code and id ever get read back out of this cache (see getJobMap
// below) — keeping the full raw Ceipal record (as this used to, via a
// spread-everything `normalise` step) blew the cached payload past Next's
// hard 2MB-per-item Data Cache limit EVERY time (measured ~25MB for the
// ~2,300-job V2 list, mostly large HTML description fields), silently
// failing to persist and forcing a full live Ceipal re-pull on every single
// request — the same class of bug jobsCache.ts already hit and fixed for
// the public jobs list, just far worse here since it never cached at all.
function toMapEntry(j: JobData): JobMapEntry {
  return {
    job_code: String(j.job_code ?? '').trim(),
    id: String(j.id ?? '').trim(),
  };
}

// Returns null when the page genuinely could not be fetched (both attempts
// timed out/errored) — kept distinguishable from a real empty-results page
// (which means "past the last page, stop"), same distinction jobsCache.ts
// makes for the public jobs pull.
async function fetchPage(url: string): Promise<{ results: JobData[]; next: string | null } | null> {
  try {
    const res = await ceipalFetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results: JobData[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    const next = typeof data?.next === 'string' && data.next ? data.next : null;
    return { results, next };
  } catch { return null; }
}

async function fetchPageWithRetry(url: string): Promise<{ results: JobData[]; next: string | null } | null> {
  const first = await raceTimeout(fetchPage(url), PAGE_ATTEMPT_TIMEOUT_MS, null);
  if (first !== null) return first;
  await sleep(RETRY_DELAY);
  return raceTimeout(fetchPage(url), PAGE_ATTEMPT_TIMEOUT_MS, null);
}

async function fetchAllV2Jobs(): Promise<JobMapEntry[]> {
  const startedAt = Date.now();
  const all: JobMapEntry[] = [];
  let nextUrl: string | null = `${V2_JOBS_URL}?paging_length=${PAGE_SIZE}&page=1`;

  while (nextUrl) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      console.warn(`[v2-job-map] time budget exceeded after ${all.length} jobs — returning partial results this cycle`);
      break;
    }

    const page = await fetchPageWithRetry(nextUrl);
    if (page === null) {
      // A hard failure after retry — stop here rather than looping forever,
      // but keep whatever was already collected instead of throwing it away.
      console.warn('[v2-job-map] a page failed to fetch after retry — stopping pagination early with a partial map');
      break;
    }

    all.push(...page.results.map(toMapEntry).filter((e) => e.job_code && e.id));
    if (page.results.length === 0) break;
    nextUrl = page.next;
  }

  // A totally empty result almost always means the very first request failed
  // outright — never a legitimate answer while Ceipal has active postings.
  // Throwing (instead of returning `[]`) stops unstable_cache from persisting
  // that failure as if it were valid data for the full revalidate window.
  if (all.length === 0) {
    throw new Error('[v2-job-map] fetchAllV2Jobs returned zero jobs — refusing to cache this as a valid result');
  }

  return all;
}

// Persisted via Next's Data Cache — see src/lib/jobsCache.ts for why a plain
// module variable doesn't work here on Vercel.
const getCachedV2Jobs = unstable_cache(fetchAllV2Jobs, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

// Single-flight guard — see src/lib/jobsCache.ts's identical guard for why
// this matters: without it, every client-portal request that lands on a
// cold/expired map launches its own independent full V2 pagination in
// parallel, each competing with the others for the same Ceipal API.
let inflightV2Jobs: Promise<JobMapEntry[]> | null = null;
function getCachedV2JobsSingleFlight(): Promise<JobMapEntry[]> {
  if (!inflightV2Jobs) {
    inflightV2Jobs = getCachedV2Jobs().finally(() => { inflightV2Jobs = null; });
  }
  return inflightV2Jobs;
}

// This site has had 1,000+ job postings for as long as it's been tracked —
// a cycle that comes back with far fewer isn't real data, it's this fetch
// hitting the time budget early or a burst of page failures.
//
// This check (and the revalidateTag it triggers) has to live out here,
// AFTER getCachedV2JobsSingleFlight() resolves — NOT inside fetchAllV2Jobs.
// Next.js does not allow revalidateTag to be called from inside a function
// that's itself wrapped by unstable_cache; calling it in there throws ("used
// ... during render ... unsupported"), and that throw was being silently
// swallowed by the try/catch below, discarding the partial-but-real result
// and returning a completely EMPTY map instead — worse than doing nothing.
const MIN_PLAUSIBLE_JOBS = 1200;

// Returns full job_code → v2 id list (shared cache for admin + portal lookups)
export async function getV2Jobs(opts?: { forceRefresh?: boolean }): Promise<JobMapEntry[]> {
  try {
    if (opts?.forceRefresh) revalidateTag(CACHE_TAG, 'max');
    const jobs = await getCachedV2JobsSingleFlight();
    if (jobs.length < MIN_PLAUSIBLE_JOBS) {
      console.warn(
        `[v2-job-map] only ${jobs.length} jobs in cache (expected ${MIN_PLAUSIBLE_JOBS}+) — looks like a partial pull; marking the cache stale so the next request retries`
      );
      revalidateTag(CACHE_TAG, 'max');
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

// Called by src/lib/warmCaches.ts so the cron warmer keeps this hot too —
// without it, this cache only gets rebuilt on whichever real request happens
// to land after the 5-minute window lapses, same cold-first-visitor problem
// jobsCache.ts documents for the public jobs list.
export async function warmV2JobMapCache(): Promise<void> {
  await getV2Jobs();
}
