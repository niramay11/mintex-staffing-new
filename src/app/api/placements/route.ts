import { NextRequest, NextResponse } from 'next/server';
import { ceipalFetchV2, CEIPAL_PLACEMENTS_URL } from '@/lib/ceipal';

const CACHE_TTL = 5 * 60 * 1000;
let cache: { data: unknown[]; at: number } | null = null;
let inflight: Promise<unknown[]> | null = null;

async function fetchPlacements(): Promise<unknown[]> {
  const url = `${CEIPAL_PLACEMENTS_URL}?paging_length=500&page=1`;
  const res = await ceipalFetchV2(url);
  if (!res.ok) throw new Error(`CEIPAL placements ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

export async function GET(req: NextRequest) {
  try {
    if (cache && Date.now() < cache.at + CACHE_TTL) {
      return filtered(req, cache.data);
    }

    if (!inflight) {
      inflight = fetchPlacements()
        .then(data => { cache = { data, at: Date.now() }; return data; })
        .finally(() => { inflight = null; });
    }

    const all = await inflight;
    return filtered(req, all);
  } catch (err) {
    console.error('Placements API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function filtered(req: NextRequest, all: unknown[]) {
  const clientName = new URL(req.url).searchParams.get('client_name');
  const results = clientName
    ? (all as Record<string, unknown>[]).filter(p =>
        String(p.client_name ?? '').toLowerCase() === clientName.toLowerCase()
      )
    : all;
  return NextResponse.json({ results, count: results.length });
}
