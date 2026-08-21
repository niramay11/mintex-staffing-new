import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import InsightsListing from "@/components/insights/InsightsListing";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

export const metadata: Metadata = pageMetadata({
  title: "Insights",
  description: "Career insights, job market insights, and ongoing hiring trends from Mintex Staffing.",
  path: "/insights",
});

export const revalidate = 60;

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Insights", path: "/insights" },
]);

export default function InsightsPage() {
  return (
    <>
      <script
        id="insights-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">Insights</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Career advice, job market data, and ongoing hiring trends from our research team.
        </p>
      </Section>

      <InsightsListing activeCategory="all" />
    </>
  );
}
