import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

// PUT /api/admin/question-curation/[hash] — admin-guarded, marks a
// question reviewed/unreviewed. Doesn't affect indexing or the kit itself —
// purely the recruiter's own "have I looked at this one" tracking.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hash } = await params;
  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabaseAdmin
    .from("question_feedback")
    .update({ reviewed: Boolean(body.reviewed) })
    .eq("hash", hash)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
