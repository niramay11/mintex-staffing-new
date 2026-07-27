"use client";

import { useEffect, useState } from "react";
import type { CeipalJob } from "./types";
import { fmtPay, fmtPosted, jobLocation, workType } from "./utils";

interface JobDetailModalProps {
  job: CeipalJob;
  onClose: () => void;
  onApply: () => void;
  // Set when JobBoard already prefetched this job's description in the
  // background while its card was visible — lets the modal skip the network
  // round-trip entirely instead of showing "Loading description…".
  prefetchedDescription?: { job_description: string; public_job_description: string };
}

export default function JobDetailModal({ job, onClose, onApply, prefetchedDescription }: JobDetailModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // The bulk jobs list no longer carries description text (see jobsCache.ts —
  // it made the cached payload too big for Next to store), so fetch this
  // one job's description on demand when the modal opens.
  const [fetchedDescription, setFetchedDescription] = useState<string | null>(() =>
    prefetchedDescription ? prefetchedDescription.public_job_description || prefetchedDescription.job_description || "" : null
  );
  const [descLoading, setDescLoading] = useState(!prefetchedDescription);

  useEffect(() => {
    if (prefetchedDescription) {
      setFetchedDescription(prefetchedDescription.public_job_description || prefetchedDescription.job_description || "");
      setDescLoading(false);
      return;
    }

    let cancelled = false;
    setDescLoading(true);
    setFetchedDescription(null);
    fetch(`/api/jobs/description?job_code=${encodeURIComponent(job.job_code)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setFetchedDescription(data.public_job_description || data.job_description || "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDescLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [job.job_code, prefetchedDescription]);

  const pay = fmtPay(job.pay_rate___salary);
  const posted = fmtPosted(job.career_portal_published_date);
  const description = fetchedDescription ?? job.public_job_description ?? job.job_description ?? "";
  const skills = (job.primary_skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const snapshot: { label: string; value?: string | number }[] = [
    { label: "Location", value: jobLocation(job) },
    { label: "Type", value: job.job_type },
    { label: "Experience", value: job.experience },
    { label: "Work Type", value: workType(job.remote_job) },
    { label: "Industry", value: job.industry },
    { label: "Positions", value: job.number_of_positions },
    { label: "Work Authorization", value: job.work_authorization },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/40 px-4 py-6 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-navy/10 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-navy/10 p-6">
          <div className="min-w-0">
            <span className="mb-1.5 inline-block rounded bg-mist px-2 py-0.5 font-mono text-[11px] text-navy/60">
              {job.job_code}
            </span>
            <h2 className="text-xl font-bold text-navy">{job.job_title}</h2>
            <p className="mt-1 text-sm text-navy/60">{jobLocation(job)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex-shrink-0 text-2xl leading-none text-navy/40 hover:text-navy"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-semibold text-steel">{pay ?? "Pay: N/A"}</span>
            {posted && <span className="text-sm text-navy/50">Posted {posted}</span>}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {snapshot
              .filter((s) => s.value)
              .map((s) => (
                <div key={s.label} className="rounded-lg bg-cream/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-navy/45">{s.label}</p>
                  <p className="mt-0.5 text-sm text-navy">{String(s.value)}</p>
                </div>
              ))}
          </div>

          {skills.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(description || descLoading) && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">Description</p>
              {descLoading ? (
                <p className="text-sm text-navy/40">Loading description…</p>
              ) : (
                <div
                  className="prose-sm text-sm leading-relaxed text-navy/80 [&_*]:my-1"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-navy/10 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy/10 bg-white px-5 py-2 text-sm font-semibold text-navy/70 hover:bg-mist"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-tan px-5 py-2 text-sm font-semibold text-navy hover:bg-tan-light"
          >
            Apply for this role
          </button>
        </div>
      </div>
    </div>
  );
}
