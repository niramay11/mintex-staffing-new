import type { CeipalJob } from "./types";

// Strip trailing zip/postal codes from a location string, e.g. "Lansing, MI, 48908" -> "Lansing, MI"
function stripZip(loc: string): string {
  return loc.replace(/,?\s*\b\d{5}(-\d{4})?\b/g, "").replace(/,\s*$/, "").trim();
}

export function jobLocation(job: CeipalJob): string {
  return stripZip(job.location || [job.city, job.states].filter(Boolean).join(", ")) || "Location not specified";
}

// A real job realistically spans a handful of industries at most. Some Ceipal records come
// through with the entire industry picklist dumped as one comma-joined string instead of a
// real value — past this count it's corrupted data, not a genuine multi-industry job.
const MAX_PLAUSIBLE_INDUSTRIES_PER_JOB = 5;

// Ceipal's `industry` field is usually a single value, but some jobs come through with every
// picklist option dumped as one giant comma-joined string. Split defensively so a single dirty
// record can't flood the industry filter with dozens of fake options, and treat it as unset
// (rather than matching every industry) so it doesn't over-match filters either.
export function jobIndustries(job: CeipalJob): string[] {
  const parts = (job.industry || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > MAX_PLAUSIBLE_INDUSTRIES_PER_JOB ? [] : parts;
}

// Mirror the admin panel's "Active" definition: status Active and modified within 6 months.
const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

export function isActiveJob(job: CeipalJob): boolean {
  if (String(job.job_status ?? "").trim() !== "Active") return false;
  const modStr = String(job.Modified ?? job.modified ?? "").trim();
  if (modStr && modStr !== "null" && modStr !== "None") {
    const d = new Date(modStr);
    if (!isNaN(d.getTime()) && d < SIX_MONTHS_AGO) return false;
  }
  return true;
}

export function fmtPay(raw?: string): string | null {
  const r = (raw || "").trim();
  if (!r || r === "0" || r.toLowerCase() === "n/a") return null;

  const isHourly = /\bhr\b|\/hr|per\s*hour|hourly/i.test(r);
  const isYearly = /\byr\b|\/yr|\/year|per\s*year|annual|salary/i.test(r);

  const nums = r.replace(/[$,\s]/g, "").match(/\d+(\.\d+)?/g);
  if (!nums) return r;

  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n.toLocaleString()}`);
  const vals = nums.map((n) => parseFloat(n));
  const isHr = isHourly || (!isYearly && vals[0] < 500);

  let display = vals.length >= 2 ? `${fmt(vals[0])} – ${fmt(vals[1])}` : fmt(vals[0]);
  if (!isHourly && !isYearly) display += isHr ? " / hr" : " / yr";
  else display += isHourly ? " / hr" : " / yr";

  return r.toLowerCase().includes("benefit") ? `${display} + Benefits` : display;
}

export type ExperienceBucketKey = "entry" | "mid" | "senior";

export const EXPERIENCE_BUCKETS: { key: ExperienceBucketKey; label: string; range: string }[] = [
  { key: "entry", label: "Entry level", range: "1–3 yrs" },
  { key: "mid", label: "Mid level", range: "4–7 yrs" },
  { key: "senior", label: "Senior", range: "8+ yrs" },
];

function parseExperienceYears(raw?: string): number | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (/entry|fresher|no\s*experience/.test(s)) return 1;
  if (/senior|expert|\blead\b/.test(s)) return 8;
  const nums = s.match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

// Buckets Ceipal's free-text `experience` field (e.g. "5-7 Years", "Entry Level") into
// Entry/Mid/Senior so the filter has a clean, fixed set of options instead of raw text.
export function experienceBucketKey(raw?: string): ExperienceBucketKey | null {
  const years = parseExperienceYears(raw);
  if (years === null) return null;
  if (years <= 3) return "entry";
  if (years <= 7) return "mid";
  return "senior";
}

// Ceipal's remote_job field isn't a strict yes/no — "Hybrid" and other free-text
// values pass through as-is, so callers must not assume the label is always "Remote".
export function workType(remote?: string): string | undefined {
  if (!remote) return undefined;
  const v = remote.toLowerCase();
  if (v === "yes" || v === "remote") return "Remote";
  if (v === "no") return "On-site";
  return remote;
}

function slugifyPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Human-readable, SEO-friendly URL slug for a job's detail page, e.g.
// job_code "JPC - 1539" + job_title "Senior Software Engineer" ->
// "jpc-1539-senior-software-engineer". Deterministic from job data alone,
// so the [slug] route can look a job up by recomputing this for every
// candidate rather than needing to store/reverse-parse anything.
export function jobUrlSlug(job: CeipalJob): string {
  return [slugifyPart(job.job_code), slugifyPart(job.job_title)].filter(Boolean).join("-");
}

export function fmtPosted(s?: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  if (diff < 30) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
