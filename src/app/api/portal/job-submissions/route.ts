import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { loadPortalSubmissions } from '@/lib/portalSubmissions';

export const maxDuration = 60;

// GET /api/portal/job-submissions?job_code=X — one job's submissions for the
// job detail modal. Same split as /api/portal/submissions: the list comes back
// right away with stored names attached, and anything flagged `name_pending`
// is filled in by the modal via /api/portal/candidate-names.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobCode = new URL(req.url).searchParams.get('job_code');
  if (!jobCode) return NextResponse.json({ error: 'Missing job_code' }, { status: 400 });

  try {
    const permissions = (client.permissions as Record<string, boolean>) ?? {};
    const { results, failedJobs } = await loadPortalSubmissions([{ job_code: jobCode }], permissions);
    if (failedJobs.length > 0) {
      return NextResponse.json({ error: "Couldn't reach CEIPAL for this job's submissions" }, { status: 502 });
    }
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
