import type { MetadataRoute } from "next";

// TODO: replace with the real production domain once it's registered/confirmed.
const baseUrl = "https://www.mintexstaffing.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
