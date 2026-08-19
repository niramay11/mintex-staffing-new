"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-mist/40 px-4 py-2.5 text-sm text-navy placeholder:text-navy/30 transition-colors focus:border-steel focus:bg-white focus:outline-none focus:ring-4 focus:ring-steel/15 dark:bg-navy-900 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40 dark:focus:bg-navy-900";
const labelClasses = "block text-sm font-semibold text-navy dark:text-cream";

export default function ResumeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/resumes", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-steel-lighter/40 p-4 text-sm text-navy dark:text-cream">
        Thanks for sharing your resume! Our team will review it and reach out if there&apos;s a
        fit.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="resume-name" className={labelClasses}>
          Full name
        </label>
        <input id="resume-name" name="name" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="resume-email" className={labelClasses}>
          Email
        </label>
        <input id="resume-email" name="email" type="email" required className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="resume-industry" className={labelClasses}>
          Industry of interest
        </label>
        <input
          id="resume-industry"
          name="industry"
          type="text"
          placeholder="e.g. IT Staffing"
          className={inputClasses}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="resume-file" className={labelClasses}>
          Resume (PDF or Word)
        </label>
        <label
          htmlFor="resume-file"
          className="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-navy/25 bg-mist/40 px-4 py-3.5 text-sm transition-colors hover:border-steel hover:bg-white dark:bg-navy-900 dark:border-white/10 dark:hover:bg-navy-800"
        >
          <span className="flex items-center gap-2.5 text-navy/70 dark:text-cream/70">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 flex-shrink-0">
              <path
                d="M12 4v11m0-11 4 4m-4-4-4 4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fileName || "Choose a file to upload"}
          </span>
          <span className="flex-shrink-0 rounded-full bg-navy/[0.06] px-3 py-1 text-xs font-semibold text-navy dark:bg-navy-800 dark:text-cream">
            Browse
          </span>
        </label>
        <input
          id="resume-file"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
        />
      </div>
      {error && (
        <div className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="sm:col-span-2 mt-1">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:px-12">
          {submitting ? "Submitting…" : "Submit Resume"}
        </Button>
      </div>
    </form>
  );
}
