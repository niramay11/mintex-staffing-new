import Link from "next/link";
import Image from "next/image";
import type { Industry } from "@/content/types";

// Glassmorphism industry card used on /industries: a full-bleed photo with
// frosted-glass overlays (stat badge + title panel) on top of it.
export default function IndustryCard({
  industry,
  imageSrc,
  sizes = "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  headingLevel = "h3",
}: {
  industry: Industry;
  imageSrc: string;
  sizes?: string;
  headingLevel?: "h2" | "h3";
}) {
  const stat = industry.stats[0];
  const Heading = headingLevel;

  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group relative block aspect-[6/5] w-full overflow-hidden rounded-[20px] border border-white/40 bg-mist shadow-[0_18px_40px_-18px_rgba(0,48,96,0.4)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_28px_50px_-20px_rgba(0,48,96,0.5)] dark:border-white/10 dark:bg-navy-950"
    >
      <Image
        src={imageSrc}
        alt={`${industry.name} professionals placed by Mintex Staffing`}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes={sizes}
      />
      {/* Shades keep the white glass text readable on bright photos */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-950/65 via-navy-950/20 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-navy-950/35 to-transparent" />

      {stat && (
        <span className="absolute left-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/40 bg-white/15 px-3 py-1.5 text-[12px] 2xl:left-4 2xl:top-4 2xl:text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-md backdrop-saturate-150">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 flex-shrink-0">
            <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="6" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.5 11c1.5.4 2.5 1.7 2.5 3.2V16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{stat.value} {stat.label}</span>
        </span>
      )}

      {/* Frosted-glass panel: title + arrow, short description */}
      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/35 bg-white/15 px-4 py-3 2xl:inset-x-4 2xl:bottom-4 2xl:px-5 2xl:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 group-hover:bg-white/20 dark:border-white/15 dark:bg-navy-950/30">
        <div className="flex items-start justify-between gap-3">
          <Heading className="font-heading text-[20px] font-bold leading-tight text-white 2xl:text-[24px]">{industry.name}</Heading>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white transition-all duration-300 group-hover:bg-white group-hover:text-navy"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 -rotate-45 transition-transform duration-300 group-hover:rotate-0">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/85 2xl:text-[14.5px]">{industry.seoSubheading}</p>
      </div>
    </Link>
  );
}
