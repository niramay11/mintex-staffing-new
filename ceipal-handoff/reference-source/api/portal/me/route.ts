import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '');
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(client);
}
