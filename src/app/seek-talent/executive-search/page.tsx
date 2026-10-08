import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import FaqSplit from "@/components/ui/FaqSplit";
import ServicePointRows, { PointList } from "@/components/seek-talent/ServicePointRows";
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
        slug="executive-search"
        siteImages={siteImages}
        points={[
          {
            title: "What is executive search?",
            imageAlt: "Private meeting between a Mintex executive search consultant and a leadership candidate",
            body: (
              <p>
                Executive search is a confidential recruiting service for senior roles: CEOs, CFOs, other C-suite
                leaders, board members and key founding hires. The search firm identifies and approaches qualified
                leaders, many of whom aren&apos;t job hunting, then assesses them for experience, leadership style
                and fit with your strategy.
              </p>
            ),
          },
          {
            title: "Roles we fill",
            imageAlt: "Leadership candidates considered in a Mintex executive search",
            body: (
              <>
                <PointList
                  items={ROLES.map((role) => (
                    <>
                      <strong>{role.title}</strong> {role.text}
                    </>
                  ))}
                />
                <p className="!mt-3">
                  We search for public, private and non-profit organizations in New Jersey and nationwide.
                </p>
              </>
            ),
          },
          {
            title: "Discreet by default",
            imageAlt: "Confidential executive search conversation held off-site",
            body: (
              <>
                <p>
                  Leadership searches leak in predictable places: a job post, a recruiter&apos;s careless call, a
                  candidate who mentions it to the wrong colleague.
                </p>
                <p>
                  We close those gaps. Searches run to your internal standards on who knows, when, and how
                  candidates are approached. Nothing goes public unless you decide it should.
                </p>
              </>
            ),
          },
          {
            title: "How our executive search works",
            imageAlt: "Search committee reviewing an executive shortlist with Mintex Staffing",
            body: (
              <PointList
                items={SEARCH_STEPS.map((step) => (
                  <>
                    <strong>{step.title}</strong> {step.text}
                  </>
                ))}
              />
            ),
          },
          {
            title: "Board recruitment and advisory",
            imageAlt: "Board members meeting to review leadership gaps",
            body: (
              <p>
                A board is only as useful as the range of experience around the table. Beyond single placements, we
                help you see the gaps in your current board or leadership team and find people who fill them.
              </p>
            ),
          },
          {
            title: "Why leaders trust Mintex with the search",
            imageAlt: "Mintex Staffing leadership team",
            body: (
              <p>
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
            ),
          },
        ]}
      />

      {/* Sec 3 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Executive search FAQ"
          intro="Answers to what employers ask most about executive search. Don't see yours? Our team is happy to help."
          items={FAQS}
        />
      </Section>

      {/* Sec 4 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
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
