import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import JobCard from "@/components/jobs/JobCard";
import IndustryAccordion from "@/components/industries/IndustryAccordion";
import { getIndustries, getIndustryBySlug } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";
import { getSiteImages } from "@/lib/siteImages";
import {
  industryCardImageKey,
  industryFaqImageKey,
  industryFaqFallbackImage,
  INDUSTRY_CARD_FALLBACK_IMAGES,
} from "@/lib/imageLocations";
import { getJobsForCachedPage } from "@/lib/jobsForCachedPage";
import { isActiveJob } from "@/components/jobs/utils";
import { SITE_URL } from "@/lib/site";
import Testimonials from "@/components/home/Testimonials";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import type { CeipalJob } from "@/components/jobs/types";

// Cached page (ISR), refreshed in the background every 10 minutes — was
// force-dynamic, flagged by Ahrefs as a slow server response.
export const revalidate = 600;

// Room for the background jobs lookup (getJobsForCachedPage) to finish after
// a cold-cache render; Vercel's default timeout would cut it short.
export const maxDuration = 60;

const MAX_ROLES_SHOWN = 3;

// Matched against the job's title + skills text, deliberately NOT Ceipal's
// `industry` field — confirmed live that field records the hiring CLIENT's
// business sector (e.g. a "Senior Software Engineer" role came through
// tagged "Healthcare" because the client company is a healthcare business),
// which would misclassify real jobs onto the wrong industry page. Keywords
// longer than 4 chars or containing a space are substring-matched (safe,
// since they're specific phrases); short keywords use a word-boundary check
// so they don't false-match inside unrelated words.
function textMatchesKeyword(text: string, keyword: string): boolean {
  const k = keyword.toLowerCase();
  if (k.includes(" ") || k.length > 4) return text.includes(k);
  return new RegExp(`\\b${k}\\b`).test(text);
}

function matchesIndustry(job: CeipalJob, keywords: string[]): boolean {
  const text = [job.job_title, job.primary_skills, job.secondary_skills]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return keywords.some((keyword) => textMatchesKeyword(text, keyword));
}

// Empty list = on-demand ISR: each industry page is rendered on its first
// live request (with real jobs) and then cached for `revalidate` seconds,
// instead of at build time, where the jobs lookup is cold and slow. Without
// generateStaticParams at all, this Next version ignores `revalidate` on a
// [slug] route and renders it on every request.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return {};

  return pageMetadata({
    title: industry.heroTitle,
    description: industry.seoSubheading,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) notFound();

  const jobs = await getJobsForCachedPage();
  const openRoles = (jobs as CeipalJob[])
    .filter((job) => isActiveJob(job) && matchesIndustry(job, industry.jobKeywords))
    .slice(0, MAX_ROLES_SHOWN);

  const achievements = industry.stats;
  const [testimonials, siteImages, allIndustries] = await Promise.all([
    getHomepageTestimonials(),
    getSiteImages(),
    getIndustries(),
  ]);
  // Same photo (and same fallback-by-index) this industry uses on the home
  // page and the /industries banner, so it's one image to manage in admin.
  const industryIndex = Math.max(0, allIndustries.findIndex((i) => i.slug === industry.slug));
  const heroImage =
    siteImages[industryCardImageKey(industry.slug)] ??
    INDUSTRY_CARD_FALLBACK_IMAGES[industryIndex % INDUSTRY_CARD_FALLBACK_IMAGES.length];
  const faqImage = siteImages[industryFaqImageKey(industry.slug)] ?? industryFaqFallbackImage(industryIndex);
  const heroStat = industry.stats[0];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: industry.name,
    name: industry.heroTitle,
    description: industry.seoSubheading,
    provider: { "@id": `${SITE_URL}/#business` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Industries", item: `${SITE_URL}/industries` },
      { "@type": "ListItem", position: 3, name: industry.name, item: `${SITE_URL}/industries/${industry.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        id="industry-service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        id="industry-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="industry-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Sec 1 — Hero: rounded photo banner, same look as /industries */}
      <Section background="white" className="!border-t-0 !pb-0 !pt-6 sm:!pt-8">
        <div className="relative overflow-hidden rounded-[28px] bg-navy-950">
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/10" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />

          <div className="relative flex min-h-[420px] flex-col justify-center px-7 py-12 sm:min-h-[440px] sm:px-12 lg:min-h-[480px] lg:px-16">
            <nav aria-label="Breadcrumb" className="absolute left-7 top-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:left-12 sm:top-9 lg:left-16">
              <Link href="/industries" className="transition-colors hover:text-white">
                Industries
              </Link>
              <span aria-hidden="true" className="mx-2 text-white/40">/</span>
              <span className="text-white/90">{industry.name}</span>
            </nav>

            <div className="mt-10 max-w-[620px]">
              {heroStat && (
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  {heroStat.value} {heroStat.label}
                </p>
              )}
              <h1 className="mt-3 font-heading text-[40px] font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {industry.heroTitle}
              </h1>
              <p className="mt-5 max-w-[460px] text-[15px] leading-relaxed text-white/80">{industry.seoSubheading}</p>
              <Link
                href="/seek-talent/get-started"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-[14.5px] font-semibold text-navy transition-colors hover:bg-cream"
              >
                Hire {industry.name} Talent
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 2 — Open roles. Heading + "View All Jobs" on one row, intro
          directly under the heading; job cards unchanged. */}
      <Section background="white" className="!border-t-0">
        <SectionLabel>Open Roles</SectionLabel>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <TwoToneHeading lead={`Open ${industry.name} roles`} muted="hiring right now" />
          <ArrowLink href="/get-hired" className="flex-shrink-0">
            View All Jobs
          </ArrowLink>
        </div>
        <p className="mt-5 max-w-[760px] text-[16px] leading-[1.7] text-navy/75 dark:text-cream/75">{industry.intro}</p>
        {openRoles.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openRoles.map((job) => (
              <JobCard key={job.job_code} job={job} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-navy/60 dark:text-cream/60">
            No open roles posted right now, check back soon or share your resume to get matched
            as new roles open.
          </p>
        )}
      </Section>

      {/* Sec 3 — In depth: four equal-height cards (icon + pill tag on top,
          title and full text below). Hover lifts the card and fills it navy —
          no size change, so the row never jumps. */}
      <Section background="white" className="!border-t-0">
        <SectionLabel>In Depth</SectionLabel>
        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <TwoToneHeading lead={`Hiring ${industry.name},`} muted="explained in depth" />
          <ArrowLink href="/seek-talent/get-started" className="flex-shrink-0">
            Hire {industry.name} Talent
          </ArrowLink>
        </div>

        <div className="mt-10 grid gap-2.5 md:grid-cols-2 2xl:grid-cols-4">
          {[
            { tag: "roles", title: "Typical Roles We Place", text: industry.typicalRoles, icon: <IconPeople /> },
            { tag: "vetting", title: "How We Vet Candidates", text: industry.vettingProcess, icon: <IconShield /> },
            { tag: "market", title: "The Market Right Now", text: industry.marketContext, icon: <IconTrend /> },
            { tag: "engagement", title: "Flexible Engagement Models", text: industry.engagementModels, icon: <IconLayers /> },
          ].map(({ tag, title, text, icon }, index) => {
            const [lead, rest] = splitLeadSentence(text);
            return (
              <div
                key={title}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-navy/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,48,96,0.04),0_12px_32px_-24px_rgba(0,48,96,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:border-navy hover:bg-navy hover:shadow-[0_32px_60px_-28px_rgba(0,48,96,0.6)] sm:p-7 dark:border-white/[0.06] dark:bg-navy-800 dark:hover:border-navy-950 dark:hover:bg-navy-950"
              >
                {/* Hover glow, purely decorative. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-steel-light/40 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-steel-lighter/60 to-steel-lighter/20 text-navy ring-1 ring-navy/[0.06] transition-all duration-500 group-hover:from-white group-hover:to-white/80 group-hover:text-navy group-hover:ring-white/20 dark:from-steel/40 dark:to-steel/10 dark:text-cream">
                    {icon}
                  </span>
                  <span className="rounded-full border border-navy/15 bg-page/60 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.1em] text-navy/60 transition-colors duration-500 group-hover:border-white/25 group-hover:bg-white/10 group-hover:text-white/85 dark:border-white/15 dark:bg-transparent dark:text-cream/70">
                    {tag}
                  </span>
                </div>

                <h3
                  style={SANS}
                  className="relative mt-8 text-[23px] font-normal leading-[1.2] tracking-[-0.02em] text-navy transition-colors duration-500 group-hover:text-white dark:text-cream"
                >
                  {title}
                </h3>
                <div className="relative mt-4 h-px bg-gradient-to-r from-steel/50 via-navy/10 to-transparent transition-colors duration-500 group-hover:from-white/50 group-hover:via-white/15" />
                <p className="relative mt-4 text-[14.5px] leading-[1.7] text-navy/70 transition-colors duration-500 group-hover:text-white/75 dark:text-cream/70">
                  <span className="font-medium text-navy transition-colors duration-500 group-hover:text-white dark:text-cream">{lead}</span>
                  {rest && <> {rest}</>}
                </p>

                <div className="relative mt-auto flex items-center justify-between gap-4 pt-8">
                  <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/40 transition-colors duration-500 group-hover:text-white/55 dark:text-cream/40">
                    <span className="text-navy transition-colors duration-500 group-hover:text-white dark:text-cream">
                      {String(index + 1).padStart(2, "0")}
                      <span className="text-navy/30 group-hover:text-white/40 dark:text-cream/30"> / 04</span>
                    </span>
                    <span aria-hidden="true" className="h-3 w-px bg-navy/15 group-hover:bg-white/25 dark:bg-white/15" />
                    Mintex · {industry.name}
                  </span>
                  <Link
                    href="/seek-talent/get-started"
                    aria-label={`Hire ${industry.name} talent: ${title}`}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-navy dark:bg-steel dark:text-navy-950"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Sec 4 — Why Us: heading + copy on the left, stacked stat cards on
          the right. */}
      <Section background="white" className="!border-t-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <SectionLabel>Why Mintex</SectionLabel>
            <TwoToneHeading className="mt-5" lead={`Why Mintex for ${industry.name} —`} muted="built around your team" />
            <p className="mt-5 max-w-[420px] text-[15.5px] leading-[1.7] text-navy/75 dark:text-cream/75">
              {industry.workStyle}
            </p>
            <ArrowLink href="/seek-talent/get-started" className="mt-8 lg:mt-auto">
              Start Hiring
            </ArrowLink>
          </div>

          <div className="flex flex-col gap-2.5">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.label}
                className="flex items-start justify-between gap-6 rounded-[20px] bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(0,48,96,0.35)] dark:bg-navy-800"
              >
                <div>
                  <p className="text-[11px] text-navy/40 dark:text-cream/40">proven result</p>
                  <p style={SANS} className="mt-3 text-[34px] font-normal leading-none tracking-[-0.03em] text-navy dark:text-cream">
                    {achievement.value}
                  </p>
                  <p className="mt-2 text-[14px] text-navy/55 dark:text-cream/55">{achievement.label}</p>
                </div>
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-page text-[12px] font-semibold text-navy/60 dark:bg-navy-900 dark:text-cream/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Testimonials stories={testimonials} />

      {/* Sec 5 — Market trends + FAQ: heading left / insight right, then a
          photo beside the FAQ accordion. */}
      <Section background="white" className="!border-t-0">
        <SectionLabel>Market &amp; FAQ</SectionLabel>
        <div className="mt-5">
          <TwoToneHeading lead={`${industry.name} job market trends`} muted="and your questions answered" />
          <div className="mt-6 max-w-[760px]">
            <h3 style={SANS} className="text-[15px] font-semibold leading-snug text-navy dark:text-cream">
              {industry.sectorInsight.title}
            </h3>
            <p className="mt-2 text-[15.5px] leading-[1.7] text-navy/75 dark:text-cream/75">{industry.sectorInsight.body}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-navy-950 lg:min-h-[480px]">
            <Image src={faqImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-white/25 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
              Mintex · {industry.name}
            </span>
          </div>

          <div className="flex flex-col">
            <h2 style={SANS} className="text-[13px] font-semibold uppercase tracking-[0.14em] text-navy/45 dark:text-cream/45">
              Frequently Asked Questions
            </h2>
            <div className="mt-2">
              <IndustryAccordion items={industry.faqs} />
            </div>
            <ArrowLink href="/insights/post/2026-hiring-trends-outlook" className="mt-8">
              Read: 2026 Hiring Trends
            </ArrowLink>
          </div>
        </div>
      </Section>
    </>
  );
}

// Headings on this page use the body sans at a light weight (the global
// h1–h4 rule forces the condensed heading font, so override inline).
const SANS = { fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" };

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-navy/60 dark:text-cream/60">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-steel dark:text-steel-light">
        <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.5 5.8 21.2l1.6-7L2 9.5l7.1-.6L12 2z" />
      </svg>
      {children}
    </p>
  );
}

function TwoToneHeading({ lead, muted, className = "" }: { lead: string; muted: string; className?: string }) {
  return (
    <h2
      style={SANS}
      className={`max-w-[760px] text-[32px] font-normal leading-[1.12] tracking-[-0.025em] text-navy sm:text-[40px] dark:text-cream ${className}`}
    >
      {lead} <span className="text-navy/35 dark:text-cream/35">{muted}</span>
    </h2>
  );
}

function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 self-start text-[14px] font-semibold text-navy dark:text-cream ${className}`}
    >
      {children}
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy shadow-[0_1px_3px_rgba(0,48,96,0.1)] transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:bg-navy-800 dark:text-cream dark:group-hover:bg-steel dark:group-hover:text-navy-950">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

// First sentence (or clause ending in ":"/";") gets emphasis on the In Depth
// cards; admin text with no such break is shown whole as the lead.
function splitLeadSentence(text: string): [string, string] {
  const match = /^(.+?[.:;])\s+([\s\S]+)$/.exec(text.trim());
  return match ? [match[1], match[2]] : [text, ""];
}

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-5 w-5",
} as const;

function IconPeople() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.6-3.4 3.2-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18.5 14.8c1.7.8 2.7 2.6 3 5.2" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6l8-3z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg {...iconProps}>
      <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}
