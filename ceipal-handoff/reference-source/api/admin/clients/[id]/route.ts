import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, verifyAdminPassword } from '@/lib/portal-auth';
import { sendPortalCredentials } from '@/lib/mailer';

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get('x-admin-password') ?? '');
}

// PUT /api/admin/clients/[id] — update client
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.username !== undefined)            updates.username           = body.username.trim().toLowerCase();
  if (body.name !== undefined)               updates.name               = body.name;
  if (body.email !== undefined)              updates.email              = body.email?.trim() || null;
  if (body.company !== undefined)            updates.company            = body.company;
  if (body.ceipal_client_name !== undefined) updates.ceipal_client_name = body.ceipal_client_name;
  if (body.allowed_job_codes !== undefined)  updates.allowed_job_codes  = body.allowed_job_codes;
  if (body.permissions !== undefined)        updates.permissions        = body.permissions;
  if (body.is_active !== undefined)          updates.is_active          = body.is_active;
  if (body.password)                         updates.password_hash      = hashPassword(body.password);

  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select('id, username, name, email, company, permissions, is_active, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const field = error.message.includes('email') ? 'Email' : 'Username';
      return NextResponse.json({ error: `${field} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If admin explicitly requested resend, send email
  if (body.resend_email && data.email && body.password) {
    try {
      await sendPortalCredentials(data.email, body.username ?? data.username, body.password);
      return NextResponse.json({ ...data, email_sent: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ...data, email_sent: false, email_error: msg });
    }
  }

  return NextResponse.json({ ...data, email_sent: false, email_error: null });
}

// DELETE /api/admin/clients/[id] — delete client
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from('clients').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
