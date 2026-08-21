import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import HiringCostCalculator from "@/components/tools/HiringCostCalculator";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Hiring Cost Calculator",
  description:
    "See what your hiring actually costs per year today, and what Mintex takes off the table, across in-house hiring, staffing desks, and executive search.",
  path: "/resources/hiring-cost-calculator",
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Resources", path: "/resources" },
  { name: "Hiring Cost Calculator", path: "/resources/hiring-cost-calculator" },
]);

// schema.org/SoftwareApplication for Google's rich-result eligibility. No
// aggregateRating: that field requires real, user-submitted ratings — this
// tool doesn't collect any, and fabricating one risks a manual Google penalty.
const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hiring Cost Calculator",
  url: `${SITE_URL}/resources/hiring-cost-calculator`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web-based)",
  description:
    "Free calculator that estimates true cost-per-hire across in-house hiring, staffing desks, and executive search.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function HiringCostCalculatorPage() {
  return (
    <>
      <script
        id="hiring-cost-calculator-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="hiring-cost-calculator-software-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
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



