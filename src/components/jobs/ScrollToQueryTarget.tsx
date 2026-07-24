"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Cross-page "jump to a section on this page" links (nav menu, homepage
// tiles) used to point at /get-hired#apply-to-jobs, leaving that hash sitting
// in the URL forever. This does the same scroll via a `?section=` query
// param instead, then strips the param back out once it's scrolled — so the
// URL settles on a plain /get-hired with no leftover fragment or query.
export default function ScrollToQueryTarget({ paramName = "section" }: { paramName?: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const target = searchParams.get(paramName);
    if (!target) return;
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    router.replace(pathname, { scroll: false });
  }, [searchParams, paramName, pathname, router]);

  return null;
}
