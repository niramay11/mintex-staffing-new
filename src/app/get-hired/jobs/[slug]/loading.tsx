"use client";

import { useEffect, useState } from "react";

// Next.js wraps page.tsx in a Suspense boundary using this file automatically.
// Job details page.tsx awaits a live Ceipal call on a cold cache (up to ~10-20s)
// with no boundary of its own — without this, that navigation just hangs blank.
// The vast majority of the time this resolves in under a second (warm cache),
// so the message below only appears if it's genuinely taking a while — e.g. a
// job that was posted moments ago and hasn't been background-warmed yet.
//
// This can't use the shared <Section> component — it's an async Server
// Component (fetches site images), and Server Components can't be imported
// into a "use client" file. The classes below just mirror Section's own
// background/spacing styles directly instead.
export default function JobDetailsLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="relative mx-auto max-w-[1920px] overflow-hidden border-t border-navy/[0.06] bg-mist px-6 py-12 dark:border-white/[0.08] dark:bg-navy-900 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div className="relative">
          <div className="flex items-center gap-2.5 text-sm font-medium text-navy/50 dark:text-cream/50">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy/20 border-t-steel dark:border-white/20 dark:border-t-steel-light" />
            {slow ? "Just a moment — this role may have just gone live, fetching the latest details…" : "Loading job details…"}
          </div>

          <div className="mt-6 h-4 w-28 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
          <div className="mt-6 h-6 w-24 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
          <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
          <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
          <div className="mt-6 flex flex-wrap gap-2.5">
            <div className="h-9 w-28 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
            <div className="h-9 w-24 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
          </div>
          <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
        </div>
      </section>

      <section className="relative mx-auto max-w-[1920px] overflow-hidden border-t border-navy/[0.06] bg-white px-6 py-16 dark:border-white/[0.08] dark:bg-navy-900 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="relative">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-10">
            <div className="rounded-2xl border border-navy/[0.08] bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-navy-900">
              <div className="h-3 w-16 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                <div className="h-6 w-20 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
              </div>
              <div className="mt-8 h-3 w-32 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
              <div className="mt-4 space-y-3">
                <div className="h-3.5 w-full animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                <div className="h-3.5 w-full animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                <div className="h-3.5 w-5/6 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                <div className="h-3.5 w-full animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
              </div>
            </div>

            <aside className="mt-6 lg:mt-0">
              <div className="rounded-2xl border border-navy/[0.08] bg-white p-6 dark:border-white/10 dark:bg-navy-900">
                <div className="h-3.5 w-32 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                <div className="mt-4 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
                      <div className="min-w-0 flex-1">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                        <div className="mt-2 h-3.5 w-24 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-navy/10 pt-5 dark:border-white/10">
                  <div className="h-11 w-full animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
