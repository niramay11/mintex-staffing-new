import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

// GET /api/social-links — public, used by the footer and the admin panel
export async function GET() {
  const { data, error } = await supabase
    .from("social_links")
    .select("id, label, url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// PUT /api/social-links — admin-guarded, replaces the full list
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { password, links } = body ?? {};

  if (!verifyAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Array.isArray(links)) {
    return NextResponse.json({ error: "links must be an array" }, { status: 400 });
  }

  const clean = links
    .map((link, i) => ({
      id: String(link.id ?? `link_${Date.now()}_${i}`),
      label: String(link.label ?? "").trim(),
      url: String(link.url ?? "").trim(),
      sort_order: i,
    }))
    .filter((link) => link.label && link.url);

  const { error: deleteError } = await supabaseAdmin.from("social_links").delete().not("id", "is", null);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (clean.length > 0) {
    const { error: insertError } = await supabaseAdmin.from("social_links").insert(clean);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: clean });
}
