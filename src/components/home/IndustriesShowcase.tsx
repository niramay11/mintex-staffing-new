import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import IndustryGlassCard from "@/components/home/IndustryGlassCard";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import {
  industryCardImageKey,
  INDUSTRY_CARD_FALLBACK_IMAGES,
  FEATURED_INDUSTRY_COUNT,
  EXPLORE_THUMB_INDUSTRY_COUNT,
} from "@/lib/imageLocations";

// Card blurbs for the featured industries, keyed by slug; any industry not
// listed falls back to its own SEO subheading.
const INDUSTRY_CARD_COPY: Record<string, string> = {
  "it-staffing":
    "Software engineers, cloud architects and IT project leaders who can move your roadmap forward.",
  "healthcare-staffing":
    "RNs, LPNs, allied health and healthcare administrators, with license verification and credentialing handled before they reach you.",
  "engineering-staffing":
    "Mechanical, civil, electrical and industrial engineers with hands-on project experience.",
};

// Industries teaser shared by the homepage and /seek-talent: the first
// FEATURED_INDUSTRY_COUNT industries as glass cards, then an "explore all"
// bar to /industries. `children` renders below the bar (e.g. a text list of
// the remaining industries).
export default async function IndustriesShowcase({
  eyebrow = "Industries",
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  const [siteImages, industries] = await Promise.all([getSiteImages(), getIndustries()]);
  const industryImage = (slug: string, index: number) =>
    siteImages[industryCardImageKey(slug)] ??
    INDUSTRY_CARD_FALLBACK_IMAGES[index % INDUSTRY_CARD_FALLBACK_IMAGES.length];

  return (
    <section id="industries" className="group relative overflow-hidden border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
      {/* Big, centered behind the whole section, including the card row —
          mostly hidden behind the opaque cards at rest. `group` on the
          section means hovering any card (a descendant) still counts as
          hovering the section, so the mark brightens/grows right when the
          user is interacting with a card, instead of needing to see
          through the card itself (which the photo fills anyway). */}
      <span className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[320px] w-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out md:block lg:h-[400px] group-hover:scale-[1.06]">
        <Image
          src={siteImages["home:industries-mark"]}
          alt=""
          aria-hidden="true"
          width={784}
          height={395}
          className="h-full w-auto select-none object-contain opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.26] dark:hidden"
        />
        <Image
          src={siteImages["global:navy-section-mark"]}
          alt=""
          aria-hidden="true"
          width={784}
          height={395}
          className="hidden h-full w-auto select-none object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100 dark:block"
        />
      </span>
      <div className="relative mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
            {eyebrow}
          </p>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            {title}
          </h2>
        </div>

        {/* A static row of the first 3 industries; the full list lives on
            /industries (linked below). */}
        <div className="group/row relative mx-auto mt-12 grid max-w-[1320px] gap-6 md:grid-cols-3">
          {industries.slice(0, FEATURED_INDUSTRY_COUNT).map((industry, index) => (
            <IndustryGlassCard
              key={industry.slug}
              industry={industry}
              imageSrc={industryImage(industry.slug, index)}
              featured={index === 1}
              description={INDUSTRY_CARD_COPY[industry.slug]}
            />
          ))}
        </div>

        {industries.length > FEATURED_INDUSTRY_COUNT && (
          <div className="relative mt-12 flex justify-center">
            {/* Glass + skeuomorphic "explore" bar: a peek at the other
                sectors' photos, a count, and a raised arrow knob. */}
            <Link
              href="/industries"
              className="group/explore flex w-full max-w-[560px] items-center gap-4 rounded-full border border-white/70 bg-white/55 p-2 pl-3 shadow-[8px_8px_20px_rgba(0,48,96,0.12),-7px_-7px_18px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[11px_11px_26px_rgba(0,48,96,0.17),-7px_-7px_18px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/10 dark:bg-navy-800/60 dark:shadow-[8px_8px_20px_rgba(0,0,0,0.45),-5px_-5px_14px_rgba(255,255,255,0.04)]"
            >
              <span className="flex flex-shrink-0 items-center">
                {industries.slice(FEATURED_INDUSTRY_COUNT, FEATURED_INDUSTRY_COUNT + EXPLORE_THUMB_INDUSTRY_COUNT).map((industry, i) => (
                  <span
                    key={industry.slug}
                    className={`relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-white shadow-[2px_2px_6px_rgba(0,48,96,0.18)] dark:ring-navy-800 ${i > 0 ? "-ml-3" : ""} ${i > 0 ? "hidden sm:block" : ""}`}
                  >
                    <Image src={industryImage(industry.slug, i + FEATURED_INDUSTRY_COUNT)} alt="" aria-hidden="true" fill sizes="44px" className="object-cover" />
                  </span>
                ))}
                <span className="-ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#e4ebf0] text-[12px] font-bold text-navy ring-[3px] ring-white shadow-[2px_2px_6px_rgba(0,48,96,0.18)] dark:from-navy-800 dark:to-navy-950 dark:text-cream dark:ring-navy-800">
                  +{industries.length - FEATURED_INDUSTRY_COUNT}
                </span>
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block whitespace-nowrap font-heading text-[17px] font-bold leading-tight sm:text-[19px] text-navy dark:text-cream">
                  See all {industries.length} industries
                </span>
                <span className="hidden truncate text-[13px] text-navy/55 sm:block dark:text-cream/55">
                  {industries.length - FEATURED_INDUSTRY_COUNT} more specialized sectors to discover
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-secondary to-navy text-white shadow-[4px_4px_10px_rgba(0,48,96,0.3),-2px_-2px_6px_rgba(255,255,255,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 group-hover/explore:scale-105 dark:from-steel-light dark:to-steel dark:text-navy-950 dark:shadow-[4px_4px_10px_rgba(0,0,0,0.45)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 transition-transform duration-300 group-hover/explore:translate-x-0.5">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
