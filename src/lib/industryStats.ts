import { unstable_cache, revalidateTag } from "next/cache";
import { supabase, supabaseAdmin } from "@/lib/supabase";

const BUCKET = "site-config";
const FILE = "industry-stats.json";
const CACHE_TAG = "industry-stats";
const CACHE_TTL_SECONDS = 60;

export type IndustryStat = { industry_slug: string; label: string; value: string };

// Numbers that were previously hardcoded in src/content/industries.ts — used as
// the starting point until an admin saves an override via the admin panel.
const DEFAULT_STATS: IndustryStat[] = [
  { industry_slug: "it-staffing", label: "IT placements made", value: "1,200+" },
  { industry_slug: "it-staffing", label: "Avg. time to fill", value: "9 days" },
  { industry_slug: "it-staffing", label: "12-month retention", value: "94%" },

  { industry_slug: "healthcare-staffing", label: "Healthcare placements", value: "2,400+" },
  { industry_slug: "healthcare-staffing", label: "Avg. time to fill", value: "11 days" },
  { industry_slug: "healthcare-staffing", label: "Credentialing accuracy", value: "100%" },

  { industry_slug: "engineering-staffing", label: "Engineering placements", value: "850+" },
  { industry_slug: "engineering-staffing", label: "Avg. time to fill", value: "14 days" },
  { industry_slug: "engineering-staffing", label: "Client satisfaction", value: "97%" },

  { industry_slug: "manufacturing-staffing", label: "Manufacturing placements", value: "1,600+" },
  { industry_slug: "manufacturing-staffing", label: "Avg. time to fill", value: "8 days" },
  { industry_slug: "manufacturing-staffing", label: "Safety-cleared candidates", value: "100%" },

  { industry_slug: "finance-staffing", label: "Finance placements", value: "1,050+" },
  { industry_slug: "finance-staffing", label: "Avg. time to fill", value: "10 days" },
  { industry_slug: "finance-staffing", label: "12-month retention", value: "95%" },

  { industry_slug: "administrative-staffing", label: "Administrative placements", value: "1,900+" },
  { industry_slug: "administrative-staffing", label: "Avg. time to fill", value: "6 days" },
  { industry_slug: "administrative-staffing", label: "Client satisfaction", value: "98%" },

  { industry_slug: "sales-staffing", label: "Sales placements", value: "1,400+" },
  { industry_slug: "sales-staffing", label: "Avg. time to fill", value: "12 days" },
  { industry_slug: "sales-staffing", label: "Quota-attaining hires", value: "89%" },

  { industry_slug: "customer-service-staffing", label: "CX placements", value: "2,100+" },
  { industry_slug: "customer-service-staffing", label: "Avg. time to fill", value: "7 days" },
  { industry_slug: "customer-service-staffing", label: "90-day retention", value: "92%" },

  { industry_slug: "logistics-staffing", label: "Logistics placements", value: "1,750+" },
  { industry_slug: "logistics-staffing", label: "Avg. time to fill", value: "5 days" },
  { industry_slug: "logistics-staffing", label: "Client satisfaction", value: "96%" },
];

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return null;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  return error;
}

async function fetchIndustryStats(): Promise<IndustryStat[]> {
  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(FILE);
  try {
    const res = await fetch(`${publicUrlData.publicUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return DEFAULT_STATS;
    const parsed = await res.json();
    return Array.isArray(parsed) ? parsed : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

// unstable_cache persists via Next's shared Data Cache rather than plain
// in-process memory — see the matching comment in siteImages.ts.
const getCachedIndustryStats = unstable_cache(fetchIndustryStats, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

export async function getIndustryStats(): Promise<IndustryStat[]> {
  return getCachedIndustryStats();
}

export function invalidateIndustryStatsCache() {
  revalidateTag(CACHE_TAG, "max");
}

export async function saveIndustryStats(stats: IndustryStat[]): Promise<{ error: string | null }> {
  const bucketError = await ensureBucket();
  if (bucketError) return { error: bucketError.message };

  const body = new Blob([JSON.stringify(stats)], { type: "application/json" });
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(FILE, body, {
    contentType: "application/json",
    upsert: true,
  });

  if (!error) invalidateIndustryStatsCache();
  return { error: error?.message ?? null };
}
