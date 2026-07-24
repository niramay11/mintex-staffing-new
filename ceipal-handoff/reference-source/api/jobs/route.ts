import { NextResponse } from 'next/server';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

export const maxDuration = 60;

const PAGE_SIZE    = 50;
const BATCH_SIZE   = 3;
const RETRY_DELAY  = 800;
const CACHE_TTL    = 5 * 60 * 1000;
const STALE_TTL    = 2 * 60 * 1000;
const CACHE_VERSION = 9;

let cache: { data: unknown[]; at: number; v: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(page: number): Promise<unknown[] | null> {
  try {
    const res  = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
    const data    = JSON.parse(text);
    const results = Array.isArray(data?.results) ? data.results : [];
    return results;
  } catch { return null; }
}

async function fetchPageWithRetry(page: number): Promise<unknown[]> {
  const first = await fetchPage(page);
  if (first !== null) return first;
  await sleep(RETRY_DELAY);
  const second = await fetchPage(page);
  if (second !== null) return second;
  return [];
}

async function fetchAllJobs(): Promise<unknown[]> {
  const all: unknown[] = [];

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
    const code = String((j as Record<string, unknown>).job_code ?? '');
    if (!code.startsWith('JPC')) return false;
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  jpc.sort((a, b) =>
    jobCodeNum((b as Record<string, unknown>).job_code) -
    jobCodeNum((a as Record<string, unknown>).job_code)
  );

  console.log(`[jobs] fetched ${all.length} total, ${jpc.length} JPC jobs`);
  return jpc;
}

function triggerRefresh() {
  if (inflight) return;
  inflight = fetchAllJobs()
    .then(data  => { cache = { data, at: Date.now(), v: CACHE_VERSION }; return data; })
    .catch(err  => { console.error('[jobs] refresh failed:', err); return cache?.data ?? []; })
    .finally(() => { inflight = null; });
}

export async function GET(req: import('next/server').NextRequest) {
  const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';

  try {
    if (forceRefresh) { cache = null; inflight = null; }

    const now = Date.now();
    if (cache && cache.v !== CACHE_VERSION) { cache = null; inflight = null; }

    if (!forceRefresh && cache) {
      const age = now - cache.at;
      if (age < CACHE_TTL)
        return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at });
      if (age < CACHE_TTL + STALE_TTL) {
        triggerRefresh();
        return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at, stale: true });
      }
    }

    if (!inflight) triggerRefresh();
    const results = await inflight!;
    return NextResponse.json({ results, count: results.length, cached_at: cache?.at ?? now });

  } catch (err) {
    console.error('[jobs] GET error:', err);
    if (cache) return NextResponse.json({ results: cache.data, count: cache.data.length, cached_at: cache.at, stale: true });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
