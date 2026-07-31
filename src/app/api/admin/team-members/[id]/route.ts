import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// PUT /api/admin/team-members/[id] — admin-guarded, updates a team member.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined)         updates.name = String(body.name).trim();
  if (body.title !== undefined)        updates.title = String(body.title).trim();
  if (body.bio !== undefined)          updates.bio = body.bio ? String(body.bio).trim() : null;
  if (body.photo_url !== undefined)    updates.photo_url = body.photo_url ? String(body.photo_url).trim() : null;
  if (body.linkedin_url !== undefined) updates.linkedin_url = body.linkedin_url ? String(body.linkedin_url).trim() : null;
  if (body.sort_order !== undefined)   updates.sort_order = Number(body.sort_order) || 0;

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/about");
  return NextResponse.json(data);
}

// DELETE /api/admin/team-members/[id] — admin-guarded, deletes a team member.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("team_members").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/about");
  return NextResponse.json({ success: true });
}
