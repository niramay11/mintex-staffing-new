import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import HiringCostCalculator from "@/components/tools/HiringCostCalculator";
import CostBreakdownPreview from "@/components/tools/CostBreakdownPreview";
import { HiringCostProvider } from "@/components/tools/HiringCostCalculatorContext";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Hiring Cost Calculator",
  description:
    "Break down the true cost of filling a role — job posting, interviews, onboarding, vacancy and ramp-up cost — then compare hiring methods including Mintex Staffing side by side.",
  path: "/resources/hiring-cost-calculator",
});

export default function HiringCostCalculatorPage() {
  return (
    <HiringCostProvider>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">Hiring Cost Calculator</h1>
        <p className="mt-4 max-w-2xl text-steel">
          Add up everything that goes into filling a role in-house  job posting, interview time,
          onboarding, vacancy and ramp-up cost  then compare it against a Mintex Staffing engagement
          and other hiring methods, by industry and seniority.
        </p>
      </Section>

      <Section background="white">
        <div className="mx-auto grid w-full items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70">
              <span className="h-[7px] w-[7px] rounded-full bg-steel" />
              Budget Clarity
            </div>
            <h2 className="mt-5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[40px]">
              Know your true cost of hire before you spend a cent
            </h2>
            <p className="mt-4 max-w-md text-lg text-steel">
              Add up job posting spend, interview time, onboarding, vacancy cost, and ramp-up losses to
              see the full in-house picture  then compare it against Mintex and other hiring methods.
            </p>
          </div>

          <div className="lg:mt-14">
            <CostBreakdownPreview />
          </div>
        </div>
      </Section>

      <Section background="cream">
        <HiringCostCalculator />
      </Section>
    </HiringCostProvider>
  );
}



