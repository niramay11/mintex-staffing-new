import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, createSession } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, name, email, username, password_hash, is_active')
    .eq('username', username.trim().toLowerCase())
    .single();

  if (!client || !verifyPassword(password, client.password_hash)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  if (!client.is_active) {
    return NextResponse.json({ error: 'Your account has been deactivated. Contact your account manager.' }, { status: 403 });
  }

  const token = await createSession(client.id);

  const res = NextResponse.json({ success: true, name: client.name });
  res.cookies.set('portal_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
