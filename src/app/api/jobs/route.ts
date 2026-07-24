import { NextResponse } from 'next/server';
import { getCachedJobs } from '@/lib/jobsCache';

export const maxDuration = 60;

export async function GET(req: import('next/server').NextRequest) {
  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';

  const { jobs, cachedAt, stale } = await getCachedJobs({ forceRefresh });
  return NextResponse.json({ results: jobs, count: jobs.length, cached_at: cachedAt, ...(stale ? { stale: true } : {}) });
}
