import Image from "next/image";

// Clean hero visual shared by /get-hired and /seek-talent: one large rounded
// photo with a soft offset backing plate behind it — no floating badges.
export default function HeroImage({
  src,
  alt,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  // Focal point for the crop, e.g. "center 20%" to keep a portrait's face in frame.
  objectPosition?: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto lg:mr-0">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] bg-steel/[0.12] dark:bg-white/[0.06]"
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] shadow-[0_30px_60px_-25px_rgba(0,48,96,0.35)] ring-1 ring-navy/[0.06] dark:ring-white/10">
        <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 540px, 100vw" className="object-cover" style={{ objectPosition }} />
      </div>
    </div>
  );
}
