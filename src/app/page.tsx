import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import Testimonials from "@/components/home/Testimonials";
import Link from "next/link";
import IndustryGlassCard from "@/components/home/IndustryGlassCard";
import HeroPhotoCollage from "@/components/home/HeroPhotoCollage";
import IndustryAccordion from "@/components/industries/IndustryAccordion";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import {
  industryCardImageKey,
  INDUSTRY_CARD_FALLBACK_IMAGES,
  FEATURED_INDUSTRY_COUNT,
  EXPLORE_THUMB_INDUSTRY_COUNT,
} from "@/lib/imageLocations";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import { SITE_URL, BUSINESS } from "@/lib/site";

// Next replaces (doesn't merge) a parent's openGraph object, so the full set
// is repeated here with `url` — the layout's defaults have no og:url, which
// SEO audits flag as incomplete Open Graph tags on the homepage.
const HOME_TITLE = "Edison, NJ Staffing Agency: 9-Day Avg. Fill | Mintex";
const HOME_DESCRIPTION =
  "Pre-screened IT, healthcare, engineering and industrial talent from an Edison, NJ staffing agency. 14,000+ placements, 9-day avg. fill.";

export const metadata: Metadata = {
  // absolute: the layout's "%s | Mintex Staffing" template would otherwise
  // double up the brand on a title that already ends in "| Mintex".
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
    images: [{ url: "/share-image?v=4", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/share-image?v=4"],
  },
};

// Publisher points at the layout's EmploymentAgency node by @id rather than
// repeating the business details.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: BUSINESS.name,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#business` },
};

const HERO_STATS = [
  { value: "14,000+", label: "Placements" },
  { value: "93%", label: "Client retention" },
  { value: "9 days", label: "Average time to fill" },
  { value: "12", label: "Industries" },
];

const HIRING_MODELS = [
  { name: "Contract", bestFor: "Projects, seasonal peaks, leave coverage" },
  { name: "Contract-to-hire", bestFor: "Trying someone in the role before you commit" },
  { name: "Permanent", bestFor: "Full-time hires for your core team" },
  { name: "Executive search", bestFor: "Confidential C-suite, board and founding-team searches" },
];

// Homepage-only card blurbs, keyed by slug; any industry not listed falls
// back to its own SEO subheading.
const INDUSTRY_CARD_COPY: Record<string, string> = {
  "it-staffing":
    "Software engineers, cloud architects and IT project leaders who can move your roadmap forward.",
  "healthcare-staffing":
    "RNs, LPNs, allied health and healthcare administrators, with license verification and credentialing handled before they reach you.",
  "engineering-staffing":
    "Mechanical, civil, electrical and industrial engineers with hands-on project experience.",
};

const HOW_IT_WORKS_STEPS = [
  { title: "Scoping call", text: "We learn the role, your team and your timeline before we source anyone." },
  { title: "Shortlist", text: "You get pre-screened candidates who match the skills and the culture." },
  { title: "Interviews to offer", text: "We coordinate interviews with your hiring managers through to a signed offer." },
  {
    title: "After the start date",
    text: "We check in after the placement, and you can track every open role in the client portal.",
  },
];

const FREE_TOOLS = [
  {
    name: "Hiring Cost Calculator",
    text: "See what an open role is really costing you.",
    href: "/resources/hiring-cost-calculator",
  },
  {
    name: "AI Interview Question Generator",
    text: "Role-specific questions in seconds.",
    href: "/resources/ai-interview-generator",
  },
  {
    name: "Interview Rights by State",
    text: "What employers can and can't ask, state by state.",
    href: "/interview-rights",
  },
];

const HOME_FAQS = [
  {
    question: "How fast can Mintex fill a role?",
    answer: "Our average time to fill is 9 days, because we draw on a talent network that's already screened.",
  },
  {
    question: "What hiring models do you offer?",
    answer: "Contract, contract-to-hire, permanent placement and executive search.",
  },
  {
    question: "Can a contract hire become permanent?",
    answer:
      "Yes. Many contract placements are set up with a clear path to a full-time offer once you and the candidate agree it's the right fit.",
  },
  {
    question: "Where do you place candidates?",
    answer: "We're based in Edison, New Jersey, and place candidates with employers nationwide.",
  },
  {
    question: "Do job seekers pay anything?",
    answer: "No. The hiring employer pays our fee. Applying, interviewing and getting placed are free.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default async function HomePage() {
  const siteImages = await getSiteImages();
  const homepageTestimonials = await getHomepageTestimonials();
  const industries = await getIndustries();
  const industryImage = (slug: string, index: number) =>
    siteImages[industryCardImageKey(slug)] ??
    INDUSTRY_CARD_FALLBACK_IMAGES[index % INDUSTRY_CARD_FALLBACK_IMAGES.length];
  return (
    <>
      <script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Sec 1 — Hero. min-h fills the viewport minus the sticky header's
          own flow height (~6rem incl. its top-4 gap), so the hero is the
          only thing on screen at load — the next section isn't visible
          until the user actually scrolls, on any device. */}
      <section className="relative flex min-h-[calc(100vh-6rem)] flex-col justify-center bg-page dark:bg-navy-900">
        {/* Fills the strip behind the floating header with the section's own
            background, so the page's plain background doesn't show through
            above the header — matches the hero image's own bleed-to-top
            treatment further down, just for the side with no image to do it. */}
        <div aria-hidden="true" className="absolute inset-x-0 -top-[62px] hidden h-[62px] bg-page lg:block dark:bg-navy-900" />
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-16 2xl:px-20">
            <div className="flex max-w-xl flex-col items-start lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                Staffing agency in Edison, NJ · Hiring since {BUSINESS.foundingYear}
              </p>
              <h1 className="mt-4 font-heading text-[34px] font-bold leading-[1.12] text-navy sm:text-[42px] lg:text-[46px] xl:text-[54px] 2xl:text-[60px] dark:text-cream">
                Staffing agency in Edison, NJ for{" "}
                <span className="relative inline-block text-steel dark:text-steel-light">
                  IT, healthcare, engineering and industrial teams
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 320 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-3 w-full text-steel dark:text-steel-light"
                  >
                    <path
                      d="M2 9c40-8 80-8 120 0s80 8 120 0 60-6 76-2"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-steel sm:text-[19px] lg:text-[20px] xl:mt-6 xl:max-w-2xl xl:text-[22px] dark:text-steel-light">
                We fill contract, contract-to-hire and permanent roles in an average of 9 days, from
                a bench of candidates we&apos;ve already screened. Your search starts with interviews,
                not job posts.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3.5 xl:mt-10 xl:gap-5">
                <ButtonLink
                  href="/seek-talent"
                  variant="primary"
                  className="!border-navy !bg-navy !text-white shadow-[0_14px_36px_-10px_rgba(0,48,96,0.35)] transition-all hover:-translate-y-0.5 hover:!bg-navy-secondary hover:shadow-[0_18px_44px_-8px_rgba(0,48,96,0.45)] xl:!px-9 xl:!py-4.5 xl:!text-lg dark:!bg-steel dark:!border-steel dark:!text-navy-950 dark:hover:!bg-steel-light"
                >
                  Request talent
                </ButtonLink>
                <ButtonLink
                  href="/get-hired"
                  variant="outline"
                  className="!border-navy !text-navy transition-all hover:-translate-y-0.5 hover:!bg-navy hover:!text-white xl:!px-9 xl:!py-4.5 xl:!text-lg dark:!border-white/15 dark:!text-cream"
                >
                  Find a job
                </ButtonLink>
              </div>

              <dl className="mt-10 grid w-full grid-cols-2 gap-x-6 gap-y-5 border-t border-navy/10 pt-7 sm:grid-cols-4 xl:mt-12 dark:border-white/10">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse">
                    <dt className="mt-1.5 text-[14px] leading-snug text-steel dark:text-steel-light">{stat.label}</dt>
                    <dd className="font-heading text-[28px] font-bold leading-none text-navy xl:text-[32px] dark:text-cream">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Hidden below lg — this collage only earns its place once the
              grid actually has room to run it beside the text; stacked below
              the heading on narrower screens it was just dead scroll length. */}
          <div className="hidden lg:mx-0 lg:mb-0 lg:flex lg:min-h-[560px] lg:items-center lg:justify-end lg:pr-8 xl:min-h-[680px] xl:pr-16 2xl:min-h-[760px]">
            <HeroPhotoCollage
              photo1Src={siteImages["home:hero-photo-1"]}
              photo2Src={siteImages["home:hero-banner"]}
            />
          </div>
        </div>
      </section>

      {/* Sec 1.5 — What We Do */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                What we do
              </p>
              <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
                Staffing that starts with how your team actually works
              </h2>
              <p className="mt-5 text-[18px] leading-[1.85] text-steel dark:text-steel-light">
                You tell us the role, the deadline and what &ldquo;good&rdquo; looks like on your
                team. We come back with a short list, not a stack of resumes.
              </p>
              <p className="mt-4 text-[18px] leading-[1.85] text-steel dark:text-steel-light">
                Every candidate on it has been screened for a real delivery track record. A polished
                resume gets someone into our pipeline. Proof that they&apos;ve done the work gets them
                in front of you.
              </p>
              <p className="mt-4 text-[18px] leading-[1.85] text-steel dark:text-steel-light">
                We&apos;ve been doing this since 2003, starting in IT and growing into healthcare,
                engineering, legal, hospitality and seven other industries. More than 14,000
                placements later, 93% of our clients keep coming back.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/15 blur-[90px]"
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["home:what-we-do-visual"]}
                  alt="Mintex Staffing recruiter discussing a candidate's fit with a client"
                  fill
                  sizes="(min-width: 640px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sec 3 — Ways to hire */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Ways to hire
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Four ways to hire, one standard of screening
            </h2>
          </div>

          <div className="mx-auto mt-11 grid max-w-[1320px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HIRING_MODELS.map((model) => (
              <div
                key={model.name}
                className="rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:bg-navy-800 dark:border-white/10"
              >
                <h3 className="font-heading text-[19px] font-semibold tracking-tight text-navy dark:text-cream">{model.name}</h3>
                <span aria-hidden="true" className="mt-3 block h-px w-8 bg-steel/40" />
                <p className="mt-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-steel/80 dark:text-steel-light/80">
                  Best for
                </p>
                <p className="mt-1.5 text-[16px] leading-[1.7] text-steel dark:text-steel-light">{model.bestFor}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-[18px] text-steel dark:text-steel-light">
            Not sure which fits? That&apos;s what the first call is for.
          </p>
        </div>
      </section>

      {/* Sec 4 — Why Mintex */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Why Mintex
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Not a resume-forwarding service
            </h2>
          </div>

          <div className="mx-auto mt-11 grid max-w-[1320px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Screened before you ask",
                text: "Our talent network is vetted year-round, not sourced cold the day your requisition opens. That's how we keep the average fill at 9 days.",
                path: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
              },
              {
                title: "The model fits the work",
                text: "Contract, contract-to-hire, permanent or executive search. We match the engagement to the shape of the job, not the other way around.",
                path: "M4 4h16v4H4zM4 10h10v4H4zM4 16h13v4H4z",
              },
              {
                title: "One screening bar across 12 industries",
                text: "A nurse gets license verification and credentialing. A developer gets a skills check. Everyone gets the same standard.",
                path: "M4 20V10M10 20V4M16 20v-7",
              },
              {
                title: "People you can name",
                text: `Founder and CEO ${BUSINESS.founder} has led Mintex since ${BUSINESS.foundingYear}.`,
                path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 20a8 8 0 0 1 16 0",
                link: { href: "/about#leadership", label: "Meet the team" },
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-navy/[0.08] bg-white p-8 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:bg-navy-800 dark:border-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel dark:text-steel-light">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d={item.path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 font-heading text-[18.5px] font-semibold tracking-tight text-navy dark:text-cream">{item.title}</h3>
                <span aria-hidden="true" className="mt-3 block h-px w-8 bg-steel/40" />
                <p className="mt-3.5 text-[16px] leading-[1.85] text-steel dark:text-steel-light">
                  {item.text}
                  {item.link && (
                    <>
                      {" "}
                      <Link
                        href={item.link.href}
                        className="font-semibold text-navy underline decoration-steel/40 underline-offset-4 transition-colors hover:decoration-navy dark:text-cream dark:hover:decoration-cream"
                      >
                        {item.link.label}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sec 4 — Industries we served */}
      <section id="industries" className="group relative overflow-hidden border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        {/* Big, centered behind the whole section, including the card row —
            mostly hidden behind the opaque cards at rest. `group` on the
            section means hovering any card (a descendant) still counts as
            hovering the section, so the mark brightens/grows right when the
            user is interacting with a card, instead of needing to see
            through the card itself (which the photo fills anyway). */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[320px] w-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out md:block lg:h-[400px] group-hover:scale-[1.06]">
          <Image
            src={siteImages["home:industries-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="h-full w-auto select-none object-contain opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.26] dark:hidden"
          />
          <Image
            src={siteImages["global:navy-section-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="hidden h-full w-auto select-none object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100 dark:block"
          />
        </span>
        <div className="relative mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Industries
            </p>
            <h2 className="mt-3 font-heading text-[30px] font-bold leading-tight text-navy sm:text-[34px] dark:text-cream">
              Industries we staff
            </h2>
          </div>

          {/* Homepage teaser — a static row of the first 3 industries; the
              full list lives on /industries (linked below). */}
          <div className="group/row relative mx-auto mt-12 grid max-w-[1320px] gap-6 md:grid-cols-3">
            {industries.slice(0, FEATURED_INDUSTRY_COUNT).map((industry, index) => (
              <IndustryGlassCard
                key={industry.slug}
                industry={industry}
                imageSrc={industryImage(industry.slug, index)}
                featured={index === 1}
                description={INDUSTRY_CARD_COPY[industry.slug]}
              />
            ))}
          </div>

          {industries.length > FEATURED_INDUSTRY_COUNT && (
            <div className="relative mt-12 flex justify-center">
              {/* Glass + skeuomorphic "explore" bar: a peek at the other
                  sectors' photos, a count, and a raised arrow knob. */}
              <Link
                href="/industries"
                className="group/explore flex w-full max-w-[560px] items-center gap-4 rounded-full border border-white/70 bg-white/55 p-2 pl-3 shadow-[8px_8px_20px_rgba(0,48,96,0.12),-7px_-7px_18px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[11px_11px_26px_rgba(0,48,96,0.17),-7px_-7px_18px_rgba(255,255,255,0.95),inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/10 dark:bg-navy-800/60 dark:shadow-[8px_8px_20px_rgba(0,0,0,0.45),-5px_-5px_14px_rgba(255,255,255,0.04)]"
              >
                <span className="flex flex-shrink-0 items-center">
                  {industries.slice(FEATURED_INDUSTRY_COUNT, FEATURED_INDUSTRY_COUNT + EXPLORE_THUMB_INDUSTRY_COUNT).map((industry, i) => (
                    <span
                      key={industry.slug}
                      className={`relative h-11 w-11 overflow-hidden rounded-full ring-[3px] ring-white shadow-[2px_2px_6px_rgba(0,48,96,0.18)] dark:ring-navy-800 ${i > 0 ? "-ml-3" : ""} ${i > 0 ? "hidden sm:block" : ""}`}
                    >
                      <Image src={industryImage(industry.slug, i + FEATURED_INDUSTRY_COUNT)} alt="" aria-hidden="true" fill sizes="44px" className="object-cover" />
                    </span>
                  ))}
                  <span className="-ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#e4ebf0] text-[12px] font-bold text-navy ring-[3px] ring-white shadow-[2px_2px_6px_rgba(0,48,96,0.18)] dark:from-navy-800 dark:to-navy-950 dark:text-cream dark:ring-navy-800">
                    +{industries.length - FEATURED_INDUSTRY_COUNT}
                  </span>
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block whitespace-nowrap font-heading text-[17px] font-bold leading-tight sm:text-[19px] text-navy dark:text-cream">
                    See all {industries.length} industries
                  </span>
                  <span className="hidden truncate text-[13px] text-navy/55 sm:block dark:text-cream/55">
                    {industries.length - FEATURED_INDUSTRY_COUNT} more specialized sectors to discover
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-secondary to-navy text-white shadow-[4px_4px_10px_rgba(0,48,96,0.3),-2px_-2px_6px_rgba(255,255,255,0.8),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-300 group-hover/explore:scale-105 dark:from-steel-light dark:to-steel dark:text-navy-950 dark:shadow-[4px_4px_10px_rgba(0,0,0,0.45)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 transition-transform duration-300 group-hover/explore:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          )}

          <p className="relative mx-auto mt-6 max-w-2xl text-center text-[15.5px] leading-relaxed text-steel dark:text-steel-light">
            Also staffing: manufacturing, finance and accounting, administrative, sales and
            marketing, customer service, logistics, creative and design, legal and hospitality.
          </p>
        </div>
      </section>

      {/* Sec 6 — How it works */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              How it works
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              How hiring with Mintex works
            </h2>
          </div>

          <ol className="mx-auto mt-11 grid max-w-[1320px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:bg-navy-800 dark:border-white/10"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] font-heading text-[18px] font-bold text-steel dark:text-steel-light"
                >
                  {index + 1}
                </span>
                <h3 className="mt-5 font-heading text-[18.5px] font-semibold tracking-tight text-navy dark:text-cream">{step.title}</h3>
                <p className="mt-2.5 text-[16px] leading-[1.75] text-steel dark:text-steel-light">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sec 7 — Client stories, sourced from the same case_studies entries
          shown on /case-studies. Replaces the client video block until real
          client videos exist (ClientStories component kept for that). */}
      <Testimonials
        stories={homepageTestimonials}
        backgroundClassName="bg-page"
        edgeFadeFromClassName="from-page"
        heading="What clients and candidates tell us"
        intro="Every client story starts the same way: a role that's been open too long. Here's how a few of them ended."
        link={{ href: "/case-studies", label: "Read the case studies" }}
      />

      {/* Sec 8 — Free hiring tools */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Free hiring tools
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Free tools for hiring teams and candidates
            </h2>
          </div>

          <div className="mx-auto mt-11 grid max-w-[1100px] gap-5 sm:grid-cols-3">
            {FREE_TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:bg-navy-800 dark:border-white/10"
              >
                <h3 className="font-heading text-[18.5px] font-semibold tracking-tight text-navy dark:text-cream">{tool.name}</h3>
                <p className="mt-2.5 text-[16px] leading-[1.7] text-steel dark:text-steel-light">{tool.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-navy dark:text-cream">
                  Try it free
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sec 9 — FAQ. HOME_FAQS also feeds the FAQPage schema below, so the
          visible answers and the structured data can't drift apart. */}
      <script
        id="home-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:px-10 lg:py-24">
          <div className="text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              FAQ
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10">
            <IndustryAccordion items={HOME_FAQS} />
          </div>
        </div>
      </section>

      {/* Sec 10 — Final CTA */}
      <section className="border-t border-navy/[0.06] bg-page dark:bg-navy-900 dark:border-white/10">
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[0.85fr_1fr] lg:gap-16 lg:px-16 lg:py-20">
          <div className="relative mx-auto aspect-square w-full max-w-[360px] lg:mx-0 lg:-ml-6">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/[0.12] blur-[70px]"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-[36%] w-[30%] rounded-[2rem] bg-navy/[0.05]"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-[8%] h-[80%] w-[80%] rounded-[2.5rem] border-2 border-steel/40"
            />
            <div className="absolute left-0 top-0 h-[80%] w-[80%] overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-20px_rgba(1,35,64,0.25)]">
              <Image
                src={siteImages["home:industries-collage"]}
                alt="Mintex Staffing recruiters collaborating with clients across industries"
                fill
                sizes="(min-width: 640px) 290px, 80vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
              Let&apos;s fill the role that&apos;s been open too long
            </h2>
            <p className="mt-4 max-w-md text-[20px] leading-relaxed text-steel dark:text-steel-light">
              Tell us what you&apos;re hiring for. We&apos;ll schedule a scoping call and start with
              candidates we already know.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <ButtonLink href="/seek-talent" variant="primary">
                Request talent
              </ButtonLink>
              <ButtonLink
                href="/get-hired"
                variant="outline"
                className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-white/15 dark:!text-cream"
              >
                Find a job
              </ButtonLink>
            </div>
            <address className="mt-8 flex flex-wrap gap-x-2 gap-y-1 text-[15px] not-italic leading-relaxed text-steel dark:text-steel-light">
              <span>
                {BUSINESS.streetAddress}, {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
              </span>
              <span aria-hidden="true">·</span>
              <a href={`tel:${BUSINESS.telephone}`} className="hover:text-navy dark:hover:text-cream">
                {BUSINESS.telephoneDisplay}
              </a>
              <span aria-hidden="true">·</span>
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-navy dark:hover:text-cream">
                {BUSINESS.email}
              </a>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
