import { getSiteImages } from "@/lib/siteImages";

// Stable URL for the link-preview (og:image) picture: every page's metadata
// points here instead of at a fixed file, and this serves whatever is set in
// admin → Site Images → Global → "Share Link Preview Image" (default:
// /og-image.jpg). The bytes are proxied rather than redirected because some
// social crawlers don't follow redirects on og:image URLs.
export async function GET(request: Request) {
  const images = await getSiteImages();
  const src = images["global:share-image"] || "/og-image.jpg";
  const url = new URL(src, request.url);

  let res = await fetch(url);
  if (!res.ok && src !== "/og-image.jpg") res = await fetch(new URL("/og-image.jpg", request.url));
  if (!res.ok || !res.body) return new Response("Share image unavailable", { status: 502 });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      // Short CDN cache so an admin change shows up within ~10 minutes.
      "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
