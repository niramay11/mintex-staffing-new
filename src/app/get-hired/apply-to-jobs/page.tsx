import type { Metadata } from "next";
import GetHiredContent from "@/components/get-hired/GetHiredContent";
import ScrollToSection from "@/components/get-hired/ScrollToSection";
import { pageMetadata } from "@/lib/pageMetadata";

// Same content as /get-hired, scrolled to the "Apply to Jobs" section — the
// canonical stays on /get-hired so search engines don't index this as
// duplicate content.
export const metadata: Metadata = pageMetadata({
  title: "Get Hired",
  description:
    "Apply to open roles, share your resume, sign up for job alerts, and prep for your next interview with Mintex Staffing.",
  path: "/get-hired",
});

// Cached page (ISR), refreshed in the background every 10 minutes — it was
// force-dynamic before, which Ahrefs flagged as a slow server response
// (~1.5s). Jobs stay fresh: the underlying jobs cache is 20 minutes anyway,
// and the job board fetches jobs client-side if a snapshot has none.
export const revalidate = 600;

export default function ApplyToJobsPage() {
  return (
    <>
      <ScrollToSection id="apply-to-jobs" />
      <GetHiredContent />
    </>
  );
}
