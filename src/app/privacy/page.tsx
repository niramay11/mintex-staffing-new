import { pageMetadata } from "@/lib/pageMetadata";
import Section from "@/components/ui/Section";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Mintex Staffing collects, uses, and protects your personal information.",
  path: "/privacy",
});

const LAST_UPDATED = "July 27, 2026";

export default function PrivacyPolicyPage() {
  return (
    <Section background="cream" className="!py-12 sm:!py-14 lg:!py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-navy sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-navy/50">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-[15.5px] leading-relaxed text-navy/80">
          <p>
            Mintex Staffing (&quot;Mintex,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your
            privacy. This policy explains what information we collect through
            mintexstaffing.com, how we use it, and the choices you have.
          </p>

          <section>
            <h2 className="text-xl font-bold text-navy">Information we collect</h2>
            <p className="mt-3">We collect information you provide directly to us, including:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Contact form:</strong> name, email, phone, company, and your message.
              </li>
              <li>
                <strong>Job applications and resume submissions:</strong> name, email, phone,
                address, work authorization, availability, current job title, resume/CV file, and
                any other details you choose to include.
              </li>
              <li>
                <strong>Hiring inquiries:</strong> name, email, phone, company, job title, and
                position details for employers looking to hire.
              </li>
              <li>
                <strong>Job alert sign-ups:</strong> email address and your search preferences
                (keyword, location).
              </li>
            </ul>
            <p className="mt-3">
              We also automatically collect standard analytics data (such as pages visited and
              general device/browser information) through Google Analytics, using cookies. You can
              control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">How we use your information</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>To respond to your inquiries and process job applications.</li>
              <li>To match candidates with relevant open roles and share your application with our recruiting team.</li>
              <li>To send job alerts you&apos;ve signed up for (you can unsubscribe at any time).</li>
              <li>To communicate with employers about their hiring needs.</li>
              <li>To understand site usage and improve our website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">How we share your information</h2>
            <p className="mt-3">
              We do not sell your personal information. We share it only:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>With our internal recruiting team, to evaluate your application or inquiry.</li>
              <li>With prospective employers, if you apply to one of their open roles.</li>
              <li>With service providers who help us operate the site (e.g. email delivery, hosting, analytics), under obligations to protect your data.</li>
              <li>When required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Data retention</h2>
            <p className="mt-3">
              We retain application and inquiry information for as long as reasonably necessary to
              consider you for current and future opportunities, or as required by law. You can
              request deletion at any time using the contact details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Your choices</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Unsubscribe from job alert emails using the link in any alert email.</li>
              <li>Request access to, correction of, or deletion of your personal information.</li>
              <li>Opt out of analytics cookies through your browser settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-navy">Contact us</h2>
            <p className="mt-3">
              Questions about this policy or your data? Reach us at{" "}
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
