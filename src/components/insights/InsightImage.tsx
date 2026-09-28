import Image from "next/image";

// Insight images are admin-uploaded originals in Supabase storage — the
// two live ones were 1.6MB and 2.9MB JPEGs, flagged by Ahrefs as "image file
// size too large" because a raw <img> served them as-is. next/image resizes
// and re-encodes them (WebP/AVIF) per `sizes`. It only works for hosts
// allowed in next.config.ts's images.remotePatterns, so any other
// admin-pasted URL still falls back to a plain <img> instead of erroring.
function isOptimizable(src: string): boolean {
  try {
    return new URL(src).hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export default function InsightImage({
  src,
  alt = "",
  sizes,
  className = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- non-allowlisted admin-supplied URL
  return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}
