import { supabase } from "./supabase";
import type { CaseStudy } from "@/content/types";

// Used by the homepage testimonials teaser. Not filtered by type (client/
// candidate/other) — with only 2 "client" entries existing right now,
// restricting to that type alone left the row too sparse; pulling all types
// gives a fuller row from content that already exists instead of requiring
// new entries to be added first.
export async function getHomepageTestimonials(): Promise<CaseStudy[]> {
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data ?? []) as CaseStudy[];
}
