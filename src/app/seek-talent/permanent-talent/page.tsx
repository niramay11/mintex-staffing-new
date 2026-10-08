import type { Metadata } from "next";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import FaqSplit from "@/components/ui/FaqSplit";
import IndustriesShowcase from "@/components/home/IndustriesShowcase";
import ServicePointRows, { PointList } from "@/components/seek-talent/ServicePointRows";
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
        slug="permanent-talent"
        siteImages={siteImages}
        points={[
          {
            title: "What is direct hire staffing?",
            imageAlt: "Hiring manager interviewing a pre-screened candidate for a permanent role",
            body: (
              <p>
                Direct hire staffing, also called permanent placement, is when a staffing agency finds a full-time
                employee who joins your payroll from day one. The agency handles sourcing, screening and interview
                coordination. You make the offer and the hire is yours. Mintex fills permanent roles in an average
                of 9 days.
              </p>
            ),
          },
          {
            title: "Speed without settling",
            imageAlt: "Mintex Staffing recruiters reviewing a shortlist for a permanent search",
            body: (
              <>
                <p>
                  Most permanent searches force a choice. Hire fast and risk a bad fit, or hold out for the right
                  person while the work piles up.
                </p>
                <p>
                  We skip that choice by starting early. Our talent network is screened year-round, so a new search
                  starts with people we already know something about. Then we test for genuine fit: skills, track
                  record and how someone works with a team.
                </p>
              </>
            ),
          },
          {
            title: "What Mintex handles in a permanent search",
            imageAlt: "Recruiter coordinating interviews for a permanent placement",
            body: (
              <PointList
                items={PROCESS_STEPS.map((step) => (
                  <>
                    <strong>{step.title}</strong> {step.text}
                  </>
                ))}
              />
            ),
          },
          {
            title: "Permanent placement is right for you if…",
            imageAlt: "Growing team adding a long-term hire through Mintex Staffing",
            body: (
              <>
                <PointList items={RIGHT_FOR_YOU_IF} />
                <p className="!mt-3">
                  Not sure yet?{" "}
                  <Link href="/seek-talent/contract-talent#contract-to-hire" className={INLINE_LINK}>
                    Contract-to-hire
                  </Link>{" "}
                  lets you see the work first.
                </p>
              </>
            ),
          },
          {
            title: "Results employers have seen",
            imageAlt: "Employer team that filled permanent roles with Mintex Staffing",
            body: (
              <>
                <figure>
                  <blockquote>
                    <p className="italic">&ldquo;{story.quote}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-1.5 text-[13px]">
                    <strong>{story.author}</strong>
                    {story.role && <span>, {story.role}</span>}
                  </figcaption>
                </figure>
                <p>
                  <strong>93%</strong> of our clients come back for their next hire.
                </p>
              </>
            ),
          },
        ]}
      />

      {/* Sec 3 — Industries: same card design as the homepage */}
      <IndustriesShowcase title="Permanent hires across {count} industries" />

      {/* Sec 4 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Permanent placement FAQ"
          intro="Answers to what employers ask most about permanent placement. Don't see yours? Our team is happy to help."
          items={FAQS}
        />
      </Section>

      {/* Sec 5 — Closing CTA */}
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
