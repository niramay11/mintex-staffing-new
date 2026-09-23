import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { US_STATES } from "@/lib/interviewKit/schema";
import { stateToSlug } from "@/lib/interviewKit/legalRights";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

function IconPin({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

// The hub page for the /interview-rights/[state] set — without this, none
// of those 50 pages had a single internal link pointing at them (they were
// only ever linked incidentally from a generated interview kit for that
// exact state), which is exactly what shows up as "orphan page" in an SEO
// audit. Linked from the footer on every page, so both this page and the
// full state set it fans out to are reachable site-wide.
export const metadata: Metadata = pageMetadata({
  title: "Interview Rights by State",
  description: "What employers legally cannot ask in a job interview, broken down by state — illegal questions, lawful alternatives, and your rights.",
  path: "/interview-rights",
});

export default function InterviewRightsIndexPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Interview Rights by State", path: "/interview-rights" },
  ]);

  const sortedStates = [...US_STATES].sort((a, b) => a.localeCompare(b));

  return (
    <>
      <script
        id="interview-rights-index-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">Interview Rights by State</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          What an employer legally cannot ask you in a job interview varies by state. Pick your state for the full
          breakdown of illegal questions, what to say if you&apos;re asked anyway, and the lawful way for hiring
          managers to ask instead.
        </p>
      </Section>

      <Section background="cream">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sortedStates.map((state) => (
            <li key={state}>
              <Link
                href={`/interview-rights/${stateToSlug(state)}`}
                className="group flex items-center gap-2.5 rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm font-medium text-navy transition-all duration-200 hover:-translate-y-0.5 hover:border-steel/50 hover:shadow-[0_12px_28px_-14px_rgba(0,48,96,0.35)] dark:border-white/10 dark:bg-navy-900 dark:text-cream"
              >
                <IconPin className="h-4 w-4 shrink-0 text-steel/70 dark:text-steel-light/70" />
                <span className="flex-1 truncate">{state}</span>
                <IconArrow className="h-3.5 w-3.5 shrink-0 text-navy/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-steel dark:text-cream/30" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
