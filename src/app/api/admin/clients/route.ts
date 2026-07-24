import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, verifyAdminPassword } from '@/lib/portal-auth';
import { sendPortalCredentials } from '@/lib/mailer';


function adminGuard(req: NextRequest) {
  return verifyAdminPassword(req.headers.get('x-admin-password') ?? '');
}

// GET /api/admin/clients
export async function GET(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('id, username, name, email, company, ceipal_id, ceipal_client_name, allowed_job_codes, permissions, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/clients — create + auto send email
export async function POST(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { username, name, email, password, company, ceipal_id, ceipal_client_name, permissions } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    username: username.trim().toLowerCase(),
    name: name || username,
    email: email?.trim() || null,
    password_hash: hashPassword(password),
    company: company || null,
    ceipal_client_name: ceipal_client_name || company || null,
    permissions: permissions ?? DEFAULT_PERMISSIONS,
  };

  // Only include ceipal_id if provided (column may not exist in older schema)
  if (ceipal_id) insertData.ceipal_id = ceipal_id;

  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert(insertData)
    .select('id, username, name, email, company, permissions, is_active, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      const field = error.message.includes('email') ? 'email' : 'username';
      return NextResponse.json({ error: `${field === 'email' ? 'Email' : 'Username'} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-send credentials email if email provided
  if (email) {
    try {
      await sendPortalCredentials(email, username.trim().toLowerCase(), password);
      return NextResponse.json({ ...data, email_sent: true }, { status: 201 });
    } catch (emailErr) {
      const errMsg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.error('Email send failed:', errMsg);
      return NextResponse.json({ ...data, email_sent: false, email_error: errMsg }, { status: 201 });
    }
  }

  return NextResponse.json({ ...data, email_sent: false, email_error: 'No email address provided' }, { status: 201 });
}

const DEFAULT_PERMISSIONS = {
  // Jobs
  show_bill_rate: false,
  show_pay_rate: false,
  show_job_salary: false,
  show_job_description: true,
  show_required_skills: true,
  allow_job_posting: false,
  // Candidates
  show_candidate_name: true,
  show_candidate_email: false,
  show_candidate_phone: false,
  show_candidate_resume: false,
  show_candidate_ssn: false,
  show_tax_terms: true,
  show_placement_dates: true,
  show_placement_bill_rate: false,
  show_placement_pay_rate: false,
};
