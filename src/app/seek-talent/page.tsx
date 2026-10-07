import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import HeroImage from "@/components/ui/HeroImage";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import Testimonials from "@/components/home/Testimonials";
import IndustriesShowcase from "@/components/home/IndustriesShowcase";
import FaqSplit from "@/components/ui/FaqSplit";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { SITE_URL } from "@/lib/site";

const PAGE_DESCRIPTION =
  "Hire contract, contract-to-hire, permanent or executive talent through Mintex Staffing. Pre-screened candidates, a 9-day average fill, 12 industries.";

// pageMetadata's fitTitle would drop the brand suffix here (the title plus
// " | Mintex Staffing" runs past 60 chars), so the exact title is set with
// `absolute` and the helper only supplies canonical/OG/Twitter.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Hire Contract, Permanent & Executive Talent",
    description: PAGE_DESCRIPTION,
    path: "/seek-talent",
  }),
  title: { absolute: "Hire Contract, Permanent & Executive Talent | Mintex" },
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Seek Talent", path: "/seek-talent" },
]);

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Staffing services for employers",
  name: "Contract, contract-to-hire, permanent and executive staffing",
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}/seek-talent`,
  provider: { "@id": `${SITE_URL}/#business` },
  areaServed: { "@type": "Country", name: "United States" },
};

const HERO_STATS = [
  { value: "14,000+", label: "Placements" },
  { value: "9 days", label: "Average time to fill" },
  { value: "93%", label: "Client retention" },
];

// Contract-to-hire has no page of its own; it links to its section on the
// Contract Talent page.
const HIRING_MODELS = [
  {
    name: "Contract talent",
    useItWhen: "A project, a seasonal peak or leave coverage",
    whatYouGet: "A screened professional for a set term, ready to start",
    href: "/seek-talent/contract-talent",
  },
  {
    name: "Contract-to-hire",
    useItWhen: "You want to see someone in the role first",
    whatYouGet: "A contract with a clear path to a permanent offer",
    href: "/seek-talent/contract-talent#contract-to-hire",
  },
  {
    name: "Permanent talent",
    useItWhen: "You're building your core team",
    whatYouGet: "Full-time hires vetted for skills and long-term fit",
    href: "/seek-talent/permanent-talent",
  },
  {
    name: "Executive search",
    useItWhen: "A C-suite, board or founding-team seat",
    whatYouGet: "A confidential search run to your internal policies",
    href: "/seek-talent/executive-search",
  },
];

const SEARCH_INCLUDES = [
  { title: "A scoping call", text: "before we source anyone." },
  { title: "A short list", text: "of candidates screened for skills, track record and culture fit." },
  { title: "Interview coordination", text: "with your hiring managers, through to the offer." },
  { title: "A client portal", text: "where you review candidates and track every open role." },
  { title: "Check-ins after the start date", text: "because a placement isn't finished on day one." },
];

// The three employer quotes this page features, in display order, matched
// by the case study's author field. If an admin renames them, the page falls
// back to every non-candidate story rather than showing nothing.
const EMPLOYER_STORY_AUTHORS = ["VP of Engineering", "Operations Director", "Director of Talent Acquisition"];

const EMPLOYER_FAQS = [
  {
    question: "How quickly can you fill a role?",
    answer:
      "Our average time to fill is 9 days. We pull from a network that's screened year-round, so most searches start with candidates we already know.",
  },
  {
    question: "Which hiring model should I choose?",
    answer:
      "Contract for defined projects or coverage, contract-to-hire if you want to see someone in the role first, permanent for core team members and executive search for leadership. We'll recommend one on the scoping call.",
  },
  {
    question: "Can a contract hire convert to full-time?",
    answer: "Yes. Many contract placements are set up with a path to a permanent offer once both sides agree on the fit.",
  },
  {
    question: "Do you recruit outside New Jersey?",
    answer: "Yes. We're based in Edison, NJ, and place talent with employers across the U.S.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: EMPLOYER_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{eyebrow}</p>
      <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
        {title}
      </h2>
    </div>
  );
}

export default async function SeekTalentPage() {
  const siteImages = await getSiteImages();
  const allStories = await getHomepageTestimonials();
  const featuredStories = EMPLOYER_STORY_AUTHORS.map((author) => allStories.find((s) => s.author === author)).filter(
    (s) => s !== undefined
  );
  const employerStories =
    featuredStories.length > 0 ? featuredStories : allStories.filter((s) => s.type !== "candidate");

  return (
    <>
      <script
        id="seek-talent-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="seek-talent-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        id="seek-talent-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Sec 1 — Hero */}
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              For employers
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl dark:text-cream">
              Hire contract, permanent and executive talent
            </h1>
            <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
              Tell us the role and the deadline. We&apos;ll send pre-screened candidates who fit the work
              and the team, usually within 9 days.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <ButtonLink href="/seek-talent/get-started" variant="primary">
                Discuss your hiring needs
              </ButtonLink>
              <ButtonLink
                href="/seek-talent/how-we-work"
                variant="outline"
                className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950"
              >
                See how we work
              </ButtonLink>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-x-6 border-t border-navy/10 pt-6 dark:border-white/10">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-1.5 text-[14px] leading-snug text-steel dark:text-steel-light">{stat.label}</dt>
                  <dd className="font-heading text-[26px] font-bold leading-none text-navy sm:text-[28px] dark:text-cream">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroImage
            src={siteImages["seek-talent:hero-visual"]}
            alt="Employer welcoming a new hire placed through Mintex Staffing"
          />
        </div>
      </Section>

      {/* Sec 2 — The problem */}
      <Section background="white">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              The problem
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              An open seat costs more than a salary
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-steel" />
            <p className="mt-6 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              The role has been open six weeks. Your team is covering it on top of their own jobs. The
              last three candidates looked great on paper and fell apart in the second interview.
            </p>
            <p className="mt-4 text-[18px] leading-[1.85] text-navy/70 dark:text-cream/70">
              We fix that part. Every search starts with a conversation about your team, your goals and
              your timeline, before we share a single profile. Then we send people who&apos;ve been
              screened for a delivery track record, not just keywords.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl py-8">
            <div
              aria-hidden="true"
              className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-steel-lighter/40 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-10 -right-8 h-60 w-60 rounded-full bg-steel/25 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 h-full w-full rounded-[2.5rem] border-2 border-steel/30"
            />
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] shadow-[0_35px_80px_-25px_rgba(0,48,96,0.45)]">
              <Image
                src={siteImages["seek-talent:cta-visual"]}
                alt="Employer team collaborating around a table with Mintex Staffing's hiring consultants"
                fill
                sizes="(min-width: 640px) 576px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-navy/0 to-navy/0" />
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 3 — Pick a model */}
      <Section background="white" id="hiring-models">
        <SectionHeading eyebrow="Pick a model" title="Choose the hiring model that fits the work" />

        <div className="mx-auto mt-11 grid max-w-[1320px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIRING_MODELS.map((model, index) => (
            <div
              key={model.name}
              className="group flex flex-col rounded-[20px] border border-navy/[0.06] bg-white p-7 shadow-[0_15px_35px_-10px_rgba(0,48,96,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-15px_rgba(0,48,96,0.15)] dark:border-white/10 dark:bg-navy-800"
            >
              <span className="font-heading text-4xl font-extrabold text-navy/10 dark:text-cream/10">0{index + 1}</span>
              <div className="mt-5 h-[3px] w-6 bg-steel" />
              <h3 className="mt-4 text-[22px] font-bold tracking-tight text-navy dark:text-cream">{model.name}</h3>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">
                    Use it when
                  </dt>
                  <dd className="mt-1 text-[16px] leading-[1.6] text-navy/70 dark:text-cream/70">{model.useItWhen}</dd>
                </div>
                <div>
                  <dt className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">
                    What you get
                  </dt>
                  <dd className="mt-1 text-[16px] leading-[1.6] text-navy/70 dark:text-cream/70">{model.whatYouGet}</dd>
                </div>
              </dl>

              <Link
                href={model.href}
                className="mt-auto inline-flex w-fit items-center gap-2.5 pt-7 text-sm font-bold text-navy transition-colors dark:text-cream"
              >
                <span className="rounded-[10px] bg-steel/10 px-5 py-3 transition-colors duration-200 group-hover:bg-steel group-hover:text-white">
                  Learn more
                  <span className="sr-only"> about {model.name.toLowerCase()}</span>
                </span>
                <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Sec 4 — What every search includes */}
      <Section background="white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:pt-2">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              What every search includes
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              What&apos;s included in every search
            </h2>
            <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-steel dark:text-steel-light">
              Every engagement, whatever the hiring model, comes with the same five things.
            </p>
            <div className="mt-8">
              <ButtonLink href="/seek-talent/get-started" variant="primary">
                Request talent
              </ButtonLink>
            </div>
          </div>

          <ol className="space-y-4">
            {SEARCH_INCLUDES.map((item, index) => (
              <li
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-6 dark:border-white/10 dark:bg-navy-800"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
                >
                  {index + 1}
                </span>
                <p className="pt-0.5 text-[17px] leading-relaxed text-navy/70 dark:text-cream/70">
                  <strong className="font-semibold text-navy dark:text-cream">{item.title}</strong> {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Sec 5 — Industries: homepage card design, plus all 12 linked once below */}
      <IndustriesShowcase title="Industries we recruit for" />

      {/* Sec 6 — Proof: employer quotes only; candidate stories belong on Get Hired */}
      <Testimonials stories={employerStories} heading="What employers say" centerWhenFits />

      {/* Sec 7 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Questions employers ask us"
          intro="Quick answers on timelines, hiring models and where we recruit. Don't see yours? Our team is happy to help."
          items={EMPLOYER_FAQS}
        />
      </Section>

      {/* Sec 8 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
            Have a role that won&apos;t fill itself?
          </h2>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/seek-talent/get-started" variant="primary">
              Discuss your hiring needs
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
