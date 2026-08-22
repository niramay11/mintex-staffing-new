import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import EmailResultsClient from "@/components/tools/EmailResultsClient";

// Personal, per-session breakdown data — never indexed, and not linked from
// anywhere except the calculator's own "Email me this breakdown" button.
export const metadata: Metadata = {
  title: "Email Your Hiring Cost Breakdown | Mintex Staffing",
  robots: { index: false, follow: false },
};

export default function EmailResultsPage() {
  return (
    <Section background="cream" className="!py-12 sm:!py-14 lg:!py-16">
      <EmailResultsClient />
    </Section>
  );
}
