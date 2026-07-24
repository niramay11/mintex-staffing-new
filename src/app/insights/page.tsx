import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { supabase } from "@/lib/supabase";
import type { InsightCategoryRow, InsightPost } from "@/content/types";

export const metadata: Metadata = {
  title: "Insights",
  description: "Career insights, job market insights, and ongoing hiring trends from Mintex Staffing.",
};

export const revalidate = 60;

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category ?? "all";

  const [{ data: categoryRows }, postsQuery] = await Promise.all([
    supabase.from("insight_categories").select("*").order("sort_order", { ascending: true }),
    (() => {
      let query = supabase.from("insights").select("*").order("published_at", { ascending: false });
      if (activeCategory !== "all") query = query.eq("category", activeCategory);
      return query;
    })(),
  ]);

  const categories = (categoryRows ?? []) as InsightCategoryRow[];
  const posts = (postsQuery.data ?? []) as InsightPost[];
  const labelFor = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Insights</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Career advice, job market data, and ongoing hiring trends from our research team.
        </p>
      </Section>

      <Section background="cream">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/insights"
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === "all" ? "bg-navy text-white" : "bg-white text-navy hover:bg-mist"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/insights?category=${cat.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeCategory === cat.slug ? "bg-navy text-white" : "bg-white text-navy hover:bg-mist"
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
              href={`/insights/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_1px_3px_rgba(0,48,96,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_rgba(0,48,96,0.25)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-mist">
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
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy shadow-sm">
                  {labelFor(post.category)}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-semibold text-navy">{post.title}</h2>
                <p className="mt-2 flex-1 text-sm text-navy/70">{post.excerpt}</p>
                <span className="mt-4 text-xs text-navy/50">
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
          <p className="mt-8 text-sm text-navy/50">No insights in this category yet.</p>
        )}
      </Section>
    </>
  );
}
