import { Suspense } from "react";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import JobBoard from "@/components/jobs/JobBoard";
import BrowseRolesButton from "@/components/jobs/BrowseRolesButton";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { IconBriefcase } from "@/components/jobs/icons";
import { getSiteImages } from "@/lib/siteImages";
import { getCachedJobs } from "@/lib/jobsCache";
import { getJobMap } from "@/lib/ceipal-job-map";
import { getCachedDescription, type JobDescription } from "@/lib/jobDescriptionCache";
import { withTimeout } from "@/lib/withTimeout";
import { isActiveJob, jobUrlSlug } from "@/components/jobs/utils";
import { SITE_URL } from "@/lib/site";
import type { CeipalJob } from "@/components/jobs/types";

// Matches JobBoard's own PAGE_SIZE — no point prefetching more than the
// first page can show before the user has even paged or filtered.
const PREFETCH_DESCRIPTION_COUNT = 8;

const jobSeekerFaqs = [
  {
    question: "Is Mintex Staffing free for job seekers?",
    answer:
      "Yes. There is never a cost to you to apply, interview, or get placed through Mintex Staffing — our fee is paid by the hiring employer, not the candidate.",
  },
  {
    question: "Is Mintex Staffing a legitimate staffing agency?",
    answer:
      "Yes. We're a staffing and recruitment agency based in Edison, New Jersey, placing candidates across IT, healthcare, engineering, and other industries with real employers on contract, contract-to-hire, and permanent roles.",
  },
  {
    question: "How does the application-to-placement process work?",
    answer:
      "You apply or share your resume, our recruiters match you against active roles that fit your skills, and if there's a fit we coordinate interviews directly with the hiring employer through to an offer.",
  },
  {
    question: "What happens after I apply to a job?",
    answer:
      "A recruiter reviews your application against the role's requirements. If it's a match, we'll reach out to discuss next steps before presenting you to the employer.",
  },
  {
    question: "Can I apply to multiple roles at once?",
    answer:
      "Yes. You're welcome to apply to any open roles you're qualified for and interested in — there's no limit on how many you can apply to.",
  },
];

// Isolated in its own Suspense boundary so the hero above never has to wait on
// Ceipal — the shell streams to the browser immediately and this section pops
// in once the (warm-cache-fast, cold-cache-timed-out) jobs fetch resolves.
async function JobBoardSection() {
  const { jobs } = await withTimeout(getCachedJobs(), 3000, { jobs: [] as unknown[], cachedAt: Date.now(), stale: true });
  const typedJobs = jobs as CeipalJob[];

  // Embed the first page's descriptions directly into this server render.
  // On a warm cache (the normal case in production — see
  // jobDescriptionCache.ts's warmJobDescriptions) this costs nothing extra
  // and means the server-rendered Data Cache entry each job's own
  // /get-hired/jobs/[job_code] page reads from is already warm by the time
  // anyone clicks through — not "probably already prefetched," but literally
  // already cached. Bounded by withTimeout so a cold cache can never hold up
  // the page itself; any job that doesn't resolve in time just falls back to
  // that page's own on-demand server fetch, same as before this existed.
  const jobMap = await withTimeout(getJobMap(), 2000, {} as Record<string, string>);
  // JobBoard's default (unfiltered) view only shows isActiveJob() jobs, so
  // prefetching the raw list's first N misses whatever got filtered out
  // ahead of it — mirror that same filter here or this prefetches the wrong
  // jobs entirely (confirmed live: zero overlap with what page 1 actually showed).
  const activeJobs = typedJobs.filter(isActiveJob);
  const prefetchedEntries = await withTimeout(
    Promise.all(
      activeJobs.slice(0, PREFETCH_DESCRIPTION_COUNT).map(async (job): Promise<[string, JobDescription] | null> => {
        const id = jobMap[job.job_code];
        if (!id) return null;
        try {
          return [job.job_code, await getCachedDescription(job.job_code, id)];
        } catch {
          return null;
        }
      })
    ),
    2500,
    []
  );
  const initialDescriptions = Object.fromEntries(prefetchedEntries.filter((e): e is [string, JobDescription] => e !== null));

  const jobListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: activeJobs.map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/get-hired/jobs/${jobUrlSlug(job)}`,
      name: job.job_title,
    })),
  };

  return (
    <>
      <script
        id="job-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobListSchema) }}
      />
      <JobBoard initialJobs={typedJobs} initialDescriptions={initialDescriptions} />
    </>
  );
}

function JobBoardSkeleton() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-navy/10 bg-white py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-navy/40">Loading open roles…</p>
    </div>
  );
}

export default async function GetHiredContent() {
  const siteImages = await getSiteImages();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: jobSeekerFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        id="get-hired-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70">
              <span className="h-[7px] w-[7px] rounded-full bg-steel shadow-[0_0_0_4px_rgba(74,115,140,0.25)]" />
              For Job Seekers
            </div>
            <h1 className="mt-5 font-heading text-4xl font-bold text-navy sm:text-5xl">Get Hired</h1>
            <p className="mt-4 max-w-xl text-steel">
              Find jobs according to your career goals, whether you are beginning your career or
planning to switch roles, we got you covered. Join our talent network to stay ahead of new
roles as they go live.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <BrowseRolesButton />
            </div>
          </div>

          {/* Right — showcase visual */}
          <div className="relative hidden lg:flex lg:items-center lg:justify-center lg:pl-6">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/15 blur-[100px]"
            />

            <div className="absolute -left-8 -top-8 z-20 flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-4 py-3 shadow-[0_25px_60px_-15px_rgba(0,48,96,0.2)]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel">
                <IconBriefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold leading-none text-navy">14k+</p>
                <p className="mt-1 text-xs leading-none text-navy/50">Placements made</p>
              </div>
            </div>

            <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[32px] border border-navy/10 shadow-[0_40px_90px_-25px_rgba(0,48,96,0.3)]">
              <Image
                src={siteImages["get-hired:hero-visual"]}
                alt="Job seeker preparing for an interview with Mintex Staffing's recruitment team"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-8 -right-8 z-20 flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-4 py-3 shadow-[0_25px_60px_-15px_rgba(0,48,96,0.2)]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel">
                <IconBriefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold leading-none text-navy">9 days</p>
                <p className="mt-1 text-xs leading-none text-navy/50">Avg. time to fill</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="apply-to-jobs" background="white">
        <h2 className="font-heading text-3xl font-bold text-navy">Apply to Jobs</h2>
        <p className="mt-2 max-w-2xl text-navy/70">
          Explore current openings across every industry we staff.
        </p>
        <div className="mt-8">
          <Suspense fallback={<JobBoardSkeleton />}>
            <JobBoardSection />
          </Suspense>
        </div>
      </Section>

      <Section background="mist">
        <h2 className="font-heading text-3xl font-bold text-navy">Frequently Asked Questions</h2>
        <FaqAccordion items={jobSeekerFaqs} />
      </Section>

      <Section id="interview-prep" background="white" className="!py-12 text-center sm:!py-14">
        <ButtonLink
          href="/resources/ai-interview-generator"
          variant="secondary"
          className="group inline-flex items-center gap-3 !px-8 !py-4 text-base !transition-all shadow-[0_10px_30px_-14px_rgba(0,48,96,0.22)] hover:-translate-y-0.5 hover:border-steel/40 hover:shadow-[0_16px_40px_-14px_rgba(0,48,96,0.3)]"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M12 2 13.8 8.2 20 10 13.8 11.8 12 18 10.2 11.8 4 10 10.2 8.2 12 2Z" fill="currentColor" />
            </svg>
          </span>
          Try the AI Interview Question Generator
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 flex-shrink-0 text-navy/50 transition-transform group-hover:translate-x-1"
          >
            <path
              d="M4 10h12M11 5l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ButtonLink>
      </Section>
    </>
  );
}
