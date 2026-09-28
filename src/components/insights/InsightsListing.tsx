import Link from "next/link";
import Section from "@/components/ui/Section";
import InsightImage from "@/components/insights/InsightImage";
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

  const pillClass = (active: boolean) =>
    `flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-b from-navy-secondary to-navy text-white shadow-[0_4px_10px_-2px_rgba(0,48,96,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] dark:from-steel-light dark:to-steel dark:text-navy-950"
        : "text-navy/70 hover:bg-gradient-to-b hover:from-white hover:to-[#f1f5f8] hover:text-navy hover:shadow-[0_2px_6px_rgba(0,48,96,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] dark:text-cream/70 dark:hover:from-navy-800 dark:hover:to-navy-900 dark:hover:text-cream"
    }`;

  return (
    <Section background="white">
      {/* Skeuomorphic filter: raised pills sitting in a recessed track */}
      <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#e8eef2] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-[inset_0_1px_3px_rgba(0,48,96,0.16),inset_0_-1px_0_rgba(255,255,255,0.9)] dark:bg-navy-950 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)]">
        <Link href="/insights" className={pillClass(activeCategory === "all")}>
          All
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/insights/category/${cat.slug}`} className={pillClass(activeCategory === cat.slug)}>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Skeuomorphic cards — same raised-shell / recessed-bezel recipe as the
          job cards (JobBoard.tsx). */}
      <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/insights/post/${post.slug}`}
            className="group flex flex-col rounded-[24px] border border-white bg-gradient-to-b from-white to-[#f1f5f8] p-2 shadow-[0_0_0_1px_rgba(0,48,96,0.06),0_2px_4px_rgba(0,48,96,0.05),0_14px_30px_-12px_rgba(0,48,96,0.22),-6px_-6px_16px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,48,96,0.08),0_4px_8px_rgba(0,48,96,0.06),0_22px_40px_-14px_rgba(0,48,96,0.3),-6px_-6px_16px_rgba(255,255,255,0.7)] dark:border-white/[0.07] dark:from-navy-800 dark:to-navy-900 dark:shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_14px_30px_-12px_rgba(0,0,0,0.6)]"
          >
            {/* Recessed bezel around the photo, even on all sides */}
            <div className="rounded-[18px] bg-gradient-to-b from-[#dde5eb] to-[#eaf0f4] p-[5px] shadow-[inset_0_1px_3px_rgba(0,48,96,0.18),inset_0_-1px_0_rgba(255,255,255,0.9)] dark:from-navy-950 dark:to-navy-950 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)]">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[13px] bg-mist shadow-[0_1px_2px_rgba(0,48,96,0.2)] ring-1 ring-navy/[0.06] dark:bg-navy-800 dark:ring-white/[0.06]">
                {post.image_url ? (
                  <InsightImage
                    src={post.image_url}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-steel to-navy-secondary">
                    <span className="font-heading text-sm font-semibold uppercase tracking-wide text-white/70">
                      {labelFor(post.category)}
                    </span>
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-gradient-to-b from-white to-[#eef3f6] px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-navy shadow-[0_3px_8px_rgba(0,48,96,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] dark:from-navy-800 dark:to-navy-900 dark:text-cream">
                  {labelFor(post.category)}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-3 pb-2 pt-4">
              <h2 className="font-heading text-[19px] font-bold leading-snug text-navy dark:text-cream">{post.title}</h2>
              <p className="mt-2 line-clamp-2 flex-1 text-[14px] leading-relaxed text-navy/60 dark:text-cream/60">{post.excerpt}</p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#eef2f4] px-3 py-2 text-[12.5px] font-medium text-navy/70 shadow-[inset_2px_2px_5px_rgba(0,48,96,0.09),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:bg-navy-950 dark:text-cream/70 dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-navy/40 dark:text-cream/40">
                    <rect x="3" y="5" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#e4ebf0] text-navy shadow-[3px_3px_8px_rgba(0,48,96,0.16),-3px_-3px_7px_rgba(255,255,255,0.95)] transition-all duration-300 group-hover:from-navy group-hover:to-navy-secondary group-hover:text-white dark:from-navy-800 dark:to-navy-950 dark:text-cream dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),-2px_-2px_6px_rgba(255,255,255,0.04)] dark:group-hover:from-steel dark:group-hover:to-steel dark:group-hover:text-navy-950"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
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
