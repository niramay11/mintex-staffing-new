import type { ReactNode } from "react";
import Link from "next/link";

// The tall info card first built for the industry pages' "In Depth" section,
// shared so other pages (e.g. /get-hired/share-resume) use the same design:
// icon tile + pill tag on top, title, gradient rule, a highlighted lead line
// with the body below, and a footer with an "01 / 04" counter and a round
// arrow link. Hover lifts the card and fills it navy without changing its
// size, so a row of these never jumps.
//
// Links inside `children` should use FEATURE_CARD_LINK so they stay legible
// on the navy hover state.

export const FEATURE_CARD_LINK =
  "font-medium text-steel underline decoration-steel/30 underline-offset-2 transition-colors duration-500 hover:text-navy group-hover:text-white group-hover:decoration-white/40 dark:text-steel-light dark:hover:text-cream";

export default function FeatureCard({
  icon,
  tag,
  title,
  lead,
  children,
  index,
  total,
  footerLabel,
  href,
  linkLabel,
}: {
  icon: ReactNode;
  tag: string;
  title: string;
  /** Emphasized opening line of the body. */
  lead?: ReactNode;
  /** Rest of the body, shown after `lead`. */
  children?: ReactNode;
  index: number;
  total: number;
  footerLabel: string;
  href: string;
  /** Accessible name for the arrow link (it has no visible text). */
  linkLabel: string;
}) {
  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-navy/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,48,96,0.04),0_12px_32px_-24px_rgba(0,48,96,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:border-navy hover:bg-navy hover:shadow-[0_32px_60px_-28px_rgba(0,48,96,0.6)] sm:p-7 dark:border-white/[0.06] dark:bg-navy-800 dark:hover:border-navy-950 dark:hover:bg-navy-950">
      {/* Hover glow, purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-steel-light/40 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-steel-lighter/60 to-steel-lighter/20 text-navy ring-1 ring-navy/[0.06] transition-all duration-500 group-hover:from-white group-hover:to-white/80 group-hover:text-navy group-hover:ring-white/20 dark:from-steel/40 dark:to-steel/10 dark:text-cream">
          {icon}
        </span>
        <span className="rounded-full border border-navy/15 bg-page/60 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.1em] text-navy/60 transition-colors duration-500 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/85 dark:border-white/15 dark:bg-transparent dark:text-cream/70">
          {tag}
        </span>
      </div>

      <h3
        className="relative mt-8 font-heading text-[26px] font-bold leading-[1.15] text-navy transition-colors duration-500 group-hover:text-white dark:text-cream"
      >
        {title}
      </h3>
      <div className="relative mt-4 h-px bg-gradient-to-r from-steel/50 via-navy/10 to-transparent transition-colors duration-500 group-hover:from-white/50 group-hover:via-white/15" />
      <p className="relative mt-4 text-[14.5px] leading-[1.7] text-navy/70 transition-colors duration-500 group-hover:text-white/75 dark:text-cream/70">
        {lead && <span className="font-medium text-navy transition-colors duration-500 group-hover:text-white dark:text-cream">{lead}</span>}
        {lead && children ? " " : null}
        {children}
      </p>

      <div className="relative mt-auto flex items-center justify-between gap-4 pt-8">
        <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/40 transition-colors duration-500 group-hover:text-white/55 dark:text-cream/40">
          <span className="text-navy transition-colors duration-500 group-hover:text-white dark:text-cream">
            {String(index + 1).padStart(2, "0")}
            <span className="text-navy/30 group-hover:text-white/40 dark:text-cream/30"> / {String(total).padStart(2, "0")}</span>
          </span>
          <span aria-hidden="true" className="h-3 w-px bg-navy/15 group-hover:bg-white/25 dark:bg-white/15" />
          {footerLabel}
        </span>
        <Link
          href={href}
          aria-label={linkLabel}
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-navy dark:bg-steel dark:text-navy-950"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
