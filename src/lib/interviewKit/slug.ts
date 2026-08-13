import type { Industry } from "@/content/types";
import { SENIORITIES, type GenerateKitInput } from "./schema";

type Seniority = (typeof SENIORITIES)[number];
import { canonicalizeJobTitle } from "./cache";

// The public kit's slug IS its cache key (see cache.ts) and its whole
// identity — a visitor arriving straight from a Google result has nothing
// but this URL, so every field the generator needs must be recoverable from
// the slug alone. No database, no session, nothing to look up.
//
// Shape: "<job-title-slug>_<industry-slug>_<state-abbr>_<seniority>_<focus>"
// Underscore-joined because slugified words already use hyphens internally
// (multi-word titles), so hyphens can't also be the field separator.

const SLUG_DELIMITER = "_";

const STATE_TO_ABBR: Record<string, string> = {
  Alabama: "al", Alaska: "ak", Arizona: "az", Arkansas: "ar", California: "ca",
  Colorado: "co", Connecticut: "ct", Delaware: "de", "District of Columbia": "dc",
  Florida: "fl", Georgia: "ga", Hawaii: "hi", Idaho: "id", Illinois: "il",
  Indiana: "in", Iowa: "ia", Kansas: "ks", Kentucky: "ky", Louisiana: "la",
  Maine: "me", Maryland: "md", Massachusetts: "ma", Michigan: "mi",
  Minnesota: "mn", Mississippi: "ms", Missouri: "mo", Montana: "mt",
  Nebraska: "ne", Nevada: "nv", "New Hampshire": "nh", "New Jersey": "nj",
  "New York": "ny", "North Carolina": "nc", "North Dakota": "nd", Ohio: "oh",
  Oklahoma: "ok", Oregon: "or", Pennsylvania: "pa", "Rhode Island": "ri",
  "South Carolina": "sc", "South Dakota": "sd", Tennessee: "tn", Texas: "tx",
  Utah: "ut", Vermont: "vt", Virginia: "va", Washington: "wa",
  "West Virginia": "wv", Wisconsin: "wi", Wyoming: "wy",
};

const ABBR_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_TO_ABBR).map(([state, abbr]) => [abbr, state])
);

// Common industry acronyms that would otherwise get mangled by naive title
// casing when reconstructed from a lowercase slug ("cnc-machinist" -> "Cnc
// Machinist"). Not exhaustive — an imperfect but harmless cosmetic fallback
// for anything not listed here.
const KNOWN_ACRONYMS = new Set([
  "cnc", "cdl", "hr", "it", "qa", "rn", "cna", "lpn", "emt", "hvac", "cpa",
  "crm", "erp", "api", "sql", "aws", "plc", "cfo", "ceo", "cto", "ehs", "osha",
]);

function slugifyWords(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => (KNOWN_ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export function buildKitSlug(input: GenerateKitInput, industry: Industry): string {
  const jobSlug = slugifyWords(canonicalizeJobTitle(input.jobTitle));
  const stateAbbr = STATE_TO_ABBR[input.state];
  const focusPart = input.focus ? slugifyWords(input.focus) : "balanced";
  return [jobSlug, industry.slug, stateAbbr, input.seniority, focusPart].join(SLUG_DELIMITER);
}

/**
 * Inverse of buildKitSlug. Returns null on anything malformed rather than
 * guessing — an unparseable slug should 404, not silently generate a kit
 * for the wrong role.
 */
export function parseKitSlug(slug: string, industries: Industry[]): GenerateKitInput | null {
  const parts = slug.split(SLUG_DELIMITER);
  if (parts.length !== 5) return null;

  const [jobSlug, industrySlug, stateAbbr, seniority, focusPart] = parts;
  if (!jobSlug || !industrySlug || !stateAbbr || !seniority) return null;

  const industry = industries.find((i) => i.slug === industrySlug);
  if (!industry) return null;

  const state = ABBR_TO_STATE[stateAbbr.toLowerCase()];
  if (!state) return null;

  if (!SENIORITIES.includes(seniority as Seniority)) return null;

  return {
    jobTitle: titleCaseFromSlug(jobSlug),
    industryName: industry.name,
    seniority: seniority as Seniority,
    state: state as GenerateKitInput["state"],
    focus: focusPart && focusPart !== "balanced" ? focusPart : undefined,
  };
}
