import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch } from '@/lib/ceipal';
import { getJobMap } from '@/lib/ceipal-job-map';

// Always hidden from clients
const PRIVATE_FIELDS = [
  'primary_recruiter','assigned_recruiter','sales_manager','recruitment_manager',
  'posted_by','created_by','modified_by','contact_person',
  'business_unit_id','business_unit','client_job_id','is_recycle',
  'apply_job','apply_job_without_registration',
  'secondary_cities','secondary_postal_codes','secondary_states',
];

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobCode = new URL(req.url).searchParams.get('job_code');
  if (!jobCode) return NextResponse.json({ error: 'Missing job_code' }, { status: 400 });

  try {
    const map  = await getJobMap();
    const v2Id = map[jobCode] ?? '';

    if (!v2Id) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${encodeURIComponent(v2Id)}/`);
    if (!res.ok) return NextResponse.json({ error: `CEIPAL ${res.status}` }, { status: res.status });

    const data = await res.json() as Record<string, unknown>;
    const permissions = (client.permissions as Record<string, boolean>) ?? {};

    // Strip private fields
    const clean = { ...data };
    for (const f of PRIVATE_FIELDS) delete clean[f];
    if (!permissions.show_bill_rate)       { delete clean.client_bill_rate___salary; }
    if (!permissions.show_pay_rate)        { delete clean.pay_rates; delete clean.pay_rate; }
    if (!permissions.show_job_description) { delete clean.requisition_description; delete clean.public_job_desc; }
    if (!permissions.show_required_skills) { delete clean.skills; }

    return NextResponse.json(clean);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
