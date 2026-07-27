import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import InsightsListing, { getInsightCategories } from "@/components/insights/InsightsListing";
import { pageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getInsightCategories();
  const match = categories.find((c) => c.slug === category);
  if (!match) return {};

  return pageMetadata({
    title: `${match.label} | Insights`,
    description: `${match.label} articles from Mintex Staffing.`,
    path: `/insights/category/${match.slug}`,
  });
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
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">{match.label}</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Career advice, job market data, and ongoing hiring trends from our research team.
        </p>
      </Section>

      <InsightsListing activeCategory={match.slug} />
    </>
  );
}
