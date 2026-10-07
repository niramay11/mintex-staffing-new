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
import { SITE_URL, BUSINESS } from "@/lib/site";

// Dedicated page — takes precedence over /seek-talent/[slug] for this URL.

const PATH = "/seek-talent/executive-search";
const PAGE_DESCRIPTION =
  "Confidential executive search for C-suite, board and founding leadership roles. Public, private and non-profit searches run from Edison, NJ.";

// "Executive Search Firm in New Jersey" + " | Mintex Staffing" fits in 60
// chars, so the layout template already produces the exact title.
export const metadata: Metadata = pageMetadata({
  title: "Executive Search Firm in New Jersey",
  description: PAGE_DESCRIPTION,
  path: PATH,
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Seek Talent", path: "/seek-talent" },
  { name: "Executive Search", path: PATH },
]);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Executive search",
  name: "Confidential executive search",
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: [
    { "@type": "State", name: "New Jersey" },
    { "@type": "Country", name: "United States" },
  ],
};

const ROLES = [
  { title: "C-suite leaders", text: "for established companies planning a transition." },
  { title: "Board members and advisors", text: "who bring a fresh perspective to the table." },
  {
    title: "Founding and leadership hires for startups,",
    text: "where the first senior people set the culture for everyone after them.",
  },
  { title: "Hard-to-fill senior specialists", text: "in the industries we know best." },
];

const SEARCH_STEPS = [
  {
    title: "Brief.",
    text: "We meet your CEO, board or search committee to define the role, the must-haves and the leadership style that works in your company.",
  },
  { title: "Market map.", text: "We identify leaders who fit, including people who aren't actively looking." },
  {
    title: "Confidential approach.",
    text: "We contact candidates discreetly and assess their track record, leadership approach and alignment with your vision.",
  },
  { title: "Shortlist.", text: "You meet a small group of finalists we'd be comfortable seeing in the seat." },
  {
    title: "Offer and transition.",
    text: "We help manage the offer and stay in touch through the leader's first months.",
  },
];

const FAQS = [
  {
    question: "How do you keep a search confidential?",
    answer:
      "We agree on confidentiality rules with you before the search starts, and follow them for sourcing, outreach and candidate communications.",
  },
  {
    question: "Do you recruit outside New Jersey?",
    answer: "Yes. Our team is based in Edison, NJ, and runs searches for organizations nationwide.",
  },
  {
    question: "Can you help a startup hire its first leadership team?",
    answer: "Yes. Founding and leadership roles for startups are one of our focus areas.",
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

export default async function ExecutiveSearchPage() {
  const siteImages = await getSiteImages();
  const ServiceIcon = getHiringServiceBySlug("executive-search")?.icon;

  return (
    <>
      <script
        id="hiring-service-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="executive-search-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        id="executive-search-faq-schema"
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
          Leadership hiring
        </div>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl dark:text-cream">
          Confidential executive search for C-suite and board roles
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
          The person you hire into this seat will shape the company for years. We run that search quietly, to
          your internal policies, from first call to signed offer.
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/seek-talent/get-started" variant="primary" className="inline-flex items-center gap-2">
            Start a confidential conversation
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
            What is executive search?
          </h2>
          <p className="mt-5 text-[19px] leading-[1.8] text-navy/75 dark:text-cream/75">
            Executive search is a confidential recruiting service for senior roles: CEOs, CFOs, other C-suite
            leaders, board members and key founding hires. The search firm identifies and approaches qualified
            leaders, many of whom aren&apos;t job hunting, then assesses them for experience, leadership style
            and fit with your strategy.
          </p>
        </div>
      </Section>

      {/* Sec 3 — What we search for */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What we search for</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Roles we fill
          </h2>
        </div>
        <ul className="mx-auto mt-11 grid max-w-5xl gap-5 sm:grid-cols-2">
          {ROLES.map((role) => (
            <li
              key={role.title}
              className="rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/10 dark:bg-navy-800"
            >
              <div className="h-[3px] w-6 bg-steel" />
              <p className="mt-4 text-[17px] leading-[1.7] text-navy/70 dark:text-cream/70">
                <strong className="font-semibold text-navy dark:text-cream">{role.title}</strong> {role.text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-8 max-w-2xl text-center text-[18px] leading-relaxed text-steel dark:text-steel-light">
          We search for public, private and non-profit organizations in New Jersey and nationwide.
        </p>
      </Section>

      {/* Sec 4 — Confidentiality */}
      <Section background="white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Eyebrow>Confidentiality</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Discreet by default
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-steel" />
            <p className="mt-6 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              Leadership searches leak in predictable places: a job post, a recruiter&apos;s careless call, a
              candidate who mentions it to the wrong colleague.
            </p>
            <p className="mt-4 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              We close those gaps. Searches run to your internal standards on who knows, when, and how candidates
              are approached. Nothing goes public unless you decide it should.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-3 rounded-[2rem] border border-navy/10 dark:border-white/10" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
              <Image
                src={siteImages["seek-talent-service:executive-search:point-1-visual"]}
                alt="Private meeting between a Mintex executive search consultant and a leadership candidate"
                fill
                sizes="(min-width: 640px) 448px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 5 — How a search runs */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How a search runs</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            How our executive search works
          </h2>
        </div>
        <ol className="mx-auto mt-11 max-w-3xl space-y-4">
          {SEARCH_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-6 dark:border-white/10 dark:bg-navy-800"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
              >
                {index + 1}
              </span>
              <p className="pt-0.5 text-[17px] leading-relaxed text-navy/70 dark:text-cream/70">
                <strong className="font-semibold text-navy dark:text-cream">{step.title}</strong> {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Sec 6 — Board advisory */}
      <Section background="white">
        <div className="mx-auto max-w-3xl rounded-[24px] border border-navy/[0.08] bg-white p-8 shadow-[0_15px_35px_-10px_rgba(0,48,96,0.08)] sm:p-10 dark:border-white/10 dark:bg-navy-800">
          <Eyebrow>Board advisory</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[30px] font-bold leading-tight text-navy sm:text-[34px] dark:text-cream">
            Board recruitment and advisory
          </h2>
          <p className="mt-5 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
            A board is only as useful as the range of experience around the table. Beyond single placements, we
            help you see the gaps in your current board or leadership team and find people who fill them.
          </p>
        </div>
      </Section>

      {/* Sec 7 — Why Mintex */}
      <Section background="white">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Why Mintex</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Why leaders trust Mintex with the search
          </h2>
          <p className="mt-5 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
            Mintex has recruited since {BUSINESS.foundingYear}, under the same founder and CEO, {BUSINESS.founder}.
            Our leadership team has more than two decades in the industry. That continuity matters when a search
            depends on relationships and discretion.{" "}
            <Link
              href="/about#leadership"
              className="font-semibold text-navy underline decoration-steel/40 underline-offset-4 transition-colors hover:decoration-navy dark:text-cream dark:hover:decoration-cream"
            >
              Meet the team
            </Link>
            .
          </p>
        </div>
      </Section>

      {/* Sec 8 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Executive search FAQ
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
            Planning a leadership change?
          </h2>
          <p className="mt-4 text-[19px] leading-relaxed text-steel dark:text-steel-light">
            Start with a confidential conversation. No commitment, no job post.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/seek-talent/get-started" variant="primary" className="inline-flex items-center gap-2">
              Start a confidential conversation
              <IconArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
