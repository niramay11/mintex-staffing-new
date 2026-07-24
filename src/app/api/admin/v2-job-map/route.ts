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
export async function GET() {
  try {
    const map = await getJobMap();
    return NextResponse.json(map);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
