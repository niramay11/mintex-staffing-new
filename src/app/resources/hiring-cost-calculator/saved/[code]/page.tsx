import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Section from "@/components/ui/Section";
import CalculatorBreakdownView from "@/components/tools/CalculatorBreakdownView";
import { getCalculatorResultByCode } from "@/lib/calculatorSaves";

// One person's saved numbers, looked up live by their short code — never
// indexed, and never statically generated (no generateStaticParams), since
// there's no fixed set of codes to prerender and each one must reflect
// whatever is in the database right now.
export const metadata: Metadata = {
  title: "Your Saved Hiring Cost Breakdown | Mintex Staffing",
  robots: { index: false, follow: false },
};

export default async function SavedCalculatorResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = await getCalculatorResultByCode(code.toUpperCase());
  if (!result) notFound();

  return (
    <Section background="cream" className="!py-12 sm:!py-14 lg:!py-16">
      <div className="mx-auto max-w-2xl">
        <CalculatorBreakdownView
          heading={result.heading}
          headlineLabel={result.headlineLabel}
          headlineValue={result.headlineValue}
          lines={result.lines}
        />
        <Link
          href="/resources/hiring-cost-calculator"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
        >
          Run a new calculation
        </Link>
      </div>
    </Section>
  );
}
