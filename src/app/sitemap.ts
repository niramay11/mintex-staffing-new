import type { MetadataRoute } from "next";
import { industries } from "@/content/industries";
import { supabase } from "@/lib/supabase";

// TODO: replace with the real production domain once it's registered/confirmed.
const baseUrl = "https://www.mintexstaffing.com";

const staticRoutes = [
  "",
  "/get-hired",
  "/seek-talent",
  "/resources",
  "/resources/hiring-cost-calculator",
  "/resources/ai-interview-generator",
  "/insights",
  "/about",
  "/case-studies",
  "/contact",
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

  const { data: insightPosts } = await supabase.from("insights").select("slug, published_at");
  const insightEntries = (insightPosts ?? []).map((post) => ({
    url: `${baseUrl}/insights/${post.slug}`,
    lastModified: new Date(post.published_at),
  }));

  return [...staticEntries, ...industryEntries, ...insightEntries];
}
