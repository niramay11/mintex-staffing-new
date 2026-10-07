"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { INDUSTRY_GROUPS, OTHER_GROUP, type IndustryListItem } from "./industryGroups";

function IconArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndustryCard({ item }: { item: IndustryListItem }) {
  return (
    <Link
      href={`/industries/${item.slug}`}
      className="group flex min-h-[340px] min-w-0 flex-col rounded-[28px] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,48,96,0.35)] sm:min-h-[380px] sm:p-8 dark:bg-navy-800"
    >
      <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.12em]">
        <span className="min-w-0 font-medium leading-snug text-navy/45 dark:text-cream/45">{item.stat ?? ""}</span>
        <span className="flex-shrink-0 text-right sm:whitespace-nowrap">
          <span className="block font-bold text-navy dark:text-cream">Mintex</span>
          <span className="mt-1 block font-semibold text-steel dark:text-steel-light">{item.group}</span>
        </span>
      </div>

      <div className="mt-auto pt-12">
        <h2 className="break-words font-heading text-[30px] font-bold leading-[1.1] text-navy sm:text-[34px] dark:text-cream">
          {item.name}
        </h2>
        <p className="mt-4 line-clamp-4 max-w-[300px] text-[13.5px] leading-relaxed text-navy/65 dark:text-cream/65">
          {item.description}
        </p>
        <span
          aria-hidden="true"
          className="mt-7 inline-flex h-9 w-14 items-center justify-center rounded-full border border-navy/80 text-navy transition-all duration-300 group-hover:w-[72px] group-hover:bg-navy group-hover:text-white dark:border-cream/60 dark:text-cream dark:group-hover:bg-cream dark:group-hover:text-navy-950"
        >
          <IconArrow className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

// Sector filter sidebar + card grid for /industries. Multi-select: nothing
// ticked shows everything; ticking sectors narrows the grid to those.
export default function IndustriesExplorer({ items }: { items: IndustryListItem[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  const groups = useMemo(() => {
    const present = new Set(items.map((i) => i.group));
    const ordered: string[] = INDUSTRY_GROUPS.filter((g) => present.has(g));
    if (present.has(OTHER_GROUP)) ordered.push(OTHER_GROUP);
    return ordered.map((g) => ({ name: g, count: items.filter((i) => i.group === g).length }));
  }, [items]);

  const visible = selected.length ? items.filter((i) => selected.includes(i.group)) : items;
  const toggle = (g: string) => setSelected((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]));

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10 xl:gap-14">
      {/* Filters: vertical checklist on desktop, swipeable chip row on mobile */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-4 hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/45 lg:block dark:text-cream/45">
          Filter by sector
        </p>
        <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-col lg:gap-3.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
          {groups.map(({ name, count }) => {
            const on = selected.includes(name);
            return (
              <li key={name} className="flex-shrink-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(name)}
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
                  {name}
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
          className="mt-6 hidden rounded-full border-[1.5px] border-navy px-5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy hover:text-white disabled:pointer-events-none disabled:opacity-40 lg:inline-flex dark:border-cream/70 dark:text-cream dark:hover:bg-cream dark:hover:text-navy-950"
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

      {/* minmax(0,1fr): a plain auto track sizes to the widest card's
          min-content and overflowed the screen on phones. */}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:mt-0 2xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {visible.map((item) => (
          <IndustryCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
