import { getCachedJobs } from '@/lib/jobsCache';

// The portal needs the exact same "all Ceipal jobs" data as the public jobs
// board (src/lib/jobsCache.ts) — same fetch, same JPC-prefix filter, same
// sort — just filtered down further per-client below. Reusing that one
// Vercel-persisted cache instead of running a second independent fetch halves
// the total Ceipal round-trips this app makes per cache window.

const ALWAYS_STRIP = [
  'primary_recruiter','assigned_recruiter','sales_manager','recruitment_manager',
  'posted_by','created_by','modified_by','business_unit_id','business_unit',
  'apply_job','apply_job_without_registration','contact_person','client_job_id','is_recycle',
];

// Called by src/instrumentation.ts as a best-effort warm-up.
export async function warmPortalJobsCache(): Promise<void> {
  await getCachedJobs();
}

// Shared by /api/portal/jobs (client-side refetches, force-refresh) and the
// client-portal Server Component page (server-side prefetch before first
// paint) — both apply the same per-client filtering/field-stripping over the
// shared jobs cache instead of duplicating the fetch.
export async function getPortalJobsForClient(
  client: Record<string, unknown>,
  opts?: { forceRefresh?: boolean }
): Promise<{ results: Record<string, unknown>[]; count: number }> {
  const { jobs } = await getCachedJobs({ forceRefresh: opts?.forceRefresh });
  const all = jobs as Record<string, unknown>[];

  const allowedCodes = (client.allowed_job_codes as string[]) ?? [];
  const ceipalName   = String(client.ceipal_client_name ?? client.company ?? '').toLowerCase().trim();
  const permissions  = (client.permissions as Record<string, boolean>) ?? {};

  let matched: Record<string, unknown>[];
  if (allowedCodes.length > 0) {
    matched = all.filter(j => allowedCodes.includes(String(j.job_code ?? '')));
  } else if (ceipalName) {
    matched = all.filter(j => String(j.client ?? '').toLowerCase().trim() === ceipalName);
  } else {
    matched = [];
  }

  const stripped = matched.map(job => {
    const j = { ...job };
    for (const f of ALWAYS_STRIP) delete j[f];
    if (!permissions.show_bill_rate)       { delete j.client_bill_rate___salary; }
    if (!permissions.show_pay_rate)        { delete j.pay_rate___salary; }
    if (!permissions.show_job_description) { delete j.job_description; delete j.public_job_description; }
    if (!permissions.show_required_skills) { delete j.primary_skills; delete j.secondary_skills; }
    return j;
  });

  return { results: stripped, count: stripped.length };
}
