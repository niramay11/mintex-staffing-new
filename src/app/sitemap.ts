import type { MetadataRoute } from "next";
import { industries } from "@/content/industries";
import { hiringServices } from "@/content/hiringServices";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";
import { getCachedJobs } from "@/lib/jobsCache";
import { isActiveJob } from "@/components/jobs/utils";
import type { CeipalJob } from "@/components/jobs/types";

// Without this, Next tries to statically prerender the sitemap at build
// time — same problem /get-hired's own page.tsx already forces dynamic to
// avoid: a cold/unreachable Ceipal fetch would hang the build itself instead
// of just this route resolving slowly on the next real request.
export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

const staticRoutes = [
  "",
  "/get-hired",
  "/get-hired/apply-to-jobs",
  "/get-hired/interview-prep",
  "/get-hired/share-resume",
  "/seek-talent",
  "/seek-talent/how-we-work",
  "/resources",
  "/resources/hiring-cost-calculator",
  "/resources/ai-interview-generator",
  "/insights",
  "/about",
  "/case-studies",
  "/contact",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  const industryEntries = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry.slug}`,
    lastModified: new Date(),
  }));

  const hiringServiceEntries = hiringServices.map((service) => ({
    url: `${baseUrl}/seek-talent/${service.slug}`,
    lastModified: new Date(),
  }));

  const { data: insightPosts } = await supabase.from("insights").select("slug, published_at");
  const insightEntries = (insightPosts ?? []).map((post) => ({
    url: `${baseUrl}/insights/post/${post.slug}`,
    lastModified: new Date(post.published_at),
  }));

  const { data: insightCategories } = await supabase.from("insight_categories").select("slug");
  const insightCategoryEntries = (insightCategories ?? []).map((category) => ({
    url: `${baseUrl}/insights/category/${category.slug}`,
    lastModified: new Date(),
  }));

  const { jobs } = await getCachedJobs();
  const jobEntries = (jobs as CeipalJob[]).filter(isActiveJob).map((job) => ({
    url: `${baseUrl}/get-hired/jobs/${encodeURIComponent(job.job_code)}`,
    lastModified: new Date(),
  }));

  return [
    ...staticEntries,
    ...industryEntries,
    ...hiringServiceEntries,
    ...insightEntries,
    ...insightCategoryEntries,
    ...jobEntries,
  ];
}
