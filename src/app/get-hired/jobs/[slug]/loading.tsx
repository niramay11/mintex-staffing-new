import Section from "@/components/ui/Section";

// Next.js wraps page.tsx in a Suspense boundary using this file automatically.
// Job details page.tsx awaits a live Ceipal call on a cold cache (up to ~10-20s)
// with no boundary of its own — without this, that navigation just hangs blank.
export default function JobDetailsLoading() {
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="h-4 w-28 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
        <div className="mt-6 h-6 w-24 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-navy/10 dark:bg-white/10" />
        <div className="mt-6 flex flex-wrap gap-2.5">
          <div className="h-9 w-28 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
        </div>
        <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-navy/10 dark:bg-white/10" />
      </Section>

      <Section background="white">
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
      </Section>
    </>
  );
}
