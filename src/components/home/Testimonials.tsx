"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";

function IconChevron({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
      />
    </svg>
  );
}

const STORY_LABEL: Record<CaseStudy["type"], string> = {
  client: "Client story",
  candidate: "Candidate story",
  other: "Success story",
};

// Same card language as the /industries grid: white 28px-radius card,
// small uppercase labels top-left / top-right, big light text, author
// pinned to the bottom.
function TestimonialCard({ story }: { story: CaseStudy }) {
  return (
    <figure className="flex min-h-[250px] w-[290px] flex-shrink-0 snap-start flex-col rounded-[24px] bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgba(0,48,96,0.35)] sm:w-[340px] dark:bg-navy-800">
      <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.12em]">
        <span className="font-medium text-navy/45 dark:text-cream/45">{STORY_LABEL[story.type] ?? "Success story"}</span>
        <span className="flex-shrink-0 text-right">
          <span className="block font-bold text-navy dark:text-cream">Mintex</span>
          <span className="mt-1 block font-semibold text-steel dark:text-steel-light">Testimonial</span>
        </span>
      </div>

      <blockquote className="mb-5 mt-5">
        <p
          style={{ fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" }}
          className="line-clamp-5 text-[16px] font-light leading-[1.5] tracking-[-0.01em] text-navy sm:text-[17px] dark:text-cream"
        >
          &ldquo;{story.quote}&rdquo;
        </p>
      </blockquote>

      {story.author && (
        <figcaption className="mt-auto flex items-center gap-3 border-t border-navy/10 pt-4 dark:border-white/10">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white dark:bg-cream dark:text-navy-950">
            {story.author.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-navy dark:text-cream">{story.author}</span>
            {story.role && <span className="block truncate text-[12px] text-navy/55 dark:text-cream/55">{story.role}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export default function Testimonials({
  stories,
  backgroundClassName = "bg-page",
  edgeFadeFromClassName = "from-page",
}: {
  stories: CaseStudy[];
  // Lets one caller (the homepage) opt into a different section background
  // without changing the default this component also renders with on
  // /industries/[slug] and /seek-talent, where it should stay unchanged.
  // edgeFadeFromClassName keeps the scroll-edge fade matched to whichever
  // background is actually in use.
  backgroundClassName?: string;
  edgeFadeFromClassName?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-measure whenever the story list itself changes
  }, [stories]);

  if (stories.length === 0) return null;

  const scrollBy = (dir: "left" | "right") => {
    scrollerRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <section className={`border-t border-navy/[0.06] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-navy-900 dark:border-white/10 ${backgroundClassName}`}>
      <h2 className="text-center font-heading text-[42px] font-bold text-navy sm:text-[52px] dark:text-cream">
        Testimonials
      </h2>

      <div className="relative mx-auto mt-14 max-w-[1920px]">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stories.map((story) => (
            <TestimonialCard key={story.id} story={story} />
          ))}
        </div>

        {/* Edge fades hint that more cards are scrollable off-screen */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent transition-opacity duration-300 dark:from-navy-900 ${edgeFadeFromClassName} ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l to-transparent transition-opacity duration-300 dark:from-navy-900 ${edgeFadeFromClassName} ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        />

        {stories.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll testimonials left"
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_24px_-8px_rgba(0,48,96,0.35)] transition-all hover:-translate-x-0.5 hover:shadow-[0_10px_28px_-6px_rgba(0,48,96,0.45)] disabled:pointer-events-none disabled:opacity-0 dark:bg-navy-800 dark:text-cream"
            >
              <IconChevron direction="left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Scroll testimonials right"
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_24px_-8px_rgba(0,48,96,0.35)] transition-all hover:translate-x-0.5 hover:shadow-[0_10px_28px_-6px_rgba(0,48,96,0.45)] disabled:pointer-events-none disabled:opacity-0 dark:bg-navy-800 dark:text-cream"
            >
              <IconChevron direction="right" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

