import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch, CEIPAL_JOBS_URL } from '@/lib/ceipal';

export const maxDuration = 60;

const PAGE_SIZE    = 50;
const BATCH_SIZE   = 3;
const RETRY_DELAY  = 800;
const CACHE_TTL    = 5 * 60 * 1000;
const STALE_TTL    = 2 * 60 * 1000;
const CACHE_VERSION = 1;

let cache: { data: Record<string, unknown>[]; at: number; v: number } | null = null;
let inflight: Promise<Record<string, unknown>[]> | null = null;

function jobCodeNum(code: unknown): number {
  const m = String(code ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(page: number): Promise<Record<string, unknown>[] | null> {
  try {
    const res  = await ceipalFetch(`${CEIPAL_JOBS_URL}?paging_length=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) return null;
    const data    = JSON.parse(text);
    const results = Array.isArray(data?.results) ? data.results : [];
    return results as Record<string, unknown>[];
  } catch { return null; }
}

async function fetchPageWithRetry(page: number): Promise<Record<string, unknown>[]> {
  const first = await fetchPage(page);
  if (first !== null) return first;
  await sleep(RETRY_DELAY);
  const second = await fetchPage(page);
  if (second !== null) return second;
  return [];
}

async function fetchAllJobs(): Promise<Record<string, unknown>[]> {
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
  console.log(`[portal/jobs] fetched ${all.length} total, ${jpc.length} JPC jobs`);
  return jpc;
}

function triggerRefresh() {
  if (inflight) return;
  inflight = fetchAllJobs()
    .then(data  => { cache = { data, at: Date.now(), v: CACHE_VERSION }; return data; })
    .catch(err  => { console.error('[portal/jobs] refresh failed:', err); return cache?.data ?? []; })
    .finally(() => { inflight = null; });
}

const ALWAYS_STRIP = [
  'primary_recruiter','assigned_recruiter','sales_manager','recruitment_manager',
  'posted_by','created_by','modified_by','business_unit_id','business_unit',
  'apply_job','apply_job_without_registration','contact_person','client_job_id','is_recycle',
];

export async function GET(req: NextRequest) {
  const token  = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';
    if (forceRefresh) { cache = null; inflight = null; }

    const now = Date.now();
    if (cache && cache.v !== CACHE_VERSION) { cache = null; inflight = null; }

    if (!forceRefresh && cache) {
      const age = now - cache.at;
      if (age >= CACHE_TTL && age < CACHE_TTL + STALE_TTL) triggerRefresh();
      else if (age >= CACHE_TTL + STALE_TTL) { cache = null; }
    }

    if (!cache) {
      if (!inflight) triggerRefresh();
      await inflight;
    }

    const all          = cache?.data ?? [];
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};

    let jobs: Record<string, unknown>[];
    if (allowedCodes.length > 0) {
      jobs = all.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
    } else if (ceipalName) {
      jobs = all.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
    } else {
      jobs = [];
    }

    const stripped = jobs.map(job => {
      const j = { ...job };
      for (const f of ALWAYS_STRIP) delete j[f];
      if (!permissions.show_bill_rate)       { delete j.client_bill_rate___salary; }
      if (!permissions.show_pay_rate)        { delete j.pay_rate___salary; }
      if (!permissions.show_job_description) { delete j.job_description; delete j.public_job_description; }
      if (!permissions.show_required_skills) { delete j.primary_skills; delete j.secondary_skills; }
      return j;
    });

    return NextResponse.json({ results: stripped, count: stripped.length });
  } catch (err) {
    console.error('[portal/jobs] GET error:', err);
    if (cache) return NextResponse.json({ results: cache.data, count: cache.data.length });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
