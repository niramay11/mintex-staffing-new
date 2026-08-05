import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { getJobMap } from '@/lib/ceipal-job-map';
import { getAllJobs } from '@/lib/data-cache';
import { fetchJobSubmissions, fetchApplicantName } from '@/lib/ceipal-submissions';

export const maxDuration = 60;

const CACHE_TTL = 3 * 60 * 1000;
// Keyed by `clientId:sortedJobCodes` — covers both explicit and derived code requests
const cacheMap = new Map<string, { data: Record<string, unknown>[]; at: number }>();

// Confirmed live: a client with 200+ jobs made this route fetch submissions
// (and then a candidate-name lookup PER submission) for every single one of
// those jobs, sequentially in batches, with zero time budget — Vercel killed
// the whole request after its hard 60s limit, and the frontend's error
// handler then showed "0" for both Total Submissions and Total Hires. A
// clean 0 looked identical to "there really are none," which is exactly
// what made this invisible. TIME_BUDGET_MS below stops the loop before
// Vercel's kill and returns whatever's been gathered so far — a real,
// non-zero partial count beats a dead request that silently becomes 0.
const TIME_BUDGET_MS = 45_000;
// Was 6s, which is well under Ceipal's real ~10-20s response time for this
// endpoint (confirmed live) — every lookup was hitting this ceiling and
// silently returning blank rather than actually failing. fetchApplicantName
// itself now caches successful results for 24h, so raising this only costs
// real time on a genuinely first-ever, uncached lookup.
const NAME_FETCH_TIMEOUT_MS = 18_000;

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clientId = String(client.id ?? client.name ?? '');

  const url = new URL(req.url);
  const jobCodesParam = url.searchParams.get('job_codes');
  const explicitCodes = jobCodesParam ? jobCodesParam.split(',').map(s => s.trim()).filter(Boolean) : null;

  // Cache key includes sorted job codes so each unique set of codes has its own entry
  const cacheKey = explicitCodes
    ? `${clientId}:${[...explicitCodes].sort().join(',')}`
    : `${clientId}:derived`;

  try {
    const cached = cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL) {
      return NextResponse.json({ results: cached.data, count: cached.data.length });
    }

    const permissions = (client.permissions as Record<string, boolean>) ?? {};
    const showName    = permissions.show_candidate_name !== false;
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();

    let jobs: Record<string, unknown>[];

    if (explicitCodes && explicitCodes.length > 0) {
      jobs = explicitCodes.map(code => ({ job_code: code }));
    } else {
      const allJobs = await getAllJobs();
      if (allowedCodes.length > 0) {
        jobs = allJobs.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
      } else if (ceipalName) {
        jobs = allJobs.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
      } else {
        jobs = [];
      }
    }

    if (jobs.length === 0) return NextResponse.json({ results: [], count: 0 });

    const map = await getJobMap();

    const BATCH = 8;
    const allSubmissions: Record<string, unknown>[] = [];
    const startedAt = Date.now();

    for (let i = 0; i < jobs.length; i += BATCH) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        console.warn(`[portal/submissions] time budget exceeded after ${i}/${jobs.length} jobs — returning partial results instead of letting Vercel kill the request`);
        break;
      }

      const batch = jobs.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(async job => {
        const jobCode = String(job.job_code ?? '');
        const v2Id    = map[jobCode] ?? '';
        if (!v2Id) return [];

        const subs = await fetchJobSubmissions(v2Id);

        const enriched = await Promise.all(subs.map(async s => {
          const sub: Record<string, unknown> = { ...s };

          // Use name already present in the submission as primary fallback
          const rawName = String(
            s.candidate_name ?? s.applicant_name ?? s.consultant_name ?? ''
          ).trim();

          if (showName) {
            if (sub.job_seeker_id) {
              // A single slow name lookup used to have no time ceiling at
              // all — capped here so one slow candidate can't eat a
              // disproportionate share of the whole request's budget. Falls
              // back to whatever name was already on the submission record
              // if this doesn't resolve in time.
              const fetchedName = await raceTimeout(fetchApplicantName(String(sub.job_seeker_id)), NAME_FETCH_TIMEOUT_MS, '');
              sub.candidate_name = fetchedName || rawName;
            } else if (rawName) {
              sub.candidate_name = rawName;
            }
          }

          sub.job_code  = jobCode;
          sub.job_title = job.job_title ?? '';
          sub.job_city  = job.city ?? '';
          sub.job_state = job.states ?? '';

          delete sub.submitted_by;
          delete sub.tagged_by;
          delete sub.job_seeker_id;
          delete sub.merge_document_path;
          delete sub.merged_pdf_document;
          delete sub.selected_submission_documents;
          delete sub.Documents;
          if (!permissions.show_pay_rate)  { delete sub.pay_rate; }
          if (!permissions.show_tax_terms) { delete sub.tax_term; }

          return sub;
        }));

        return enriched;
      }));

      for (const r of results) allSubmissions.push(...r);
    }

    allSubmissions.sort((a, b) => {
      const da = new Date(String(a.submitted_on ?? '')).getTime() || 0;
      const db = new Date(String(b.submitted_on ?? '')).getTime() || 0;
      return db - da;
    });

    cacheMap.set(cacheKey, { data: allSubmissions, at: Date.now() });
    return NextResponse.json({ results: allSubmissions, count: allSubmissions.length });

  } catch (err) {
    console.error('[portal/submissions] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
