"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InterviewKitView from "@/components/tools/InterviewKitView";
import ResumeGapAnalysis from "@/components/tools/ResumeGapAnalysis";
import type { InterviewKit } from "@/lib/interviewKit/schema";

export const JD_KIT_STORAGE_KEY = "mintex-jd-kit-preview";

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

  if (stored === undefined) return null;

  if (!stored) {
    return (
      <PreviewSection className="!py-12 sm:!py-14 lg:!py-16">
        <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900">
          <p className="text-navy/70 dark:text-cream/70">
            This preview isn&apos;t available — it only lives in this browser tab and doesn&apos;t survive being
            reopened elsewhere.
          </p>
          <Link href="/resources/ai-interview-generator" className="mt-3 inline-block font-medium text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
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
        <Link href="/resources/ai-interview-generator" className="text-sm font-medium text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
          ← Generate another kit
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">
          {kit.role.title} Interview Questions
        </h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">{kit.role.summary}</p>
      </PreviewSection>

      <PreviewSection>
        <p className="mb-6 rounded-xl bg-steel/10 px-4 py-3 text-sm text-navy/70 dark:text-cream/70">
          Generated from your pasted job posting — grounded in the tools and requirements it actually named, not
          guessed. This isn&apos;t saved on our servers; it disappears once you close this tab.
        </p>
        <InterviewKitView kit={kit} path="jd" />
        <div className="mt-8">
          <ResumeGapAnalysis kit={kit} jdContext={jdContext} />
        </div>
      </PreviewSection>
    </>
  );
}
