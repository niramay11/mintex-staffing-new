import { unstable_cache, revalidateTag } from 'next/cache';
import { ceipalFetch } from './ceipal';
import { getJobMap } from './ceipal-job-map';
import { getCachedJobs } from './jobsCache';

// See jobsCache.ts for the full reasoning — budgets below are only tight
// because of Vercel's 60s serverless hard-kill, which doesn't exist locally.
const RUNNING_ON_VERCEL = !!process.env.VERCEL;

export type JobDescription = { job_description: string; public_job_description: string };

// Stretched from 1 hour to 24 hours — a job's description essentially never
// changes once posted, so a short window bought almost nothing. Without a
// recurring external warm-cache pinger actually configured, every ~1 hour
// gap in traffic meant the next person to open that job (however long after
// — potentially the first visitor of the day) paid Ceipal's own live 8-12+
// second response time again. A single warm-up (already automatic via
// `npm run deploy`) now keeps every visitor's click instant for a full day
// afterward instead of only the first hour.
const CACHE_TTL_SECONDS = 24 * 60 * 60;

async function fetchDescriptionOnce(jobCode: string, id: string): Promise<JobDescription> {
  const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
  if (!res.ok) throw new Error(`CEIPAL ${res.status}`);
  const data = await res.json();
  const job_description = data?.requisition_description ?? '';
  const public_job_description = data?.public_job_desc ?? '';
  // Confirmed live: Ceipal sometimes answers 200 OK with a degraded/
  // incomplete body under load — neither description field populated even
  // though the job genuinely has one. Treating that as success used to cache
  // the empty result for a full 24h, silently blanking a job's description
  // site-wide until the window happened to lapse. Throwing here instead
  // means a transient bad response gets retried instead of poisoning the
  // cache for a day.
  if (!job_description && !public_job_description) {
    throw new Error(`CEIPAL returned no description content for job ${jobCode} (id ${id})`);
  }
  return { job_description, public_job_description };
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// One retry before giving up — Ceipal has been measured taking 8-12+ seconds
// even for a normal response, so a single transient failure doesn't mean the
// description is actually unavailable.
async function fetchDescription(jobCode: string, id: string): Promise<JobDescription> {
  try {
    return await fetchDescriptionOnce(jobCode, id);
  } catch {
    await sleep(800);
    return fetchDescriptionOnce(jobCode, id);
  }
}

const CACHE_TAG = 'job-description';

const getCachedDescriptionRaw = unstable_cache(fetchDescription, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

// Shared by /api/jobs/description (on-demand, single job) and
// warmJobDescriptions() below (proactive, bounded batch). forceRefresh busts
// EVERY cached job's description at once (there's no cheap way to target a
// single job_code's entry specifically) — a one-time way to clear out any
// descriptions that got poisoned by the empty-response bug fixed above,
// before their own 24h window would otherwise have expired on its own.
export async function getCachedDescription(jobCode: string, id: string, opts?: { forceRefresh?: boolean }): Promise<JobDescription> {
  if (opts?.forceRefresh) revalidateTag(CACHE_TAG, 'max');
  return getCachedDescriptionRaw(jobCode, id);
}

const PER_JOB_TIMEOUT_MS = RUNNING_ON_VERCEL ? 8_000 : 20_000;
const TIME_BUDGET_MS = RUNNING_ON_VERCEL ? 30_000 : 5 * 60_000;
const BATCH_SIZE = 8;
// Warming all 1,500+ postings every cron cycle isn't realistic within one
// serverless invocation's time budget — but visitors overwhelmingly click
// into the newest listings on the default (newest-first) job board view, so
// keeping just that subset perpetually warm covers the common case without
// needing to cover the long tail at all.
const WARM_COUNT = 40;

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// Called by warmCaches.ts so the cron warmer/deploy step keeps the freshest
// job descriptions hot — without this, descriptions only ever get cached in
// reaction to a real visitor's (slow, live) first click.
export async function warmJobDescriptions(): Promise<void> {
  const startedAt = Date.now();
  const [{ jobs }, jobMap] = await Promise.all([getCachedJobs(), getJobMap()]);

  const targets = (jobs as { job_code?: string }[])
    .slice(0, WARM_COUNT)
    .map((j) => ({ code: String(j.job_code ?? ''), id: jobMap[String(j.job_code ?? '')] }))
    .filter((t) => t.code && t.id);

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    const batch = targets.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((t) =>
        raceTimeout(getCachedDescription(t.code, t.id).catch(() => null), PER_JOB_TIMEOUT_MS, null)
      )
    );
  }
}
