import Link from "next/link";
import type { CeipalJob } from "./types";
import JobPageApply from "./JobPageApply";
import { fmtPay, fmtPosted, isNewJob, jobLocation, jobType, jobUrlSlug, remoteBadge } from "./utils";
import { IconArrowRight, IconBriefcase, IconCalendar, IconFlag, IconInfo, IconTag } from "./icons";
import { PRIMARY_BUTTON_COLORS, SECONDARY_BUTTON_COLORS } from "@/components/ui/Button";

// Standalone copy of the skeuomorphic job card from the /get-hired job board
// (JobBoard.tsx), for lists outside the board — e.g. "More open roles" on a
// job page. Same markup and classes; minus the board-only pieces (bulk-apply
// checkbox, selection ring). "Apply now" opens the same apply modal the job
// page itself uses.
export default function JobCard({ job }: { job: CeipalJob }) {
  const pay = fmtPay(job.pay_rate___salary);
  const posted = fmtPosted(job.career_portal_published_date);
  const remote = remoteBadge(job.remote_job);
  const isNew = isNewJob(job.career_portal_published_date);
  const href = `/get-hired/jobs/${jobUrlSlug(job)}`;

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl bg-gradient-to-b from-white to-[#f2f6f8] p-4 shadow-[7px_7px_18px_rgba(0,48,96,0.12),-6px_-6px_16px_rgba(255,255,255,0.85),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[9px_9px_22px_rgba(0,48,96,0.16),-6px_-6px_16px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.6)] dark:bg-gradient-to-b dark:from-navy-800 dark:to-navy-900 dark:shadow-[7px_7px_18px_rgba(0,0,0,0.45),-5px_-5px_14px_rgba(255,255,255,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#e9eef1] text-[#0d98ba] shadow-[3px_3px_7px_rgba(0,48,96,0.14),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:from-navy-800 dark:to-navy-950 dark:text-[#6bc7db] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.45),-2px_-2px_6px_rgba(255,255,255,0.03)]">
            <IconBriefcase className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-[13px] font-medium text-navy/70 dark:text-cream/70">{jobLocation(job)}</span>
        </div>
        {remote && (
          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${remote.cls}`}>
            <IconFlag className="h-3 w-3" />
            {remote.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {jobType(job) && (
          <div className="flex items-center gap-2 rounded-lg bg-[#eef2f4] px-2.5 py-1.5 shadow-[inset_2px_2px_5px_rgba(0,48,96,0.09),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:bg-navy-950 dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]">
            <IconTag className="h-3.5 w-3.5 flex-shrink-0 text-navy/40 dark:text-cream/40" />
            <div className="min-w-0">
              <p className="text-[10.5px] leading-tight text-navy/45 dark:text-cream/45">Type</p>
              <p className="truncate text-[12.5px] font-medium text-navy dark:text-cream">{jobType(job)}</p>
            </div>
          </div>
        )}
        {posted && (
          <div className="flex items-center gap-2 rounded-lg bg-[#eef2f4] px-2.5 py-1.5 shadow-[inset_2px_2px_5px_rgba(0,48,96,0.09),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:bg-navy-950 dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]">
            <IconCalendar className="h-3.5 w-3.5 flex-shrink-0 text-navy/40 dark:text-cream/40" />
            <div className="min-w-0">
              <p className="text-[10.5px] leading-tight text-navy/45 dark:text-cream/45">Posted</p>
              <p className="truncate text-[12.5px] font-medium text-navy dark:text-cream">{posted}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 text-[15px] font-bold leading-snug text-navy dark:text-cream">
            <Link href={href} className="hover:text-steel hover:underline dark:hover:text-steel-light">
              {job.job_title}
            </Link>
          </h3>
          {isNew && (
            <span className="inline-flex items-center rounded-full bg-[#0d98ba]/12 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0d98ba] dark:bg-[#0d98ba]/20 dark:text-[#6bc7db]">
              New
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-1 text-[12.5px] leading-relaxed text-navy/55 dark:text-cream/55">
          {pay ? `${pay} · ` : ""}Job Order #{job.job_code}
          {job.number_of_positions ? ` · ${job.number_of_positions} opening${job.number_of_positions === 1 ? "" : "s"}` : ""}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <Link
          href={href}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-semibold transition-all ${SECONDARY_BUTTON_COLORS}`}
        >
          <IconInfo className="h-3.5 w-3.5" />
          Details
        </Link>
        <JobPageApply
          job={{
            job_code: job.job_code,
            job_title: job.job_title,
            location: jobLocation(job),
            pay_rate: job.pay_rate___salary || "N/A",
          }}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-semibold transition-all ${PRIMARY_BUTTON_COLORS}`}
        >
          <IconArrowRight className="h-3.5 w-3.5" />
          Apply
        </JobPageApply>
      </div>
    </div>
  );
}
