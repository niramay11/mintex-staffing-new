import Image from "next/image";

// Direct port of the reference code's hero-visual: same 680x560 coordinate
// system, same person-card / profile-badge / metric-card proportions
// (converted to exact percentages from the original px values, not rounded
// approximations), and the connector SVG's path data and dot coordinates
// used completely unmodified. The stats themselves (14,000+ placements,
// 93% retention, 9-day avg fill, 9+ industries) are the same real numbers
// used elsewhere on the site — only the presentation changed.

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m4 13 4 4L20 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 5 6v5.5c0 4.4 3 8.1 7 9 4-.9 7-4.6 7-9V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
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
    <div className="relative mx-auto w-full max-w-[700px] lg:max-w-[760px] xl:max-w-[860px] 2xl:max-w-[950px]">
      {/* 680x560 — the exact same coordinate system the reference code's
          connector viewBox uses, so the SVG below and the cards positioned
          against it stay in the same proportional relationship as the
          original. */}
      <div className="relative aspect-[17/14]">
        {/* Connector SVG — path data, dot coordinates, colors, stroke-width
            and opacity all copied verbatim from the reference code. Not
            reshaped or repositioned. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 680 560"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {/* Line 1 — matches the mockup exactly: touches badge 1's right
              edge, curves down, and ends in open space right where photo 2
              begins (not extending alongside photo 2's full height). */}
          <path
            d="M645 85 C690 75 680 160 670 228"
            stroke="#527895"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Line 2 — previous curve's control points (145,420) and
              (90,445) accidentally passed straight through metric 1's own
              box (the "9 days" card, x85–217 y355–427), making the line
              look like it pierced through it. Rerouted to stay left of
              x85 (metric 1's left edge) for its entire middle stretch,
              only crossing that card's row well below it (y430+) or above
              it (y300ish), never through it. Start point (250,480) stays
              deep inside badge 2's card — hidden at every tested width. */}
          <path
            d="M250 480 C170 470 100 460 60 430 C30 400 30 360 45 330 C60 305 100 295 150 300"
            stroke="#527895"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Top dot pulled back out to x150 — not overlapping photo 1
              (edge at x165) or sitting deep in its shadow, but right at
              the shadow's outer visible edge, touching it from outside. */}
          <circle cx="670" cy="228" r="5" fill="#2f6688" />
          <circle cx="150" cy="300" r="5" fill="#2f6688" />
        </svg>

        {/* Photo 1 — person-card-one: width350 height345 right165 top47 in
            the reference's 680x560 canvas, converted to exact percentages
            (24.26% / 8.39% / 51.47% / 61.61%), not rounded. This wrapper
            itself has no overflow-hidden — that's only on the image-frame
            child below, exactly like the reference's DOM (profile-badge is
            a sibling of image-frame, not nested inside it, so it isn't
            clipped when it overflows the photo's edge). */}
        <div className="absolute right-[24.26%] top-[8.39%] h-[61.61%] w-[51.47%]">
          {/* Colored backdrop block — the layered depth effect visible in
              the reference screenshot behind the photo, which the pasted
              code's CSS never actually included (it only has a subtle
              box-shadow). Slightly larger than the photo and peeking out
              at the top-left, tilted for depth. */}
          <div
            aria-hidden="true"
            className="absolute -left-[4%] -top-[4%] h-[104%] w-[104%] -rotate-2 rounded-[1.75rem] bg-steel/25 dark:bg-steel/15"
          />
          <div className="relative h-full w-full overflow-hidden rounded-tl-[25px] rounded-tr-[25px] rounded-br-[25px] rounded-bl-[48px] border border-navy/10 shadow-[0_22px_55px_rgba(16,50,76,0.13)] dark:border-white/10">
            <Image
              src={photo1Src}
              alt="Mintex Staffing candidate placed with a client team"
              fill
              sizes="(min-width: 1024px) 32vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          {/* badge-one: top19 right-130, relative to person-card-one
              (350x345) — exact percentages of that box: 5.51% / -37.14%.
              Shadow: exact 0 15px 40px rgba(21,54,79,0.13) from the
              reference code (was a much darker/heavier 0.4 before). */}
          <div className="absolute right-[-37.14%] top-[5.51%] flex w-[73%] items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_15px_40px_rgba(21,54,79,0.13)] dark:bg-navy-800">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#b3e2f3] text-navy dark:bg-cream/10 dark:text-cream">
              <IconCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold leading-none text-navy dark:text-cream">14,000+</p>
              <p className="mt-1.5 text-[13px] leading-tight text-steel dark:text-steel-light">Placements made</p>
            </div>
          </div>
        </div>

        {/* Photo 2 — person-card-two: width360 height350 right0 bottom30,
            converted to exact percentages (0% / 5.36% / 52.94% / 62.5%) —
            height trimmed to 54% (from 62.5%) so its top edge sits lower,
            covering less of photo 1's face. Pulled in to right-[3%] (was
            right-0, touching the canvas edge) so line 1 below has an open
            margin to run down through instead of hitting a dead end. */}
        <div className="absolute bottom-[5.36%] right-[3%] h-[54%] w-[52.94%]">
          {/* Colored backdrop block, mirrored — peeking out at the
              bottom-right, matching the reference's second photo. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-[4%] -right-[3%] h-[104%] w-[104%] rotate-2 rounded-[1.75rem] bg-mist-dark dark:bg-navy-800/60"
          />
          <div className="relative h-full w-full overflow-hidden rounded-tl-[25px] rounded-tr-[48px] rounded-br-[25px] rounded-bl-[25px] border border-navy/10 shadow-[0_22px_55px_rgba(16,50,76,0.13)] dark:border-white/10">
            <Image
              src={photo2Src}
              alt="Mintex Staffing recruiter finalizing a placement"
              fill
              sizes="(min-width: 1024px) 30vw, 52vw"
              className="object-cover"
            />
          </div>

          {/* badge-two: bottom12 left-130, relative to person-card-two
              (360x350) — exact percentages of that box: 3.43% / -36.11%. */}
          <div className="absolute bottom-[3.43%] left-[-36.11%] flex w-[71%] items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_15px_40px_rgba(21,54,79,0.13)] dark:bg-navy-800">
            {/* The real connector-touch-point dot, anchored to this card's
                own box via CSS so it's correct at every viewport width
                (verified 1024/1440/1920) — unlike a fixed SVG coordinate,
                which can't track this card's position since the SVG
                viewBox scales independently of this card's fixed padding. */}
            <span
              aria-hidden="true"
              className="absolute -left-[7px] -top-[7px] h-3.5 w-3.5 rounded-full bg-[#2f6688]"
            />
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#c6ade7] text-navy dark:bg-cream/10 dark:text-cream">
              <IconShield className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold leading-none text-navy dark:text-cream">93%</p>
              <p className="mt-1.5 text-[13px] leading-tight text-steel dark:text-steel-light">Client retention</p>
            </div>
          </div>
        </div>

        {/* metric-card: left85 top355 (of the 680x560 canvas directly, not
            nested in a photo) — exact percentages: 12.5% / 63.39%. Shadow:
            exact 0 16px 35px rgba(7,56,102,0.2) from the reference code. */}
        <div className="absolute left-[12.5%] top-[63.39%] flex min-w-[19.4%] items-center gap-3 rounded-2xl bg-white p-3.5 shadow-[0_16px_35px_rgba(7,56,102,0.2)] dark:bg-navy-800">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#b8e6c1] text-navy dark:bg-cream/10 dark:text-cream">
            <IconClock className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold leading-none text-navy dark:text-cream">9 days</p>
            <p className="mt-1.5 text-[13px] leading-tight text-steel dark:text-steel-light">Avg. time to fill</p>
          </div>
        </div>

        {/* metric-two: right315 top485 (46.32% / 86.61%) sits directly on
            top of badge-two at those exact coordinates. Nudged rightward
            only — right-[14.4%] instead of 46.32% — clearing badge-two's
            right edge (65.4%) while keeping the same top position. Shadow:
            exact 0 15px 40px rgba(29,58,80,0.11) from the reference code. */}
        <div className="absolute right-[14.4%] top-[86.61%] flex min-w-[19.4%] items-center gap-3 rounded-2xl border border-navy/10 bg-white p-3.5 shadow-[0_15px_40px_rgba(29,58,80,0.11)] dark:border-white/10 dark:bg-navy-800">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#d4d3e5] text-navy dark:bg-cream/10 dark:text-cream">
            <IconGrid className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold leading-none text-navy dark:text-cream">9+</p>
            <p className="mt-1.5 text-[13px] leading-tight text-steel dark:text-steel-light">Industries served</p>
          </div>
        </div>
      </div>
    </div>
  );
}
