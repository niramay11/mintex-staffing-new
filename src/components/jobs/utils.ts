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

// Ceipal job descriptions are recruiter-pasted rich text (often straight out
// of Word/Outlook), which sometimes carries a literal <h1> for a section
// title. The job page itself already has the real <h1> (the job title), so
// any <h1> surviving inside the description would give the page two —
// bumping it to <h2> keeps the heading hierarchy valid no matter what a
// given job's source HTML contains. Shared between the server-rendered page
// and JobDescriptionLoader's client-side fetch fallback so both apply the
// same treatment.
export function demoteDescriptionHeadings(html: string): string {
  return html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}

// Confirmed live: some Ceipal postings carry a "description" that's really
// just the job title pasted in as a heading with nothing after it (looks
// like an AI-writing-tool paste that got cut short before the real content
// came through) — technically non-empty HTML, but rendering it looks like a
// broken/incomplete page to an applicant, not an honest "nothing here yet."
// Stripping tags and requiring a minimum length catches that case without
// needing to know anything about what a given job's real content should be
// — any genuine description (responsibilities, qualifications, etc.) clears
// this by a wide margin; a bare title heading doesn't.
const MIN_SUBSTANTIVE_DESCRIPTION_LENGTH = 60;

export function hasSubstantiveDescription(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length >= MIN_SUBSTANTIVE_DESCRIPTION_LENGTH;
}

// Shared by the job page's server-rendered description and
// JobDescriptionLoader's client-fetched one, so a description that arrives
// late (see JobDescriptionLoader) renders identically to one available at
// first render.
export const JOB_DESCRIPTION_PROSE_CLASS =
  "text-[15px] leading-relaxed text-navy/80 dark:text-cream/80 " +
  "[&_p]:mb-3 [&_p:last-child]:mb-0 " +
  "[&_strong]:font-semibold [&_strong]:text-navy dark:[&_strong]:text-cream " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 " +
  "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 " +
  "[&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-navy [&_h1:first-child]:mt-0 dark:[&_h1]:text-cream " +
  "[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy [&_h2:first-child]:mt-0 dark:[&_h2]:text-cream " +
  "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy [&_h3:first-child]:mt-0 dark:[&_h3]:text-cream " +
  "[&_a]:font-medium [&_a]:text-steel [&_a]:no-underline [&_a:hover]:underline dark:[&_a]:text-steel-light";

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

// Seniority/level words stripped before comparing an interview kit's role
// title (free text — typed by a candidate or lifted from a pasted job
// description) against a live job's title. Without this, "Senior Software
// Engineer" (job) would never match a kit titled just "Software Engineer".
const TITLE_MODIFIER_WORDS = new Set([
  "senior", "sr", "junior", "jr", "lead", "principal", "staff", "entry",
  "level", "i", "ii", "iii", "iv", "1", "2", "3", "4", "associate",
  "intern", "internship", "mid", "the", "a", "an",
]);

function coreTitlePhrase(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !TITLE_MODIFIER_WORDS.has(w))
    .join(" ")
    .trim();
}

// Deliberately stricter than the per-industry keyword matching in
// matchesIndustry (industries/[slug]/page.tsx): that list is a handful of
// hand-picked, human-vetted keywords, so "any keyword matches" is safe.
// A kit's role title is arbitrary free text with no human review, so this
// requires the full (modifier-stripped) phrase to appear as a substring
// rather than matching on any single word — "Developer" alone would
// otherwise match almost every engineering job on the board.
export function matchesRoleTitle(job: CeipalJob, roleTitle: string): boolean {
  const core = coreTitlePhrase(roleTitle);
  const jobTitle = coreTitlePhrase(job.job_title || "");
  if (core.length < 3 || jobTitle.length < 3) return false;
  return jobTitle.includes(core) || core.includes(jobTitle);
}
