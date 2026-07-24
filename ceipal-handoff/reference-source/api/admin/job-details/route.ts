import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

export async function GET(req: import('next/server').NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    // Try v2 endpoint with v1 token
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getJobPostingDetails/${id}/`
    );

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[job-details] CEIPAL error', res.status, body);
      return NextResponse.json({ error: `CEIPAL ${res.status}`, detail: body }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[job-details] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
