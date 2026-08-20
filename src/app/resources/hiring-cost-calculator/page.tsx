import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import HiringCostCalculator from "@/components/tools/HiringCostCalculator";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Hiring Cost Calculator",
  description:
    "See what your hiring actually costs per year today, and what Mintex takes off the table, across in-house hiring, staffing desks, and executive search.",
  path: "/resources/hiring-cost-calculator",
});

export default function HiringCostCalculatorPage() {
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">Hiring Cost Calculator</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          See what your hiring actually costs per year today, and what Mintex takes off the table, whether you hire
          in-house, run a staffing desk, or lead executive search.
        </p>
      </Section>

      <Section background="cream">
        <HiringCostCalculator />
      </Section>
    </>
  );
}



