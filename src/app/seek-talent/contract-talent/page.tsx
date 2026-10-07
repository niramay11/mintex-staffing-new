import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import IndustryAccordion from "@/components/industries/IndustryAccordion";
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

const INDUSTRY_LINKS = [
  { label: "IT", slug: "it-staffing" },
  { label: "healthcare (including per diem)", slug: "healthcare-staffing" },
  { label: "engineering", slug: "engineering-staffing" },
  { label: "manufacturing", slug: "manufacturing-staffing" },
  { label: "finance", slug: "finance-staffing" },
  { label: "administrative", slug: "administrative-staffing" },
  { label: "sales", slug: "sales-staffing" },
  { label: "customer service", slug: "customer-service-staffing" },
  { label: "logistics", slug: "logistics-staffing" },
  { label: "creative", slug: "creative-design-staffing" },
  { label: "legal", slug: "legal-staffing" },
  { label: "hospitality", slug: "hospitality-staffing" },
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

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{children}</p>
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
            variant="outline"
            className="!border-navy !text-navy inline-flex items-center gap-2 hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950"
          >
            See all services
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Section>

      {/* Sec 2 — Definition (featured-snippet target: a self-contained
          answer paragraph directly under the question H2) */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Definition</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            What is contract staffing?
          </h2>
          <p className="mt-5 text-[19px] leading-[1.8] text-navy/75 dark:text-cream/75">
            Contract staffing means bringing in a skilled professional for a set period, such as a project, a
            busy season or a leave of absence, without adding permanent headcount. Mintex finds, screens and
            places the contractor. If the fit is right, many contracts convert to permanent hires.
          </p>
        </div>
      </Section>

      {/* Sec 3 — When to use it */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>When to use it</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            When contract talent makes sense
          </h2>
        </div>
        <ul className="mx-auto mt-11 grid max-w-5xl gap-5 sm:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <li
              key={useCase.title}
              className="rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/10 dark:bg-navy-800"
            >
              <div className="h-[3px] w-6 bg-steel" />
              <p className="mt-4 text-[17px] leading-[1.7] text-navy/70 dark:text-cream/70">
                <strong className="font-semibold text-navy dark:text-cream">{useCase.title}</strong> {useCase.text}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Sec 4 — Contract-to-hire (anchor target from /seek-talent's model card) */}
      <Section background="white" id="contract-to-hire" className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Eyebrow>Contract-to-hire</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Contract-to-hire: see the work before you make the offer
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-steel" />
            <p className="mt-6 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              Interviews tell you how someone talks about their work. A contract shows you the work.
            </p>
            <p className="mt-4 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              With contract-to-hire, your new team member starts on contract. You both get time to confirm the
              fit. When you&apos;re ready, you convert them to a permanent employee, and we handle the
              transition.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-navy/10 dark:border-white/10" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
              <Image
                src={siteImages["seek-talent-service:contract-talent:point-3-visual"]}
                alt="Contract hire working alongside a client team before converting to a permanent role"
                fill
                sizes="(min-width: 640px) 448px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 5 — Engagement types */}
      <Section background="white">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Engagement types</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            W-2, 1099 or corp-to-corp
          </h2>
          <p className="mt-5 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
            Mintex started in IT staffing and has placed contractors under every common arrangement: W-2, 1099,
            corp-to-corp (C2C) and full-time. We&apos;ll recommend the one that fits the role and your compliance
            requirements.
          </p>
          <ul aria-label="Arrangements we support" className="mt-7 flex flex-wrap justify-center gap-3">
            {ENGAGEMENT_TYPES.map((type) => (
              <li
                key={type}
                className="rounded-full border border-navy/10 bg-white px-5 py-2 text-[15px] font-semibold text-navy dark:border-white/10 dark:bg-navy-800 dark:text-cream"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Sec 6 — What's included */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What&apos;s included</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            What you get with Mintex contract staffing
          </h2>
        </div>
        <ol className="mx-auto mt-11 max-w-3xl space-y-4">
          {INCLUDED.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-6 dark:border-white/10 dark:bg-navy-800"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
              >
                {index + 1}
              </span>
              <p className="pt-0.5 text-[17px] leading-relaxed text-navy/70 dark:text-cream/70">{item}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Sec 7 — Industries */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Industries</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Contract talent across {INDUSTRY_LINKS.length} industries
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
          We place contractors in{" "}
          {INDUSTRY_LINKS.map((industry, index) => (
            <span key={industry.slug}>
              {index === INDUSTRY_LINKS.length - 1 ? "and " : ""}
              <Link
                href={`/industries/${industry.slug}`}
                className="text-navy underline decoration-steel/40 underline-offset-4 transition-colors hover:decoration-navy dark:text-cream dark:hover:decoration-cream"
              >
                {industry.label}
              </Link>
              {index < INDUSTRY_LINKS.length - 2 ? ", " : " "}
            </span>
          ))}
          roles across the U.S.
        </p>
      </Section>

      {/* Sec 8 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Contract staffing FAQ
            </h2>
          </div>
          <div className="mt-10">
            <IndustryAccordion items={FAQS} />
          </div>
        </div>
      </Section>

      {/* Sec 9 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[34px] font-bold leading-tight text-navy sm:text-[42px] dark:text-cream">
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
