import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import { industryCardImageKey, INDUSTRY_CARD_FALLBACK_IMAGES } from "@/lib/imageLocations";
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
  const [industries, siteImages] = await Promise.all([getIndustries(), getSiteImages()]);

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {industries.map((industry, index) => (
            <Link
              key={industry.slug}
              href={`/industries/${industry.slug}`}
              className="group overflow-hidden rounded-2xl border border-navy/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-mist dark:bg-navy-950">
                <Image
                  src={
                    siteImages[industryCardImageKey(industry.slug)] ??
                    INDUSTRY_CARD_FALLBACK_IMAGES[index % INDUSTRY_CARD_FALLBACK_IMAGES.length]
                  }
                  alt={`${industry.name} professionals placed by Mintex Staffing`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-5">
                <h2 className="font-heading text-base font-semibold text-navy dark:text-cream">{industry.name}</h2>
                <p className="mt-1.5 line-clamp-2 text-sm text-steel dark:text-steel-light">{industry.seoSubheading}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-steel group-hover:text-navy dark:text-steel-light dark:group-hover:text-cream">
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
