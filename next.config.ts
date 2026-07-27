import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
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
};

export default nextConfig;
