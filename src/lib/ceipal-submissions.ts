import { ceipalFetch } from './ceipal';

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

// Both /api/portal/submissions and /api/portal/job-submissions used to call
// Ceipal directly with `catch { return [] }` and no retry — meaning one slow
// or transiently-failed response for a job got silently recorded as "zero
// submissions" instead of "this fetch failed," identical to the exact class
// of bug already found and fixed in jobsCache.ts/ceipal-job-map.ts today
// (Ceipal has been measured taking 8-12+ seconds even for a normal,
// successful response). One retry before giving up — and a log line instead
// of silence — turns a transient hiccup back into real data most of the
// time, and makes a genuine outage visible in the server logs instead of
// just looking like "this job has no candidates."
export async function fetchJobSubmissions(v2Id: string): Promise<Record<string, unknown>[]> {
  const first = await fetchOnce(v2Id);
  if (first !== null) return first;

  await sleep(RETRY_DELAY_MS);
  const retry = await fetchOnce(v2Id);
  if (retry !== null) return retry;

  console.warn(`[ceipal-submissions] failed to fetch submissions for jobId=${v2Id} after retry — treating as zero this cycle`);
  return [];
}
