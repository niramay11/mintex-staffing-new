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

function TestimonialCard({ story }: { story: CaseStudy }) {
  return (
    <div className="flex w-[360px] flex-shrink-0 snap-start flex-col justify-between rounded-3xl border border-navy/10 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] sm:w-[420px]">
      <p className="font-heading text-lg italic leading-relaxed text-navy/80">
        &ldquo;{story.quote}&rdquo;
      </p>
      {story.author && <p className="mt-8 text-navy/70">- {story.author}</p>}
    </div>
  );
}

export default function Testimonials({ stories }: { stories: CaseStudy[] }) {
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
    scrollerRef.current?.scrollBy({ left: dir === "left" ? -440 : 440, behavior: "smooth" });
  };

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <h2 className="text-center font-heading text-[42px] font-normal text-navy sm:text-[52px]">
        Explore testimonials
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
          className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent transition-opacity duration-300 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
        />

        {stories.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll testimonials left"
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_24px_-8px_rgba(0,48,96,0.35)] transition-all hover:-translate-x-0.5 hover:shadow-[0_10px_28px_-6px_rgba(0,48,96,0.45)] disabled:pointer-events-none disabled:opacity-0"
            >
              <IconChevron direction="left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Scroll testimonials right"
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy shadow-[0_8px_24px_-8px_rgba(0,48,96,0.35)] transition-all hover:translate-x-0.5 hover:shadow-[0_10px_28px_-6px_rgba(0,48,96,0.45)] disabled:pointer-events-none disabled:opacity-0"
            >
              <IconChevron direction="right" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
