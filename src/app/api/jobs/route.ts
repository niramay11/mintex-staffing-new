import { NextResponse, after } from 'next/server';
import { getCachedJobs } from '@/lib/jobsCache';
import { warmIfNearExpiry } from '@/lib/warmCaches';

export const maxDuration = 60;

export async function GET(req: import('next/server').NextRequest) {
  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';

  const { jobs, cachedAt, stale } = await getCachedJobs({ forceRefresh });
  // The browser only calls this route when the server-side prefetch already
  // timed out — a strong signal the cache was cold — so also schedule a
  // background top-up here, same as the page components.
  after(() => warmIfNearExpiry());
  return NextResponse.json({ results: jobs, count: jobs.length, cached_at: cachedAt, ...(stale ? { stale: true } : {}) });
}
