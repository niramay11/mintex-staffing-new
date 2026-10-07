"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import InsightImage from "@/components/insights/InsightImage";
import { PRIMARY_BUTTON_COLORS } from "@/components/ui/Button";

export type InsightListItem = {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  category: string;
  categoryLabel: string;
  dateLabel: string;
};

function InsightCard({ post }: { post: InsightListItem }) {
  return (
    <Link
      href={`/insights/post/${post.slug}`}
      className="group flex min-w-0 flex-col rounded-[24px] border border-white bg-gradient-to-b from-white to-[#f1f5f8] p-2 shadow-[0_0_0_1px_rgba(0,48,96,0.06),0_2px_4px_rgba(0,48,96,0.05),0_14px_30px_-12px_rgba(0,48,96,0.22),-6px_-6px_16px_rgba(255,255,255,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(0,48,96,0.08),0_4px_8px_rgba(0,48,96,0.06),0_22px_40px_-14px_rgba(0,48,96,0.3),-6px_-6px_16px_rgba(255,255,255,0.7)] dark:border-white/[0.07] dark:from-navy-800 dark:to-navy-900 dark:shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_14px_30px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="rounded-[18px] bg-gradient-to-b from-[#dde5eb] to-[#eaf0f4] p-[5px] shadow-[inset_0_1px_3px_rgba(0,48,96,0.18),inset_0_-1px_0_rgba(255,255,255,0.9)] dark:from-navy-950 dark:to-navy-950 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[13px] bg-mist shadow-[0_1px_2px_rgba(0,48,96,0.2)] ring-1 ring-navy/[0.06] dark:bg-navy-800 dark:ring-white/[0.06]">
          {post.imageUrl ? (
            <InsightImage
              src={post.imageUrl}
              sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-steel to-navy-secondary">
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-white/70">{post.categoryLabel}</span>
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-b from-white to-[#eef3f6] px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-navy shadow-[0_3px_8px_rgba(0,48,96,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] dark:from-navy-800 dark:to-navy-900 dark:text-cream">
            {post.categoryLabel}
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
            {post.dateLabel}
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
  );
}

// Left "Filter by category" checklist + card grid — same filter pattern as
// the /industries page. Multi-select; nothing ticked shows every post.
export default function InsightsExplorer({
  posts,
  initialSelected = [],
}: {
  posts: InsightListItem[];
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const categories = useMemo(() => {
    const map = new Map<string, { slug: string; label: string; count: number }>();
    for (const p of posts) {
      const entry = map.get(p.category) ?? { slug: p.category, label: p.categoryLabel, count: 0 };
      entry.count++;
      map.set(p.category, entry);
    }
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [posts]);

  const visible = selected.length ? posts.filter((p) => selected.includes(p.category)) : posts;
  const toggle = (slug: string) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]));

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 xl:gap-14">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-4 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/45 lg:block dark:text-cream/45">
          Filter by category
        </p>
        <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-col lg:gap-3.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {categories.map(({ slug, label, count }) => {
            const on = selected.includes(slug);
            return (
              <li key={slug} className="flex-shrink-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(slug)}
                  className={`group flex items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors lg:rounded-none lg:border-0 lg:p-0 ${
                    on
                      ? "border-navy bg-navy text-white lg:bg-transparent lg:text-steel dark:border-steel dark:bg-steel dark:text-navy-950 lg:dark:bg-transparent lg:dark:text-steel-light"
                      : "border-navy/15 bg-white text-navy hover:border-navy/40 lg:bg-transparent lg:hover:text-steel dark:border-white/15 dark:bg-navy-800 dark:text-cream lg:dark:bg-transparent"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`hidden h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors lg:flex ${
                      on ? "border-steel bg-steel text-white dark:border-steel-light dark:bg-steel-light dark:text-navy-950" : "border-navy dark:border-cream/70"
                    }`}
                  >
                    {on && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} className="h-2.5 w-2.5">
                        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {label}
                  <span className={`font-medium ${on ? "opacity-70" : "text-navy/40 dark:text-cream/40"}`}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setSelected([])}
          disabled={selected.length === 0}
          className={`mt-6 hidden rounded-full px-5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-all disabled:pointer-events-none disabled:opacity-40 lg:inline-flex ${PRIMARY_BUTTON_COLORS}`}
        >
          Reset all
        </button>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="mt-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-steel lg:hidden dark:text-steel-light"
          >
            Reset all
          </button>
        )}
      </aside>

      <div className="mt-6 lg:mt-0">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-7 sm:grid-cols-[repeat(2,minmax(0,1fr))] 2xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          {visible.map((post) => (
            <InsightCard key={post.slug} post={post} />
          ))}
        </div>
        {visible.length === 0 && <p className="text-sm text-navy/50 dark:text-cream/50">No insights published yet.</p>}
      </div>
    </div>
  );
}
