import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { Inter, Poppins } from "next/font/google";
import DeferredAnalytics from "@/components/analytics/DeferredAnalytics";
import SiteChrome from "@/components/layout/SiteChrome";
import { getSiteImages } from "@/lib/siteImages";
import { getLocalBusinessSchema } from "@/lib/localBusinessSchema";
import { getIndustries } from "@/lib/industries";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Staffing & Recruitment | Mintex Staffing",
    template: "%s | Mintex Staffing",
  },
  description:
    "Mintex Staffing connects exceptional talent with leading employers across IT, healthcare, engineering, manufacturing, finance, and more.",
  openGraph: {
    title: "Staffing & Recruitment | Mintex Staffing",
    description:
      "Mintex Staffing connects exceptional talent with leading employers across IT, healthcare, engineering, manufacturing, finance, and more.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Staffing & Recruitment | Mintex Staffing",
    description:
      "Mintex Staffing connects exceptional talent with leading employers across IT, healthcare, engineering, manufacturing, finance, and more.",
    images: ["/og-image.png"],
  },
  // Next's file-based icon convention (src/app/favicon.ico, icon.png,
  // apple-icon.png) already emits modern rel="icon"/rel="apple-touch-icon"
  // tags, which is all real browsers and Google need — but some SEO
  // auditing tools only recognize the older rel="shortcut icon" attribute
  // and report "no favicon" without it. Declaring `icons` here REPLACES the
  // file-based auto-detection entirely rather than adding to it (confirmed
  // live — icon.png and apple-touch-icon silently disappeared from <head>
  // when only `shortcut` was set here), so every icon has to be listed
  // explicitly to avoid losing the other two.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteImages, localBusinessSchema, industries] = await Promise.all([
    getSiteImages(),
    getLocalBusinessSchema(),
    getIndustries(),
  ]);

  ReactDOM.preconnect("https://img.youtube.com");

  return (
    <html lang="en-US" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream">
        <script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <DeferredAnalytics />
        <SiteChrome siteImages={siteImages} industries={industries}>{children}</SiteChrome>
      </body>
    </html>
  );
}
