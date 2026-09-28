import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import FeaturedIndustries from "@/components/industries/FeaturedIndustries";
import IndustriesExplorer from "@/components/industries/IndustriesExplorer";
import { industryGroup, type IndustryListItem } from "@/components/industries/industryGroups";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import { industryCardImageKey, INDUSTRY_CARD_FALLBACK_IMAGES, FEATURED_INDUSTRY_COUNT } from "@/lib/imageLocations";
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

  const items: IndustryListItem[] = industries.map((industry, index) => {
    const stat = industry.stats[0];
    return {
      slug: industry.slug,
      name: industry.name,
      headline: industry.heroTitle || industry.name,
      description: industry.seoSubheading,
      // "1,600+ Manufacturing placements" -> "1,600+ placements" so the card's
      // small top label stays on one line; labels without "placement" are
      // kept whole.
      stat: stat ? (/placement/i.test(stat.label) ? `${stat.value} placements` : `${stat.value} ${stat.label}`) : null,
      group: industryGroup(industry.slug),
      imageSrc:
        siteImages[industryCardImageKey(industry.slug)] ??
        INDUSTRY_CARD_FALLBACK_IMAGES[index % INDUSTRY_CARD_FALLBACK_IMAGES.length],
    };
  });

  return (
    <>
      <script
        id="industries-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="white" className="!border-t-0 !pb-0 !pt-6 sm:!pt-8">
        <FeaturedIndustries items={items.slice(0, FEATURED_INDUSTRY_COUNT)} />
      </Section>

      {/* overflow-visible: Section clips by default, which breaks the
          sidebar's position: sticky. */}
      <Section background="white" className="!overflow-visible !border-t-0 !pt-12 sm:!pt-16">
        <IndustriesExplorer items={items} />
      </Section>
    </>
  );
}
