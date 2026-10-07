import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import FaqSplit from "@/components/ui/FaqSplit";
import { getHiringServiceBySlug } from "@/content/hiringServices";
import { getSiteImages } from "@/lib/siteImages";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { SITE_URL } from "@/lib/site";

// Dedicated page — takes precedence over /seek-talent/[slug] for this URL.

const PATH = "/seek-talent/permanent-talent";
const PAGE_DESCRIPTION =
  "Direct hire and permanent placement from Mintex Staffing. We source, screen and vet full-time hires across 12 industries, with a 9-day average fill.";

// Exact title via `absolute` — pageMetadata would render "| Mintex Staffing".
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Permanent Placement & Direct Hire Staffing",
    description: PAGE_DESCRIPTION,
    path: PATH,
  }),
  title: { absolute: "Permanent Placement & Direct Hire Staffing | Mintex" },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Seek Talent", path: "/seek-talent" },
  { name: "Permanent Talent", path: PATH },
]);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Permanent placement",
  name: "Permanent placement and direct hire staffing",
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: { "@type": "Country", name: "United States" },
};

const PROCESS_STEPS = [
  { title: "Scoping.", text: "A call to understand the role, your culture and where the team is heading." },
  { title: "Sourcing.", text: "From our pre-screened network first, then targeted outreach." },
  {
    title: "Screening and vetting.",
    text: "Skills, delivery history and references, checked before you see a profile.",
  },
  { title: "A short list.", text: "Targeted matches, not a pile of resumes that tick boxes." },
  { title: "Interviews to offer.", text: "We coordinate schedules and feedback through to the signed offer." },
  { title: "Follow-up.", text: "We check in after the start date." },
];

const RIGHT_FOR_YOU_IF = [
  "You're adding to your core team and need someone for years, not months.",
  "You've tried posting the job and got volume without quality.",
  "A growing startup needs founding or leadership hires (a Mintex specialty).",
  "You'd rather your managers spend time interviewing finalists than reading resumes.",
];

const INDUSTRY_LINKS = [
  { label: "IT", slug: "it-staffing" },
  { label: "healthcare", slug: "healthcare-staffing" },
  { label: "engineering", slug: "engineering-staffing" },
  { label: "manufacturing", slug: "manufacturing-staffing" },
  { label: "finance and accounting", slug: "finance-staffing" },
  { label: "administrative", slug: "administrative-staffing" },
  { label: "sales and marketing", slug: "sales-staffing" },
  { label: "customer service", slug: "customer-service-staffing" },
  { label: "logistics", slug: "logistics-staffing" },
  { label: "creative and design", slug: "creative-design-staffing" },
  { label: "legal", slug: "legal-staffing" },
  { label: "hospitality", slug: "hospitality-staffing" },
];

// The featured quote, matched by the case study's author field so admin
// edits to the quote text still show; falls back to the PDF copy.
const FEATURED_STORY_AUTHOR = "VP of Engineering";
const FALLBACK_STORY = {
  quote:
    "Mintex didn't just send us resumes, they became an extension of our hiring team. We hit our headcount plan two months early without lowering our bar.",
  author: "VP of Engineering",
  role: "Series C SaaS company",
};

const FAQS = [
  {
    question: "How long does a permanent search take?",
    answer:
      "Our average time to fill is 9 days. Senior or highly specialized roles can take longer, and we'll give you a realistic timeline on the scoping call.",
  },
  {
    question: "What's the difference between direct hire and contract-to-hire?",
    answer:
      "A direct hire joins your payroll on day one. A contract-to-hire starts on contract and converts to permanent once both sides confirm the fit.",
  },
  {
    question: "Who pays the placement fee?",
    answer: "The employer. Candidates never pay to work with Mintex.",
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

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 7 9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{children}</p>
  );
}

const INLINE_LINK =
  "font-semibold text-navy underline decoration-steel/40 underline-offset-4 transition-colors hover:decoration-navy dark:text-cream dark:hover:decoration-cream";

export default async function PermanentTalentPage() {
  const [siteImages, stories] = await Promise.all([getSiteImages(), getHomepageTestimonials()]);
  const ServiceIcon = getHiringServiceBySlug("permanent-talent")?.icon;
  const featured = stories.find((s) => s.author === FEATURED_STORY_AUTHOR);
  const story = featured
    ? { quote: featured.quote, author: featured.author, role: featured.role ?? "" }
    : FALLBACK_STORY;

  return (
    <>
      <script
        id="hiring-service-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="permanent-talent-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        id="permanent-talent-faq-schema"
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
          Long-term hires
        </div>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl dark:text-cream">
          Permanent hires, screened for the long run
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
          We source, screen and vet full-time candidates so your leadership team can keep running the
          business. You meet people who fit the role and the company, not just the job description.
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

      {/* Sec 2 — Definition (featured-snippet target) */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Definition</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            What is direct hire staffing?
          </h2>
          <p className="mt-5 text-[19px] leading-[1.8] text-navy/75 dark:text-cream/75">
            Direct hire staffing, also called permanent placement, is when a staffing agency finds a full-time
            employee who joins your payroll from day one. The agency handles sourcing, screening and interview
            coordination. You make the offer and the hire is yours. Mintex fills permanent roles in an average
            of 9 days.
          </p>
        </div>
      </Section>

      {/* Sec 3 — The trade-off we refuse */}
      <Section background="white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Eyebrow>The trade-off we refuse</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Speed without settling
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-steel" />
            <p className="mt-6 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              Most permanent searches force a choice. Hire fast and risk a bad fit, or hold out for the right
              person while the work piles up.
            </p>
            <p className="mt-4 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              We skip that choice by starting early. Our talent network is screened year-round, so a new search
              starts with people we already know something about. Then we test for genuine fit: skills, track
              record and how someone works with a team.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-navy/10 dark:border-white/10" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
              <Image
                src={siteImages["seek-talent-service:permanent-talent:point-1-visual"]}
                alt="Hiring manager interviewing a pre-screened candidate for a permanent role"
                fill
                sizes="(min-width: 640px) 448px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 4 — What we handle */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What we handle</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            What Mintex handles in a permanent search
          </h2>
        </div>
        <ol className="mx-auto mt-11 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-800"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
              >
                {index + 1}
              </span>
              <p className="mt-4 text-[17px] leading-[1.7] text-navy/70 dark:text-cream/70">
                <strong className="font-semibold text-navy dark:text-cream">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Sec 5 — Who it's for */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Permanent placement is right for you if…
            </h2>
          </div>
          <ul className="mt-10 space-y-3.5">
            {RIGHT_FOR_YOU_IF.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-800"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel dark:text-steel-light">
                  <IconCheck className="h-4 w-4" />
                </span>
                <p className="pt-0.5 text-[17px] leading-relaxed text-navy/75 dark:text-cream/75">{item}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-[18px] text-steel dark:text-steel-light">
            Not sure yet?{" "}
            <Link href="/seek-talent/contract-talent#contract-to-hire" className={INLINE_LINK}>
              Contract-to-hire
            </Link>{" "}
            lets you see the work first.
          </p>
        </div>
      </Section>

      {/* Sec 6 — Industries */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Industries</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Permanent hires across {INDUSTRY_LINKS.length} industries
          </h2>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
          We recruit permanent staff in{" "}
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
          for employers across the U.S.
        </p>
      </Section>

      {/* Sec 7 — Proof */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Proof</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Results employers have seen
          </h2>
        </div>
        <div className="mx-auto mt-11 grid max-w-5xl items-stretch gap-6 lg:grid-cols-[1.6fr_1fr]">
          <figure className="flex flex-col rounded-[24px] bg-white p-8 shadow-[0_15px_35px_-10px_rgba(0,48,96,0.08)] dark:bg-navy-800">
            <blockquote>
              <p className="text-[20px] font-light leading-[1.55] text-navy sm:text-[22px] dark:text-cream">
                &ldquo;{story.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-auto border-t border-navy/10 pt-5 text-[14px] dark:border-white/10">
              <span className="block font-semibold text-navy dark:text-cream">{story.author}</span>
              {story.role && <span className="block text-navy/55 dark:text-cream/55">{story.role}</span>}
            </figcaption>
          </figure>
          <div className="flex flex-col justify-center rounded-[24px] bg-navy p-8 text-white dark:bg-steel dark:text-navy-950">
            <p className="font-heading text-[56px] font-bold leading-none">93%</p>
            <p className="mt-3 text-[18px] leading-snug text-white/85 dark:text-navy-950/80">
              of our clients come back for their next hire.
            </p>
          </div>
        </div>
      </Section>

      {/* Sec 8 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Permanent placement FAQ"
          intro="Answers to what employers ask most about permanent placement. Don't see yours? Our team is happy to help."
          items={FAQS}
        />
      </Section>

      {/* Sec 9 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
            Ready to build your core team?
          </h2>
          <p className="mt-4 text-[19px] leading-relaxed text-steel dark:text-steel-light">
            Tell us about the role. We&apos;ll come back with people worth meeting.
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
