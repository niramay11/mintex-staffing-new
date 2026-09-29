import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import StatBlock from "@/components/ui/StatBlock";
import JobCard from "@/components/jobs/JobCard";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { getIndustries, getIndustryBySlug } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";
import { getSiteImages } from "@/lib/siteImages";
import { industryCardImageKey, INDUSTRY_CARD_FALLBACK_IMAGES } from "@/lib/imageLocations";
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

      {/* Sec 2 — Open roles */}
      <Section background="white">
        <h2 className="font-heading text-3xl font-bold text-navy dark:text-cream">Open {industry.name} Roles</h2>
        <p className="mt-2 max-w-2xl text-navy/70 dark:text-cream/70">{industry.intro}</p>
        {openRoles.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openRoles.map((job) => (
              <JobCard key={job.job_code} job={job} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-navy/60 dark:text-cream/60">
            No open roles posted right now, check back soon or share your resume to get matched
            as new roles open.
          </p>
        )}
      </Section>

      {/* Sec 3 — Sector insights */}
      <Section background="mist">
        <h2 className="font-heading text-3xl font-bold text-navy dark:text-cream">{industry.name} Job Market Trends</h2>
        <h3 className="mt-4 text-xl font-semibold text-navy dark:text-cream">{industry.sectorInsight.title}</h3>
        <p className="mt-3 max-w-2xl text-navy/70 dark:text-cream/70">{industry.sectorInsight.body}</p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/insights/post/2026-hiring-trends-outlook"
            className="text-sm font-semibold text-steel hover:text-navy hover:underline dark:text-steel-light dark:hover:text-cream"
          >
            Related: 2026 Hiring Trends: What Employers Need to Watch &rarr;
          </Link>
        </div>
      </Section>

      {/* Sec 3.5 — In-depth: roles, vetting, market, engagement models */}
      <Section background="white">
        <h2 className="font-heading text-3xl font-bold text-navy dark:text-cream">Hiring {industry.name}, In Depth</h2>
        {/* Same card language as the /industries grid: white 28px-radius
            card, small uppercase labels top-left / top-right, big light
            title, short body text. */}
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          {[
            { tag: "Roles", title: "Typical Roles We Place", text: industry.typicalRoles },
            { tag: "Vetting", title: "How We Vet Candidates", text: industry.vettingProcess },
            { tag: "Market", title: "The Market Right Now", text: industry.marketContext },
            { tag: "Engagement", title: "Flexible Engagement Models", text: industry.engagementModels },
          ].map(({ tag, title, text }, index) => (
            <div
              key={title}
              className="flex min-h-[300px] min-w-0 flex-col rounded-[28px] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,48,96,0.35)] sm:p-8 dark:bg-navy-800"
            >
              <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.12em]">
                <span className="font-medium text-navy/45 dark:text-cream/45">
                  {String(index + 1).padStart(2, "0")} · {tag}
                </span>
                <span className="flex-shrink-0 text-right">
                  <span className="block font-bold text-navy dark:text-cream">Mintex</span>
                  <span className="mt-1 block font-semibold text-steel dark:text-steel-light">{industry.name}</span>
                </span>
              </div>

              <div className="mt-auto pt-12">
                <h3
                  style={{ fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" }}
                  className="text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-navy sm:text-[30px] dark:text-cream"
                >
                  {title}
                </h3>
                <p className="mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-navy/65 dark:text-cream/65">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sec 4 — Why Us */}
      <Section background="mist">
        <h2 className="text-3xl font-bold text-navy dark:text-cream">Why Mintex Staffing for {industry.name}</h2>
        <p className="mt-2 max-w-2xl text-navy/70 dark:text-cream/70">{industry.workStyle}</p>
        <div className="mt-8 grid grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <StatBlock key={achievement.label} label={achievement.label} value={achievement.value} />
          ))}
        </div>
      </Section>

      <Testimonials stories={testimonials} />

      {/* Sec 5 — FAQ */}
      <Section background="white">
        <h2 className="text-3xl font-bold text-navy dark:text-cream">Frequently Asked Questions</h2>
        <FaqAccordion items={industry.faqs} />
      </Section>
    </>
  );
}
