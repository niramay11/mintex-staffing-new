import { NextResponse } from 'next/server';
import { getJobMap } from '@/lib/ceipal-job-map';

export const maxDuration = 60;

// This used to run its own independent, unprotected pagination loop with a
// plain in-memory cache (no retry, no time budget, no sanity check) --
// confirmed live returning as few as 20 of ~1,500+ jobs, which broke the
// admin panel's "View" job-detail/submissions modal for almost every job
// whose code wasn't among the lucky 20 that made it through. Delegating to
// the shared, already-hardened src/lib/ceipal-job-map.ts (retry-protected,
// durable across invocations, sanity-floor guarded) instead of maintaining
// a second, divergent copy of the same logic.
export async function GET(req: Request) {
  try {
    // The map only rebuilds every 6 hours on its own (see ceipal-job-map.ts) —
    // a job posted since the last rebuild simply isn't in it yet, which the
    // admin panel's job-detail modal surfaces as "Job not found in V2 list".
    // ?refresh=1 lets that modal force an immediate rebuild instead of the
    // admin having to wait out the rest of the 6-hour window.
    const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';
    const map = await getJobMap({ forceRefresh });
    return NextResponse.json(map);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
