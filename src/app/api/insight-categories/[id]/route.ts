import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// PUT /api/insight-categories/[id] — admin-guarded, renames a category.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.label !== undefined) updates.label = String(body.label).trim();
  if (body.slug !== undefined)  updates.slug = String(body.slug).trim();

  const { data, error } = await supabaseAdmin
    .from("insight_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That category already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE /api/insight-categories/[id] — admin-guarded, removes a category.
// Insight posts already assigned to it keep their stored category value.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("insight_categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
