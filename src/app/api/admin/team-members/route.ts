import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// GET /api/admin/team-members — admin-guarded, lists every team member.
export async function GET(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/team-members — admin-guarded, creates a new team member.
export async function POST(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const title = String(body.title ?? "").trim();
  const bio = body.bio ? String(body.bio).trim() : null;
  const photo_url = body.photo_url ? String(body.photo_url).trim() : null;
  const linkedin_url = body.linkedin_url ? String(body.linkedin_url).trim() : null;

  if (!name || !title) {
    return NextResponse.json({ error: "Name and title are required" }, { status: 400 });
  }

  const { count } = await supabaseAdmin
    .from("team_members")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .insert({ name, title, bio, photo_url, linkedin_url, sort_order: count ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/about");
  return NextResponse.json(data);
}
