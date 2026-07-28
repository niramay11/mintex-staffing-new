import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

const VALID_TYPES = new Set(["client", "candidate", "other"]);

// GET /api/admin/case-studies — admin-guarded, lists every case study.
export async function GET(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("case_studies")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/case-studies — admin-guarded, creates a new case study.
export async function POST(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const type = String(body.type ?? "").trim();
  const title = String(body.title ?? "").trim();
  const quote = String(body.quote ?? "").trim();
  const author = String(body.author ?? "").trim();
  const role = body.role ? String(body.role).trim() : null;
  const video_url = body.video_url ? String(body.video_url).trim() : null;
  const thumbnail_url = body.thumbnail_url ? String(body.thumbnail_url).trim() : null;

  if (!VALID_TYPES.has(type) || !title || !quote || !author) {
    return NextResponse.json({ error: "Type, title, quote, and author are required" }, { status: 400 });
  }

  const { count } = await supabaseAdmin
    .from("case_studies")
    .select("id", { count: "exact", head: true })
    .eq("type", type);

  const { data, error } = await supabaseAdmin
    .from("case_studies")
    .insert({ type, title, quote, author, role, video_url, thumbnail_url, sort_order: count ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // /case-studies already self-refreshes within 60s (its own `revalidate`
  // window) — this makes a new case study appear immediately instead of
  // waiting out that window. The homepage teaser reads the same table
  // (see getHomepageTestimonials) and is fully static, so it needs its own
  // explicit revalidation too — it has no revalidate window at all otherwise.
  revalidatePath("/case-studies");
  revalidatePath("/");
  return NextResponse.json(data);
}
