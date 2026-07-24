import { ceipalFetch, ceipalFetchV2, CEIPAL_JOBS_URL, CEIPAL_PLACEMENTS_URL } from './ceipal';

const PAGE_SIZE  = 50;
const BATCH_SIZE = 3;
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── In-memory cache ──────────────────────────────────────────────────────────
// On Railway (persistent Node.js server) these module-level variables survive
// across requests for the lifetime of the process — exactly what we need.
let jobsCache:    { data: Record<string, unknown>[]; at: number } | null = null;
let jobsInflight: Promise<Record<string, unknown>[]> | null = null;

let placementsCache:    { data: Record<string, unknown>[]; at: number } | null = null;
let placementsInflight: Promise<Record<string, unknown>[]> | null = null;

// ─── CEIPAL fetch helpers ─────────────────────────────────────────────────────
function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function fetchPage(page: number): Promise<Record<string, unknown>[] | null> {
  try {
    const res  = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
    const data = JSON.parse(text);
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return null; }
}

async function fetchPageWithRetry(page: number): Promise<Record<string, unknown>[]> {
  const first = await fetchPage(page);
  if (first !== null) return first;
  await new Promise(r => setTimeout(r, 800));
  return (await fetchPage(page)) ?? [];
}

async function _fetchAllJobs(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  for (let start = 1; start <= 300; start += BATCH_SIZE) {
    const pages   = Array.from({ length: BATCH_SIZE }, (_, i) => start + i);
    const results = await Promise.all(pages.map(fetchPageWithRetry));
    let done = false;
    for (const pageResults of results) {
      if (pageResults.length === 0) { done = true; break; }
      all.push(...pageResults);
      if (pageResults.length < PAGE_SIZE) { done = true; break; }
    }
    if (done) break;
  }
  const seen = new Set<string>();
  const jpc = all.filter(j => {
    const code = String(j.job_code ?? '');
    if (!code.startsWith('JPC')) return false;
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
  jpc.sort((a, b) => jobCodeNum(b.job_code) - jobCodeNum(a.job_code));
  console.log(`[data-cache] fetched ${all.length} total, ${jpc.length} JPC jobs`);
  return jpc;
}

async function _fetchAllPlacements(): Promise<Record<string, unknown>[]> {
  try {
    const res = await ceipalFetchV2(`${CEIPAL_PLACEMENTS_URL}?paging_length=500&page=1`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return []; }
}

// ─── Public API ───────────────────────────────────────────────────────────────
function startJobsRefresh() {
  if (jobsInflight) return;
  jobsInflight = _fetchAllJobs()
    .then(data => { jobsCache = { data, at: Date.now() }; return data; })
    .catch(err  => { console.error('[data-cache] jobs refresh failed:', err); return jobsCache?.data ?? []; })
    .finally(() => { jobsInflight = null; });
}

function startPlacementsRefresh() {
  if (placementsInflight) return;
  placementsInflight = _fetchAllPlacements()
    .then(data => { placementsCache = { data, at: Date.now() }; return data; })
    .catch(err  => { console.error('[data-cache] placements refresh failed:', err); return placementsCache?.data ?? []; })
    .finally(() => { placementsInflight = null; });
}

export async function getAllJobs(): Promise<Record<string, unknown>[]> {
  const now = Date.now();

  // Fresh cache — return immediately
  if (jobsCache && now - jobsCache.at < CACHE_TTL) return jobsCache.data;

  // Stale cache — return immediately, refresh silently in background
  if (jobsCache) {
    startJobsRefresh();
    return jobsCache.data;
  }

  // No cache — must wait for fresh data
  startJobsRefresh();
  return jobsInflight!;
}

export async function getAllPlacements(): Promise<Record<string, unknown>[]> {
  const now = Date.now();

  if (placementsCache && now - placementsCache.at < CACHE_TTL) return placementsCache.data;

  if (placementsCache) {
    startPlacementsRefresh();
    return placementsCache.data;
  }

  startPlacementsRefresh();
  return placementsInflight!;
}

// Force-invalidate both caches (e.g. on manual sync)
export function invalidateCache() {
  jobsCache = null;
  placementsCache = null;
}
