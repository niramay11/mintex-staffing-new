"use client";

import { useState } from "react";
import Image from "next/image";
import type { Industry } from "@/content/types";

export type IndustryCardData = { industry: Industry; imageSrc: string };

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

// One transform recipe per position relative to the active card ("rel", can
// be negative). rel 0 is the sharp, full-size center card; ±1 and ±2 peek
// out blurred on either side (coverflow-style), getting smaller/dimmer/
// blurrier with distance; anything further is staged fully invisible so
// sliding never pops a card in from nowhere. `x` is a percentage of the
// card's OWN width, so the spread scales naturally at every breakpoint.
function coverTransform(rel: number): { x: number; scale: number; opacity: number; blur: number; interactive: boolean } {
  const dist = Math.abs(rel);
  const sign = Math.sign(rel);
  if (dist === 0) return { x: 0, scale: 1, opacity: 1, blur: 0, interactive: true };
  if (dist === 1) return { x: sign * 70, scale: 0.82, opacity: 0.55, blur: 3, interactive: true };
  if (dist === 2) return { x: sign * 132, scale: 0.68, opacity: 0.22, blur: 5, interactive: true };
  return { x: sign * 165, scale: 0.6, opacity: 0, blur: 6, interactive: false };
}

function CoverCard({
  industry,
  imageSrc,
  rel,
  onSelect,
}: IndustryCardData & { rel: number; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const achievement = industry.stats[0];
  const t = coverTransform(rel);
  // Hovering a blurred side card sharpens and nudges it forward, teasing
  // what's there before committing to a click — the front card is already
  // sharp, so this only does anything for rel !== 0.
  const sharpen = rel !== 0 && hovered && t.interactive;
  const scale = sharpen ? Math.min(1, t.scale + 0.1) : t.scale;
  const opacity = sharpen ? 1 : t.opacity;
  const blur = sharpen ? 0 : t.blur;
  // Capped well under the site header's sticky z-50 (see Header.tsx) — these
  // used to also hit 50, and because the header renders earlier in the DOM,
  // an equal z-index meant this card (later in the DOM) painted on top of it
  // once the section scrolled up under the sticky header.
  const z = rel === 0 ? 20 : sharpen ? 18 : 10 - Math.abs(rel) * 3;

  const cardBody = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-mist dark:bg-navy-900">
        <Image
          src={imageSrc}
          alt={`${industry.name} professionals placed by Mintex Staffing`}
          fill
          className={`object-cover transition-transform duration-500 ease-out ${rel === 0 ? "group-hover:scale-110" : ""}`}
          sizes="480px"
        />
        {achievement && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-navy shadow-sm backdrop-blur-sm dark:bg-navy-950/85 dark:text-cream">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-steel">
              <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="6" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.5 11c1.5.4 2.5 1.7 2.5 3.2V16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {achievement.value} {achievement.label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center p-6">
        <h3 className="text-3xl font-bold text-navy dark:text-cream">{industry.name}</h3>
        <p className="mt-3 line-clamp-3 text-base leading-relaxed text-steel dark:text-steel-light">
          {industry.seoSubheading}
        </p>
      </div>
    </>
  );

  const style = {
    transform: `translateX(${t.x}%) scale(${scale})`,
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    zIndex: z,
    pointerEvents: t.interactive ? ("auto" as const) : ("none" as const),
  };

  // Always the same element (an <a>, never swapped for a <button>) so the
  // DOM node itself never gets torn down and recreated as a card crosses in
  // or out of the front position — that swap was killing the CSS transition
  // right at the moment it mattered (the node has no "previous style" to
  // animate from the instant it's created), which is why advancing looked
  // like an instant jump instead of a slide. Side cards intercept the click
  // to bring themselves to the front instead of navigating; only the actual
  // front card follows its href.
  return (
    <a
      href={`/industries/${industry.slug}`}
      onClick={(e) => {
        if (rel !== 0) {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={rel === 0 ? undefined : `Bring ${industry.name} to the front`}
      tabIndex={t.interactive ? 0 : -1}
      className="group absolute inset-0 flex flex-col overflow-hidden rounded-[22px] bg-white text-left shadow-[0_18px_40px_-18px_rgba(0,48,96,0.4)] transition-[transform,opacity,filter] duration-500 ease-out dark:bg-navy-800"
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cardBody}
    </a>
  );
}

export default function IndustriesCarousel({ items }: { items: IndustryCardData[] }) {
  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  const canGoBack = active > 0;
  const canGoForward = active < items.length - 1;

  return (
    <div className="mt-11 flex flex-col items-center">
      {/* Aspect ratio tuned per breakpoint to actually match this content's
          height (image at 4:3 + title + 3-line description + padding) —
          one fixed ratio for every width left a big dead gap of empty white
          space below the text on the larger breakpoints. */}
      <div className="relative aspect-[320/400] w-full max-w-[320px] sm:aspect-[420/475] sm:max-w-[420px] lg:aspect-[480/520] lg:max-w-[480px]">
        {items.map(({ industry, imageSrc }, index) => (
          <CoverCard
            key={industry.slug}
            industry={industry}
            imageSrc={imageSrc}
            rel={index - active}
            onSelect={() => setActive(index)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setActive((i) => Math.max(0, i - 1))}
          disabled={!canGoBack}
          aria-label="Previous industry"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-30 dark:border-white/15 dark:bg-navy-800 dark:text-cream dark:hover:bg-navy-900"
        >
          <IconChevron direction="left" className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium tabular-nums text-navy/60 dark:text-cream/60">
          {active + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={() => setActive((i) => Math.min(items.length - 1, i + 1))}
          disabled={!canGoForward}
          aria-label="Next industry"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-30 dark:border-white/15 dark:bg-navy-800 dark:text-cream dark:hover:bg-navy-900"
        >
          <IconChevron direction="right" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
