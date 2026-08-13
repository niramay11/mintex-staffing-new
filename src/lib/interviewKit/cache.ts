import { unstable_cache } from "next/cache";
import { generateInterviewKit } from "./generate";
import type { GenerateKitInput, InterviewKit } from "./schema";

// One billed Gemini call per unique (title, industry, seniority, state,
// focus) combination. Every later request for the same combination is
// served from this cache instead of hitting the model again — see the
// caching diagram: first request checks the cache, misses, calls the AI,
// saves the result; everyone after that hits the saved copy instantly.
//
// A long TTL is safe here: interview-question content for a given
// role/seniority/state doesn't meaningfully go stale day to day. If
// unstable_cache's underlying fn throws (KitGenerationError), Next.js does
// not cache the failure — a transient Gemini error gets retried on the next
// request instead of poisoning the cache, same reasoning as
// jobDescriptionCache.ts's fetchDescription.
const CACHE_TAG = "interview-kit";
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const generateInterviewKitCached = unstable_cache(generateInterviewKit, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

/**
 * Collapses whitespace and normalises casing so "senior react developer",
 * "Senior React Developer" and "SENIOR REACT DEVELOPER" all land on the
 * same cache entry instead of each paying for a fresh Gemini call. Acronyms
 * typed in all-caps (e.g. "CNC", "RN") are left alone rather than
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

export async function getCachedInterviewKit(input: GenerateKitInput): Promise<InterviewKit> {
  const canonicalInput: GenerateKitInput = { ...input, jobTitle: canonicalizeJobTitle(input.jobTitle) };
  return generateInterviewKitCached(canonicalInput);
}
