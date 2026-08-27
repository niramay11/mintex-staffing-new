import type { CeipalJob } from "@/components/jobs/types";
import { BUSINESS, SITE_URL } from "@/lib/site";
import { hasSubstantiveDescription } from "@/components/jobs/utils";

// Google accepts employmentType as a single enum string or an array of them —
// returning an array covers dual-classified listings (e.g. "Full-Time or
// Contract") instead of only ever matching the first substring found.
function toEmploymentType(raw?: string): string[] {
  const s = (raw || "").toLowerCase();
  const types: string[] = [];
  if (s.includes("full")) types.push("FULL_TIME");
  if (s.includes("part")) types.push("PART_TIME");
  if (s.includes("intern")) types.push("INTERN");
  if (s.includes("temp")) types.push("TEMPORARY");
  if (s.includes("contract") || s.includes("c2h") || s.includes("1099") || s.includes("corp")) types.push("CONTRACTOR");
  return types.length ? types : ["OTHER"];
}

function toIsoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function sixMonthsAfter(isoDate: string): string {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() + 6);
  return d.toISOString();
}

function toCountryCode(raw?: string): string {
  const s = (raw || "").trim().toLowerCase();
  if (!s || s === "us" || s === "usa" || s.includes("united states")) return "US";
  return raw!.trim();
}

function resolveCityState(job: CeipalJob): { city?: string; region?: string } {
  if (job.city || job.states) return { city: job.city, region: job.states };
  const parts = (job.location || "").split(",").map((s) => s.trim()).filter(Boolean);
  return { city: parts[0], region: parts[1] };
}

// Ceipal's pay field is free text meant for display (e.g. "$90,000 - $120,000
// / Year"). Google's JobPosting schema needs actual numbers, not a formatted
// string, so this pulls out the raw min/max + unit instead of reusing
// utils.ts's fmtPay (which rounds to "$90k" for on-page display only).
function parseSalaryForSchema(raw?: string): { minValue: number; maxValue: number; unitText: "HOUR" | "YEAR" } | null {
  const r = (raw || "").trim();
  if (!r || r === "0" || r.toLowerCase() === "n/a") return null;

  const nums = r.replace(/[$,\s]/g, "").match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  const vals = nums.map(Number).filter((n) => n > 0);
  if (vals.length === 0) return null;

  const isHourly = /\bhr\b|\/hr|per\s*hour|hourly/i.test(r);
  const isYearly = /\byr\b|\/yr|\/year|per\s*year|annual|salary/i.test(r);
  const unitText: "HOUR" | "YEAR" = isHourly || (!isYearly && vals[0] < 500) ? "HOUR" : "YEAR";

  return { minValue: Math.min(...vals), maxValue: Math.max(...vals), unitText };
}

// Builds a schema.org JobPosting object (see https://schema.org/JobPosting)
// for Google's Jobs rich result. Only valid for a job's own dedicated,
// crawlable page — Google won't credit structured data sitting inside a
// click-triggered modal.
export function buildJobPostingSchema(job: CeipalJob, description: string) {
  const datePosted =
    toIsoDate(job.career_portal_published_date) ?? toIsoDate(job.Modified) ?? toIsoDate(job.modified) ?? new Date().toISOString();
  // Ceipal's job_end_date is blank for most listings, and Google requires
  // validThrough eventually (an empty one just means Google keeps showing a
  // stale posting forever). Falling back to 6 months past datePosted mirrors
  // the site's own staleness window (isActiveJob in components/jobs/utils.ts,
  // "mirror the admin panel's Active definition"), so Google's own automatic
  // expiry lines up with the point this site would already stop listing it —
  // no separate cron/expiry job needed, and no new business rule invented.
  const validThrough = toIsoDate(job.job_end_date) ?? sixMonthsAfter(datePosted);
  const isRemote = ["yes", "remote"].includes((job.remote_job || "").trim().toLowerCase());
  const salary = parseSalaryForSchema(job.pay_rate___salary);
  const { city, region } = resolveCityState(job);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.job_title,
    // Confirmed live (JPC-1553): some Ceipal postings' description is just
    // the job title pasted in as a heading, nothing else — technically
    // non-empty, but not something worth telling Google is this job's
    // description (Google flags overly short/generic JobPosting
    // descriptions as a quality issue). Falls to the same generated summary
    // used when there's no description at all.
    description: hasSubstantiveDescription(description) ? description.trim() : `${job.job_title} — apply now with ${BUSINESS.name}.`,
    identifier: {
      "@type": "PropertyValue",
      name: BUSINESS.name,
      value: job.job_code,
    },
    datePosted,
    validThrough,
    employmentType: toEmploymentType(job.job_type),
    hiringOrganization: {
      "@type": "Organization",
      name: BUSINESS.name,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
    },
    jobLocationType: isRemote ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: isRemote ? { "@type": "Country", name: "USA" } : undefined,
    // Google requires jobLocation.address to exist (addressCountry at minimum)
    // for every non-remote posting — Ceipal's free-text location field doesn't
    // always parse into a city/state, so this must never come back empty for
    // an on-site job, unlike city/region which are included only when known.
    jobLocation: isRemote
      ? undefined
      : {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            ...(city ? { addressLocality: city } : {}),
            ...(region ? { addressRegion: region } : {}),
            ...(job.zip_code ? { postalCode: job.zip_code } : {}),
            addressCountry: toCountryCode(job.country),
          },
        },
    baseSalary: salary
      ? {
          "@type": "MonetaryAmount",
          currency: "USD",
          value: {
            "@type": "QuantitativeValue",
            minValue: salary.minValue,
            maxValue: salary.maxValue,
            unitText: salary.unitText,
          },
        }
      : undefined,
  };
}
