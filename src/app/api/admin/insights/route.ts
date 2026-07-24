import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/admin/insights — admin-guarded, lists every insight post (published or not).
export async function GET(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("insights")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/insights — admin-guarded, creates a new insight post.
export async function POST(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const title = String(body.title ?? "").trim();
  const category = String(body.category ?? "").trim();
  const excerpt = String(body.excerpt ?? "").trim();
  const author = String(body.author ?? "").trim();
  const published_at = String(body.published_at ?? "").trim();
  const image_url = body.image_url ? String(body.image_url).trim() : null;
  const bodyParagraphs = Array.isArray(body.body)
    ? body.body.map((p: unknown) => String(p).trim()).filter(Boolean)
    : [];
  const slug = String(body.slug ?? "").trim() || slugify(title);

  if (!title || !category || !excerpt || !author || !published_at || bodyParagraphs.length === 0 || !slug) {
    return NextResponse.json({ error: "Title, category, excerpt, author, published date, and body are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("insights")
    .insert({ slug, category, title, excerpt, body: bodyParagraphs, published_at, author, image_url })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
