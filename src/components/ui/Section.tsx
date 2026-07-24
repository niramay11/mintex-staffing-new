import type { ReactNode } from "react";
import Image from "next/image";
import { getSiteImages } from "@/lib/siteImages";

const backgrounds = {
  navy: "bg-gradient-to-br from-navy via-navy-deep to-navy-secondary text-white shadow-[0_30px_80px_-30px_rgba(0,48,96,0.55)]",
  white: "bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)]",
  mist: "bg-mist",
  tan: "bg-tan text-navy",
  cream: "bg-cream",
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
  const siteImages = background === "navy" && !backgroundMedia ? await getSiteImages() : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <section
        id={id}
        className={`relative mx-auto mt-6 max-w-[1920px] overflow-hidden rounded-[32px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 ${backgrounds[background]} ${className}`}
      >
        {backgroundMedia && <div aria-hidden="true" className="absolute inset-0">{backgroundMedia}</div>}
        {background === "navy" && !backgroundMedia && (
          <>
            <div aria-hidden="true" className="bg-grid-pattern pointer-events-none absolute inset-0" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-tan/20 blur-[110px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -right-16 h-[460px] w-[460px] rounded-full bg-steel/25 blur-[120px]"
            />
            <Image
              src={siteImages!["global:navy-section-mark"]}
              alt=""
              aria-hidden="true"
              width={784}
              height={395}
              className="pointer-events-none absolute -right-20 top-1/2 hidden h-[300px] w-auto -translate-y-1/2 select-none md:block lg:h-[380px]"
              style={{
                opacity: 0.5,
                maskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
                WebkitMaskImage: "linear-gradient(115deg, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 55%, black 85%)",
              }}
            />
          </>
        )}
        <div className="relative">{children}</div>
      </section>
    </div>
  );
}
