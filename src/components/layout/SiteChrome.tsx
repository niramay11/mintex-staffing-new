"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import type { Industry } from "@/content/types";

// Routes that render their own full-screen chrome (dark standalone tools).
const BARE_ROUTES = ["/client-portal", "/admin"];

export default function SiteChrome({
  children,
  siteImages,
  industries,
}: {
  children: React.ReactNode;
  siteImages: Record<string, string>;
  industries: Industry[];
}) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (bare) return <>{children}</>;

  return (
    <>
      <Header siteImages={siteImages} industries={industries} />
      <main className="flex-1 pb-6">{children}</main>
      <Footer siteImages={siteImages} industries={industries} />
    </>
  );
}
