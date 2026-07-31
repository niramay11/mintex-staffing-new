import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { SITE_URL, BUSINESS } from "@/lib/site";

// Called from the root layout, so this runs on every single page request —
// social links are admin-managed and rarely change, so there's no reason to
// hit Supabase live on every visitor. Cache tag is invalidated by
// /api/social-links's PUT handler whenever an admin actually updates them.
const CACHE_TAG = "local-business-schema";

const getCachedSocialLinks = unstable_cache(
  async () => {
    const { data } = await supabase.from("social_links").select("url");
    return data ?? [];
  },
  [CACHE_TAG],
  { revalidate: 60 * 60, tags: [CACHE_TAG] }
);

export async function getLocalBusinessSchema() {
  const socialLinks = await getCachedSocialLinks();

  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
    image: `${SITE_URL}/logo-navy.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    ...(socialLinks && socialLinks.length > 0
      ? { sameAs: socialLinks.map((link) => link.url) }
      : {}),
  };
}
