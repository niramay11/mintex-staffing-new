"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { demoteDescriptionHeadings, hasSubstantiveDescription, JOB_DESCRIPTION_PROSE_CLASS } from "@/components/jobs/utils";

// Server-side rendering already has a 2.5s budget for the live Ceipal
// description pull (see [slug]/page.tsx's loadDescription) — long enough to
// keep the page fast, but Ceipal's own measured 8-12s response time on a
// truly cold cache means that budget genuinely isn't enough sometimes,
// especially on rarely-visited older postings whose 24h description cache
// had days to go stale between visitors. Previously that meant no
// description at all until someone else happened to reload the page. This
// component picks up exactly that gap: rendered only when the server had
// nothing to show, it fetches the same data client-side with no fixed
// timeout, so the one visitor who hit the cold cache still sees the real
// description within a few seconds instead of a blank section.
export default function JobDescriptionLoader({ jobCode }: { jobCode: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // Set when Ceipal genuinely has content, but it's just a title pasted in
  // as a heading with nothing after it (see hasSubstantiveDescription) —
  // distinct from `failed` since retrying/reloading would return the exact
  // same thin content, not fix anything.
  const [thin, setThin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/jobs/description?job_code=${encodeURIComponent(jobCode)}`)
      .then((r) => r.json())
      .then((data: { public_job_description?: string; job_description?: string; error?: string }) => {
        if (cancelled) return;
        const desc = data.public_job_description || data.job_description || "";
        const demoted = desc ? demoteDescriptionHeadings(desc) : "";
        if (demoted && hasSubstantiveDescription(demoted)) setHtml(demoted);
        else if (demoted) setThin(true);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [jobCode]);

  if (html) {
    return <div className={JOB_DESCRIPTION_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (thin) {
    return (
      <p className="text-sm text-navy/60 dark:text-cream/60">
        A detailed description isn&apos;t available for this role yet — reach out to us or apply directly and we&apos;ll walk you through it.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="text-sm text-navy/60 dark:text-cream/60">
        We couldn&apos;t load the full description right now — please refresh in a moment, or{" "}
        <Link href="/get-hired/apply-to-jobs" className="font-medium text-steel underline dark:text-steel-light">
          browse other open roles
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="animate-pulse space-y-2.5" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading job description…</span>
      <div className="h-3.5 w-full rounded bg-navy/10 dark:bg-cream/10" />
      <div className="h-3.5 w-11/12 rounded bg-navy/10 dark:bg-cream/10" />
      <div className="h-3.5 w-4/5 rounded bg-navy/10 dark:bg-cream/10" />
    </div>
  );
}
