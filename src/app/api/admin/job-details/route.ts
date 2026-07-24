import { NextResponse } from 'next/server';
import { ceipalFetch } from '@/lib/ceipal';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchDetails(id: string) {
  const res = await ceipalFetch(`https://api.ceipal.com/v2/getJobPostingDetails/${id}/`);
  if (!res.ok) return { ok: false as const, status: res.status, body: await res.text().catch(() => '') };
  return { ok: true as const, data: await res.json() };
}

export async function GET(req: import('next/server').NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    // One retry before giving up — Ceipal has been measured taking 8-12+
    // seconds even for a normal response, so a single transient failure
    // doesn't mean the job's details are actually unavailable.
    let result = await fetchDetails(id);
    if (!result.ok) {
      await sleep(800);
      result = await fetchDetails(id);
    }

    if (!result.ok) {
      console.error('[job-details] CEIPAL error', result.status, result.body);
      return NextResponse.json({ error: `CEIPAL ${result.status}`, detail: result.body }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[job-details] error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
