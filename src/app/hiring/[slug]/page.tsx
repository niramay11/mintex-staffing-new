import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import InterviewKitView from "@/components/tools/InterviewKitView";
import { loadKitBySlug, RateLimitError } from "@/lib/interviewKit/loadKit";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

// Employer-facing counterpart to /interview-questions/[slug] — same slug,
// same cached kit (see implementation notes: "candidate: probe visible ...
// employer: strongAnswer visible").
// The URL param carries the literal "-interview-guide" suffix so the
// public-facing path reads as /hiring/senior-react-developer...-interview-
// guide; we strip it back off before decoding the underlying kit slug.
const SUFFIX = "-interview-guide";

function stripSuffix(rawSlug: string): string | null {
  return rawSlug.endsWith(SUFFIX) ? rawSlug.slice(0, -SUFFIX.length) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const kitSlug = stripSuffix(rawSlug);
  if (!kitSlug) return {};
  const kit = await loadKitBySlug(kitSlug).catch(() => null);
  if (!kit) return {};

  return pageMetadata({
    title: `${kit.role.title} Interview Guide for Employers (${kit.region.state})`,
    description: `Printable interview guide for hiring a ${kit.role.title} in ${kit.region.state}: question bank, what a strong answer looks like, and lawful phrasing for ${kit.region.state} compliance.`,
    path: `/hiring/${rawSlug}`,
  });
}

export default async function EmployerKitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const kitSlug = stripSuffix(rawSlug);
  if (!kitSlug) notFound();

  let kit;
  try {
    kit = await loadKitBySlug(kitSlug);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return (
        <Section background="mist" className="!py-16 text-center">
          <h1 className="font-heading text-2xl font-bold text-navy dark:text-cream">Too many requests</h1>
          <p className="mt-3 text-steel dark:text-steel-light">You&apos;ve hit a lot of guides in a short time — give it a few minutes and try again.</p>
        </Section>
      );
    }
    kit = null;
  }
  if (!kit) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "AI Interview Question Generator", path: "/resources/ai-interview-generator" },
    { name: `${kit.role.title} Interview Guide for Employers`, path: `/hiring/${rawSlug}` },
  ]);

  return (
    <>
      <script
        id="employer-kit-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16 print:hidden">
        <Link href="/resources/ai-interview-generator" className="text-sm font-medium text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
          ← Build another guide
        </Link>
        <h1 className="mt-3 font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">
          {kit.role.title} — Interviewer Guide
        </h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Printable question bank and scorecard for hiring a {kit.role.title} in {kit.region.state}. Score each
          candidate live, or print this page beforehand.
        </p>
      </Section>

      <Section background="cream">
        <InterviewKitView kit={kit} view="employer" />
        <p className="mt-8 text-sm text-navy/50 dark:text-cream/50 print:hidden">
          Looking to fill this role faster?{" "}
          <Link href="/contact" className="font-medium text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
            Talk to Mintex Staffing →
          </Link>
        </p>
      </Section>
    </>
  );
}
