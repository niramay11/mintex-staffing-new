import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
import SiteChrome from "@/components/layout/SiteChrome";
import { getSiteImages } from "@/lib/siteImages";
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
  title: {
    default: "Mintex Staffing | IT, Healthcare & Engineering Staffing Agency",
    template: "%s | Mintex Staffing",
  },
  description:
    "Mintex Staffing connects exceptional talent with leading employers across IT, healthcare, engineering, manufacturing, finance, and more.",
  openGraph: {
    title: "Mintex Staffing | IT, Healthcare & Engineering Staffing Agency",
    description:
      "Mintex Staffing connects exceptional talent with leading employers across IT, healthcare, engineering, manufacturing, finance, and more.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteImages = await getSiteImages();

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X8S5R27JY4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X8S5R27JY4');
          `}
        </Script>
        <SiteChrome siteImages={siteImages}>{children}</SiteChrome>
      </body>
    </html>
  );
}
