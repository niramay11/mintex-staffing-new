import Link from "next/link";
import Image from "next/image";
import type { Industry } from "@/content/types";

// Homepage industry card. At rest it's a light, text-only card; the
// highlighted card turns into frosted glass over a heavily blurred photo.
// The `featured` card is highlighted by default, and hovering any card in the
// row (parent has `group/row`) moves the highlight to that card instead —
// pure CSS, no client JS. Class strings are written out in full (not built
// dynamically) so Tailwind's scanner picks them up.
const STYLES = {
  featured: {
    card: "border-white/25 shadow-[0_34px_45px_-24px_rgba(20,30,40,0.55)] group-hover/row:border-navy/[0.07] group-hover/row:shadow-[0_1px_2px_rgba(0,48,96,0.04)] group-hover/card:border-white/25! group-hover/card:shadow-[0_34px_45px_-24px_rgba(20,30,40,0.55)]!",
    layer: "opacity-100 group-hover/row:opacity-0 group-hover/card:opacity-100!",
    tag: "bg-white/20 text-white group-hover/row:bg-steel/10 group-hover/row:text-steel group-hover/card:bg-white/20! group-hover/card:text-white!",
    title: "text-white group-hover/row:text-navy dark:group-hover/row:text-cream group-hover/card:text-white!",
    body: "text-white/80 group-hover/row:text-navy/60 dark:group-hover/row:text-cream/60 group-hover/card:text-white/80!",
    foot: "text-white/85 group-hover/row:text-navy/55 dark:group-hover/row:text-cream/55 group-hover/card:text-white/85!",
  },
  normal: {
    card: "border-navy/[0.07] shadow-[0_1px_2px_rgba(0,48,96,0.04)] group-hover/card:border-white/25 group-hover/card:shadow-[0_34px_45px_-24px_rgba(20,30,40,0.55)]",
    layer: "opacity-0 group-hover/card:opacity-100",
    tag: "bg-steel/10 text-steel dark:text-steel-light group-hover/card:bg-white/20 group-hover/card:text-white",
    title: "text-navy dark:text-cream group-hover/card:text-white",
    body: "text-navy/60 dark:text-cream/60 group-hover/card:text-white/80",
    foot: "text-navy/55 dark:text-cream/55 group-hover/card:text-white/85",
  },
} as const;

export default function IndustryGlassCard({
  industry,
  imageSrc,
  featured = false,
}: {
  industry: Industry;
  imageSrc: string;
  featured?: boolean;
}) {
  const stat = industry.stats[0];
  const s = featured ? STYLES.featured : STYLES.normal;

  return (
    <Link
      href={`/industries/${industry.slug}`}
      className={`group/card relative flex min-h-[300px] flex-col md:min-h-[380px] overflow-hidden rounded-[22px] border bg-white/85 p-7 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1 dark:border-white/10 dark:bg-navy-800/70 ${s.card}`}
    >
      {/* Glass layer: blurred photo + grey frost tint */}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out ${s.layer}`}>
        <Image src={imageSrc} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="scale-125 object-cover blur-[22px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8f9ca6]/75 via-[#6f7d88]/65 to-[#56626c]/75 dark:from-navy-800/70 dark:via-navy-900/65 dark:to-navy-950/80" />
        <div className="absolute inset-0 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_0_0_1px_rgba(255,255,255,0.12)]" />
      </div>

      <div className="relative flex flex-1 flex-col">
        {stat && (
          <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors duration-500 ${s.tag}`}>
            {stat.value} {stat.label}
          </span>
        )}

        <h3 className={`mt-4 font-heading text-[30px] font-semibold leading-tight transition-colors duration-500 ${s.title}`}>
          {industry.name}
        </h3>
        <p className={`mt-4 line-clamp-3 text-[15.5px] leading-relaxed transition-colors duration-500 ${s.body}`}>
          {industry.seoSubheading}
        </p>

        <span className={`mt-auto inline-flex items-center gap-2 pt-10 text-[14px] font-medium transition-colors duration-500 ${s.foot}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <rect x="3" y="7" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Explore roles
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 transition-transform duration-300 group-hover/card:translate-x-1">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
