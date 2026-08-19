import type { ReactNode } from "react";
import Image from "next/image";
import { getSiteImages } from "@/lib/siteImages";

const backgrounds = {
  navy: "bg-gradient-to-br from-navy via-navy-deep to-navy-secondary text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 dark:text-cream",
  white: "bg-white dark:bg-navy-900",
  mist: "bg-mist dark:bg-navy-900",
  tan: "bg-white text-navy dark:bg-navy-900 dark:text-cream",
  cream: "bg-mist dark:bg-navy-900",
} as const;

export default async function Section({
  children,
  background = "white",
  className = "",
  id,
  backgroundMedia,
}: {
  children: ReactNode;
  background?: keyof typeof backgrounds;
  className?: string;
  id?: string;
  backgroundMedia?: ReactNode;
}) {
  const showMark = (background === "navy" || background === "mist") && !backgroundMedia;
  const siteImages = showMark ? await getSiteImages() : null;

  return (
    <section
      id={id}
      className={`relative mx-auto max-w-[1920px] overflow-hidden border-t border-navy/[0.06] px-6 py-16 dark:border-white/[0.08] sm:px-10 sm:py-20 lg:px-16 lg:py-24 ${backgrounds[background]} ${className}`}
    >
      {backgroundMedia && <div aria-hidden="true" className="absolute inset-0">{backgroundMedia}</div>}
      {background === "navy" && !backgroundMedia && (
        <>
          <div aria-hidden="true" className="bg-grid-pattern pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-steel-lighter/20 blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-16 h-[460px] w-[460px] rounded-full bg-steel/25 blur-[120px]"
          />
        </>
      )}
      {showMark && background === "navy" && (
        <Image
          src={siteImages!["global:navy-section-mark"]}
          alt=""
          aria-hidden="true"
          width={784}
          height={395}
          className="pointer-events-none absolute -right-20 top-1/2 hidden h-[300px] w-auto -translate-y-1/2 select-none object-contain md:block lg:h-[380px]"
          style={{
            opacity: 0.5,
            maskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
            WebkitMaskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
          }}
        />
      )}
      {showMark && background === "mist" && (
        <span className="pointer-events-none absolute -right-20 top-1/2 hidden h-[300px] w-auto -translate-y-1/2 md:block lg:h-[380px]">
          <Image
            src={siteImages!["global:light-section-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="h-full w-auto select-none object-contain dark:hidden"
            style={{
              opacity: 0.14,
              maskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
              WebkitMaskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
            }}
          />
          <Image
            src={siteImages!["global:navy-section-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="hidden h-full w-auto select-none object-contain dark:block"
            style={{
              maskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
              WebkitMaskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
            }}
          />
        </span>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
