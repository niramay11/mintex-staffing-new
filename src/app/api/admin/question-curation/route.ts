import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { isPromotionCandidate, isSuppressed } from "@/lib/interviewKit/feedback";

// GET /api/admin/question-curation — admin-guarded. Turns the vote data
// collected on every generated kit into something a recruiter actually
// looks at — per implementation-notes.md: "Build the recruiter-facing
// aggregate view at the same time or the votes will sit unused."
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("question_feedback")
    .select("*")
    .order("up", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((row) => ({
    ...row,
    status: isSuppressed(row) ? "suppressed" : isPromotionCandidate(row) ? "promotion_candidate" : "neutral",
  }));

  return NextResponse.json(rows);
}
