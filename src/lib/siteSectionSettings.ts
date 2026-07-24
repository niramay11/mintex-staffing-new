import { supabase, supabaseAdmin } from "./supabase";

// Server-side only: whether a given named homepage section should render at
// all — lets an admin temporarily hide a section (e.g. Client Stories)
// without deleting its underlying content. Defaults to `true` (visible) if
// the row doesn't exist yet or the query fails, so a Supabase hiccup never
// silently hides content that was never meant to be hidden.
//
// Deliberately NOT cached in-process: the homepage that reads this is a
// single cheap primary-key lookup, not a heavy paginated pull like the
// Ceipal caches — caching it bought nothing but stale-toggle confusion (an
// admin's "enable" not showing up because a previous "disable" was still
// sitting in a 60s-old in-memory cache in the same server process). The
// route that writes this also calls `revalidatePath("/")` so the homepage
// itself re-renders with the fresh value on the very next visit.
export async function getSectionEnabled(sectionKey: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("site_section_settings")
    .select("enabled")
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (error) {
    console.error(`[siteSectionSettings] getSectionEnabled(${sectionKey}) error:`, error.message);
  }
  return data?.enabled ?? true;
}

export async function setSectionEnabled(
  sectionKey: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("site_section_settings")
    .upsert({ section_key: sectionKey, enabled, updated_at: new Date().toISOString() });

  return { error: error?.message ?? null };
}
