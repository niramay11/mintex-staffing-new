import Image from "next/image";

// Mirrors the reference layout's overlapping-photo hero composition: two
// offset photo cards on tilted color backdrops, two floating stat cards, and
// a dashed connector line threading between them. The stats themselves
// (14,000+ placements, 9-day avg fill, 93% retention) are the same real
// numbers the old HeroBubbleCluster used — only the presentation changed.

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m4 13 4 4L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function HeroPhotoCollage({
  photo1Src,
  photo2Src,
}: {
  photo1Src: string;
  photo2Src: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative aspect-[9/10]">
        {/* Dashed connector threading through the composition, with two dot
            accents — matches the reference's squiggle-and-dots backdrop. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 460 510"
          className="pointer-events-none absolute inset-0 h-full w-full text-navy/25 dark:text-cream/20"
        >
          <path
            d="M40 25c110 0 30 90 130 100s150-15 170 55-40 95 30 140"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="40" cy="25" r="5" className="fill-steel" />
          <circle cx="370" cy="320" r="5" className="fill-steel" />
        </svg>

        {/* Backdrop square behind photo 1, tilted for depth. */}
        <div
          aria-hidden="true"
          className="absolute left-[6%] top-[2%] h-[52%] w-[68%] -rotate-3 rounded-[2rem] bg-steel/25 dark:bg-steel/15"
        />
        {/* Photo 1 */}
        <div className="absolute left-[9%] top-[5%] h-[48%] w-[62%] overflow-hidden rounded-[1.75rem] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
          <Image
            src={photo1Src}
            alt="Mintex Staffing candidate placed with a client team"
            fill
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Floating stat card — placements made — pinned to photo 1's
            top-right corner, like the reference's profile card. */}
        <div className="absolute right-[0%] top-[6%] flex w-[64%] items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_18px_40px_-16px_rgba(0,48,96,0.4)] dark:bg-navy-800">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy dark:bg-cream/10 dark:text-cream">
            <IconCheck className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold leading-none text-navy dark:text-cream">14,000+</p>
            <p className="mt-1 text-[12.5px] leading-tight text-steel dark:text-steel-light">Placements made</p>
          </div>
        </div>

        {/* Floating tag-style card overlapping photo 1's bottom-left, like
            the reference's role/rate chip row. */}
        <div className="absolute bottom-[36%] left-[0%] flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 shadow-[0_18px_40px_-16px_rgba(0,48,96,0.4)] dark:bg-navy-800">
          <span className="text-[12.5px] font-medium text-steel dark:text-steel-light">Avg. time to fill</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/15 px-3 py-1 text-[13.5px] font-semibold text-navy dark:bg-steel/25 dark:text-cream">
            <IconClock className="h-3.5 w-3.5" />9 days
          </span>
        </div>

        {/* Backdrop square behind photo 2. */}
        <div
          aria-hidden="true"
          className="absolute bottom-[2%] right-[4%] h-[46%] w-[58%] rotate-2 rounded-[2rem] bg-mist-dark dark:bg-navy-800/60"
        />
        {/* Photo 2 */}
        <div className="absolute bottom-[5%] right-[7%] h-[42%] w-[52%] overflow-hidden rounded-[1.75rem] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
          <Image
            src={photo2Src}
            alt="Mintex Staffing recruiter finalizing a placement"
            fill
            sizes="(min-width: 1024px) 26vw, 52vw"
            className="object-cover"
          />
        </div>

        {/* Floating stat card — retention — pinned to photo 2, like the
            reference's work-log card. */}
        <div className="absolute bottom-[0%] left-[2%] flex items-center gap-3 rounded-2xl bg-navy p-3.5 shadow-[0_18px_40px_-16px_rgba(0,48,96,0.5)] dark:bg-steel">
          <div>
            <p className="font-heading text-2xl font-bold leading-none text-white dark:text-navy-950">93%</p>
            <p className="mt-1 text-[13.5px] text-white/70 dark:text-navy-950/70">Client retention</p>
          </div>
        </div>
      </div>
    </div>
  );
}
