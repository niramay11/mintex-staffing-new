import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/portal-auth';
import { ceipalFetch } from '@/lib/ceipal';
import { getJobMap } from '@/lib/ceipal-job-map';
import { fetchJobSubmissions } from '@/lib/ceipal-submissions';

async function fetchApplicantName(jobSeekerId: string): Promise<string> {
  try {
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getApplicantDetails/${encodeURIComponent(jobSeekerId)}/`
    );
    if (!res.ok) return '';
    const raw = await res.json();
    const d   = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>;
    if (!d) return '';
    return String(
      d.consultant_name ?? d.full_name ?? d.applicant_name ??
      `${d.firstname ?? d.first_name ?? ''} ${d.lastname ?? d.last_name ?? ''}`.trim()
    ).trim();
  } catch {
    return '';
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('portal_token')?.value;
  const client = await verifySession(token ?? '') as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobCode = new URL(req.url).searchParams.get('job_code');
  if (!jobCode) return NextResponse.json({ error: 'Missing job_code' }, { status: 400 });

  try {
    const map  = await getJobMap();
    const v2Id = map[jobCode] ?? '';

    if (!v2Id) return NextResponse.json([]);

    const submissions = await fetchJobSubmissions(v2Id);

    const permissions = (client.permissions as Record<string, boolean>) ?? {};

    // Fetch applicant names in parallel (server-side, job_seeker_id never exposed to client)
    const showName = permissions.show_candidate_name !== false;
    const enriched = await Promise.all(submissions.map(async s => {
      const sub = { ...s };

      // Enrich with candidate name server-side based on permission
      if (showName && sub.job_seeker_id) {
        const name = await fetchApplicantName(String(sub.job_seeker_id));
        if (name) sub.candidate_name = name;
      }

      // Strip private fields — never expose to client
      delete sub.submitted_by;
      delete sub.tagged_by;
      delete sub.job_seeker_id;
      delete sub.merge_document_path;
      delete sub.merged_pdf_document;
      delete sub.selected_submission_documents;
      delete sub.Documents;
      if (!permissions.show_pay_rate)  { delete sub.pay_rate; }
      if (!permissions.show_tax_terms) { delete sub.tax_term; }

      return sub;
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
