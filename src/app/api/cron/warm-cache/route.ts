import { NextResponse } from "next/server";
import { warmAllJobCaches } from "@/lib/warmCaches";
import { checkForNewJobsAndNotify } from "@/lib/jobAlertNotifier";

export const maxDuration = 60;

// Proactively refreshes every Ceipal cache (jobs, placements, portal jobs)
// BEFORE their revalidate window lapses, so a real visitor's request never
// lands on an expired entry and has to wait out a live Ceipal pull (observed
// up to ~40s-2min cold — see src/lib/jobsCache.ts). Also runs the new-job-alert
// check, for the same reason (see below).
//
// Both of these MUST run inside a real request — Next's unstable_cache throws
// "incrementalCache missing" when called from a bare background timer with no
// request context, which is exactly what src/instrumentation.ts used to do.
// A route handler is a real request, so this is the correct home for both.
//
// An external scheduler hitting this route every ~4 minutes is what actually
// keeps things warm in production — set one up with Vercel Cron (vercel.json)
// if your plan allows sub-daily crons, or a free external pinger like
// cron-job.org otherwise. Either way it just calls this URL — no database
// involved. Real visitor traffic is still a fallback in the meantime: any
// request that lands on an expired cache will fetch fresh data itself.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const provided = auth === `Bearer ${secret}` ? secret : url.searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    await warmAllJobCaches();
    await checkForNewJobsAndNotify().catch((err) => {
      console.error("[cron/warm-cache] job-alert check failed:", err);
    });
    return NextResponse.json({ ok: true, warmedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/warm-cache] failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
