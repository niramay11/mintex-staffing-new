import type { MetadataRoute } from "next";
import { getIndustries } from "@/lib/industries";
import { hiringServices } from "@/content/hiringServices";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";
import { getCachedJobs } from "@/lib/jobsCache";
import { isActiveJob, jobUrlSlug } from "@/components/jobs/utils";
import type { CeipalJob } from "@/components/jobs/types";
import { US_STATES } from "@/lib/interviewKit/schema";
import { stateToSlug } from "@/lib/interviewKit/legalRights";

// Without this, Next tries to statically prerender the sitemap at build
// time — same problem /get-hired's own page.tsx already forces dynamic to
// avoid: a cold/unreachable Ceipal fetch would hang the build itself instead
// of just this route resolving slowly on the next real request.
export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

const staticRoutes = [
  "",
  "/get-hired",
  "/get-hired/share-resume",
  "/get-hired/interview-prep",
  "/get-hired/apply-to-jobs",
  "/get-hired/how-we-work/for-job-seekers",
  "/interview-rights",
  "/industries",
  "/seek-talent",
  "/seek-talent/how-we-work",
  "/seek-talent/how-we-work/for-clients",
  "/seek-talent/get-started",
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
  }));

  const industries = await getIndustries();
  const industryEntries = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry.slug}`,
  }));

  const hiringServiceEntries = hiringServices.map((service) => ({
    url: `${baseUrl}/seek-talent/${service.slug}`,
  }));

  const { data: insightPosts } = await supabase.from("insights").select("slug, published_at");
  const insightEntries = (insightPosts ?? []).map((post) => ({
    url: `${baseUrl}/insights/post/${post.slug}`,
    lastModified: new Date(post.published_at),
  }));

  const { data: insightCategories } = await supabase.from("insight_categories").select("slug");
  const insightCategoryEntries = (insightCategories ?? []).map((category) => ({
    url: `${baseUrl}/insights/category/${category.slug}`,
  }));

  const { jobs } = await getCachedJobs();
  const jobEntries = (jobs as CeipalJob[]).filter(isActiveJob).map((job) => ({
    url: `${baseUrl}/get-hired/jobs/${jobUrlSlug(job)}`,
    ...(job.career_portal_published_date
      ? { lastModified: new Date(job.career_portal_published_date) }
      : {}),
  }));

  const interviewRightsEntries = US_STATES.map((state) => ({
    url: `${baseUrl}/interview-rights/${stateToSlug(state)}`,
  }));

  return [
    ...staticEntries,
    ...industryEntries,
    ...hiringServiceEntries,
    ...insightEntries,
    ...insightCategoryEntries,
    ...jobEntries,
    ...interviewRightsEntries,
  ];
}
