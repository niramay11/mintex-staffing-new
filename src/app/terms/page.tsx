import { pageMetadata } from "@/lib/pageMetadata";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of the Mintex Staffing website.",
  path: "/terms",
});

const LAST_UPDATED = "July 27, 2026";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro={
        <>
          These Terms of Service (&quot;Terms&quot;) govern your use of mintexstaffing.com (the
          &quot;Site&quot;), operated by Mintex Staffing. By using the Site, you agree to these
          Terms.
        </>
      }
      sections={[
        {
          id: "using-the-site",
          title: "Using the site",
          content: (
            <p>
              You may use the Site to browse job openings, apply for roles, request staffing
              services, and access our published resources (such as the hiring cost calculator and
              interview question generator). You agree to provide accurate information when
              submitting a form, application, or resume, and not to misuse the Site (including
              attempting to disrupt it, scrape it at scale, or submit false information).
            </p>
          ),
        },
        {
          id: "job-applications",
          title: "Job applications and staffing services",
          content: (
            <p>
              Submitting an application does not guarantee an interview, placement, or offer of
              employment. Mintex Staffing acts as an intermediary between candidates and employers;
              final hiring decisions are made by the employer. Similarly, submitting a hiring inquiry
              does not create a binding service agreement — that is established separately.
            </p>
          ),
        },
        {
          id: "tools-and-calculators",
          title: "Tools and calculators",
          content: (
            <p>
              Resources like the Hiring Cost Calculator and AI Interview Question Generator are
              provided for general informational purposes only and do not constitute financial,
              legal, or HR advice. Results are estimates and should be verified independently.
            </p>
          ),
        },
        {
          id: "intellectual-property",
          title: "Intellectual property",
          content: (
            <p>
              All content on the Site — including text, graphics, and logos — is owned by Mintex
              Staffing or its licensors and may not be reproduced without permission, except for your
              own personal, non-commercial use (such as printing a job posting to reference later).
            </p>
          ),
        },
        {
          id: "disclaimer",
          title: "Disclaimer and limitation of liability",
          content: (
            <p>
              The Site is provided &quot;as is&quot; without warranties of any kind. Job listings are
              sourced from employers and third-party systems and may change or be filled at any time.
              To the fullest extent permitted by law, Mintex Staffing is not liable for any indirect
              or consequential damages arising from your use of the Site.
            </p>
          ),
        },
        {
          id: "changes-to-terms",
          title: "Changes to these terms",
          content: (
            <p>
              We may update these Terms from time to time. Continued use of the Site after changes
              are posted constitutes acceptance of the updated Terms.
            </p>
          ),
        },
        {
          id: "contact-us",
          title: "Contact us",
          content: (
            <p>
              Questions about these Terms? Reach us at{" "}
              <a href="mailto:info@mintexstaffing.com">info@mintexstaffing.com</a> or +1 (732)
              983-5723, or by mail at 2163 Oak Tree Rd, Edison, NJ 08820.
            </p>
          ),
        },
      ]}
    />
  );
}
