import { after } from "next/server";
import { getCachedJobs } from "@/lib/jobsCache";
import { withTimeout } from "@/lib/withTimeout";

// True while `next build` is prerendering pages. Anything slow or
// background-only (jobs lookups, cache warm-ups via `after`) must be skipped
// then — Next waits for `after` callbacks during a build, and a single page
// may not take longer than 60s.
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

// Jobs for a page that is cached (ISR, `export const revalidate`) instead of
// rendered on every request — those pages were flagged by Ahrefs as slow
// (0.6–1.5s before the first byte) because they were force-dynamic.
//
// - During `next build` this returns [] straight away: a cold jobs lookup can
//   take over a minute there, which blew Next's 60s per-page build limit. The
//   first background revalidation on the live site fills the real jobs in, and
//   /get-hired's JobBoard fetches /api/jobs client-side whenever it starts
//   empty, so visitors never see an empty board.
// - At runtime it waits at most `timeoutMs`; if the lookup is slower, the page
//   renders with [] (same client-side fallback) and `after` keeps the lookup
//   alive so it still finishes warming the jobs cache for the next render.
//   (revalidatePath can't be called from inside a cached render, so the
//   snapshot simply refreshes on its normal revalidate interval.)
export async function getJobsForCachedPage(timeoutMs = 3000): Promise<unknown[]> {
  if (isBuildPhase()) return [];

  const lookup = getCachedJobs();
  const TIMED_OUT = { jobs: [] as unknown[], cachedAt: 0, stale: true, timedOut: true };
  const result = await withTimeout(lookup, timeoutMs, TIMED_OUT);

  if ("timedOut" in result) {
    after(() =>
      lookup.then(
        () => undefined,
        (err) => console.error("[jobsForCachedPage] background jobs lookup failed:", err),
      ),
    );
  }
  return result.jobs;
}
