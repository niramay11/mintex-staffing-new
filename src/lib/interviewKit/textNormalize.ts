// Pure, dependency-free text helpers — deliberately kept isolated from
// generate.ts/feedback.ts/validator.ts (all server-only, all eventually
// touching Supabase or the Gemini API key). slug.ts and cache.ts import
// canonicalizeJobTitle; slug.ts is reachable from "use client" components
// (the form needs to build a slug client-side before navigating), so
// anything it depends on has to be safe to bundle into the browser. A
// previous version of this had slug.ts import cache.ts, which transitively
// pulled in feedback.ts's Supabase admin client — that client reads
// SUPABASE_SERVICE_ROLE_KEY at module-evaluation time and throws
// immediately in a browser bundle, where that env var doesn't exist.

/**
 * Collapses whitespace and normalises casing so "senior react developer",
 * "Senior React Developer" and "SENIOR REACT DEVELOPER" all land on the
 * same cache entry / slug instead of each paying for a fresh Gemini call.
 * Acronyms typed in all-caps (e.g. "CNC", "RN") are left alone rather than
 * lowercased into nonsense.
 */
export function canonicalizeJobTitle(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => (word.length > 1 && word === word.toUpperCase() ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

/** Normalise before hashing so trivial wording variants collide on the same record. */
export function normaliseForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
