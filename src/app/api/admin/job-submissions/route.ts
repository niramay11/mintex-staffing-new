import { NextResponse } from 'next/server';
import { fetchJobSubmissions } from '@/lib/ceipal-submissions';

export async function GET(req: import('next/server').NextRequest) {
  const jobId = new URL(req.url).searchParams.get('job_id');
  if (!jobId) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });

  try {
    // Same retry-protected fetch the portal routes use — this used to call
    // Ceipal directly with no retry, meaning one slow/transient response
    // here looked identical to "this job has no submissions."
    const list = await fetchJobSubmissions(jobId);
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
