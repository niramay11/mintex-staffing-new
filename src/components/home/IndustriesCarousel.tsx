"use client";

import { useRef, useState } from "react";
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
      {/* Full-bleed photo; the text sits on a frosted-glass panel over it. */}
      <div className="absolute inset-0 overflow-hidden bg-mist dark:bg-navy-900">
        <Image
          src={imageSrc}
          alt={`${industry.name} professionals placed by Mintex Staffing`}
          fill
          draggable={false}
          className={`object-cover transition-transform duration-700 ease-out ${rel === 0 ? "group-hover:scale-105" : ""}`}
          sizes="480px"
        />
        {/* Soft bottom shade so the white glass text stays readable on bright photos. */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950/60 via-navy-950/20 to-transparent" />
        {achievement && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-md backdrop-saturate-150">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-white">
              <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="6" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.5 11c1.5.4 2.5 1.7 2.5 3.2V16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {achievement.value} {achievement.label}
          </span>
        )}
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-start gap-3 rounded-2xl border border-white/35 bg-white/15 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 group-hover:bg-white/20 sm:inset-x-4 sm:bottom-4 sm:p-5 dark:border-white/15 dark:bg-navy-950/30">
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold text-white sm:text-[28px]">{industry.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-snug text-white/85 sm:text-[15.5px]">
            {industry.seoSubheading}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition-all duration-300 group-hover:bg-white group-hover:text-navy"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
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
      draggable={false}
      onClick={(e) => {
        if (rel !== 0) {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={rel === 0 ? undefined : `Bring ${industry.name} to the front`}
      tabIndex={t.interactive ? 0 : -1}
      className="group absolute inset-0 flex flex-col overflow-hidden rounded-[22px] bg-white text-left shadow-[0_18px_40px_-18px_rgba(0,48,96,0.4)] ring-1 ring-white/70 dark:ring-white/10 transition-[transform,opacity,filter] duration-500 ease-out dark:bg-navy-800"
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {cardBody}
    </a>
  );
}

export default function IndustriesCarousel({ items }: { items: IndustryCardData[] }) {
  // Start on the middle card so a short list (the homepage shows 3) fills
  // both sides of the coverflow instead of leaving the left side empty.
  const [active, setActive] = useState(() => Math.floor((items.length - 1) / 2));
  // Swipe-to-advance for touch/pen/mouse drag — the card stack is a set of
  // absolutely-positioned, transform-animated cards (coverflow style), not a
  // native scrollable element, so there's nothing for the browser's own
  // touch-scroll to grab. A release-based drag threshold on top of the same
  // setActive the arrow buttons already use gets real swipe navigation
  // without touching the transform/animation model at all.
  const dragStartX = useRef<number | null>(null);
  // After a real swipe, touch browsers still synthesize a click on release —
  // without suppressing it, a swipe on the front card would both advance the
  // carousel AND follow that card's link. Set once a swipe crosses the
  // threshold, consumed (and cleared) by the very next click.
  const suppressNextClick = useRef(false);
  const SWIPE_THRESHOLD_PX = 40;

  if (items.length === 0) return null;

  const canGoBack = active > 0;
  const canGoForward = active < items.length - 1;
  const goBack = () => setActive((i) => Math.max(0, i - 1));
  const goForward = () => setActive((i) => Math.min(items.length - 1, i + 1));

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (delta > SWIPE_THRESHOLD_PX) {
      suppressNextClick.current = true;
      goBack();
    } else if (delta < -SWIPE_THRESHOLD_PX) {
      suppressNextClick.current = true;
      goForward();
    }
  };
  const handleClickCapture = (e: React.MouseEvent) => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="mt-11 flex flex-col items-center">
      {/* Aspect ratio tuned per breakpoint to actually match this content's
          height (image at 4:3 + title + 3-line description + padding) —
          one fixed ratio for every width left a big dead gap of empty white
          space below the text on the larger breakpoints. touch-action:
          pan-y lets the page still scroll vertically through this element
          while letting us read the horizontal gesture ourselves instead of
          the browser treating it as a failed scroll attempt. */}
      <div
        className="relative aspect-[320/400] w-full max-w-[320px] cursor-grab touch-pan-y select-none active:cursor-grabbing sm:aspect-[420/475] sm:max-w-[420px] lg:aspect-[480/520] lg:max-w-[480px]"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragStartX.current = null; }}
        onClickCapture={handleClickCapture}
      >
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
