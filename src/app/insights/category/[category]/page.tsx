import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import InsightsListing, { getInsightCategories } from "@/components/insights/InsightsListing";
import { pageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

// Required for `revalidate` to take effect on a dynamic [param] route in
// this Next version — without generateStaticParams the page silently renders
// on every request (Ahrefs flagged posts as "slow page", ~1-1.6s TTFB, served
// no-store). An empty list = on-demand ISR: each page is rendered on its first
// request, then cached. Admin publish/edit/delete already calls
// revalidatePath for the affected pages, so changes still show immediately.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getInsightCategories();
  const match = categories.find((c) => c.slug === category);
  if (!match) return {};

  // Every post lives on /insights (the category is just a filter there), so
  // this page is a duplicate of it: canonical points to /insights and it is
  // kept out of the index. It stays reachable for old links, and is no longer
  // listed in the sitemap (Ahrefs flagged it as an orphan page there).
  return {
    ...pageMetadata({
      title: `${match.label} | Insights`,
      description: `${match.label} articles and advice from Mintex Staffing, covering practical guidance for job seekers and employers.`,
      path: "/insights",
    }),
    robots: { index: false, follow: true },
  };
}

export default async function InsightCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = await getInsightCategories();
  const match = categories.find((c) => c.slug === category);
  if (!match) notFound();

  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">{match.label}</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Career advice, job market data, and ongoing hiring trends from our research team.
        </p>
      </Section>

      <InsightsListing activeCategory={match.slug} />
    </>
  );
}
