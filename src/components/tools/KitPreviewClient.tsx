"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InterviewKitView from "@/components/tools/InterviewKitView";
import ResumeGapAnalysis from "@/components/tools/ResumeGapAnalysis";
import EmailKitButton from "@/components/tools/EmailKitButton";
import type { InterviewKit } from "@/lib/interviewKit/schema";
import type { CeipalJob } from "@/components/jobs/types";
import { isActiveJob, matchesRoleTitle } from "@/components/jobs/utils";

export const JD_KIT_STORAGE_KEY = "mintex-jd-kit-preview";

const MAX_RELATED_JOBS = 3;

type JdContext = { mustHaveSkills?: string[]; namedTools?: string[] };
type StoredKit = { kit: InterviewKit; jdContext?: JdContext };

// Mirrors components/ui/Section's wrapper classes for the "mist"/"cream"
// backgrounds without importing it — Section is an async SERVER component
// (it fetches a decorative background image from Supabase), which can't be
// bundled into this client component. Same layout, minus that one
// decorative flourish.
function PreviewSection({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={`relative mx-auto max-w-[1920px] overflow-hidden border-t border-navy/[0.06] bg-mist px-6 py-16 dark:border-white/[0.08] dark:bg-navy-900 sm:px-10 sm:py-20 lg:px-16 lg:py-24 ${className}`}
    >
      <div className="relative">{children}</div>
    </section>
  );
}

// This page exists purely so the JD-paste path gets its own results page,
// matching the by-title flow's UX — same hero + content Section layout as
// /interview-questions/[slug] — but a pasted JD has no deterministic slug
// (it's arbitrary free text, and it shouldn't sit on a shareable URL
// anyway), so there is no server-side storage or cache entry backing this
// route. The kit is held in sessionStorage on the client only: it survives
// a refresh in this tab, but never touches a server, is never indexed, and
// disappears the moment the tab closes — private by construction, not by
// an expiry timer someone has to remember to enforce.
export default function KitPreviewClient() {
  const [stored, setStored] = useState<StoredKit | null | undefined>(undefined);
  // undefined (not []) until the fetch below resolves, so the section stays
  // hidden while loading instead of flashing a "no roles" message that then
  // flips to real matches a moment later.
  const [relatedJobs, setRelatedJobs] = useState<CeipalJob[] | undefined>(undefined);

  useEffect(() => {
    // sessionStorage is only reachable client-side, so this has to run
    // after mount rather than in a lazy useState initializer — computing it
    // during render would make the server-rendered HTML (which has no
    // sessionStorage) mismatch the client's first render, which is worse
    // than the one extra render this costs.
    try {
      const raw = sessionStorage.getItem(JD_KIT_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStored(raw ? (JSON.parse(raw) as StoredKit) : null);
    } catch {
      setStored(null);
    }
  }, []);

  // No server round-trip backs this page (see the file comment), so unlike
  // the indexed /interview-questions/[slug] page this can't fetch jobs
  // server-side — falls back to the same public jobs list JobBoard already
  // fetches client-side, filtered down to this kit's role.
  useEffect(() => {
    if (!stored) return;
    let cancelled = false;
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data: { results?: CeipalJob[] }) => {
        if (cancelled) return;
        const matched = (data.results ?? [])
          .filter((job) => isActiveJob(job) && matchesRoleTitle(job, stored.kit.role.title))
          .slice(0, MAX_RELATED_JOBS);
        setRelatedJobs(matched);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [stored]);

  if (stored === undefined) return null;

  if (!stored) {
    return (
      <PreviewSection className="!py-12 sm:!py-14 lg:!py-16">
        <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900">
          <p className="text-navy/70 dark:text-cream/70">
            This preview isn&apos;t available — it only lives in this browser tab and doesn&apos;t survive being
            reopened elsewhere.
          </p>
          <Link href="/resources/ai-interview-generator" className="mt-3 inline-block font-semibold text-navy/80 hover:text-navy dark:text-cream/80 dark:hover:text-cream">
            Generate a new kit →
          </Link>
        </div>
      </PreviewSection>
    );
  }

  const { kit, jdContext } = stored;

  return (
    <>
      <PreviewSection className="!py-12 sm:!py-14 lg:!py-16">
        <Link href="/resources/ai-interview-generator" className="text-sm font-medium text-navy/80 hover:text-navy dark:text-cream/80 dark:hover:text-cream">
          ← Generate another kit
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">
          {kit.role.title} Interview Questions
        </h1>
        <p className="mt-4 max-w-2xl text-navy/70 dark:text-cream/70">{kit.role.summary}</p>
        <div className="mt-5">
          <EmailKitButton kit={kit} />
        </div>
      </PreviewSection>

      <PreviewSection>
        <p className="mb-6 rounded-xl bg-steel/10 px-4 py-3 text-sm text-navy/70 dark:text-cream/70">
          Generated from your pasted job posting — grounded in the tools and requirements it actually named, not
          guessed. This isn&apos;t saved on our servers; it disappears once you close this tab.
        </p>
        <InterviewKitView kit={kit} path="jd" relatedJobs={relatedJobs} />
        <div className="mt-8">
          <ResumeGapAnalysis kit={kit} jdContext={jdContext} />
        </div>
      </PreviewSection>
    </>
  );
}
