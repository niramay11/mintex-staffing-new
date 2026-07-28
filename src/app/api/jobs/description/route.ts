import { NextResponse } from 'next/server';
import { getJobMap } from '@/lib/ceipal-job-map';
import { getCachedDescription } from '@/lib/jobDescriptionCache';

// The bulk /api/jobs list deliberately excludes job_description/
// public_job_description — including them pushed the cached payload past
// Next's hard 2MB-per-item cache limit, which silently broke caching for the
// entire jobs list (see src/lib/jobsCache.ts). This route fetches just one
// job's description on demand — used by JobBoard.tsx's background prefetch
// (which warms this cache for the individual /get-hired/jobs/[job_code] pages
// before a visitor ever clicks into one). See jobDescriptionCache.ts for the
// caching/warming strategy.
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

    const description = await getCachedDescription(jobCode, id);
    return NextResponse.json(description);
  } catch (err) {
    console.error('[jobs/description] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
