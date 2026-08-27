import type { Metadata } from "next";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Section from "@/components/ui/Section";
import JobPageApply from "@/components/jobs/JobPageApply";
import JobDescriptionLoader from "@/components/jobs/JobDescriptionLoader";
import { IconBars, IconBriefcase, IconPeople, IconPin } from "@/components/jobs/icons";
import { getCachedJobs } from "@/lib/jobsCache";
import { getJobMap } from "@/lib/ceipal-job-map";
import { getCachedDescription } from "@/lib/jobDescriptionCache";
import { warmIfNearExpiry } from "@/lib/warmCaches";
import {
  isActiveJob,
  jobLocation,
  jobUrlSlug,
  fmtPay,
  fmtPosted,
  workType,
  demoteDescriptionHeadings,
  JOB_DESCRIPTION_PROSE_CLASS,
} from "@/components/jobs/utils";
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

function raceTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

// getJobMap()/getCachedDescription() each independently fall back to a live
// Ceipal call whenever their own cache is cold (see ceipal-job-map.ts and
// jobDescriptionCache.ts) — measured 8-12+ seconds for a single description
// fetch alone. That's well past what a crawler will wait for a page to
// render (confirmed live: Semrush flagged this exact page, jpc-1535, as slow
// at 3.59s). This page already has a perfectly good fallback on hand — the
// plain-text description that came with the job listing itself — so there's
// no reason to make a visitor (or crawler) wait out a cold Ceipal call for
// the nicer, richly-formatted v2 description. Racing against a short budget
// and falling back instantly keeps the page fast regardless of cache state;
// `after()` lets the abandoned lookup keep running in the background so it
// still finishes warming the cache for the next visitor.
const DESCRIPTION_TIMEOUT_MS = 2_500;
const TIMED_OUT = Symbol("description-lookup-timed-out");

async function loadDescription(job: CeipalJob): Promise<string> {
  const fallback = job.public_job_description || job.job_description || "";

  const lookup = (async (): Promise<string | null> => {
    const jobMap = await getJobMap();
    const id = jobMap[job.job_code];
    if (!id) {
      console.warn(`[job-page] no v2 id found for job_code "${job.job_code}" — jobMap has ${Object.keys(jobMap).length} entries`);
      return null;
    }
    const desc = await getCachedDescription(job.job_code, id);
    if (!desc.public_job_description && !desc.job_description) {
      console.warn(`[job-page] getCachedDescription returned empty for job_code "${job.job_code}" (id ${id})`);
    }
    return desc.public_job_description || desc.job_description || null;
  })().catch((err) => {
    console.error(`[job-page] loadDescription threw for job_code "${job.job_code}":`, err);
    return null;
  });

  const result = await raceTimeout(lookup, DESCRIPTION_TIMEOUT_MS, TIMED_OUT as unknown as string | null);
  if ((result as unknown) === TIMED_OUT) {
    // A slow-but-successful lookup here warms jobDescriptionCache.ts's own 24h
    // cache — but THIS page's ISR snapshot was just rendered with the empty
    // `fallback` below, and would otherwise keep serving that for the rest of
    // its 20-minute revalidate window (see `export const revalidate` above).
    // On a low-traffic job page, the next real visit might not come until long
    // after that window too, and if IT also races the 2.5s timeout, the page
    // re-poisons itself with another empty render — confirmed live: jpc-1506
    // sat with an empty description for weeks this way. Revalidating this
    // exact path as soon as the real description lands means the very next
    // visitor sees it, instead of whoever happens to reload after the window
    // lapses AND gets lucky with Ceipal's response time.
    after(async () => {
      const late = await lookup.catch(() => null);
      if (!late) return;
      // ceipal-job-map.ts's markStaleIfPossible() found revalidateTag/
      // revalidatePath can throw when called outside a route handler's
      // request scope — guarding the same way here since `after()` runs
      // post-response, a context Next's own docs don't explicitly cover for
      // this call.
      try {
        revalidatePath(`/get-hired/jobs/${jobUrlSlug(job)}`);
      } catch (err) {
        console.error(`[job-page] revalidatePath failed for job_code "${job.job_code}":`, err);
      }
    });
    return demoteDescriptionHeadings(fallback);
  }
  return demoteDescriptionHeadings(result || fallback);
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

            <div className={skills.length > 0 ? "mt-8" : ""}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">Job Description</p>
              {description ? (
                <div className={JOB_DESCRIPTION_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                // The server-side lookup (loadDescription above) raced a 2.5s
                // budget against Ceipal and lost — usually only on an older,
                // rarely-visited job whose 24h description cache had days to
                // go cold between visitors. Rather than show nothing, this
                // fetches the same description client-side with no fixed
                // timeout, so this one visitor still sees it within a few
                // seconds instead of an empty section.
                <JobDescriptionLoader jobCode={job.job_code} />
              )}
            </div>
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
