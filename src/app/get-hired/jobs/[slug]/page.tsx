import type { Metadata } from "next";
import { after } from "next/server";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Section from "@/components/ui/Section";
import JobPageApply from "@/components/jobs/JobPageApply";
import { IconBars, IconBriefcase, IconPeople, IconPin } from "@/components/jobs/icons";
import { getCachedJobs } from "@/lib/jobsCache";
import { getJobMap } from "@/lib/ceipal-job-map";
import { getCachedDescription } from "@/lib/jobDescriptionCache";
import { warmIfNearExpiry } from "@/lib/warmCaches";
import { isActiveJob, jobLocation, jobUrlSlug, fmtPay, fmtPosted, workType } from "@/components/jobs/utils";
import { buildJobPostingSchema } from "@/lib/jobPostingSchema";
import { SITE_URL } from "@/lib/site";
import type { CeipalJob } from "@/components/jobs/types";

// Job data changes with Ceipal sync cycles, so this can't be a one-time
// static build — but `force-dynamic` was overkill: it also forced Next to
// treat generateMetadata's job lookup as unpredictable per-request runtime
// data, which triggers Next's automatic streaming-metadata optimization
// (title/canonical/meta tags get appended to <body> instead of <head> so the
// rest of the page doesn't wait on them — fine for Googlebot, but it's what
// SEO crawlers like Screaming Frog flag, and non-JS bots never see them at
// all). ISR with a revalidate window matching jobsCache.ts's own
// CACHE_TTL_SECONDS (20 min) keeps job data just as fresh — the underlying
// Ceipal cache was already the real freshness bottleneck, not page
// rendering — while letting metadata resolve during the periodic
// re-render instead of streaming, and restoring CDN/bfcache caching for
// this route (previously served as Cache-Control: no-store).
export const revalidate = 1200;

// Confirmed live (this Next.js version's docs warn its caching model has
// changed from what training data assumes): a `[slug]` route with no
// generateStaticParams at all renders fully dynamically on every single
// request — `export const revalidate` above is silently ignored — no matter
// what value it's set to. An empty array is enough to opt every unlisted
// slug into on-demand ISR (render once, cache for `revalidate` seconds,
// background-refresh after) instead of listing real job codes here, which
// would require querying Ceipal/Supabase at build time — exactly the stale
// build-time snapshot the comment above is trying to avoid.
export async function generateStaticParams() {
  return [];
}

// This page schedules a background cache warm-up (via `after()`) that can
// take up to ~45s on a cold cache — without raising this, Vercel's default
// timeout would kill that background work before it finishes.
export const maxDuration = 60;

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 12h18M12 3a15.3 15.3 0 0 1 0 18 15.3 15.3 0 0 1 0-18Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m3 13 9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3 4.5 6v6c0 4.5 3 7.5 7.5 9 4.5-1.5 7.5-4.5 7.5-9V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

async function findJobBySlug(slug: string): Promise<CeipalJob | null> {
  const { jobs } = await getCachedJobs();
  const job = (jobs as CeipalJob[]).find((j) => isActiveJob(j) && jobUrlSlug(j) === slug);
  return job ?? null;
}

// The old URL format used the raw, unslugified job_code directly (e.g.
// "JPC - 1539"). Kept so any already-indexed/shared old-format links
// redirect to the new slug instead of 404ing.
async function findJobByLegacyCode(code: string): Promise<CeipalJob | null> {
  const { jobs } = await getCachedJobs();
  const job = (jobs as CeipalJob[]).find((j) => isActiveJob(j) && j.job_code === code);
  return job ?? null;
}

// Ceipal job descriptions are recruiter-pasted rich text (often straight out
// of Word/Outlook), which sometimes carries a literal <h1> for a section
// title. The page itself already has the real <h1> (the job title), so any
// <h1> surviving inside the description would give the page two — bumping
// it to <h2> keeps the heading hierarchy valid no matter what a given job's
// source HTML contains.
function demoteDescriptionHeadings(html: string): string {
  return html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}

async function loadDescription(job: CeipalJob): Promise<string> {
  const fallback = job.public_job_description || job.job_description || "";
  try {
    const jobMap = await getJobMap();
    const id = jobMap[job.job_code];
    if (!id) {
      console.warn(`[job-page] no v2 id found for job_code "${job.job_code}" — jobMap has ${Object.keys(jobMap).length} entries`);
      return demoteDescriptionHeadings(fallback);
    }
    const desc = await getCachedDescription(job.job_code, id);
    if (!desc.public_job_description && !desc.job_description) {
      console.warn(`[job-page] getCachedDescription returned empty for job_code "${job.job_code}" (id ${id})`);
    }
    return demoteDescriptionHeadings(desc.public_job_description || desc.job_description || fallback);
  } catch (err) {
    console.error(`[job-page] loadDescription threw for job_code "${job.job_code}":`, err);
    return demoteDescriptionHeadings(fallback);
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const job = (await findJobBySlug(decoded)) ?? (await findJobByLegacyCode(decoded));
  if (!job) return { title: "Job Not Found", robots: { index: false, follow: false } };

  const title = job.job_title;
  // "{Job Title} – {City}, {State}" captures long-tail searches like "executive
  // chef jobs new york city" that a bare job title never would. Falls back to
  // the bare title when location data is missing rather than showing the
  // "Location not specified" placeholder in a real <title> tag.
  const location = jobLocation(job);
  const titleWithLocation = location === "Location not specified" ? title : `${title} – ${location}`;
  const fullTitle = `${titleWithLocation} | Mintex Staffing`;
  const description = `${job.job_title} in ${jobLocation(job)}${job.job_type ? ` — ${job.job_type}` : ""}. Apply now with Mintex Staffing.`;
  const path = `/get-hired/jobs/${jobUrlSlug(job)}`;

  return {
    title: titleWithLocation,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, type: "website" },
    twitter: { card: "summary", title: fullTitle, description },
  };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  // Fire-and-forget: if the jobs/description cache is close to expiring,
  // silently refresh everything in the background after THIS response is
  // sent, so the next person to click into a job doesn't land on a cold
  // Ceipal call. No-op (near-instant) when the cache was refreshed recently.
  after(() => warmIfNearExpiry());

  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const job = await findJobBySlug(decoded);
  if (!job) {
    const legacyJob = await findJobByLegacyCode(decoded);
    if (legacyJob) permanentRedirect(`/get-hired/jobs/${jobUrlSlug(legacyJob)}`);
    notFound();
  }

  const description = await loadDescription(job);
  const schema = buildJobPostingSchema(job, description);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Get Hired", item: `${SITE_URL}/get-hired` },
      { "@type": "ListItem", position: 3, name: job.job_title, item: `${SITE_URL}/get-hired/jobs/${jobUrlSlug(job)}` },
    ],
  };

  const pay = fmtPay(job.pay_rate___salary);
  const posted = fmtPosted(job.career_portal_published_date);
  const postedIso = job.career_portal_published_date ? new Date(job.career_portal_published_date).toISOString() : null;
  const remoteLabel = workType(job.remote_job);
  const skills = (job.primary_skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const selectedJob = {
    job_code: job.job_code,
    job_title: job.job_title,
    location: jobLocation(job),
    pay_rate: job.pay_rate___salary || "N/A",
  };

  const snapshot: { label: string; value?: string | number; Icon: (props: { className?: string }) => React.JSX.Element }[] = [
    { label: "Location", value: jobLocation(job), Icon: IconPin },
    { label: "Job Type", value: job.job_type, Icon: IconBriefcase },
    { label: "Work Type", value: remoteLabel, Icon: IconGlobe },
    { label: "Experience", value: job.experience, Icon: IconBars },
    { label: "Industry", value: job.industry, Icon: IconLayers },
    { label: "Positions", value: job.number_of_positions, Icon: IconPeople },
    { label: "Work Authorization", value: job.work_authorization, Icon: IconShield },
  ];

  return (
    <>
      <script
        id="job-posting-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        id="job-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <Link
          href="/get-hired/apply-to-jobs"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-navy/60 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream"
        >
          <IconArrowLeft className="h-4 w-4" />
          All open roles
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-navy/10 bg-white px-3 py-1 font-mono text-[11px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
            {job.job_code}
          </span>
          {posted && (
            <time dateTime={postedIso ?? undefined} className="text-xs text-navy/50 dark:text-cream/50">
              Posted {posted}
            </time>
          )}
        </div>

        <h1 className="mt-4 font-heading text-3xl font-bold text-navy sm:text-5xl dark:text-cream">{job.job_title}</h1>

        <p className="mt-4 flex items-center gap-1.5 text-steel dark:text-steel-light">
          <IconPin className="h-4 w-4 flex-shrink-0" />
          {jobLocation(job)}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {pay && <span className="rounded-full bg-navy px-4 py-2 text-base font-semibold text-white dark:bg-steel dark:text-navy-950">{pay}</span>}
          {job.job_type && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3.5 py-1.5 text-xs font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
              <IconBriefcase className="h-3.5 w-3.5" />
              {job.job_type}
            </span>
          )}
          {remoteLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3.5 py-1.5 text-xs font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
              <IconGlobe className="h-3.5 w-3.5" />
              {remoteLabel}
            </span>
          )}
        </div>

        <div className="mt-8">
          <JobPageApply job={selectedJob} />
        </div>
      </Section>

      {/* Content */}
      <Section background="white">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-10">
          {/* Main column */}
          <div className="rounded-2xl border border-navy/[0.08] bg-white p-6 sm:p-8 dark:border-white/10 dark:bg-navy-900">
            {skills.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy dark:bg-navy-800 dark:text-cream">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {description && (
              <div className={skills.length > 0 ? "mt-8" : ""}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">Job Description</p>
                <div
                  className="text-[15px] leading-relaxed text-navy/80
                    dark:text-cream/80
                    [&_p]:mb-3 [&_p:last-child]:mb-0
                    [&_strong]:font-semibold [&_strong]:text-navy dark:[&_strong]:text-cream
                    [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5
                    [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5
                    [&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-navy [&_h1:first-child]:mt-0 dark:[&_h1]:text-cream
                    [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy [&_h2:first-child]:mt-0 dark:[&_h2]:text-cream
                    [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy [&_h3:first-child]:mt-0 dark:[&_h3]:text-cream
                    [&_a]:font-medium [&_a]:text-steel [&_a]:no-underline [&_a:hover]:underline dark:[&_a]:text-steel-light"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start">
            <div className="rounded-2xl border border-navy/[0.08] bg-white p-6 dark:border-white/10 dark:bg-navy-900">
              <h2 className="text-sm font-semibold text-navy dark:text-cream">Role at a glance</h2>
              <div className="mt-4 space-y-4">
                {snapshot
                  .filter((s) => s.value)
                  .map(({ label, value, Icon }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-mist text-steel dark:bg-navy-800 dark:text-steel-light">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/45 dark:text-cream/45">{label}</p>
                        <p className="mt-0.5 text-sm font-medium text-navy dark:text-cream">{String(value)}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="mt-6 border-t border-navy/10 pt-5 dark:border-white/10">
                <JobPageApply
                  job={selectedJob}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white border border-navy px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-mist dark:bg-navy-900 dark:border-steel dark:text-cream dark:hover:bg-navy-800"
                />
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
