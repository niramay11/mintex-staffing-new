import { unstable_cache } from 'next/cache';
import { ceipalFetch } from './ceipal';
import { getCachedJobs } from './jobsCache';
import { getJobMap } from './ceipal-job-map';
import { supabaseAdmin } from './supabase';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns null on a genuine failure (non-OK response, timeout, network error,
// bad JSON) — kept distinguishable from a real "this job has zero
// submissions" answer, same distinction jobsCache.ts and ceipal-job-map.ts
// make for their own Ceipal pulls.
async function fetchOnce(v2Id: string): Promise<Record<string, unknown>[] | null> {
  try {
    const res = await ceipalFetch(`https://api.ceipal.com/v2/getSubmissionsList?jobId=${encodeURIComponent(v2Id)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  } catch {
    return null;
  }
}

const RETRY_DELAY_MS = 800;

// Throws (rather than falling back to []) when both attempts fail, so the
// cache below never mistakes "Ceipal didn't answer in time" for "this job
// genuinely has zero submissions" — and never persists that failure as if
// it were real data.
async function fetchJobSubmissionsLive(v2Id: string): Promise<Record<string, unknown>[]> {
  const first = await fetchOnce(v2Id);
  if (first !== null) return first;

  await sleep(RETRY_DELAY_MS);
  const retry = await fetchOnce(v2Id);
  if (retry !== null) return retry;

  throw new Error(`failed to fetch submissions for jobId=${v2Id} after retry`);
}

// Confirmed live: a Client Portal page for an account with 200+ jobs was
// re-asking Ceipal for every single one of those jobs' submissions on every
// single page visit. Ceipal's own well-documented slowness under sustained,
// back-to-back requests (see jobsCache.ts's own measurements) meant most of
// those individual fetches started failing after their one retry, showing
// "0 submissions" for jobs that likely have real ones — and because nothing
// was cached, EVERY visit paid this same cost and hit the same failures
// again, forever. Caching each job's submissions for 10 minutes means only
// the FIRST view (by any client, for any job) pays that live-call risk;
// every view after that, for that job, reuses the already-successful result
// instead of re-rolling the dice with Ceipal hundreds of times per page load.
const CACHE_TTL_SECONDS = 10 * 60;
const getCachedJobSubmissionsRaw = unstable_cache(fetchJobSubmissionsLive, ['job-submissions'], {
  revalidate: CACHE_TTL_SECONDS,
});

// Both /api/portal/submissions and /api/portal/job-submissions call this —
// same name/signature as before, so no call site needs to change. The
// graceful "treat as zero" fallback only kicks in on a genuine failure, and
// critically that failure is never what gets cached — the next read for
// this same job tries Ceipal fresh again instead of staying stuck at zero
// for the rest of the cache window.
export async function fetchJobSubmissions(v2Id: string): Promise<Record<string, unknown>[]> {
  try {
    return await getCachedJobSubmissionsRaw(v2Id);
  } catch (err) {
    console.warn(`[ceipal-submissions] ${err instanceof Error ? err.message : String(err)} — treating as zero this cycle`);
    return [];
  }
}

// Confirmed live: Ceipal's getApplicantDetails endpoint routinely takes
// 10-20+ seconds to respond (measured directly against production), but both
// portal routes that called this were capping the wait at 6s (or not caching
// the result at all), so almost every candidate name came back blank — not
// because the data didn't exist, but because the code gave up before Ceipal
// answered. Caching each candidate's name once resolved (names don't change)
// means only the first-ever lookup for a given candidate pays that latency.
// 20s (ceipalFetch's shared default) wasn't enough on its own — confirmed
// live that a single isolated lookup can take ~15-16s, so anything under
// real concurrent load has little margin left before hitting that default
// and getting aborted regardless of how long the caller is willing to wait.
const APPLICANT_DETAILS_TIMEOUT_MS = 30_000;

async function fetchApplicantNameLive(jobSeekerId: string): Promise<string> {
  const res = await ceipalFetch(
    `https://api.ceipal.com/v2/getApplicantDetails/${encodeURIComponent(jobSeekerId)}/`,
    APPLICANT_DETAILS_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(`getApplicantDetails ${res.status} for ${jobSeekerId}`);
  const raw = await res.json();
  const d = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;
  const name = d
    ? String(
        d.consultant_name ?? d.full_name ?? d.applicant_name ??
        `${d.firstname ?? d.first_name ?? ''} ${d.lastname ?? d.last_name ?? ''}`.trim()
      ).trim()
    : '';
  // Confirmed live: an empty result used to be cached for 24h same as a real
  // name, same class of bug jobsCache.ts/ceipal-job-map.ts already guard
  // against elsewhere in this file — one unlucky/incomplete response
  // permanently "locked in" as blank for the rest of the cache window, even
  // on later requests where Ceipal would have answered fine. Throwing here
  // instead means unstable_cache never persists it, so the next request
  // tries fresh instead of reusing a stale non-answer.
  if (!name) throw new Error(`getApplicantDetails returned no usable name for ${jobSeekerId}`);
  return name;
}

const NAME_CACHE_TTL_SECONDS = 24 * 60 * 60;
const getCachedApplicantNameRaw = unstable_cache(fetchApplicantNameLive, ['applicant-name'], {
  revalidate: NAME_CACHE_TTL_SECONDS,
});

// Callers still race this against their own per-request time budget — this
// only guarantees a real attempt gets a realistic amount of time to
// complete and that a successful result is reused instead of re-fetched.
export async function fetchApplicantName(jobSeekerId: string): Promise<string> {
  try {
    return await getCachedApplicantNameRaw(jobSeekerId);
  } catch (err) {
    console.warn(`[ceipal-submissions] fetchApplicantName failed for ${jobSeekerId}:`, err instanceof Error ? err.message : String(err));
    return '';
  }
}

const RUNNING_ON_VERCEL = !!process.env.VERCEL;
// Deliberately tight — this runs alongside five other cache warmers in the
// same warmAllJobCaches() Promise.all (see warmCaches.ts), all sharing one
// Vercel invocation capped at 60s total. A handful of clients can easily
// have 1,000+ jobs between them, so this is a best-effort head start on the
// most impactful accounts, not a guarantee of full coverage in one cycle —
// the 10-minute cache above plus organic portal visits fill in the rest.
const WARM_TIME_BUDGET_MS = RUNNING_ON_VERCEL ? 20_000 : 60_000;
const WARM_BATCH_SIZE = 8;
const WARM_MAX_JOBS = 300;
const WARM_PER_JOB_TIMEOUT_MS = 8_000;

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// Proactively warms submissions for every active Client Portal account's
// assigned jobs, right after every deploy — so a client opening the portal
// shortly after a deploy sees mostly-instant, mostly-complete numbers
// instead of needing to reload repeatedly while the cache slowly fills in
// from scratch through their own page loads.
export async function warmClientSubmissions(): Promise<void> {
  const startedAt = Date.now();
  try {
    const [{ jobs }, jobMap, { data: clients, error: clientsError }] = await Promise.all([
      getCachedJobs(),
      getJobMap(),
      supabaseAdmin.from('clients').select('allowed_job_codes, ceipal_client_name, company').eq('is_active', true),
    ]);

    if (clientsError) {
      console.error('[ceipal-submissions] warmClientSubmissions could not load clients:', clientsError.message);
      return;
    }
    if (!clients || clients.length === 0) return;

    const allJobs = jobs as Record<string, unknown>[];
    const codesToWarm = new Set<string>();

    for (const client of clients as Record<string, unknown>[]) {
      const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
      const ceipalName = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
      const matched = allowedCodes.length > 0
        ? allJobs.filter((j) => allowedCodes.includes(String(j.job_code ?? '')))
        : ceipalName
          ? allJobs.filter((j) => String(j.client ?? '').toLowerCase().trim() === ceipalName)
          : [];
      for (const j of matched) {
        const code = String(j.job_code ?? '');
        if (code) codesToWarm.add(code);
      }
      if (codesToWarm.size >= WARM_MAX_JOBS) break;
    }

    const ids = [...codesToWarm]
      .slice(0, WARM_MAX_JOBS)
      .map((code) => jobMap[code])
      .filter((id): id is string => !!id);

    for (let i = 0; i < ids.length; i += WARM_BATCH_SIZE) {
      if (Date.now() - startedAt > WARM_TIME_BUDGET_MS) {
        console.warn(`[ceipal-submissions] warmClientSubmissions time budget exceeded after warming ${i}/${ids.length} jobs`);
        break;
      }
      const batch = ids.slice(i, i + WARM_BATCH_SIZE);
      await Promise.all(batch.map((id) => raceTimeout(fetchJobSubmissions(id).catch(() => null), WARM_PER_JOB_TIMEOUT_MS, null)));
    }
  } catch (err) {
    console.error('[ceipal-submissions] warmClientSubmissions failed:', err);
  }
}
