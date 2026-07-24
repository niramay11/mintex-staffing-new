import { unstable_cache } from 'next/cache';
import { ceipalFetchV2, CEIPAL_PLACEMENTS_URL } from './ceipal';
import { getCachedJobs } from './jobsCache';

const PLACEMENTS_CACHE_TAG = 'ceipal-placements';
const CACHE_TTL_SECONDS = 5 * 60;

async function _fetchAllPlacements(): Promise<Record<string, unknown>[]> {
  try {
    const res = await ceipalFetchV2(`${CEIPAL_PLACEMENTS_URL}?paging_length=500&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return []; }
}

// Persisted via Next's Data Cache (works across Vercel's isolated serverless
// invocations, unlike a plain module-level variable — see src/lib/jobsCache.ts).
const getCachedPlacements = unstable_cache(_fetchAllPlacements, [PLACEMENTS_CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [PLACEMENTS_CACHE_TAG],
});

// Jobs used by the portal's placements/submissions routes and the job-alerts
// poller are the exact same "all Ceipal jobs" data src/lib/jobsCache.ts
// already fetches and caches for the public jobs board — reuse it instead of
// running a second independent fetch.
export async function getAllJobs(): Promise<Record<string, unknown>[]> {
  const { jobs } = await getCachedJobs();
  return jobs as Record<string, unknown>[];
}

export async function getAllPlacements(): Promise<Record<string, unknown>[]> {
  return getCachedPlacements();
}
