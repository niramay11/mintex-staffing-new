import type { Job } from "@/content/types";

export default function JobTile({ job }: { job: Job }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-navy">{job.title}</h3>
        <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">
          {job.type}
        </span>
      </div>
      <p className="mt-1 text-sm text-navy/70">{job.location}</p>
      <p className="mt-3 text-sm text-navy/80">{job.summary}</p>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-steel">{job.salaryRange}</span>
        <span className="text-navy/50">
          Posted {new Date(job.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
