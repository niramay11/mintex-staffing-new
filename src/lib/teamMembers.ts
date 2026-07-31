import { supabase } from "./supabase";
import type { TeamMember } from "@/content/types";

// Used by /about's Leadership section.
export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data ?? []) as TeamMember[];
}
