import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

export async function GET(req: import('next/server').NextRequest) {
  const jobId = new URL(req.url).searchParams.get('job_id');
  if (!jobId) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });

  try {
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getSubmissionsList?jobId=${encodeURIComponent(jobId)}`
    );
    if (!res.ok) return NextResponse.json({ error: `CEIPAL ${res.status}` }, { status: res.status });
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
