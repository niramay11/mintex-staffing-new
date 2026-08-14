import { getIndustries } from "@/lib/industries";
import { parseKitSlug } from "./slug";
import { getCachedInterviewKit } from "./cache";
import { applySuppression } from "./feedback";
import { checkRateLimit, getClientIpFromHeaders, RateLimitError } from "./rateLimit";
import type { InterviewKit } from "./schema";

export { RateLimitError };

// Shared by both the candidate page (/interview-questions/[slug]) and the
// employer page (/hiring/[slug]-interview-guide) — same slug, same cached
// kit, just rendered differently. Returns null on any unparseable slug so
// callers can 404 instead of generating a kit for the wrong role. Throws
// RateLimitError (distinct from the null/404 case) so callers can render a
// different message for it.
//
// The rate-limit check happens HERE, before touching the cache, rather
// than inside generateInterviewKit itself — that function runs inside
// unstable_cache, and Next.js explicitly does not support reading headers()
// inside a cache scope. Checking on every call (cache hit or miss) rather
// than only on genuine Gemini-calling misses is a deliberate simplification:
// unstable_cache doesn't expose hit/miss status, and 20 requests/hour/IP is
// generous enough that normal repeat visits won't come close to it anyway.
//
// Suppression runs here too, at read time, not baked into the cached kit —
// votes collected after a kit was cached still take effect on the next
// view without needing to bust the 30-day cache entry.
export async function loadKitBySlug(slug: string): Promise<InterviewKit | null> {
  const ip = await getClientIpFromHeaders();
  const allowed = await checkRateLimit("interview-kit-page", ip);
  if (!allowed) throw new RateLimitError();

  const industries = await getIndustries();
  const input = parseKitSlug(slug, industries);
  if (!input) return null;
  const kit = await getCachedInterviewKit(input);
  return applySuppression(kit, "public").catch(() => kit);
}
