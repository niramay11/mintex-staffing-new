import { unstable_cache } from 'next/cache';
import { ceipalFetch } from './ceipal';
import { getJobMap } from './ceipal-job-map';
import { getCachedJobs } from './jobsCache';

// See jobsCache.ts for the full reasoning — budgets below are only tight
// because of Vercel's 60s serverless hard-kill, which doesn't exist locally.
const RUNNING_ON_VERCEL = !!process.env.VERCEL;

export type JobDescription = { job_description: string; public_job_description: string };

// A job's description essentially never changes once posted, so an hour-long
// cache is cheap — the real cost this exists to avoid is Ceipal's own 8-12+
// second response time for this endpoint (measured elsewhere in this
// codebase), which every visitor would otherwise pay live on every open.
const CACHE_TTL_SECONDS = 60 * 60;

async function fetchDescription(jobCode: string, id: string): Promise<JobDescription> {
  const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
  if (!res.ok) throw new Error(`CEIPAL ${res.status}`);
  const data = await res.json();
  return {
    job_description: data?.requisition_description ?? '',
    public_job_description: data?.public_job_desc ?? '',
  };
}

const getCachedDescriptionRaw = unstable_cache(fetchDescription, ['job-description'], {
  revalidate: CACHE_TTL_SECONDS,
});

// Shared by /api/jobs/description (on-demand, single job) and
// warmJobDescriptions() below (proactive, bounded batch).
export async function getCachedDescription(jobCode: string, id: string): Promise<JobDescription> {
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
