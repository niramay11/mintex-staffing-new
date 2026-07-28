import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

const VALID_TYPES = new Set(["client", "candidate", "other"]);

// PUT /api/admin/case-studies/[id] — admin-guarded, updates a case study.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.type !== undefined) {
    const type = String(body.type).trim();
    if (!VALID_TYPES.has(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    updates.type = type;
  }
  if (body.title !== undefined)         updates.title = String(body.title).trim();
  if (body.quote !== undefined)         updates.quote = String(body.quote).trim();
  if (body.author !== undefined)        updates.author = String(body.author).trim();
  if (body.role !== undefined)          updates.role = body.role ? String(body.role).trim() : null;
  if (body.video_url !== undefined)     updates.video_url = body.video_url ? String(body.video_url).trim() : null;
  if (body.thumbnail_url !== undefined) updates.thumbnail_url = body.thumbnail_url ? String(body.thumbnail_url).trim() : null;

  const { data, error } = await supabaseAdmin
    .from("case_studies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/case-studies");
  revalidatePath("/");
  return NextResponse.json(data);
}

// DELETE /api/admin/case-studies/[id] — admin-guarded, deletes a case study.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("case_studies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/case-studies");
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
