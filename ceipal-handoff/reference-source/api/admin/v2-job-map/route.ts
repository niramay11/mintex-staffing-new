import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

// Cache: job_code → v2 id
type JobMap = Record<string, string>;
let cache: { map: JobMap; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function buildMap(): Promise<JobMap> {
  const map: JobMap = {};
  let page = 1;

  while (true) {
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getJobPostingsList/?paging_length=50&page=${page}`
    );
    if (!res.ok) break;

    const data = await res.json();
    const results: Record<string, unknown>[] = Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    if (results.length === 0) break;

    for (const job of results) {
      const code = String(job.job_code ?? '').trim();
      const id   = String(job.id ?? '').trim();
      if (code && id) map[code] = id;
    }

    if (!data?.next || results.length < 50) break;
    page++;
  }

  return map;
}

export async function GET() {
  try {
    if (cache && Date.now() < cache.at + CACHE_TTL) {
      return NextResponse.json(cache.map);
    }
    const map = await buildMap();
    cache = { map, at: Date.now() };
    return NextResponse.json(map);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
