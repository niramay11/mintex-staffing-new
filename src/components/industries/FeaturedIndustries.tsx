"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { IndustryListItem } from "./industryGroups";

const AUTOPLAY_MS = 6500;

function IconArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Featured banner at the top of /industries: full-bleed photo slides that
// crossfade, with the copy on a dark left-side fade. Auto-advances, pauses
// while hovered/focused, and stays still for prefers-reduced-motion users.
export default function FeaturedIndustries({ items }: { items: IndustryListItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % items.length), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative h-[460px] overflow-hidden rounded-[28px] bg-navy-950 sm:h-[440px] lg:h-[480px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {items.map((item, i) => (
        <div
          key={item.slug}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <Image
            src={item.imageSrc}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-transform duration-[7000ms] ease-out ${i === active ? "scale-105" : "scale-100"}`}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/5" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-7 sm:px-12 lg:px-16">
            <div className="max-w-[560px]">
              {item.stat && (
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/70">{item.stat}</p>
              )}
              <h2 className="mt-3 font-heading text-[34px] font-bold leading-[1.05] text-white sm:text-[44px] lg:text-[52px]">
                {item.headline}
              </h2>
              <p className="mt-5 line-clamp-3 max-w-[380px] text-[14px] leading-relaxed text-white/75">{item.description}</p>
              <Link
                href={`/industries/${item.slug}`}
                tabIndex={i === active ? 0 : -1}
                aria-label={`Explore ${item.name}`}
                className="mt-8 inline-flex h-10 w-16 items-center justify-center rounded-full bg-white/90 text-navy transition-all duration-300 hover:w-20 hover:bg-white"
              >
                <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Page H1 sits where the reference shows its "FEATURED" label */}
      <div className="pointer-events-none absolute left-7 top-7 sm:left-12 sm:top-9 lg:left-16">
        <h1 style={{ fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif", letterSpacing: "0.16em" }} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/80">Industries We Serve</h1>
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-7 left-7 flex items-center gap-1.5 sm:bottom-9 sm:left-12 lg:left-16">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${item.name}`}
              aria-current={i === active}
              className="flex h-5 items-center"
            >
              <span
                className={`block h-[3px] rounded-full transition-all duration-500 ${i === active ? "w-7 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
