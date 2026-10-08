import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import FaqSplit from "@/components/ui/FaqSplit";
import IndustriesShowcase from "@/components/home/IndustriesShowcase";
import ServicePointRows, { PointList, PointTags } from "@/components/seek-talent/ServicePointRows";
import { getHiringServiceBySlug } from "@/content/hiringServices";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { SITE_URL } from "@/lib/site";

// Dedicated page — takes precedence over /seek-talent/[slug] for this URL.
// Contract Talent got its own structure (definition, contract-to-hire,
// engagement types, FAQ) that the shared service template doesn't have.

const PATH = "/seek-talent/contract-talent";
const PAGE_DESCRIPTION =
  "Contract and contract-to-hire staffing for projects, seasonal peaks and leave coverage. Pre-screened professionals, 9-day average fill. Edison, NJ.";

// Exact title via `absolute` — pageMetadata's fitTitle would otherwise drop
// the brand (title + " | Mintex Staffing" runs past 60 chars).
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Contract Staffing & Contract-to-Hire Services",
    description: PAGE_DESCRIPTION,
    path: PATH,
  }),
  title: { absolute: "Contract Staffing & Contract-to-Hire Services | Mintex" },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Seek Talent", path: "/seek-talent" },
  { name: "Contract Talent", path: PATH },
]);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Contract staffing",
  name: "Contract staffing and contract-to-hire",
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: { "@type": "Country", name: "United States" },
};

const USE_CASES = [
  { title: "A project with an end date.", text: "A system migration, a plant relaunch, a product launch." },
  {
    title: "A seasonal or demand spike.",
    text: "Like the logistics client who needed 25 warehouse staff in a month and had a vetted team in three weeks.",
  },
  {
    title: "Leave or vacancy coverage.",
    text: "Someone on leave, someone who quit, a seat that can't sit empty while you run a full search.",
  },
  { title: "A skill you need for months, not years.", text: "Specialist IT, engineering or compliance work." },
];

const ENGAGEMENT_TYPES = ["W-2", "1099", "Corp-to-corp (C2C)", "Full-time"];

const INCLUDED = [
  "A scoping call to pin down the project, the timeline and the skills.",
  "Candidates screened and matched to that scope, so you're not sorting unqualified resumes.",
  "A professional who's ready to start, with no lengthy onboarding on your side.",
  "Ongoing check-ins during the assignment, plus a client portal to track every role.",
];

const FAQS = [
  {
    question: "How fast can a contractor start?",
    answer: "Our average time to fill is 9 days, because we start with candidates we've already screened.",
  },
  {
    question: "Who employs the contractor?",
    answer:
      "It depends on the arrangement. On a W-2 contract, the contractor is typically employed by the staffing agency, not by you. We'll walk you through the options on the scoping call.",
  },
  {
    question: "Can I hire a contractor permanently?",
    answer: "Yes. Many of our contract placements convert to permanent once both sides confirm the fit.",
  },
  {
    question: "What if the contractor isn't working out?",
    answer: "Tell us early. We'll talk through what's missing and find a replacement.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function ContractTalentPage() {
  const siteImages = await getSiteImages();
  const ServiceIcon = getHiringServiceBySlug("contract-talent")?.icon;

  return (
    <>
      <script
        id="hiring-service-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="contract-talent-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        id="contract-talent-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Sec 1 — Hero */}
      <Section background="mist" className="relative !py-12 sm:!py-14 lg:!py-16">
        <Link
          href="/seek-talent"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-navy/60 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream"
        >
          <IconArrowLeft className="h-4 w-4" />
          Seek Talent
        </Link>

        <div className="mt-6 flex w-fit items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[14.5px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
          {ServiceIcon && <ServiceIcon className="h-4 w-4 flex-shrink-0" />}
          Flexible staffing
        </div>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl dark:text-cream">
          Contract staffing for projects, peaks and coverage gaps
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
          Bring in a screened professional for as long as the work needs them. No months-long search, no
          permanent headcount until you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/seek-talent/get-started" variant="primary" className="inline-flex items-center gap-2">
            Discuss your hiring needs
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink
            href="/seek-talent"
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            See all services
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Section>

      {/* Sec 2 — Content in the original service-template design: one
          photo + card row per topic (definition first: featured-snippet
          target), "Let's talk" in the last card. */}
      <ServicePointRows
        slug="contract-talent"
        siteImages={siteImages}
        points={[
          {
            title: "What is contract staffing?",
            imageAlt: "Mintex Staffing recruiter discussing a contract placement with a client",
            body: (
              <p>
                Contract staffing means bringing in a skilled professional for a set period, such as a project, a
                busy season or a leave of absence, without adding permanent headcount. Mintex finds, screens and
                places the contractor. If the fit is right, many contracts convert to permanent hires.
              </p>
            ),
          },
          {
            title: "When contract talent makes sense",
            imageAlt: "Contract professional joining a client team for a project",
            body: (
              <PointList
                items={USE_CASES.map((useCase) => (
                  <>
                    <strong>{useCase.title}</strong> {useCase.text}
                  </>
                ))}
              />
            ),
          },
          {
            id: "contract-to-hire",
            title: "Contract-to-hire: see the work before you make the offer",
            imageAlt: "Contract hire working alongside a client team before converting to a permanent role",
            body: (
              <>
                <p>Interviews tell you how someone talks about their work. A contract shows you the work.</p>
                <p>
                  With contract-to-hire, your new team member starts on contract. You both get time to confirm the
                  fit. When you&apos;re ready, you convert them to a permanent employee, and we handle the
                  transition.
                </p>
              </>
            ),
          },
          {
            title: "W-2, 1099 or corp-to-corp",
            imageAlt: "Mintex Staffing team reviewing contractor engagement options",
            body: (
              <>
                <p>
                  Mintex started in IT staffing and has placed contractors under every common arrangement: W-2,
                  1099, corp-to-corp (C2C) and full-time. We&apos;ll recommend the one that fits the role and your
                  compliance requirements.
                </p>
                <PointTags items={ENGAGEMENT_TYPES} label="Arrangements we support" />
              </>
            ),
          },
          {
            title: "What you get with Mintex contract staffing",
            imageAlt: "Mintex Staffing recruiters reviewing candidates for contract talent placements",
            body: <PointList items={INCLUDED} />,
          },
        ]}
      />

      {/* Sec 3 — Industries: same card design as the homepage */}
      <IndustriesShowcase title="Contract talent across {count} industries" />

      {/* Sec 4 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Contract staffing FAQ"
          intro="Answers to what employers ask most about contract staffing. Don't see yours? Our team is happy to help."
          items={FAQS}
        />
      </Section>

      {/* Sec 5 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
            Need someone who can start soon?
          </h2>
          <p className="mt-4 text-[19px] leading-relaxed text-steel dark:text-steel-light">
            Tell us about the project and when it starts. We&apos;ll take it from there.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/seek-talent/get-started" variant="primary" className="inline-flex items-center gap-2">
              Discuss your hiring needs
              <IconArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
