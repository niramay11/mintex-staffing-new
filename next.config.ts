import type { NextConfig } from "next";

// Every host below is one this site actually loads at runtime — verified in
// code, not guessed: GTM/GA4 script (DeferredAnalytics.tsx), YouTube embeds
// (ClientStories/TestimonialCard) + their img.youtube.com thumbnails, the
// Google Maps iframe on /contact, and Supabase (site images + client-portal
// auth). 'unsafe-inline' is required for both script-src and style-src —
// Next's own hydration scripts need it, and `experimental.inlineCss` above
// inlines all page CSS as <style> tags, which a stricter policy would block
// outright (no nonce plumbing exists here to avoid it). Ceipal API calls are
// unaffected: every api.ceipal.com fetch happens server-side (lib/ceipal*.ts
// via app/api/**/route.ts) — the browser never talks to Ceipal directly, so
// no Ceipal host needs to appear in connect-src.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://img.youtube.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.supabase.co",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com",
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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      {
        source: "/insights/:slug",
        destination: "/insights/post/:slug",
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
