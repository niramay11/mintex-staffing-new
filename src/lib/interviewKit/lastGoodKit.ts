import { supabaseAdmin } from "@/lib/supabase";
import type { GenerateKitInput, InterviewKit } from "./schema";

// Backs the "regenerate once, then serve the last known-good kit" fallback
// on the public path. Deliberately its own small table rather than reusing
// question_feedback — this is a single overwritable row per role, not an
// append/increment log. Server-only: never imported by anything reachable
// from a "use client" component (see textNormalize.ts for why that
// distinction matters here).

/** Same identity as the 30-day generation cache — public path only. Does
 * NOT include namedTools/mustHaveSkills; those are JD-path-only fields,
 * and the JD path never uses this fallback (nothing cached there to fall
 * back to in the first place). */
export function buildLastGoodKitKey(input: GenerateKitInput): string {
  return JSON.stringify({
    jobTitle: input.jobTitle,
    industryName: input.industryName,
    seniority: input.seniority,
    state: input.state,
    focus: input.focus ?? null,
  });
}

export async function saveLastGoodKit(cacheKey: string, kit: InterviewKit): Promise<void> {
  const { error } = await supabaseAdmin
    .from("last_good_kits")
    .upsert({ cache_key: cacheKey, kit, updated_at: new Date().toISOString() });
  if (error) console.error("Failed to save last-good kit:", error);
}

export async function getLastGoodKit(cacheKey: string): Promise<InterviewKit | null> {
  const { data, error } = await supabaseAdmin
    .from("last_good_kits")
    .select("kit")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (error || !data) return null;
  return data.kit as InterviewKit;
}
