import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { getIndustries } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

export const metadata: Metadata = pageMetadata({
  title: "Industries We Serve",
  description:
    "Mintex Staffing places talent across IT, healthcare, engineering, manufacturing, finance, administrative, sales, customer service, logistics, and creative/design staffing.",
  path: "/industries",
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Industries", path: "/industries" },
]);

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <>
      <script
        id="industries-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">Industries We Serve</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Deep talent pools across every specialized sector we staff — deeper market insights and
          qualified candidates that match your standards and speed up hiring.
        </p>
      </Section>

      <Section background="white">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group rounded-2xl border border-navy/[0.08] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900"
            >
              <h2 className="font-heading text-lg font-semibold text-navy dark:text-cream">{industry.name}</h2>
              <p className="mt-2 text-sm text-steel dark:text-steel-light">{industry.seoSubheading}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-steel group-hover:text-navy dark:text-steel-light dark:group-hover:text-cream">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
