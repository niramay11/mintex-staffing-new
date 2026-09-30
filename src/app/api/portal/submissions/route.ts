import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { getAllJobs } from '@/lib/data-cache';
import { loadPortalSubmissions, type PortalJobRef } from '@/lib/portalSubmissions';

export const maxDuration = 60;

function toJobRef(j: Record<string, unknown>): PortalJobRef {
  return { job_code: String(j.job_code ?? ''), job_title: j.job_title, city: j.city, states: j.states };
}

// GET /api/portal/submissions?job_codes=A,B,C
//
// Submission lists only — one cached Ceipal call per job, no per-candidate
// name lookups (those moved to /api/portal/candidate-names, see
// portalSubmissions.ts for why). The portal requests a few job codes per call
// and runs several calls in parallel, so no single request carries a whole
// account's worth of jobs against Vercel's 60s limit.
//
// `failed_jobs` lists any job Ceipal didn't answer for, so the portal can say
// the numbers are incomplete instead of silently showing a low count.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const jobCodesParam = url.searchParams.get('job_codes');
  const explicitCodes = jobCodesParam ? jobCodesParam.split(',').map(s => s.trim()).filter(Boolean) : null;

  try {
    const permissions  = (client.permissions as Record<string, boolean>) ?? {};
    const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
    const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();

    const allJobs = await getAllJobs();
    let jobs: PortalJobRef[];

    if (explicitCodes && explicitCodes.length > 0) {
      // Titles/locations come from the shared jobs cache — the codes alone
      // used to leave job_title blank on every submission card.
      const byCode = new Map(allJobs.map(j => [String(j.job_code ?? ''), j]));
      jobs = explicitCodes.map(code => {
        const j = byCode.get(code);
        return j ? toJobRef(j) : { job_code: code };
      });
    } else if (allowedCodes.length > 0) {
      jobs = allJobs.filter(j => allowedCodes.includes(String(j.job_code ?? ''))).map(toJobRef);
    } else if (ceipalName) {
      jobs = allJobs.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName).map(toJobRef);
    } else {
      jobs = [];
    }

    if (jobs.length === 0) return NextResponse.json({ results: [], count: 0, failed_jobs: [] });

    const { results, failedJobs } = await loadPortalSubmissions(jobs, permissions);
    if (failedJobs.length > 0) {
      console.warn(`[portal/submissions] Ceipal didn't answer for ${failedJobs.length}/${jobs.length} jobs: ${failedJobs.join(', ')}`);
    }
    return NextResponse.json({ results, count: results.length, failed_jobs: failedJobs });
  } catch (err) {
    console.error('[portal/submissions] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
