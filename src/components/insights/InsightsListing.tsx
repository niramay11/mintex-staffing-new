import Section from "@/components/ui/Section";
import InsightsExplorer, { type InsightListItem } from "@/components/insights/InsightsExplorer";
import { supabase } from "@/lib/supabase";
import type { InsightCategoryRow, InsightPost } from "@/content/types";

export async function getInsightCategories(): Promise<InsightCategoryRow[]> {
  const { data } = await supabase
    .from("insight_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []) as InsightCategoryRow[];
}

export default async function InsightsListing({ activeCategory }: { activeCategory: string }) {
  const [categories, postsQuery] = await Promise.all([
    getInsightCategories(),
    supabase.from("insights").select("*").order("published_at", { ascending: false }),
  ]);

  const labelFor = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const posts: InsightListItem[] = ((postsQuery.data ?? []) as InsightPost[]).map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    imageUrl: post.image_url,
    category: post.category,
    categoryLabel: labelFor(post.category),
    dateLabel: new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  }));

  // Every post is on one page; the category is just a filter. The
  // /insights/category/[slug] URLs still work and open with that box ticked.
  return (
    <Section background="white" className="!overflow-visible">
      {/* Only pre-tick the category if it actually has posts — otherwise
          (e.g. an old link to a category nobody uses any more) show every
          post instead of an empty "No insights published yet" page. */}
      <InsightsExplorer
        posts={posts}
        initialSelected={activeCategory !== "all" && posts.some((p) => p.category === activeCategory) ? [activeCategory] : []}
      />
    </Section>
  );
}
