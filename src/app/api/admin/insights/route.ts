import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { sanitizeInsightBodyHtml } from "@/lib/sanitizeInsightHtml";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// Keep in sync with the client-side preview in src/app/admin/page.tsx —
// this only runs when the admin leaves the Slug field untouched.
const SLUG_STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "for", "to", "in", "on", "at",
  "by", "with", "is", "are", "was", "were", "be", "been", "being", "this",
  "that", "these", "those", "you", "your", "should", "have", "has", "had",
  "will", "would", "can", "could", "it", "as", "from", "into", "than",
  "then", "so", "if", "not", "no", "do", "does", "did",
]);
const SLUG_MAX_WORDS = 6;

function slugify(title: string): string {
  const words = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean);

  const meaningful = words.filter((w) => !SLUG_STOPWORDS.has(w));
  return (meaningful.length > 0 ? meaningful : words).slice(0, SLUG_MAX_WORDS).join("-");
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
  const author_title = body.author_title ? String(body.author_title).trim() : null;
  const author_bio = body.author_bio ? String(body.author_bio).trim() : null;
  const author_photo_url = body.author_photo_url ? String(body.author_photo_url).trim() : null;
  const bodyParagraphs = Array.isArray(body.body)
    ? body.body.map((p: unknown) => String(p).trim()).filter(Boolean)
    : [];
  const body_html = body.body_html ? sanitizeInsightBodyHtml(String(body.body_html)) : null;
  const slug = String(body.slug ?? "").trim() || slugify(title);

  if (!title || !category || !excerpt || !author || !published_at || bodyParagraphs.length === 0 || !slug) {
    return NextResponse.json({ error: "Title, category, excerpt, author, published date, and body are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("insights")
    .insert({ slug, category, title, excerpt, body: bodyParagraphs, body_html, published_at, author, image_url, author_title, author_bio, author_photo_url })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // /insights and its category pages already self-refresh within 60s (their
  // own `revalidate` window) — this makes a new post appear immediately
  // instead of waiting out that window.
  revalidatePath("/insights");
  revalidatePath(`/insights/post/${slug}`);
  revalidatePath(`/insights/category/${category}`);
  return NextResponse.json(data);
}
