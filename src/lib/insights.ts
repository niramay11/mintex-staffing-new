import { supabase } from "./supabase";
import type { InsightPost } from "@/content/types";

// Reused by "Resources & Insights" teasers on the how-we-work pages so they
// always reflect whatever's currently in the admin-managed insights table,
// instead of hardcoding a post's title/excerpt that can drift once an admin
// edits or replaces it.
export async function getInsightsByCategory(category: string, limit: number): Promise<InsightPost[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as InsightPost[];
}
