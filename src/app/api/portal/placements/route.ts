import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch, ceipalFetchV2, CEIPAL_PLACEMENTS_URL } from '@/lib/ceipal';
import { getAllJobs } from '@/lib/data-cache';

const CACHE_TTL = 5 * 60 * 1000;
let cache: { data: Record<string, unknown>[]; at: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

const PAGE_SIZE = 100;

async function fetchPage(page: number): Promise<Record<string, unknown>[] | null> {
  try {
    const url = `${CEIPAL_PLACEMENTS_URL}?paging_length=${PAGE_SIZE}&page=${page}`;
    let res = await ceipalFetch(url);
    if (!res.ok) res = await ceipalFetchV2(url);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch { return null; }
}

async function fetchAllPlacements(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];

  for (let page = 1; page <= 50; page++) {
    const results = await fetchPage(page);
    if (!results || results.length === 0) break;
    all.push(...results);
    if (results.length < PAGE_SIZE) break; // last page
  }

  console.log(`[portal/placements] fetched total: ${all.length}`);
  return all;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!cache || Date.now() > cache.at + CACHE_TTL) {
      if (!inflight) {
        inflight = fetchAllPlacements()
          .then(d => { cache = { data: d, at: Date.now() }; return d; })
          .finally(() => { inflight = null; });
      }
      await inflight;
    }

    const all = cache?.data ?? [];
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? '').toLowerCase().trim();
    const ceipalClientInJobs = String(client.company ?? '').toLowerCase().trim();
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};

    // Build the set of job codes that belong to this client
    // Priority: explicit allowed_job_codes → ceipal_client_name → derive from jobs cache
    let clientJobCodes: Set<string>;

    if (allowedCodes.length > 0) {
      clientJobCodes = new Set(allowedCodes);
    } else {
      // Get all jobs and filter to this client — same logic as portal/jobs route
      const allJobs = await getAllJobs();
      const name = ceipalName || ceipalClientInJobs;
      const clientJobs = name
        ? allJobs.filter(j => String(j.client ?? '').toLowerCase().trim() === name)
        : [];
      clientJobCodes = new Set(clientJobs.map(j => String(j.job_code ?? '')).filter(Boolean));
    }

    // Match placements: by job_code first, then by client name fields
    const placements = all.filter(p => {
      const pJobCode = String(p.job_code ?? '').trim();

      // Match by job code (most accurate)
      if (pJobCode && clientJobCodes.has(pJobCode)) return true;

      // Fallback: match by client name fields
      if (ceipalName) {
        const fields = [
          String(p.client_id ?? '').toLowerCase().trim(),
          String(p.client_prime_vendor ?? '').toLowerCase().trim(),
          String(p.client_name ?? '').toLowerCase().trim(),
        ].filter(v => v.length >= 3);
        if (fields.some(v => v === ceipalName || v.includes(ceipalName) || ceipalName.includes(v))) return true;
      }

      return false;
    });

    console.log(`[portal/placements] client="${ceipalName}" jobCodes=${clientJobCodes.size} matched=${placements.length} total=${all.length}`);

    // Strip sensitive fields based on permissions
    const stripped = placements.map(p => {
      const item = { ...p };
      if (!permissions.show_bill_rate)         { delete item.client_bill_rate; }
      if (!permissions.show_pay_rate)           { delete item.pay_rate; }
      if (!permissions.show_candidate_contact)  { delete item.mobile_number; delete item.email; }
      return item;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    console.error('Portal placements error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
