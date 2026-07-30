import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import StatBlock from "@/components/ui/StatBlock";
import JobTile from "@/components/ui/JobTile";
import { ButtonLink } from "@/components/ui/Button";
import { industries, getIndustryBySlug } from "@/content/industries";
import { getIndustryStats } from "@/lib/industryStats";
import { pageMetadata } from "@/lib/pageMetadata";
import { getCachedJobs } from "@/lib/jobsCache";
import { isActiveJob } from "@/components/jobs/utils";
import { withTimeout } from "@/lib/withTimeout";
import type { CeipalJob } from "@/components/jobs/types";

// Job data changes with Ceipal sync cycles — never bake a stale snapshot into
// the build (same reasoning as /get-hired, see that page's own comment).
export const dynamic = "force-dynamic";

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

  return (
    <>
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
        <h2 className="text-3xl font-bold text-navy">Sector Insights</h2>
        <h3 className="mt-4 text-xl font-semibold text-navy">{industry.sectorInsight.title}</h3>
        <p className="mt-3 max-w-2xl text-navy/70">{industry.sectorInsight.body}</p>
      </Section>

      {/* Sec 4 — Why Us */}
      <Section background="mist">
        <h2 className="text-3xl font-bold text-navy">Why Us</h2>
        <p className="mt-2 max-w-2xl text-navy/70">{industry.workStyle}</p>
        <div className="mt-8 grid grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <StatBlock key={achievement.label} label={achievement.label} value={achievement.value} />
          ))}
        </div>
      </Section>
    </>
  );
}
