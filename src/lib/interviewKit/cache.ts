import { unstable_cache } from "next/cache";
import { generateInterviewKit } from "./generate";
import type { GenerateKitInput, InterviewKit } from "./schema";
import { canonicalizeJobTitle } from "./textNormalize";
import { buildLastGoodKitKey, getLastGoodKit } from "./lastGoodKit";

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
export const CACHE_TAG = "interview-kit";
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const generateInterviewKitCached = unstable_cache(generateInterviewKit, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

export async function getCachedInterviewKit(input: GenerateKitInput): Promise<InterviewKit> {
  const canonicalInput: GenerateKitInput = { ...input, jobTitle: canonicalizeJobTitle(input.jobTitle) };
  try {
    return await generateInterviewKitCached(canonicalInput);
  } catch (err) {
    // Hard failure (Gemini unreachable, schema-repair retry exhausted) —
    // the softer "validator still unhappy after repair" case is handled
    // inside generate.ts itself; this is the outer net for everything
    // that throws before ever getting that far.
    const lastGood = await getLastGoodKit(buildLastGoodKitKey(canonicalInput)).catch(() => null);
    if (lastGood) {
      console.error("Generation failed entirely; serving last known-good kit instead:", err);
      return lastGood;
    }
    throw err;
  }
}
