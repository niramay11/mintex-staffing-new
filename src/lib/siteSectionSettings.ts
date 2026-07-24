import { supabase, supabaseAdmin } from "./supabase";

// Server-side only: whether a given named homepage section should render at
// all — lets an admin temporarily hide a section (e.g. Client Stories)
// without deleting its underlying content. Defaults to `true` (visible) if
// the row doesn't exist yet or the query fails, so a Supabase hiccup never
// silently hides content that was never meant to be hidden.
const CACHE_TTL = 60_000; // 1 minute
const cache = new Map<string, { enabled: boolean; at: number }>();

export async function getSectionEnabled(sectionKey: string): Promise<boolean> {
  const now = Date.now();
  const hit = cache.get(sectionKey);
  if (hit && now - hit.at < CACHE_TTL) return hit.enabled;

  const { data } = await supabase
    .from("site_section_settings")
    .select("enabled")
    .eq("section_key", sectionKey)
    .maybeSingle();

  const enabled = data?.enabled ?? true;
  cache.set(sectionKey, { enabled, at: now });
  return enabled;
}

export async function setSectionEnabled(
  sectionKey: string,
  enabled: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin
    .from("site_section_settings")
    .upsert({ section_key: sectionKey, enabled, updated_at: new Date().toISOString() });

  if (!error) cache.delete(sectionKey);
  return { error: error?.message ?? null };
}
