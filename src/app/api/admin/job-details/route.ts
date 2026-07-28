import { unstable_cache, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDetails(id: string): Promise<Record<string, unknown>> {
  const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
  if (!res.ok) throw new Error(`CEIPAL ${res.status}: ${await res.text().catch(() => '')}`);
  const data = await res.json();
  // Confirmed live: Ceipal sometimes answers 200 OK with a degraded/
  // incomplete body under load — no description at all even though the job
  // genuinely has one (same class of bug as jobDescriptionCache.ts). Without
  // this check, that degraded response looked like a normal success and got
  // cached below as the "real" answer for a full 24h. Throwing here instead
  // routes it through the retry below, and — if still empty after that —
  // stops unstable_cache from caching a bad result at all.
  if (!data?.requisition_description) {
    throw new Error(`CEIPAL returned no description content for job id ${id}`);
  }
  return data;
}

// One retry before giving up — Ceipal has been measured taking 8-12+ seconds
// even for a normal response, so a single transient failure doesn't mean the
// job's details are actually unavailable. Throwing after both attempts fail
// (instead of returning a fallback) keeps unstable_cache from ever
// persisting a bad result as if it were real data.
async function fetchDetailsWithRetry(id: string): Promise<Record<string, unknown>> {
  try {
    return await fetchDetails(id);
  } catch {
    await sleep(800);
    return fetchDetails(id);
  }
}

// Every previous view of a job's admin detail panel did a fully uncached
// live Ceipal call — every click, every time, even for a job just opened
// moments ago. Ceipal's own occasional slowness under load (see
// jobsCache.ts) means this usually succeeds but sometimes lands on an
// incomplete response, silently showing "No job description available"
// even though Ceipal genuinely has one — with nothing cached, there was no
// fallback to fall back on. Caching this (same 24h pattern as
// jobDescriptionCache.ts, since a job's own posted details rarely change
// after the fact) means only the FIRST view of a given job pays that
// live-call risk; every view after that, by any admin, serves the
// already-successful result instead of re-rolling the dice with Ceipal
// every single time.
const CACHE_TAG = 'admin-job-details';

const getCachedDetails = unstable_cache(fetchDetailsWithRetry, [CACHE_TAG], {
  revalidate: 24 * 60 * 60,
  tags: [CACHE_TAG],
});

export async function GET(req: import('next/server').NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    // Busts EVERY cached job's details at once (no cheap way to target a
    // single id) — a one-time way to clear out anything poisoned by the
    // empty-response bug fixed above, before its own 24h window would
    // otherwise have expired on its own.
    const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';
    if (forceRefresh) revalidateTag(CACHE_TAG, 'max');
    const data = await getCachedDetails(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[job-details] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
