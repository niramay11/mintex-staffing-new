"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { CeipalJob, SelectedJob } from "./types";
import ApplyModal from "./ApplyModal";
import JobAlertModal from "./JobAlertModal";
import {
  EXPERIENCE_BUCKETS,
  experienceBucketKey,
  fmtPay,
  fmtPosted,
  isActiveJob,
  jobIndustries,
  jobLocation,
  jobUrlSlug,
  type ExperienceBucketKey,
} from "./utils";
import { IconArrowRight, IconBars, IconBell, IconBriefcase, IconChevron, IconPeople, IconPin, IconSearch } from "./icons";

const PAGE_SIZE = 8;

const LOCATION_OPTIONS = [
  "Remote",
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

function toSelectedJob(job: CeipalJob): SelectedJob {
  return {
    job_code: job.job_code,
    job_title: job.job_title,
    location: job.location || [job.city, job.states].filter(Boolean).join(", "),
    pay_rate: job.pay_rate___salary || "N/A",
  };
}

// Windowed page-number list with ellipsis, e.g. [1, "…", 4, 5, 6, "…", 12].
function pageWindow(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const add = (p: number | "…") => pages.push(p);
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
      add(p);
    } else if (pages[pages.length - 1] !== "…") {
      add("…");
    }
  }
  return pages;
}

function remoteBadge(remote?: string) {
  if (!remote) return null;
  const v = remote.toLowerCase();
  if (v === "yes" || v === "remote") return { label: "Remote", cls: "bg-green-100 text-green-800" };
  if (v === "no") return { label: "On-site", cls: "bg-red-100 text-red-700" };
  return { label: remote, cls: "bg-navy/10 text-navy" };
}

// ─── Collapsible sidebar section ───────────────────────────────────────────────
function FilterSection({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-navy/10 pt-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-navy/50">
          {title}
          {typeof count === "number" && count > 0 && <span className="ml-1 text-navy/35">({count})</span>}
        </span>
        <IconChevron className={`h-3.5 w-3.5 text-navy/35 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function CheckboxList({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex cursor-pointer items-center gap-2.5 text-sm text-navy/75 hover:text-navy">
          <input
            type="checkbox"
            checked={selected.has(opt)}
            onChange={() => onToggle(opt)}
            className="h-4 w-4 rounded border-navy/30 accent-steel"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

// Card-style option row — used for Job Type and Experience level so both read as
// the same filter widget instead of a plain checkbox list.
function OptionCard({
  icon,
  label,
  subtitle,
  active,
  onClick,
  indicatorShape = "circle",
}: {
  icon: ReactNode;
  label: string;
  subtitle?: string;
  active: boolean;
  onClick: () => void;
  indicatorShape?: "circle" | "square";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
        active ? "border-navy bg-cream" : "border-navy/10 hover:border-navy/30"
      }`}
    >
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
          active ? "bg-navy text-white" : "bg-mist text-navy/45"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm font-medium ${active ? "text-navy" : "text-navy/80"}`}>{label}</span>
        {subtitle && <span className="block text-xs text-navy/45">{subtitle}</span>}
      </span>
      <span
        className={`h-4 w-4 flex-shrink-0 border ${indicatorShape === "circle" ? "rounded-full" : "rounded-[4px]"} ${
          active ? "border-navy bg-navy" : "border-navy/25"
        }`}
      />
    </button>
  );
}

// Custom location dropdown — a native <select>'s popup is styled entirely by the
// OS/browser and can render oversized or mispositioned; this renders in-flow instead.
function LocationSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function select(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-navy/20 bg-white px-3 py-2 text-sm focus:border-steel focus:outline-none"
      >
        <span className={value ? "text-navy" : "text-navy/50"}>{value || "All locations"}</span>
        <IconChevron className={`h-3.5 w-3.5 flex-shrink-0 text-navy/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-lg border border-navy/10 bg-white p-1 shadow-[0_12px_32px_-8px_rgba(0,48,96,0.25)]">
          <button
            type="button"
            onClick={() => select("")}
            className={`block w-full rounded-md px-3 py-1.5 text-left text-sm ${
              !value ? "bg-cream font-medium text-navy" : "text-navy/70 hover:bg-cream"
            }`}
          >
            All locations
          </button>
          {LOCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={`block w-full rounded-md px-3 py-1.5 text-left text-sm ${
                value === opt ? "bg-cream font-medium text-navy" : "text-navy/70 hover:bg-cream"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface JobBoardProps {
  initialJobs?: CeipalJob[];
  // Server-prefetched descriptions for the first page's jobs (see
  // GetHiredContent.tsx) — seeded straight into descCacheRef below so the
  // very first render already has them, no client fetch needed at all.
  initialDescriptions?: Record<string, { job_description: string; public_job_description: string }>;
}

export default function JobBoard({ initialJobs, initialDescriptions }: JobBoardProps) {
  const hasInitialJobs = Boolean(initialJobs && initialJobs.length > 0);
  const [jobs, setJobs] = useState<CeipalJob[]>(initialJobs ?? []);
  const [loading, setLoading] = useState(!hasInitialJobs);
  const [error, setError] = useState<string | null>(null);
  // Right after a fresh deploy (or any 15-min gap in traffic), the very
  // first visitor's request can take up to ~40s while the job list
  // refetches from Ceipal — a bare spinner for that long reads as "broken."
  // Swapping the message after a few seconds keeps it honest instead.
  const [slowLoad, setSlowLoad] = useState(false);

  const [search, setSearch] = useState("");
  const [zip, setZip] = useState("");
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<Set<string>>(new Set());
  const [experienceFilter, setExperienceFilter] = useState<Set<ExperienceBucketKey>>(new Set());

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyJobs, setApplyJobs] = useState<SelectedJob[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);

  useEffect(() => {
    // Server-prefetched jobs are already in state (see get-hired/page.tsx) — only
    // fall back to a client-side fetch if that prefetch is missing or came back empty.
    if (hasInitialJobs) return;

    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlowLoad(true); }, 6000);

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        const list: CeipalJob[] = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        if (!cancelled) setJobs(list);
      } catch {
        if (!cancelled) setError("We couldn't load open roles right now. Please refresh or try again shortly.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [hasInitialJobs]);

  const activeJobs = useMemo(() => jobs.filter(isActiveJob), [jobs]);

  const jobTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const j of activeJobs) {
      if (!j.job_type) continue;
      counts.set(j.job_type, (counts.get(j.job_type) ?? 0) + 1);
    }
    return counts;
  }, [activeJobs]);
  const jobTypes = useMemo(() => Array.from(jobTypeCounts.keys()).sort(), [jobTypeCounts]);

  const industries = useMemo(
    () => Array.from(new Set(activeJobs.flatMap(jobIndustries))).sort(),
    [activeJobs]
  );

  const experienceCounts = useMemo(() => {
    const counts = new Map<ExperienceBucketKey, number>();
    for (const j of activeJobs) {
      const key = experienceBucketKey(j.experience);
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [activeJobs]);

  function toggleInSet<T>(setter: (fn: (prev: Set<T>) => Set<T>) => void, value: T) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const z = zip.trim();
    return activeJobs.filter((job) => {
      if (typeFilter.size > 0 && !typeFilter.has(job.job_type || "")) return false;
      if (experienceFilter.size > 0) {
        const key = experienceBucketKey(job.experience);
        if (!key || !experienceFilter.has(key)) return false;
      }

      if (locationFilter) {
        if (locationFilter === "Remote") {
          const remoteVal = (job.remote_job || "").toLowerCase();
          if (remoteVal !== "remote" && remoteVal !== "yes") return false;
        } else {
          const target = locationFilter.toLowerCase();
          const state = (job.states || "").toLowerCase();
          const city = (job.city || "").toLowerCase();
          const location = (job.location || "").toLowerCase();
          if (!state.includes(target) && !city.includes(target) && !location.includes(target)) return false;
        }
      }

      if (industryFilter.size > 0 && !jobIndustries(job).some((i) => industryFilter.has(i))) return false;

      if (q) {
        const haystack = `${job.job_title} ${job.primary_skills || ""} ${job.city || ""} ${job.states || ""} ${job.location || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (z) {
        if (!job.zip_code?.includes(z) && !job.location?.includes(z)) return false;
      }

      return true;
    });
  }, [activeJobs, typeFilter, locationFilter, industryFilter, experienceFilter, search, zip]);

  // Reset to page 1 whenever the effective filter set changes.
  useEffect(() => {
    setPage(1);
  }, [search, zip, typeFilter, locationFilter, industryFilter, experienceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageJobs = filteredJobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // /api/jobs/description is a live, sometimes-slow (8-12s) Ceipal call — the
  // route caches it server-side per job, but that still means whoever opens a
  // given job's modal FIRST pays that cost live. Prefetching every visible
  // card's description in the background as soon as the page renders means
  // by the time a real click happens (which takes at least a moment of human
  // reaction time), the answer is usually already sitting in this ref — so
  // opening the modal reads it synchronously instead of waiting on a fetch.
  const descCacheRef = useRef<Map<string, { job_description: string; public_job_description: string }>>(
    new Map(Object.entries(initialDescriptions ?? {}))
  );
  const descPrefetchedRef = useRef<Set<string>>(new Set(Object.keys(initialDescriptions ?? {})));
  useEffect(() => {
    for (const job of pageJobs) {
      const code = job.job_code;
      if (!code || descPrefetchedRef.current.has(code)) continue;
      descPrefetchedRef.current.add(code);
      fetch(`/api/jobs/description?job_code=${encodeURIComponent(code)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) descCacheRef.current.set(code, data);
        })
        .catch(() => {});
    }
  }, [pageJobs]);

  const activeFilterCount =
    typeFilter.size +
    industryFilter.size +
    experienceFilter.size +
    (locationFilter ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    (zip.trim() ? 1 : 0);

  function clearAllFilters() {
    setTypeFilter(new Set());
    setIndustryFilter(new Set());
    setExperienceFilter(new Set());
    setLocationFilter("");
    setSearch("");
    setZip("");
  }

  function openApplyForSelected() {
    const jobsToApply = jobs.filter((j) => selected.has(j.job_code)).map(toSelectedJob);
    if (jobsToApply.length === 0) return;
    setApplyJobs(jobsToApply);
    setApplyOpen(true);
  }

  function closeApply() {
    setApplyOpen(false);
  }

  function handleApplySuccess() {
    setApplyOpen(false);
    setSelected(new Set());
  }

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {/* Search bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3 rounded-lg border border-navy/10 bg-white p-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, skill, or location"
            className="w-full rounded-md border border-navy/20 bg-white py-2.5 pl-9 pr-3 text-sm text-navy focus:border-steel focus:outline-none"
          />
        </div>
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip code"
          className="w-full rounded-md border border-navy/20 bg-white px-3 py-2.5 text-sm text-navy focus:border-steel focus:outline-none sm:max-w-[160px]"
        />
        <button type="submit" className="rounded-full bg-white border border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-mist sm:flex-shrink-0">
          Search
        </button>
      </form>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAlertOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel hover:text-navy"
        >
          <IconBell className="h-4 w-4" />
          Create job alert
        </button>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[260px_1fr] lg:items-start lg:gap-8">
        {/* Filters — left sidebar on desktop, stacked panel on mobile */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-navy/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-steel underline-offset-2 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {jobTypes.length > 0 && (
                <FilterSection title="Job Type" count={jobTypes.length}>
                  <div className="space-y-2">
                    {jobTypes.map((type) => {
                      const active = typeFilter.has(type);
                      const count = jobTypeCounts.get(type) ?? 0;
                      return (
                        <OptionCard
                          key={type}
                          icon={<IconBriefcase className="h-4 w-4" />}
                          label={type}
                          subtitle={`${count} opening${count === 1 ? "" : "s"}`}
                          active={active}
                          onClick={() => toggleInSet(setTypeFilter, type)}
                          indicatorShape="square"
                        />
                      );
                    })}
                  </div>
                </FilterSection>
              )}

              <FilterSection title="Work Location">
                <LocationSelect value={locationFilter} onChange={setLocationFilter} />
              </FilterSection>

              {industries.length > 0 && (
                <FilterSection title="Industry" count={industries.length}>
                  <CheckboxList
                    options={industries}
                    selected={industryFilter}
                    onToggle={(v) => toggleInSet(setIndustryFilter, v)}
                  />
                </FilterSection>
              )}

              {experienceCounts.size > 0 && (
                <FilterSection title="Experience level">
                  <div className="space-y-2">
                    {EXPERIENCE_BUCKETS.filter((b) => experienceCounts.has(b.key)).map((bucket) => {
                      const active = experienceFilter.has(bucket.key);
                      return (
                        <OptionCard
                          key={bucket.key}
                          icon={<IconBars className="h-3.5 w-3.5" />}
                          label={bucket.label}
                          subtitle={bucket.range}
                          active={active}
                          onClick={() => toggleInSet(setExperienceFilter, bucket.key)}
                          indicatorShape="circle"
                        />
                      );
                    })}
                  </div>
                </FilterSection>
              )}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="mt-6 lg:mt-0">
          <p className="text-sm text-navy/60">
            {loading ? (
              "Loading open roles…"
            ) : (
              <>
                <span className="font-semibold text-navy">{filteredJobs.length}</span> active position
                {filteredJobs.length === 1 ? "" : "s"} found
              </>
            )}
          </p>

          {/* Loading state */}
          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy/15 border-t-steel" />
              <p className="mt-4 text-sm font-medium uppercase tracking-wide text-navy/40">Loading positions…</p>
              {slowLoad && (
                <p className="mt-2 max-w-xs text-xs text-navy/40">
                  Still working — this can take up to a minute right after things update. Thanks for your patience.
                </p>
              )}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="mt-6 rounded-lg border border-navy/10 bg-white p-8 text-center">
              <p className="text-sm text-navy/70">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="mt-6 rounded-lg border border-navy/10 bg-white p-8 text-center">
              <p className="text-base font-semibold text-navy">No roles match your filters</p>
              <p className="mt-1 text-sm text-navy/60">Try adjusting your search or clearing filters.</p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-4 rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-secondary"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Job grid */}
          {!loading && !error && filteredJobs.length > 0 && (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {pageJobs.map((job) => {
                  const isSelected = selected.has(job.job_code);
                  const pay = fmtPay(job.pay_rate___salary);
                  const posted = fmtPosted(job.career_portal_published_date);
                  const remote = remoteBadge(job.remote_job);

                  return (
                    <div
                      key={job.job_code}
                      className={`relative flex flex-col rounded-lg border bg-white p-6 transition-colors ${
                        isSelected ? "border-steel bg-cream/40" : "border-navy/10"
                      }`}
                    >
                      <label
                        className="absolute right-4 top-4 flex h-5 w-5 cursor-pointer items-center justify-center"
                        aria-label={`Select ${job.job_title}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleInSet(setSelected, job.job_code)}
                          className="h-4 w-4 rounded border-navy/30 accent-steel"
                        />
                      </label>

                      <div className="pr-7">
                        <span className="mb-1 inline-block rounded bg-mist px-2 py-0.5 font-mono text-[11px] text-navy/60">
                          {job.job_code}
                        </span>
                        <h3 className="text-base font-semibold text-navy">
                          <Link
                            href={`/get-hired/jobs/${jobUrlSlug(job)}`}
                            className="hover:text-steel hover:underline"
                          >
                            {job.job_title}
                          </Link>
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-navy/60">
                          <IconPin className="h-3.5 w-3.5 flex-shrink-0 text-navy/35" />
                          <span className="truncate">{jobLocation(job)}</span>
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {pay && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            {pay}
                          </span>
                        )}
                        {job.number_of_positions && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy/70">
                            <IconPeople className="h-3 w-3" />
                            {job.number_of_positions}
                          </span>
                        )}
                        {remote && (
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${remote.cls}`}>{remote.label}</span>
                        )}
                        {job.job_type && (
                          <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-navy">{job.job_type}</span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-navy/10 pt-4 text-sm">
                        <span className="text-navy/50">{posted ? `Posted ${posted}` : ""}</span>
                        <Link
                          href={`/get-hired/jobs/${jobUrlSlug(job)}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-secondary"
                        >
                          View &amp; Apply
                          <IconArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Job results pages" className="mt-8 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="rounded-full border border-navy/20 bg-white px-3 py-2 text-sm font-medium text-navy hover:border-navy/40 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    &larr;
                  </button>
                  {pageWindow(safePage, totalPages).map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-navy/40">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        aria-current={p === safePage ? "page" : undefined}
                        className={`h-9 min-w-[2.25rem] rounded-full px-2 text-sm font-semibold transition-colors ${
                          p === safePage ? "bg-navy text-white" : "text-navy/70 hover:bg-cream"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="rounded-full border border-navy/20 bg-white px-3 py-2 text-sm font-medium text-navy hover:border-navy/40 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    &rarr;
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating multi-select bar */}
      {selected.size > 0 && !applyOpen && (
        <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-navy px-5 py-3.5 shadow-[0_20px_60px_-15px_rgba(0,48,96,0.6)]">
            <p className="text-sm font-semibold text-white">
              {selected.size} role{selected.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openApplyForSelected}
                className="rounded-full bg-white border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-mist"
              >
                Apply now
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                aria-label="Clear selection"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {applyOpen && <ApplyModal jobs={applyJobs} onClose={closeApply} onSuccess={handleApplySuccess} />}

      {alertOpen && (
        <JobAlertModal
          initialKeyword={search}
          initialLocation={zip || locationFilter}
          onClose={() => setAlertOpen(false)}
        />
      )}
    </div>
  );
}
