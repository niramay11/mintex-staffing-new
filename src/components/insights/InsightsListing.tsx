import Link from "next/link";
import Section from "@/components/ui/Section";
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
    (() => {
      let query = supabase.from("insights").select("*").order("published_at", { ascending: false });
      if (activeCategory !== "all") query = query.eq("category", activeCategory);
      return query;
    })(),
  ]);

  const posts = (postsQuery.data ?? []) as InsightPost[];
  const labelFor = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  return (
    <Section background="white">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/insights"
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            activeCategory === "all"
              ? "bg-navy text-white dark:bg-steel dark:text-navy-950"
              : "bg-white text-navy hover:bg-mist dark:bg-navy-900 dark:text-cream dark:hover:bg-navy-800"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/insights/category/${cat.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === cat.slug
                ? "bg-navy text-white dark:bg-steel dark:text-navy-950"
                : "bg-white text-navy hover:bg-mist dark:bg-navy-900 dark:text-cream dark:hover:bg-navy-800"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/insights/post/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_1px_3px_rgba(0,48,96,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(0,48,96,0.25)] dark:border-white/10 dark:bg-navy-900"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-mist dark:bg-navy-800">
              {post.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
                <img
                  src={post.image_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-steel to-navy-secondary">
                  <span className="font-heading text-sm font-semibold uppercase tracking-wide text-white/70">
                    {labelFor(post.category)}
                  </span>
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy shadow-sm dark:bg-navy-900/95 dark:text-cream">
                {labelFor(post.category)}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-semibold text-navy dark:text-cream">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm text-navy/70 dark:text-cream/70">{post.excerpt}</p>
              <span className="mt-4 text-xs text-navy/50 dark:text-cream/50">
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="mt-8 text-sm text-navy/50 dark:text-cream/50">No insights in this category yet.</p>
      )}
    </Section>
  );
}
