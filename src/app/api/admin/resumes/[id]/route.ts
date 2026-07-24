import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

const BUCKET = "resumes";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// PUT /api/admin/resumes/[id] — admin-guarded, marks a resume read/unread.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabaseAdmin
    .from("resume_submissions")
    .update({ is_read: Boolean(body.is_read) })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/resumes/[id] — admin-guarded, deletes a resume (row + stored file).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: existing } = await supabaseAdmin
    .from("resume_submissions")
    .select("resume_path")
    .eq("id", id)
    .single();

  const { error } = await supabaseAdmin.from("resume_submissions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (existing?.resume_path) {
    await supabaseAdmin.storage.from(BUCKET).remove([existing.resume_path]);
  }

  return NextResponse.json({ success: true });
}
