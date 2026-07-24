import { NextRequest, NextResponse } from 'next/server';
import { getCeipalToken } from '@/lib/ceipal';
import { verifyAdminPassword } from '@/lib/portal-auth';
import { supabaseAdmin } from '@/lib/supabase';

const CEIPAL_CLIENTS_URL = 'https://api.ceipal.com/v1/getClientsList/';
const CACHE_TTL = 10 * 60 * 1000;
let cache: { data: unknown[]; at: number } | null = null;

async function fetchAllCeipalClients(): Promise<unknown[]> {
  const token = await getCeipalToken();
  const all: unknown[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(`${CEIPAL_CLIENTS_URL}?paging_length=50&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) break;
    const data = await res.json();
    const results: unknown[] = Array.isArray(data?.results) ? data.results : [];
    all.push(...results);
    if (!data.next) break;
    page++;
  }

  return all;
}

export async function GET(req: NextRequest) {
  if (!verifyAdminPassword(req.headers.get('x-admin-password') ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (cache && Date.now() < cache.at + CACHE_TTL) {
      return await withPortalStatus(cache.data);
    }

    const clients = await fetchAllCeipalClients();
    cache = { data: clients, at: Date.now() };
    return await withPortalStatus(clients);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function withPortalStatus(ceipalClients: unknown[]) {
  // Get all portal clients to mark which CEIPAL clients already have access
  const { data: portalClients } = await supabaseAdmin
    .from('clients')
    .select('id, ceipal_id, username, email, is_active');

  const portalMap = new Map<string, Record<string, unknown>>();
  for (const pc of portalClients ?? []) {
    if ((pc as Record<string, unknown>).ceipal_id) {
      portalMap.set(String((pc as Record<string, unknown>).ceipal_id), pc as Record<string, unknown>);
    }
  }

  const enriched = (ceipalClients as Record<string, unknown>[]).map(c => ({
    ...c,
    portal_access: portalMap.get(String(c.id)) ?? null,
  }));

  return NextResponse.json({ results: enriched, count: enriched.length });
}
