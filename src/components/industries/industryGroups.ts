// Sector groups used by the /industries filter sidebar. Industries are
// admin-managed rows with no category field of their own, so the grouping
// lives here, keyed by slug; any industry added later without an entry
// falls into "Other" (only shown when something is actually in it).
export const INDUSTRY_GROUPS = [
  "Technology & Creative",
  "Healthcare",
  "Engineering & Industrial",
  "Business & Finance",
  "Sales & Service",
] as const;

export const OTHER_GROUP = "Other";

const GROUP_BY_SLUG: Record<string, (typeof INDUSTRY_GROUPS)[number]> = {
  "it-staffing": "Technology & Creative",
  "creative-design-staffing": "Technology & Creative",
  "healthcare-staffing": "Healthcare",
  "engineering-staffing": "Engineering & Industrial",
  "manufacturing-staffing": "Engineering & Industrial",
  "logistics-staffing": "Engineering & Industrial",
  "finance-staffing": "Business & Finance",
  "legal-staffing": "Business & Finance",
  "administrative-staffing": "Business & Finance",
  "sales-staffing": "Sales & Service",
  "customer-service-staffing": "Sales & Service",
  "hospitality-staffing": "Sales & Service",
};

export function industryGroup(slug: string): string {
  return GROUP_BY_SLUG[slug] ?? OTHER_GROUP;
}

// Plain, serializable shape passed from the server page to the client
// components (the full Industry row carries far more than these need).
export type IndustryListItem = {
  slug: string;
  name: string;
  headline: string;
  description: string;
  stat: string | null;
  group: string;
  imageSrc: string;
};
