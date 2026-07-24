import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  if (token) await deleteSession(token);

  const res = NextResponse.json({ success: true });
  res.cookies.set('portal_token', '', { maxAge: 0, path: '/' });
  return res;
}
