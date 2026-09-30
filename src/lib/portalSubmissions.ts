import { supabaseAdmin } from './supabase';
import { getJobMap } from './ceipal-job-map';
import { fetchJobSubmissionsOrNull, fetchApplicantName } from './ceipal-submissions';

// Shared by the Client Portal submission routes. Confirmed live: the old
// /api/portal/submissions resolved every candidate's name (Ceipal's
// getApplicantDetails, ~10-20s each) inline, job by job, inside one request —
// on Vercel's 60s limit it ran out of time partway and returned only the jobs
// it had reached (CBREX showed 31 submissions / 1 hire live vs 50 / 2 on a
// warm local server), and most names timed out to blank.
//
// Now the two concerns are split:
//  - loadPortalSubmissions: one cached getSubmissionsList call per job, so
//    counts are complete. Names already in the candidate_names table are
//    attached immediately; the rest are flagged `name_pending`.
//  - resolvePortalCandidateNames: the slow per-candidate lookups, a few at a
//    time within a time budget, each success stored permanently so it's never
//    looked up again. The portal calls it after the list is on screen.

type Row = Record<string, unknown>;
export type PortalJobRef = { job_code: string; job_title?: unknown; city?: unknown; states?: unknown };

const JOB_CONCURRENCY = 6;
const NAME_CONCURRENCY = 4;
const NAMES_TABLE = 'candidate_names';

const PRIVATE_FIELDS = [
  'submitted_by',
  'tagged_by',
  'job_seeker_id',
  'merge_document_path',
  'merged_pdf_document',
  'selected_submission_documents',
  'Documents',
];

// Stable per-submission key the client uses to match names back to rows —
// never the job_seeker_id itself, which stays server-side.
export function submissionKey(sub: Row): string {
  return String(sub.submission_id ?? sub.id ?? '');
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((resolve) => { timer = setTimeout(() => resolve(fallback), ms); }),
  ]).finally(() => clearTimeout(timer));
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

// Missing table (migration 026 not applied yet) or a Supabase hiccup just
// means no stored names — the Ceipal lookup still works, it's only slower.
async function loadStoredNames(ids: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await supabaseAdmin
      .from(NAMES_TABLE)
      .select('job_seeker_id, name')
      .in('job_seeker_id', ids.slice(i, i + 200));
    if (error) {
      console.warn('[portalSubmissions] candidate_names read failed:', error.message);
      return found;
    }
    for (const row of data ?? []) found.set(String(row.job_seeker_id), String(row.name));
  }
  return found;
}

async function storeNames(entries: [string, string][]) {
  if (entries.length === 0) return;
  const { error } = await supabaseAdmin
    .from(NAMES_TABLE)
    .upsert(entries.map(([job_seeker_id, name]) => ({ job_seeker_id, name, updated_at: new Date().toISOString() })));
  if (error) console.warn('[portalSubmissions] candidate_names write failed:', error.message);
}

function nameOnRecord(sub: Row): string {
  return String(sub.candidate_name ?? sub.applicant_name ?? sub.consultant_name ?? '').trim();
}

async function fetchRawSubmissions(jobs: PortalJobRef[]) {
  const map = await getJobMap();
  const perJob = await mapPool(jobs, JOB_CONCURRENCY, async (job) => {
    const v2Id = map[job.job_code] ?? '';
    // No v2 id = Ceipal has no submissions endpoint entry for this job (same
    // as before) — a real zero, not a failure.
    if (!v2Id) return { job, subs: [] as Row[] };
    return { job, subs: await fetchJobSubmissionsOrNull(v2Id) };
  });
  return perJob;
}

export async function loadPortalSubmissions(jobs: PortalJobRef[], permissions: Record<string, boolean>) {
  const showName = permissions.show_candidate_name !== false;
  const perJob = await fetchRawSubmissions(jobs);

  const failedJobs = perJob.filter((r) => r.subs === null).map((r) => r.job.job_code);
  const raw = perJob.flatMap((r) => (r.subs ?? []).map((sub) => ({ job: r.job, sub })));

  const ids = showName
    ? [...new Set(raw.map(({ sub }) => String(sub.job_seeker_id ?? '')).filter(Boolean))]
    : [];
  const stored = ids.length > 0 ? await loadStoredNames(ids) : new Map<string, string>();

  const results = raw.map(({ job, sub }) => {
    const item: Row = { ...sub };
    if (showName) {
      const seekerId = String(sub.job_seeker_id ?? '');
      const name = (seekerId && stored.get(seekerId)) || nameOnRecord(sub);
      if (name) item.candidate_name = name;
      else if (seekerId) item.name_pending = true;
    } else {
      delete item.candidate_name;
    }
    item.submission_key = submissionKey(sub);
    item.job_code = job.job_code;
    item.job_title = job.job_title ?? '';
    item.job_city = job.city ?? '';
    item.job_state = job.states ?? '';
    for (const field of PRIVATE_FIELDS) delete item[field];
    if (!permissions.show_pay_rate) delete item.pay_rate;
    if (!permissions.show_tax_terms) delete item.tax_term;
    return item;
  });

  results.sort((a, b) => {
    const da = new Date(String(a.submitted_on ?? '')).getTime() || 0;
    const db = new Date(String(b.submitted_on ?? '')).getTime() || 0;
    return db - da;
  });

  return { results, failedJobs };
}

// Resolves names for the given jobs' submissions within `budgetMs`. Returns
// { submission_key: name } for everything known, plus how many are still
// unresolved so the client knows whether to ask again.
export async function resolvePortalCandidateNames(jobs: PortalJobRef[], budgetMs: number) {
  const startedAt = Date.now();
  const perJob = await fetchRawSubmissions(jobs);
  const subs = perJob.flatMap((r) => r.subs ?? []);

  const keyToSeeker = new Map<string, string>();
  const names: Record<string, string> = {};
  for (const sub of subs) {
    const key = submissionKey(sub);
    const seekerId = String(sub.job_seeker_id ?? '');
    const onRecord = nameOnRecord(sub);
    if (onRecord) names[key] = onRecord;
    else if (seekerId) keyToSeeker.set(key, seekerId);
  }

  const seekerIds = [...new Set(keyToSeeker.values())];
  const resolved = await loadStoredNames(seekerIds);
  const missing = seekerIds.filter((id) => !resolved.has(id));

  const deadline = startedAt + budgetMs;
  const fresh: [string, string][] = [];
  await mapPool(missing, NAME_CONCURRENCY, async (id) => {
    // Hard stop at the deadline so the response always goes out before
    // Vercel's cutoff; a lookup still in flight keeps going in the
    // background and lands in fetchApplicantName's own cache for next time.
    const remaining = deadline - Date.now();
    if (remaining < 3_000) return;
    const name = await raceTimeout(fetchApplicantName(id), remaining, '');
    if (name) {
      resolved.set(id, name);
      fresh.push([id, name]);
    }
  });
  await storeNames(fresh);

  let pending = 0;
  for (const [key, seekerId] of keyToSeeker) {
    const name = resolved.get(seekerId);
    if (name) names[key] = name;
    else pending += 1;
  }
  return { names, pending };
}
