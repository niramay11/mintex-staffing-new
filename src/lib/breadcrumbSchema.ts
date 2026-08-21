import { SITE_URL } from "@/lib/site";

export type BreadcrumbEntry = { name: string; path: string };

// Builds a schema.org BreadcrumbList (see https://schema.org/BreadcrumbList)
// from a simple ["Home", ...] chain — `path` is site-relative (e.g. "/about").
export function buildBreadcrumbSchema(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${SITE_URL}${entry.path}`,
    })),
  };
}
