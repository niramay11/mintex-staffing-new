import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/insight-categories — public, used by the /insights filter chips and the admin panel.
export async function GET() {
  const { data, error } = await supabase
    .from("insight_categories")
    .select("id, slug, label, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/insight-categories — admin-guarded, creates a new category.
export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const label = String(body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "Label is required" }, { status: 400 });
  const slug = String(body.slug ?? "").trim() || slugify(label);

  const { count } = await supabaseAdmin.from("insight_categories").select("id", { count: "exact", head: true });

  const { data, error } = await supabaseAdmin
    .from("insight_categories")
    .insert({ slug, label, sort_order: count ?? 0 })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That category already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
