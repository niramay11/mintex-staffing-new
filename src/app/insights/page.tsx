import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import InsightsListing from "@/components/insights/InsightsListing";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Insights",
  description: "Career insights, job market insights, and ongoing hiring trends from Mintex Staffing.",
  path: "/insights",
});

export const revalidate = 60;

export default function InsightsPage() {
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">Insights</h1>
        <p className="mt-4 max-w-2xl text-steel">
          Career advice, job market data, and ongoing hiring trends from our research team.
        </p>
      </Section>

      <InsightsListing activeCategory="all" />
    </>
  );
}
