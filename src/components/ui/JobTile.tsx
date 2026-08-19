import Link from "next/link";
import type { CeipalJob } from "@/components/jobs/types";
import { fmtPay, fmtPosted, jobLocation, jobUrlSlug } from "@/components/jobs/utils";
import { IconArrowRight, IconPin } from "@/components/jobs/icons";

export default function JobTile({ job }: { job: CeipalJob }) {
  const pay = fmtPay(job.pay_rate___salary);
  const posted = fmtPosted(job.career_portal_published_date);

  return (
    <div className="flex flex-col rounded-lg border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-navy dark:text-cream">{job.job_title}</h3>
        {job.job_type && (
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy dark:bg-navy-800 dark:text-cream">
            {job.job_type}
          </span>
        )}
      </div>
      <p className="mt-1 flex items-center gap-1 text-sm text-navy/70 dark:text-cream/70">
        <IconPin className="h-3.5 w-3.5 flex-shrink-0 text-navy/35 dark:text-cream/40" />
        {jobLocation(job)}
      </p>

      <div className="mt-4 flex flex-1 items-end justify-between gap-3 border-t border-navy/10 pt-4 text-sm dark:border-white/10">
        <div>
          {pay && <span className="font-semibold text-steel dark:text-steel-light">{pay}</span>}
          {posted && <p className="text-navy/50 dark:text-cream/50">Posted {posted}</p>}
        </div>
        <Link
          href={`/get-hired/jobs/${jobUrlSlug(job)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
        >
          View &amp; Apply
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
