import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import HiringCostCalculator from "@/components/tools/HiringCostCalculator";
import CostBreakdownPreview from "@/components/tools/CostBreakdownPreview";
import { HiringCostProvider } from "@/components/tools/HiringCostCalculatorContext";
import { getIndustries } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Hiring Cost Calculator",
  description:
    "Compare the true cost of hiring in-house against using Mintex, across direct, MSP Tier 1, and MSP Tier 2 engagements — onshore or offshore.",
  path: "/resources/hiring-cost-calculator",
});

export default async function HiringCostCalculatorPage() {
  const industries = await getIndustries();

  return (
    <HiringCostProvider>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Hiring Cost Calculator</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Add up everything that goes into filling a role in-house, then see it side by side with a
          Mintex engagement — direct, MSP Tier 1, or MSP Tier 2/franchise, onshore or offshore.
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
              Add up ad spend, recruiter time, vacancy cost, and ramp-up losses to see the full
              in-house picture — then compare it against a Mintex engagement tailored to your client
              type and delivery model.
            </p>
          </div>

          <CostBreakdownPreview />
        </div>
      </Section>

      <Section background="cream">
        <HiringCostCalculator industries={industries} />
      </Section>
    </HiringCostProvider>
  );
}
