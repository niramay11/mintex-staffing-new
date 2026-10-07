import type { NextConfig } from "next";

// Every host below is one this site actually loads at runtime — verified in
// code, not guessed: GTM/GA4 script (DeferredAnalytics.tsx), YouTube embeds
// (ClientStories/TestimonialCard) + their img.youtube.com thumbnails, the
// Google Maps iframe on /contact, Supabase (site images + client-portal
// auth), and Calendly's popup scheduling widget (CalendlyButton, /contact —
// assets.calendly.com serves its script/CSS, calendly.com is the popup
// iframe itself and its API calls). 'unsafe-inline' is required for both
// script-src and style-src — Next's own hydration scripts need it, and
// `experimental.inlineCss` above inlines all page CSS as <style> tags,
// which a stricter policy would block outright (no nonce plumbing exists
// here to avoid it). Ceipal API calls are unaffected: every api.ceipal.com
// fetch happens server-side (lib/ceipal*.ts via app/api/**/route.ts) — the
// browser never talks to Ceipal directly, so no Ceipal host needs to
// appear in connect-src.
//
// GA4 hosts follow Google's published CSP guidance for GA4 with Google
// Signals: hits go to analytics.google.com (a bare host `*.analytics.google.com`
// doesn't match), www.google.com/g/collect and stats.g.doubleclick.net, and
// audience pixels load as images from www.google.com. Signals can also hit a
// country domain (e.g. www.google.co.in); CSP can't wildcard a TLD, so those
// stay blocked — they're remarketing pixels only, not page-view hits.
const GA_HOSTS =
  "https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://assets.calendly.com",
  "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
  `img-src 'self' data: blob: https://*.supabase.co https://img.youtube.com ${GA_HOSTS} https://assets.calendly.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${GA_HOSTS} https://*.supabase.co https://calendly.com https://*.calendly.com`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://calendly.com https://*.calendly.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  // pdfkit (interview-kit PDF attachment, lib/interviewKit/kitPdf.ts) reads
  // its built-in font metric files from its own package folder at runtime —
  // bundling it breaks those paths, so load it with plain Node require.
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    minimumCacheTTL: 2678400,
    // Default list tops out at 3840px — crawlers (Ahrefs) fetch the largest
    // srcset candidate, and a 3840px copy of a big upload was flagged as
    // "image file size too large" (2.1 MB). 2048px is still sharp for the
    // widest images here (full-width banners) on retina laptops.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  async redirects() {
    return [
      {
        source: "/insights/:slug",
        destination: "/insights/post/:slug",
        permanent: true,
      },
      // How We Work now carries both processes in full, so the old
      // sub-pages point at their matching sections. Their page files are
      // kept but unreachable (redirects run before the filesystem).
      {
        source: "/seek-talent/how-we-work/for-clients",
        destination: "/seek-talent/how-we-work#employers",
        permanent: true,
      },
      {
        source: "/get-hired/how-we-work/for-job-seekers",
        destination: "/seek-talent/how-we-work#job-seekers",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
