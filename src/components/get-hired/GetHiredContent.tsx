import { Suspense } from "react";
import { after } from "next/server";
import HeroImage from "@/components/ui/HeroImage";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import JobBoard from "@/components/jobs/JobBoard";
import BrowseRolesButton from "@/components/jobs/BrowseRolesButton";
import JobAlertButton from "@/components/jobs/JobAlertButton";
import FaqSplit from "@/components/ui/FaqSplit";
import Testimonials from "@/components/home/Testimonials";
import Link from "next/link";
import { getSiteImages } from "@/lib/siteImages";
import { getHomepageTestimonials } from "@/lib/caseStudies";
import { getJobsForCachedPage, isBuildPhase } from "@/lib/jobsForCachedPage";
import { getJobMap } from "@/lib/ceipal-job-map";
import { getCachedDescription, type JobDescription } from "@/lib/jobDescriptionCache";
import { withTimeout } from "@/lib/withTimeout";
import { warmIfNearExpiry } from "@/lib/warmCaches";
import { isActiveJob, jobUrlSlug } from "@/components/jobs/utils";
import { SITE_URL, BUSINESS } from "@/lib/site";
import type { CeipalJob } from "@/components/jobs/types";

// Matches JobBoard's own PAGE_SIZE — no point prefetching more than the
// first page can show before the user has even paged or filtered.
const PREFETCH_DESCRIPTION_COUNT = 9;

const jobSeekerFaqs = [
  {
    question: "Is Mintex Staffing free for job seekers?",
    answer: "Yes. You never pay to apply, interview or get placed. The hiring employer pays our fee.",
  },
  {
    question: "Is Mintex Staffing a legitimate staffing agency?",
    answer: `Yes. We've been recruiting since ${BUSINESS.foundingYear} from our office at ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}, and place candidates with real employers on contract, contract-to-hire and permanent roles.`,
  },
  {
    question: "What happens after I apply?",
    answer:
      "A recruiter reviews your application against the role. If it's a match, we'll contact you to discuss next steps before presenting you to the employer.",
  },
  {
    question: "Can I apply to more than one role?",
    answer: "Yes. Apply to as many roles as you're qualified for and interested in.",
  },
  {
    question: "Can a contract job become permanent?",
    answer:
      "Often, yes. Many of our contract placements convert to full-time once you and the employer agree it's a good fit.",
  },
  {
    question: "What if there's no role for me right now?",
    answer:
      "Share your resume or create a job alert. Recruiters search our talent network first when new roles open.",
  },
];

const AFTER_YOU_APPLY = [
  { title: "A recruiter reads your application.", text: "A person, not just software, checks it against the role." },
  { title: "We call if it's a match.", text: "We talk through the job and what you want next in your career." },
  { title: "We introduce you to the employer", text: "and set up interviews." },
  { title: "We help you prepare,", text: "then handle the offer details with you." },
];

const INTERVIEW_TOOLS = [
  {
    name: "AI Interview Question Generator",
    text: "Practice with questions written for your exact role.",
    href: "/resources/ai-interview-generator",
  },
  {
    name: "Interview Rights by State",
    text: "Know which questions employers can't legally ask where you live.",
    href: "/interview-rights",
  },
];

const INLINE_LINK =
  "font-semibold text-navy underline decoration-steel/40 underline-offset-4 transition-colors hover:decoration-navy dark:text-cream dark:hover:decoration-cream";

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{children}</p>
  );
}

// Isolated in its own Suspense boundary so the hero above never has to wait on
// Ceipal — the shell streams to the browser immediately and this section pops
// in once the (warm-cache-fast, cold-cache-timed-out) jobs fetch resolves.
async function JobBoardSection() {
  // Fire-and-forget: if the jobs cache is within a few minutes of expiring,
  // silently refresh everything in the background after THIS response is
  // sent, so the next visitor never lands on the cold cache this one might
  // have. No-op (near-instant) when the cache was refreshed recently.
  // Skipped during `next build` (see isBuildPhase).
  if (!isBuildPhase()) after(() => warmIfNearExpiry());

  // These pages are cached (ISR) now — see getJobsForCachedPage.
  const jobs = await getJobsForCachedPage();
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
  const jobMap = isBuildPhase() ? {} : await withTimeout(getJobMap(), 2000, {} as Record<string, string>);
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
      {/* activeJobs, not the raw typedJobs — the raw cache holds every job
          Ceipal has ever returned (confirmed live: 1,578 jobs going back
          to job codes in the single digits, vs ~88 actually active),
          and JobBoard only ever displays/filters isActiveJob() jobs
          anyway (see its own activeJobs useMemo), so embedding the other
          ~1,490 inactive jobs' data into this page's initial HTML was
          pure dead weight — confirmed live as the reason this page (and
          /get-hired, /get-hired/interview-prep, which render the same
          component) ran over 2MB. */}
      <JobBoard initialJobs={activeJobs} initialDescriptions={initialDescriptions} />
    </>
  );
}

function JobBoardSkeleton() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-navy/10 bg-white py-16 dark:border-white/10 dark:bg-navy-900">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy/15 border-t-steel dark:border-white/15 dark:border-t-steel-light" />
      <p className="mt-4 text-sm font-medium uppercase tracking-wide text-navy/40 dark:text-cream/40">Loading open roles…</p>
    </div>
  );
}

export default async function GetHiredContent() {
  const [siteImages, stories] = await Promise.all([getSiteImages(), getHomepageTestimonials()]);
  // Candidate stories live here; /seek-talent shows the employer ones.
  const candidateStories = stories.filter((s) => s.type === "candidate");

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
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>For job seekers</Eyebrow>
            <h1 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">
              Find your next job, free
            </h1>
            <p className="mt-4 max-w-xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
              Starting your career or ready for a change? Browse open contract and full-time roles, or send us
              your resume and a recruiter will match you to jobs as they open.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <BrowseRolesButton />
              <ButtonLink
                href="/get-hired/share-resume"
                variant="outline"
                className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950"
              >
                Share your resume
              </ButtonLink>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-medium text-navy/75 dark:text-cream/75">
              <span>14,000+ people placed since {BUSINESS.foundingYear}</span>
              <span aria-hidden="true" className="text-steel">·</span>
              <span>Never a fee for candidates</span>
            </p>
          </div>

          <HeroImage
            src={siteImages["get-hired:hero-visual"]}
            objectPosition="center 15%"
            alt="Job seeker preparing for an interview with Mintex Staffing's recruitment team"
          />
        </div>
      </Section>

      <Section id="apply-to-jobs" background="white">
        <h2 className="font-heading text-3xl font-bold text-navy dark:text-cream">Open roles</h2>
        <p className="mt-2 max-w-3xl text-[17px] leading-relaxed text-navy/70 dark:text-cream/70">
          New jobs go up every week across IT, healthcare, hospitality, legal, finance, industrial and more.
          Filter by job type, location, industry and experience level, or set up a job alert so new matches come
          to you.
        </p>
        <div className="mt-8">
          <Suspense fallback={<JobBoardSkeleton />}>
            <JobBoardSection />
          </Suspense>
        </div>
      </Section>

      {/* Sec 3 — What happens after you apply */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
              What happens after you apply
            </h2>
          </div>
          <ol className="mt-10 space-y-3.5">
            {AFTER_YOU_APPLY.map((step, index) => (
              <li
                key={step.title}
                className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-800"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
                >
                  {index + 1}
                </span>
                <p className="pt-0.5 text-[17px] leading-relaxed text-navy/70 dark:text-cream/70">
                  <strong className="font-semibold text-navy dark:text-cream">{step.title}</strong> {step.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-[18px] text-steel dark:text-steel-light">
            Didn&apos;t see the right role?{" "}
            <Link href="/get-hired/share-resume" className={INLINE_LINK}>
              Share your resume
            </Link>{" "}
            and we&apos;ll reach out when one opens.
          </p>
        </div>
      </Section>

      {/* Sec 4 — Candidate stories (employer stories live on /seek-talent) */}
      <Testimonials stories={candidateStories} heading="From people we've placed" />

      {/* Sec 5 — Interview prep */}
      <Section id="interview-prep" background="white" className="scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Interview prep</Eyebrow>
          <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
            Prepare for the interview
          </h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
          {INTERVIEW_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/10 dark:bg-navy-800"
            >
              <h3 className="font-heading text-[19px] font-semibold tracking-tight text-navy dark:text-cream">{tool.name}</h3>
              <p className="mt-2.5 text-[16px] leading-[1.7] text-steel dark:text-steel-light">{tool.text}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[14px] font-semibold text-navy dark:text-cream">
                Open the tool
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Sec 6 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <FaqSplit
          title="Frequently asked questions"
          intro="Answers to what job seekers ask us most. Don't see yours? Our team is happy to help."
          items={jobSeekerFaqs}
        />
      </Section>

      {/* Sec 7 — Closing CTA */}
      <Section background="mist">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
            Your next role might open tomorrow
          </h2>
          <p className="mt-4 text-[19px] leading-relaxed text-steel dark:text-steel-light">Get on our radar today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/get-hired/share-resume" variant="primary">
              Share your resume
            </ButtonLink>
            <JobAlertButton className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950" />
          </div>
        </div>
      </Section>
    </>
  );
}
