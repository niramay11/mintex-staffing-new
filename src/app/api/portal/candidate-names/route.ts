import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { resolvePortalCandidateNames } from '@/lib/portalSubmissions';

export const maxDuration = 60;

// Leaves ~10s of Vercel's 60s for the submissions read and the response.
const NAME_BUDGET_MS = 45_000;
const MAX_CODES = 12;

// POST /api/portal/candidate-names  { job_codes: string[] }
// → { names: { [submission_key]: name }, pending: number }
//
// The slow half of the portal's submissions view: resolves candidate names
// for submissions the list returned as `name_pending`. Each name found is
// stored permanently (candidate_names table), so this only costs real time
// the first time a candidate is seen. The portal calls again while
// `pending` > 0.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = (client.permissions as Record<string, boolean>) ?? {};
  if (permissions.show_candidate_name === false) return NextResponse.json({ names: {}, pending: 0 });

  const body = await req.json().catch(() => null);
  const codes: string[] = Array.isArray(body?.job_codes)
    ? [...new Set<string>(body.job_codes.map((c: unknown) => String(c ?? '').trim()).filter(Boolean))].slice(0, MAX_CODES)
    : [];
  if (codes.length === 0) return NextResponse.json({ names: {}, pending: 0 });

  try {
    const result = await resolvePortalCandidateNames(codes.map(job_code => ({ job_code })), NAME_BUDGET_MS);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[portal/candidate-names] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
