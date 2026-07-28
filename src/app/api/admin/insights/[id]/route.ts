import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// A slug or category can change as part of an edit — revalidating only the
// NEW path would leave the OLD post/category page frozen showing stale
// content (or a since-moved post) until its own 60s window happened to lapse.
function revalidateInsightPaths(slug: string, category: string) {
  revalidatePath("/insights");
  revalidatePath(`/insights/post/${slug}`);
  revalidatePath(`/insights/category/${category}`);
}

// PUT /api/admin/insights/[id] — admin-guarded, updates an insight post.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: before } = await supabaseAdmin.from("insights").select("slug, category").eq("id", id).single();

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.slug !== undefined)         updates.slug = String(body.slug).trim();
  if (body.category !== undefined)     updates.category = String(body.category).trim();
  if (body.title !== undefined)        updates.title = String(body.title).trim();
  if (body.excerpt !== undefined)      updates.excerpt = String(body.excerpt).trim();
  if (body.author !== undefined)       updates.author = String(body.author).trim();
  if (body.published_at !== undefined) updates.published_at = String(body.published_at).trim();
  if (body.image_url !== undefined)    updates.image_url = body.image_url ? String(body.image_url).trim() : null;
  if (Array.isArray(body.body))        updates.body = body.body.map((p: unknown) => String(p).trim()).filter(Boolean);

  const { data, error } = await supabaseAdmin
    .from("insights")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (before) revalidateInsightPaths(before.slug, before.category);
  revalidateInsightPaths(data.slug, data.category);
  return NextResponse.json(data);
}

// DELETE /api/admin/insights/[id] — admin-guarded, deletes an insight post.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: before } = await supabaseAdmin.from("insights").select("slug, category").eq("id", id).single();

  const { error } = await supabaseAdmin.from("insights").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (before) revalidateInsightPaths(before.slug, before.category);
  return NextResponse.json({ success: true });
}
