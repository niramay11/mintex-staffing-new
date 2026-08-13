import { getIndustries } from "@/lib/industries";
import { parseKitSlug } from "./slug";
import { getCachedInterviewKit } from "./cache";
import { applySuppression } from "./feedback";
import type { InterviewKit } from "./schema";

// Shared by both the candidate page (/interview-questions/[slug]) and the
// employer page (/hiring/[slug]-interview-guide) — same slug, same cached
// kit, just rendered differently. Returns null on any unparseable slug so
// callers can 404 instead of generating a kit for the wrong role.
//
// Suppression runs here, at read time, not baked into the cached kit —
// votes collected after a kit was cached still take effect on the next
// view without needing to bust the 30-day cache entry.
export async function loadKitBySlug(slug: string): Promise<InterviewKit | null> {
  const industries = await getIndustries();
  const input = parseKitSlug(slug, industries);
  if (!input) return null;
  const kit = await getCachedInterviewKit(input);
  return applySuppression(kit).catch(() => kit);
}
