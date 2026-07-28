import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDetails(id: string): Promise<Record<string, unknown>> {
  const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
  if (!res.ok) throw new Error(`CEIPAL ${res.status}: ${await res.text().catch(() => '')}`);
  return res.json();
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
const getCachedDetails = unstable_cache(fetchDetailsWithRetry, ['admin-job-details'], {
  revalidate: 24 * 60 * 60,
});

export async function GET(req: import('next/server').NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const data = await getCachedDetails(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[job-details] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
