import type { ReactNode } from "react";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

// The original Seek Talent service template's "What's included" section
// (the pre-rewrite /seek-talent/[slug] design): alternating rows of a framed
// photo beside a white card with a round icon, a small bold title and the
// copy, with a "Let's talk" button in the last card. The Contract,
// Permanent and Executive Search pages render their (newer) content through
// this so they keep the old look.

export type ServicePoint = {
  title: string;
  body: ReactNode;
  /** Anchor id for in-page links (e.g. #contract-to-hire). */
  id?: string;
  imageAlt: string;
};

function IconBadge({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 13.5 7.5 21l4.5-2.5 4.5 2.5-1.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPeople({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-3.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 3a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeadset({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 19v1a3 3 0 0 1-3 3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 7 9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pointIcons = [IconBadge, IconPeople, IconHeadset, IconCheck];

// Each service has four admin-managed photos
// (seek-talent-service:<slug>:point-1..4-visual); rows past four reuse them.
const PHOTO_COUNT = 4;

/** Small body-copy helpers so every card's text matches the old template. */
export function PointList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <IconCheck className="mt-[3px] h-3.5 w-3.5 flex-shrink-0 text-steel dark:text-steel-light" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PointTags({ items, label }: { items: string[]; label: string }) {
  return (
    <ul aria-label={label} className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-navy/10 bg-page px-3 py-1 text-[12.5px] font-semibold text-navy dark:border-white/10 dark:bg-navy-800 dark:text-cream"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ServicePointRows({
  slug,
  siteImages,
  points,
  eyebrow = "Why choose us",
  title = "What's included",
}: {
  slug: string;
  siteImages: Record<string, string>;
  points: ServicePoint[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <Section background="white" className="!py-12 sm:!py-14 lg:!py-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{eyebrow}</p>
        <h2 className="mt-2.5 text-3xl font-bold text-navy sm:text-4xl dark:text-cream">{title}</h2>
      </div>

      <div className="mx-auto mt-10 max-w-5xl space-y-10 lg:space-y-14">
        {points.map((point, index) => {
          const PointIcon = pointIcons[index % pointIcons.length];
          const imageFirst = index % 2 === 0;
          const isLast = index === points.length - 1;
          return (
            <div
              key={point.title}
              id={point.id}
              className={`flex scroll-mt-28 flex-col items-center gap-6 lg:items-start lg:gap-10 ${imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"}`}
            >
              <div className="relative hidden flex-shrink-0 lg:block" style={{ width: 320 }}>
                <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-navy/10 dark:border-white/10" />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
                  <Image
                    src={siteImages[`seek-talent-service:${slug}:point-${(index % PHOTO_COUNT) + 1}-visual`]}
                    alt={point.imageAlt}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="group flex w-full flex-1 gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel dark:text-steel-light">
                  <PointIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy dark:text-cream">{point.title}</h3>
                  <div className="mt-1 space-y-2 text-sm leading-relaxed text-navy/70 dark:text-cream/70 [&_strong]:font-semibold [&_strong]:text-navy dark:[&_strong]:text-cream">
                    {point.body}
                  </div>
                  {isLast && (
                    <ButtonLink href="/seek-talent/get-started" variant="primary" className="mt-4 inline-flex items-center gap-2">
                      Let&apos;s talk
                      <IconArrowRight className="h-4 w-4" />
                    </ButtonLink>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
