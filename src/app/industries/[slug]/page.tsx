import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Section from "@/components/ui/Section";
import StatBlock from "@/components/ui/StatBlock";
import JobTile from "@/components/ui/JobTile";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { ButtonLink } from "@/components/ui/Button";
import { industries, getIndustryBySlug } from "@/content/industries";
import { getIndustryStats } from "@/lib/industryStats";
import { pageMetadata } from "@/lib/pageMetadata";
import { getCachedJobs } from "@/lib/jobsCache";
import { isActiveJob } from "@/components/jobs/utils";
import { withTimeout } from "@/lib/withTimeout";
import { SITE_URL } from "@/lib/site";
import Testimonials from "@/components/home/Testimonials";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import type { CeipalJob } from "@/components/jobs/types";

// Job data changes with Ceipal sync cycles — never bake a stale snapshot into
// the build (same reasoning as /get-hired, see that page's own comment).
export const dynamic = "force-dynamic";

function IconRoles({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconVetting({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMarket({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20V10M10 20V4M16 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEngagement({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

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

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustryBySlug(slug);
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
  const industry = getIndustryBySlug(slug);
  if (!industry) notFound();

  const { jobs } = await withTimeout(getCachedJobs(), 3000, {
    jobs: [] as unknown[],
    cachedAt: Date.now(),
    stale: true,
  });
  const openRoles = (jobs as CeipalJob[])
    .filter((job) => isActiveJob(job) && matchesIndustry(job, industry.jobKeywords))
    .slice(0, MAX_ROLES_SHOWN);

  const allStats = await getIndustryStats();
  const achievements = allStats.filter((s) => s.industry_slug === industry.slug);
  const testimonials = await getHomepageTestimonials();

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
      { "@type": "ListItem", position: 2, name: "Industries", item: `${SITE_URL}/#industries` },
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
      {/* Sec 1 — Hero */}
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">{industry.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-white/80">{industry.seoSubheading}</p>
        <div className="mt-8">
          <ButtonLink href="/seek-talent/get-started" variant="primary">
            Hire {industry.name} Talent
          </ButtonLink>
        </div>
      </Section>

      {/* Sec 2 — Open roles */}
      <Section background="cream">
        <h2 className="text-3xl font-bold text-navy">Open {industry.name} Roles</h2>
        <p className="mt-2 max-w-2xl text-navy/70">{industry.intro}</p>
        {openRoles.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openRoles.map((job) => (
              <JobTile key={job.job_code} job={job} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-navy/60">
            No open roles posted right now, check back soon or share your resume to get matched
            as new roles open.
          </p>
        )}
      </Section>

      {/* Sec 3 — Sector insights */}
      <Section background="white">
        <h2 className="text-3xl font-bold text-navy">What&apos;s Happening in the {industry.name} Job Market?</h2>
        <h3 className="mt-4 text-xl font-semibold text-navy">{industry.sectorInsight.title}</h3>
        <p className="mt-3 max-w-2xl text-navy/70">{industry.sectorInsight.body}</p>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/insights/post/2026-hiring-trends-outlook"
            className="text-sm font-semibold text-steel hover:text-navy hover:underline"
          >
            Related: 2026 Hiring Trends: What Employers Need to Watch &rarr;
          </Link>
          <Link
            href="/insights/post/cost-of-a-bad-hire"
            className="text-sm font-semibold text-steel hover:text-navy hover:underline"
          >
            Related: The Real Cost of a Bad Hire &rarr;
          </Link>
        </div>
      </Section>

      {/* Sec 3.5 — In-depth: roles, vetting, market, engagement models */}
      <Section background="cream">
        <h2 className="text-3xl font-bold text-navy">Hiring {industry.name}, In Depth</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            { title: "Typical Roles We Place", text: industry.typicalRoles, Icon: IconRoles },
            { title: "How We Vet Candidates", text: industry.vettingProcess, Icon: IconVetting },
            { title: "The Market Right Now", text: industry.marketContext, Icon: IconMarket },
            { title: "Flexible Engagement Models", text: industry.engagementModels, Icon: IconEngagement },
          ].map(({ title, text, Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-navy/[0.08] bg-white p-8 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-heading text-[17px] font-semibold tracking-tight text-navy">{title}</h3>
              <span aria-hidden="true" className="mt-3 block h-px w-8 bg-tan/40" />
              <p className="mt-3.5 text-[14.5px] leading-[1.85] text-steel">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sec 4 — Why Us */}
      <Section background="mist">
        <h2 className="text-3xl font-bold text-navy">Why Choose Mintex Staffing for {industry.name}?</h2>
        <p className="mt-2 max-w-2xl text-navy/70">{industry.workStyle}</p>
        <div className="mt-8 grid grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <StatBlock key={achievement.label} label={achievement.label} value={achievement.value} />
          ))}
        </div>
      </Section>

      <Testimonials stories={testimonials} />

      {/* Sec 5 — FAQ */}
      <Section background="white">
        <h2 className="text-3xl font-bold text-navy">Frequently Asked Questions</h2>
        <FaqAccordion items={industry.faqs} />
      </Section>
    </>
  );
}
