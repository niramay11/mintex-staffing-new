import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import HiringCostCalculator from "@/components/tools/HiringCostCalculator";
import CostBreakdownPreview from "@/components/tools/CostBreakdownPreview";
import { HiringCostProvider } from "@/components/tools/HiringCostCalculatorContext";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Hiring Cost Calculator",
  description: "Estimate your true cost-per-hire across ad spend, agency fees, and internal time.",
  path: "/resources/hiring-cost-calculator",
});

export default function HiringCostCalculatorPage() {
  return (
    <HiringCostProvider>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Hiring Cost Calculator</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Add up everything that goes into filling a role to see your true cost per hire.
        </p>
      </Section>

      <Section background="cream">
        <div className="mx-auto grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70">
              <span className="h-[7px] w-[7px] rounded-full bg-tan" />
              Budget Clarity
            </div>
            <h2 className="mt-5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[40px]">
              Know your true cost of hire before you spend a cent
            </h2>
            <p className="mt-4 max-w-md text-lg text-steel">
              Add up ad spend, agency fees, recruiter time, and onboarding costs to see the full
              picture — then use it to build a hiring budget that actually holds up.
            </p>
          </div>

          <CostBreakdownPreview />
        </div>
      </Section>

      <Section background="cream">
        <HiringCostCalculator />
      </Section>
    </HiringCostProvider>
  );
}
