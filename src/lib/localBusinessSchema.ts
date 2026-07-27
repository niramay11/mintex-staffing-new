import { supabase } from "@/lib/supabase";
import { SITE_URL, BUSINESS } from "@/lib/site";

export async function getLocalBusinessSchema() {
  const { data: socialLinks } = await supabase.from("social_links").select("url");

  return {
    "@context": "https://schema.org",
    "@type": "EmploymentAgency",
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    ...(socialLinks && socialLinks.length > 0
      ? { sameAs: socialLinks.map((link) => link.url) }
      : {}),
  };
}
