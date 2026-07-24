import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

type UserMap = Record<string, string>; // encoded_id → display_name
let cache: { map: UserMap; at: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function buildUsersMap(): Promise<UserMap> {
  const map: UserMap = {};
  let page = 1;

  while (true) {
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getUsersList?paging_length=100&page=${page}`
    );
    if (!res.ok) break;

    const data = await res.json();
    const users: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : [];

    if (users.length === 0) break;

    for (const u of users) {
      const id   = String(u.id ?? '').trim();
      const name = String(u.display_name ?? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() ?? '');
      if (id && name) map[id] = name;
    }

    if (!data?.next || users.length < 100) break;
    page++;
  }

  return map;
}

export async function GET() {
  try {
    if (cache && Date.now() < cache.at + CACHE_TTL) {
      return NextResponse.json(cache.map);
    }
    const map = await buildUsersMap();
    cache = { map, at: Date.now() };
    return NextResponse.json(map);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
