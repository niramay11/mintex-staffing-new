import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

export const metadata: Metadata = pageMetadata({
  title: "How We Work",
  description:
    "See how Mintex Staffing scopes, sources, and supports every search, plus how existing clients sign in to the client portal.",
  path: "/seek-talent/how-we-work",
});

function IconSearchTalent({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5M3 8l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

const steps = [
  {
    number: "1",
    title: "",
    description:
      "Finding the right job shouldn't feel like sending resumes into a void. At Mintex Staffing, we take time to understand where you've been and where you want to go and then match you with roles across IT, healthcare, engineering, manufacturing, finance, administrative, sales, customer service, legal and logistics that actually fit.",
    icon: IconSearchTalent,
  },
  {
    number: "2",
    title: "",
    description:
      "It starts with a conversation, not a form. We understand your skills, your goals, and the kind of workplace culture where you'll thrive and grow. From there, we tap our active employer network to connect you with roles that match your experience, and we screen every opportunity before it reaches you, so your time is never wasted on a bad fit.",
    icon: IconLayers,
  },
  {
    number: "3",
    title: "",
    description:
      "Once you're placed, we don't disappear. We stay involved through your offer, your first days on the job, and beyond, because your success is our success.",
    icon: IconTarget,
  },
  {
    number: "4",
    title: "",
    description:
      "Whether you're exploring a career change or ready for your next step, Mintex Staffing is here to help you find your desired position that fits your standards. Ready to get started?",
    icon: IconTarget,
  },
];

const clientSteps = [
  {
    number: "1",
    title: "",
    description:
      "At Mintex Staffing, our hiring process starts with listening, what you want, how soon you want and your future goals for the business. We partner with employers to help them with IT staffing, healthcare staffing, engineering staffing, manufacturing staffing, finance staffing, administrative staffing, sales staffing, customer service staffing, legal staffing and logistics staffing, which means no two searches look the same, and no two shortlists should either.",
  },
  {
    number: "2",
    title: "",
    description:
      "Every engagement begins with a scoping call, where we learn your team's culture, timeline, and what “great fit” really means for your business, before we start the hunt. From there, we source and screen candidates from our active talent network, vetting for skill, experience, and cultural fit so you only meet people worth your time.",
  },
  {
    number: "3",
    title: "",
    description:
      "Placement isn't the finish line. We stay involved through offer negotiations, onboarding, and beyond, making sure the fit holds up in the real world.",
  },
  {
    number: "4",
    title: "",
    description:
      "This is what lets Mintex Staffing deliver consistent, high-quality hires across industries, not just fast ones. Ready to build a shortlist around your team?",
  },
];

const faqs = [
  {
    question: "How quickly can Mintex Staffing fill an open role?",
    answer:
      "Our average time to hire is 9 days, drawing from an active, pre-vetted talent network across every industry we serve.",
  },
  {
    question: "What types of hiring arrangements do you offer?",
    answer:
      "Contract, permanent, and executive search placements, so you can pick the engagement model that fits your project or team.",
  },
  {
    question: "Can a contract hire convert to a full-time employee?",
    answer:
      "Yes. Many of our contract placements are structured with a clear path to permanent hire once both sides confirm it's the right fit.",
  },
  {
    question: "What industries does Mintex Staffing recruit for?",
    answer:
      "IT, healthcare, engineering, manufacturing, finance, administrative, sales, customer service, and logistics.",
  },
  {
    question: "How do I get started?",
    answer:
      "Reach out through our contact form or submit a hiring inquiry, and our team will schedule a scoping call to understand your needs before we source any candidates.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default async function HowWeWorkPage() {
  const siteImages = await getSiteImages();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Seek Talent", path: "/seek-talent" },
    { name: "How We Work", path: "/seek-talent/how-we-work" },
  ]);
  return (
    <>
      <script
        id="how-we-work-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="how-we-work-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
          Our process
        </p>
        <h1 className="mt-2.5 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">How Our Staffing Process Works</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          At Mintex Staffing, every partnership begins with a conversation. We take time to
          understand your team, culture, and hiring timeline before recommending a single
          candidate, because a great fit starts with real insight. Our proven hiring process
          helps businesses across IT, healthcare, manufacturing, finance, and more industries.
        </p>
      </Section>

      <Section background="white">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                For clients
              </p>
              <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
                How We Help Our Clients
              </h2>

              <p className="mt-6 text-[15px] leading-relaxed text-navy/70 dark:text-cream/70">
                {clientSteps[0].description}
              </p>
              <Link
                href="/seek-talent/how-we-work/for-clients"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-navy-secondary dark:text-cream"
              >
                Know more
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className="mt-8">
                <ButtonLink href="/seek-talent/get-started" variant="primary">
                  Let&apos;s Talk Hiring
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-steel/25"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:how-we-work-clients-visual"]}
                  alt="Mintex Staffing recruiter discussing hiring needs with a client team"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-20 grid items-center gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-steel/25"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:how-we-work-visual"]}
                  alt="Hiring manager and candidate discussing a staffing role with Mintex Staffing's recruitment guidance"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                For job seekers
              </p>
              <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
                How We Help Job Seekers
              </h2>

              <p className="mt-6 text-[15px] leading-relaxed text-navy/70 dark:text-cream/70">
                {steps[0].description}
              </p>
              <Link
                href="/get-hired/how-we-work/for-job-seekers"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-navy-secondary dark:text-cream"
              >
                Know more
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className="mt-8">
                <ButtonLink href="/get-hired" variant="primary">
                  Browse Open Roles
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_15px_35px_-15px_rgba(0,48,96,0.15)] sm:flex-row sm:items-center sm:p-8 dark:border-white/10 dark:bg-navy-900">
            <div>
              <h3 className="text-lg font-semibold text-navy dark:text-cream">Already a client?</h3>
              <p className="mt-1 text-sm text-navy/70 dark:text-cream/70">
                Sign in to the client portal to review candidates, track open roles, and manage
                your account.
              </p>
            </div>
            <ButtonLink href="/client-portal" variant="secondary" className="flex-shrink-0">
              Client Login
            </ButtonLink>
          </div>

          <div className="mt-16">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Common questions
            </p>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
              Frequently asked questions
            </h2>
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </Section>
    </>
  );
}
