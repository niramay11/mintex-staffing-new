import { pageMetadata } from "@/lib/pageMetadata";
import Section from "@/components/ui/Section";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of the Mintex Staffing website.",
  path: "/terms",
});

const LAST_UPDATED = "July 27, 2026";

export default function TermsOfServicePage() {
  return (
    <Section background="cream" className="!py-12 sm:!py-14 lg:!py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-navy sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-navy/50">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-[15.5px] leading-relaxed text-navy/80">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of mintexstaffing.com
            (the &quot;Site&quot;), operated by Mintex Staffing. By using the Site, you agree to
            these Terms.
          </p>

          <section>
            <h2 className="text-xl font-bold text-navy">Using the site</h2>
            <p className="mt-3">
              You may use the Site to browse job openings, apply for roles, request staffing
              services, and access our published resources (such as the hiring cost calculator and
              interview question generator). You agree to provide accurate information when
              submitting a form, application, or resume, and not to misuse the Site (including
              attempting to disrupt it, scrape it at scale, or submit false information).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Job applications and staffing services</h2>
            <p className="mt-3">
              Submitting an application does not guarantee an interview, placement, or offer of
              employment. Mintex Staffing acts as an intermediary between candidates and employers;
              final hiring decisions are made by the employer. Similarly, submitting a hiring
              inquiry does not create a binding service agreement — that is established separately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Tools and calculators</h2>
            <p className="mt-3">
              Resources like the Hiring Cost Calculator and AI Interview Question Generator are
              provided for general informational purposes only and do not constitute financial,
              legal, or HR advice. Results are estimates and should be verified independently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Intellectual property</h2>
            <p className="mt-3">
              All content on the Site — including text, graphics, and logos — is owned by Mintex
              Staffing or its licensors and may not be reproduced without permission, except for
              your own personal, non-commercial use (such as printing a job posting to reference
              later).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Disclaimer and limitation of liability</h2>
            <p className="mt-3">
              The Site is provided &quot;as is&quot; without warranties of any kind. Job listings
              are sourced from employers and third-party systems and may change or be filled at any
              time. To the fullest extent permitted by law, Mintex Staffing is not liable for any
              indirect or consequential damages arising from your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Changes to these terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. Continued use of the Site after changes
              are posted constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Contact us</h2>
            <p className="mt-3">
              Questions about these Terms? Reach us at{" "}
              <a href="mailto:info@mintexstaffing.com" className="font-medium text-tan hover:underline">
                info@mintexstaffing.com
              </a>{" "}
              or +1 (732) 983-5723, or by mail at 2163 Oak Tree Rd, Edison, NJ 08820.
            </p>
          </section>
        </div>
      </div>
    </Section>
  );
}
