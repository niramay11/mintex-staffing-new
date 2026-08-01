import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Industry } from "@/content/types";

// Read on nearly every page (nav, footer, homepage, industry pages, sitemap),
// so this is cached the same way local-business-schema is — admin-managed,
// rarely changes, invalidated via revalidateTag from the admin API routes.
export const INDUSTRIES_CACHE_TAG = "industries";

export type IndustryRow = {
  id: string;
  slug: string;
  name: string;
  hero_title: string;
  seo_subheading: string;
  intro: string;
  sector_insight_title: string;
  sector_insight_body: string;
  work_style: string;
  job_keywords: string[];
  faqs: { question: string; answer: string }[];
  typical_roles: string;
  vetting_process: string;
  market_context: string;
  engagement_models: string;
  sort_order: number;
  stats: { label: string; value: string }[];
};

export function mapIndustryRow(row: IndustryRow): Industry {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    heroTitle: row.hero_title,
    seoSubheading: row.seo_subheading,
    intro: row.intro,
    sectorInsight: { title: row.sector_insight_title, body: row.sector_insight_body },
    workStyle: row.work_style,
    jobKeywords: row.job_keywords ?? [],
    faqs: row.faqs ?? [],
    typicalRoles: row.typical_roles,
    vettingProcess: row.vetting_process,
    marketContext: row.market_context,
    engagementModels: row.engagement_models,
    sortOrder: row.sort_order,
    stats: row.stats ?? [],
  };
}

const getCachedIndustries = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("industries")
      .select("*")
      .order("sort_order", { ascending: true });
    return (data ?? []) as IndustryRow[];
  },
  [INDUSTRIES_CACHE_TAG],
  { revalidate: 60 * 60, tags: [INDUSTRIES_CACHE_TAG] }
);

export async function getIndustries(): Promise<Industry[]> {
  const rows = await getCachedIndustries();
  return rows.map(mapIndustryRow);
}

export async function getIndustryBySlug(slug: string): Promise<Industry | undefined> {
  const all = await getIndustries();
  return all.find((industry) => industry.slug === slug);
}
