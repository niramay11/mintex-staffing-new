import { getAllJobs, getAllPlacements } from "@/lib/data-cache";
import { getCachedJobs, isJobsCacheNearExpiry } from "@/lib/jobsCache";
import { warmPortalJobsCache } from "@/lib/portalJobsCache";
import { warmV2JobMapCache } from "@/lib/ceipal-job-map";
import { warmJobDescriptions } from "@/lib/jobDescriptionCache";
import { warmClientSubmissions } from "@/lib/ceipal-submissions";

// Every Ceipal-backed cache in this app is stored via unstable_cache (Next's
// Data Cache), which on Vercel persists across serverless invocations — but it
// only gets (re)computed when something actually calls it after the
// revalidate window has passed. Nothing on Vercel calls these on its own, so
// without an active warmer the FIRST real visitor after each ~5min window
// expires is the one stuck waiting on a slow, cold Ceipal pull. Call this from
// both the in-process best-effort poller (instrumentation.ts) and the
// externally-triggered /api/cron/warm-cache route (the one that actually runs
// reliably in production — see that route's comment for why).
export async function warmAllJobCaches(): Promise<void> {
  await Promise.all([
    getAllJobs(),
    getAllPlacements(),
    getCachedJobs(),
    warmPortalJobsCache(),
    // The client portal's submissions/job-details lookups depend on this
    // job_code → v2 id map — without warming it here it only gets rebuilt
    // whenever a real client request happens to land after it expires.
    warmV2JobMapCache(),
    // Keeps the newest job postings' descriptions warm so a real visitor
    // opening the job board almost never lands on a cold, live Ceipal call.
    warmJobDescriptions(),
    // Proactively warms Client Portal submission counts for every active
    // client's assigned jobs — without this, a client opening the portal
    // shortly after a deploy had to reload repeatedly while their own page
    // loads slowly filled the cache in job-by-job, often hitting Ceipal's
    // own slowdown under that many back-to-back requests along the way.
    warmClientSubmissions(),
  ]);
}

// Called via `after()` from real page views (see get-hired page/job-details
// page/api routes) so ordinary traffic itself keeps the cache warm ahead of
// its natural expiry — deliberately not gated behind an external cron/pinger.
// No-ops (cheap) when the jobs cache was refreshed recently; only pays the
// full warm-up cost when a visit happens to land within the last few minutes
// before that cache would otherwise expire.
export async function warmIfNearExpiry(): Promise<void> {
  if (!isJobsCacheNearExpiry()) return;
  try {
    await warmAllJobCaches();
  } catch (err) {
    console.error("[warmCaches] background warmIfNearExpiry failed:", err);
  }
}
