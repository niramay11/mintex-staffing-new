import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';
import { getJobMap } from '@/lib/ceipal-job-map';

// The bulk /api/jobs list deliberately excludes job_description/
// public_job_description — including them pushed the cached payload past
// Next's hard 2MB-per-item cache limit, which silently broke caching for the
// entire jobs list (see src/lib/jobsCache.ts). This route fetches just one
// job's description on demand, for JobDetailModal.tsx's public "Get Hired"
// job popup — a single job's description is tiny, no caching needed.
//
// getJobMap()'s own cache can be cold (confirmed ~70s to rebuild from
// scratch), so this needs the same generous ceiling as /api/jobs rather than
// Vercel's much shorter default function timeout.
export const maxDuration = 60;

export async function GET(req: Request) {
  const jobCode = new URL(req.url).searchParams.get('job_code');
  if (!jobCode) return NextResponse.json({ error: 'Missing job_code' }, { status: 400 });

  try {
    const map = await getJobMap();
    const id = map[jobCode];
    if (!id) return NextResponse.json({ error: 'Unknown job_code' }, { status: 404 });

    const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
    if (!res.ok) return NextResponse.json({ error: `CEIPAL ${res.status}` }, { status: 502 });

    const data = await res.json();
    return NextResponse.json({
      job_description: data?.requisition_description ?? '',
      public_job_description: data?.public_job_desc ?? '',
    });
  } catch (err) {
    console.error('[jobs/description] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
