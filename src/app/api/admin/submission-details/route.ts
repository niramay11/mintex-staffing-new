import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

export async function GET(req: import('next/server').NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const res = await ceipalFetch(
      `https://api.ceipal.com/v2/getSubmissionDetails/${encodeURIComponent(id)}/`
    );
    if (!res.ok) return NextResponse.json({ error: `CEIPAL ${res.status}` }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
