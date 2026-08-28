import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import InterviewKitView from "@/components/tools/InterviewKitView";
import ResumeGapAnalysis from "@/components/tools/ResumeGapAnalysis";
import EmailKitButton from "@/components/tools/EmailKitButton";
import { loadKitBySlug, RateLimitError } from "@/lib/interviewKit/loadKit";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { getCachedJobs } from "@/lib/jobsCache";
import { isActiveJob, matchesRoleTitle } from "@/components/jobs/utils";
import { withTimeout } from "@/lib/withTimeout";
import type { CeipalJob } from "@/components/jobs/types";

const MAX_RELATED_JOBS = 3;

// The public, candidate-facing, INDEXED kit page — see implementation
// notes: this is what unlocks SEO for the tool at all. Server-rendered so
// crawlers see the full kit, not a blank shell waiting on client JS.
// Contrast with the private JD/CV path, which gets noindex + no persistent
// URL instead — ResumeGapAnalysis itself is client-rendered and never
// stores or indexes anything, so it's safe to drop into this indexed page.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = await loadKitBySlug(slug).catch(() => null);
  if (!kit) return {};

  return pageMetadata({
    title: `${kit.role.title} Interview Questions & Prep (${kit.region.state})`,
    description: `Free interview kit for ${kit.role.title} roles in ${kit.region.state}: competency map, scored practice questions, and your rights in ${kit.region.state}.`,
    path: `/interview-questions/${slug}`,
  });
}

export default async function InterviewKitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let kit;
  try {
    kit = await loadKitBySlug(slug);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return (
        <Section background="mist" className="!py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-navy dark:text-cream">Too many requests</h1>
          <p className="mt-3 text-navy/70 dark:text-cream/70">You&apos;ve hit a lot of kits in a short time — give it a few minutes and try again.</p>
        </Section>
      );
    }
    kit = null;
  }
  if (!kit) notFound();

  // Best-effort — a slow or failed jobs fetch should never break the kit
  // page itself, so this just falls back to hiding the section (see
  // InterviewKitView's relatedJobs prop) rather than surfacing an error.
  const { jobs } = await withTimeout(getCachedJobs(), 3000, {
    jobs: [] as unknown[],
    cachedAt: Date.now(),
    stale: true,
  });
  const relatedJobs = (jobs as CeipalJob[])
    .filter((job) => isActiveJob(job) && matchesRoleTitle(job, kit.role.title))
    .slice(0, MAX_RELATED_JOBS);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "AI Interview Question Generator", path: "/resources/ai-interview-generator" },
    { name: `${kit.role.title} Interview Questions`, path: `/interview-questions/${slug}` },
  ]);

  return (
    <>
      <script
        id="interview-kit-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <Link href="/resources/ai-interview-generator" className="text-sm font-medium text-navy/80 hover:text-navy dark:text-cream/80 dark:hover:text-cream">
          ← Generate another kit
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">
          {kit.role.title} Interview Questions
        </h1>
        <p className="mt-4 max-w-2xl text-navy/70 dark:text-cream/70">{kit.role.summary}</p>
        <div className="mt-5">
          <EmailKitButton kit={kit} slug={slug} />
        </div>
      </Section>

      <Section background="cream">
        <InterviewKitView kit={kit} roleSlug={slug} relatedJobs={relatedJobs} />
        <div className="mt-8">
          <ResumeGapAnalysis kit={kit} />
        </div>
        <p className="mt-8 text-sm text-navy/70 dark:text-cream/70">
          Hiring for this role?{" "}
          <Link href={`/hiring/${slug}-interview-guide`} className="font-semibold text-navy/80 hover:text-navy dark:text-cream/80 dark:hover:text-cream">
            Get the printable interviewer scorecard →
          </Link>
        </p>
      </Section>
    </>
  );
}
