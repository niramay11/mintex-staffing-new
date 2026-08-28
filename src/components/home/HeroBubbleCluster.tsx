import type { ReactNode } from "react";

// The hero's headline stats (14,000+ placements, 93% retention, 9-day avg
// fill) plus the same three capability icons used in the "Why us" section
// further down the page — all real, already-existing facts, just shown here
// as a scattered bubble cluster instead of a card grid or a photo.

function IconAchievements({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m4 13 4 4L20 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInsights({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20V10M10 20V4M16 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGuides({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 4h9l3 3v13H6V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 10h6M9 14h6M9 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Small dark corner badge, mirroring the reference's numbered circles
// pinned to some bubbles — here it's just an at-a-glance index (1-3), not
// invented data.
function CornerBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white shadow-[0_4px_10px_-2px_rgba(0,48,96,0.5)] dark:bg-cream dark:text-navy-950">
      {n}
    </span>
  );
}

type Bubble = {
  key: string;
  size: number; // px, used for both the flow (mobile) and absolute (desktop) layouts
  badge?: number;
  top?: string; // desktop-only absolute position, % of the cluster box
  left?: string;
  content: ReactNode;
};

const statBubbleClass =
  "flex h-full w-full flex-col items-center justify-center rounded-full text-center shadow-[0_18px_40px_-18px_rgba(0,48,96,0.45)]";
const iconBubbleClass =
  "flex h-full w-full items-center justify-center rounded-full border-2 border-navy/15 bg-white shadow-[0_14px_30px_-16px_rgba(0,48,96,0.35)] dark:border-white/15 dark:bg-navy-800";

const BUBBLES: Bubble[] = [
  {
    key: "placements",
    size: 220,
    badge: 1,
    top: "3%",
    left: "6%",
    content: (
      <div className={`${statBubbleClass} bg-navy text-white dark:bg-steel dark:text-navy-950`}>
        <span className="font-heading text-3xl font-bold leading-none">14,000+</span>
        <span className="mt-1.5 text-xs font-medium opacity-80">Placements made</span>
      </div>
    ),
  },
  {
    key: "retention",
    size: 170,
    top: "0%",
    left: "58%",
    content: (
      <div className={`${statBubbleClass} bg-steel text-white`}>
        <span className="font-heading text-2xl font-bold leading-none">93%</span>
        <span className="mt-1 text-[11px] font-medium opacity-80">Client retention</span>
      </div>
    ),
  },
  {
    key: "achievements",
    size: 120,
    top: "22%",
    left: "84%",
    content: (
      <div className={iconBubbleClass}>
        <IconAchievements className="h-8 w-8 text-steel dark:text-steel-light" />
      </div>
    ),
  },
  {
    key: "fill-time",
    size: 195,
    badge: 3,
    top: "46%",
    left: "16%",
    content: (
      <div className={`${statBubbleClass} border-2 border-navy/15 bg-white text-navy dark:border-white/15 dark:bg-navy-800 dark:text-cream`}>
        <span className="font-heading text-2xl font-bold leading-none">9 days</span>
        <span className="mt-1 text-[11px] font-medium text-steel dark:text-steel-light">Avg. time to fill</span>
      </div>
    ),
  },
  {
    key: "insights",
    size: 132,
    badge: 2,
    top: "54%",
    left: "70%",
    content: (
      <div className={iconBubbleClass}>
        <IconInsights className="h-8 w-8 text-steel dark:text-steel-light" />
      </div>
    ),
  },
  {
    key: "guides",
    size: 108,
    top: "82%",
    left: "40%",
    content: (
      <div className={iconBubbleClass}>
        <IconGuides className="h-7 w-7 text-steel dark:text-steel-light" />
      </div>
    ),
  },
];

export default function HeroBubbleCluster() {
  return (
    <div className="relative w-full">
      {/* Desktop: scattered cluster, absolutely positioned within a square
          stage, with soft oversized background circles for depth (matches
          the reference's pale backdrop circles). */}
      <div className="relative mx-auto hidden aspect-square max-w-[600px] lg:block">
        <div aria-hidden="true" className="absolute -right-12 top-0 h-80 w-80 rounded-full bg-white/70 dark:bg-navy-800/50" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-steel/[0.08] dark:bg-steel/10" />
        {BUBBLES.map((b) => (
          <div
            key={b.key}
            className="absolute"
            style={{ top: b.top, left: b.left, width: b.size, height: b.size }}
          >
            <div className="relative h-full w-full">
              {b.content}
              {b.badge && <CornerBadge n={b.badge} />}
            </div>
          </div>
        ))}
      </div>

      {/* Everything below lg: same bubbles, plain wrapped flow instead of
          absolute scatter — precise scattered coordinates don't hold up
          across arbitrary narrow widths. */}
      <div className="flex flex-wrap items-center justify-center gap-5 py-4 lg:hidden">
        {BUBBLES.map((b) => (
          <div key={b.key} className="relative" style={{ width: b.size * 0.62, height: b.size * 0.62 }}>
            {b.content}
            {b.badge && <CornerBadge n={b.badge} />}
          </div>
        ))}
      </div>
    </div>
  );
}
