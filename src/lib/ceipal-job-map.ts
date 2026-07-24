import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch } from './ceipal';

const V2_JOBS_URL = 'https://api.ceipal.com/v2/getJobPostingsList/';

type JobMap  = Record<string, string>;                  // job_code → v2 id
type JobData = Record<string, unknown>;

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
const CACHE_TTL_SECONDS = 5 * 60;
const CACHE_TAG = 'ceipal-v2-job-map';
const PAGE_ATTEMPT_TIMEOUT_MS = 8_000;
const TIME_BUDGET_MS = 40_000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

function normalise(j: JobData): JobData {
  return {
    ...j,
    job_title:           j.position_title    ?? j.job_title      ?? '',
    job_code:            j.job_code          ?? '',
    job_status:          j.job_status        ?? '',
    job_type:            j.employment_type   ?? j.job_type       ?? '',
    city:                j.primary_city      ?? j.city           ?? '',
    states:              j.primary_state     ?? j.states         ?? '',
    country:             j.country           ?? '',
    number_of_positions: j.number_of_positions ?? '',
    primary_skills:      j.skills            ?? j.primary_skills ?? '',
    pay_rate___salary:   Array.isArray(j.pay_rates) && (j.pay_rates as JobData[]).length > 0
                           ? String((j.pay_rates as JobData[])[0].pay_rate ?? '')
                           : String(j.pay_rate___salary ?? ''),
    job_start_date:      j.job_start_date    ?? '',
    job_end_date:        j.job_end_date      ?? '',
    work_authorization:  j.work_authorization ?? '',
    tax_terms:           j.tax_terms         ?? '',
    remote_job:          j.remote_opportunities ?? j.remote_job  ?? '',
    industry:            j.industry          ?? '',
    job_description:     j.requisition_description ?? j.public_job_desc ?? '',
    client:              j.client            ?? '',
    duration:            j.duration          ?? '',
    experience:          j.experience        ?? '',
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

async function fetchAllV2Jobs(): Promise<JobData[]> {
  const startedAt = Date.now();
  const all: JobData[] = [];
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

    all.push(...page.results.map(normalise));
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
let inflightV2Jobs: Promise<JobData[]> | null = null;
function getCachedV2JobsSingleFlight(): Promise<JobData[]> {
  if (!inflightV2Jobs) {
    inflightV2Jobs = getCachedV2Jobs().finally(() => { inflightV2Jobs = null; });
  }
  return inflightV2Jobs;
}

// Returns full normalised V2 job list (shared cache for admin + portal)
export async function getV2Jobs(opts?: { forceRefresh?: boolean }): Promise<JobData[]> {
  try {
    if (opts?.forceRefresh) revalidateTag(CACHE_TAG, 'max');
    return await getCachedV2JobsSingleFlight();
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
    const code = String(j.job_code ?? '').trim();
    const id   = String(j.id ?? '').trim();
    if (code && id) map[code] = id;
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
