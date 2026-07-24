import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { getPortalJobsForClient } from '@/lib/portalJobsCache';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const token  = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const forceRefresh = new URL(req.url).searchParams.get('refresh') === '1';
    const { results, count } = await getPortalJobsForClient(client, { forceRefresh });
    return NextResponse.json({ results, count });
  } catch (err) {
    console.error('[portal/jobs] GET error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
