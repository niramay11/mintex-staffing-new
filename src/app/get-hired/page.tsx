import type { Metadata } from "next";
import GetHiredContent from "@/components/get-hired/GetHiredContent";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

// "Find Jobs: Contract & Full-Time Roles" + " | Mintex Staffing" fits in 60
// chars, so the layout template produces the exact title.
export const metadata: Metadata = pageMetadata({
  title: "Find Jobs: Contract & Full-Time Roles",
  description:
    "Browse contract, contract-to-hire and full-time jobs across 12 industries. Free for job seekers: apply, share your resume and get matched by a recruiter.",
  path: "/get-hired",
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Get Hired", path: "/get-hired" },
]);

// Cached page (ISR), refreshed in the background every 10 minutes — it was
// force-dynamic before, which Ahrefs flagged as a slow server response
// (~1.5s). Jobs stay fresh: the underlying jobs cache is 20 minutes anyway,
// and the job board fetches jobs client-side if a snapshot has none.
export const revalidate = 600;

// GetHiredContent schedules a background cache warm-up (via `after()`) that
// can take up to ~45s on a cold cache — without raising this, Vercel's
// default timeout would kill that background work before it finishes.
export const maxDuration = 60;

export default function GetHiredPage() {
  return (
    <>
      <script
        id="get-hired-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <GetHiredContent />
    </>
  );
}
