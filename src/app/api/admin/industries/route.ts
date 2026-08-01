import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { INDUSTRIES_CACHE_TAG, mapIndustryRow, type IndustryRow } from "@/lib/industries";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/industries — admin-guarded, lists every industry.
export async function GET(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("industries")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => mapIndustryRow(row as IndustryRow)));
}

// POST /api/admin/industries — admin-guarded, creates a new industry.
export async function POST(req: NextRequest) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = body.slug ? slugify(String(body.slug)) : slugify(name);
  if (!slug) return NextResponse.json({ error: "Could not derive a slug from the name" }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("industries")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabaseAdmin
    .from("industries")
    .insert({
      slug,
      name,
      hero_title: String(body.heroTitle ?? `Hire Top ${name}`).trim(),
      seo_subheading: String(body.seoSubheading ?? "").trim(),
      intro: String(body.intro ?? "").trim(),
      sector_insight_title: String(body.sectorInsightTitle ?? "").trim(),
      sector_insight_body: String(body.sectorInsightBody ?? "").trim(),
      work_style: String(body.workStyle ?? "").trim(),
      job_keywords: Array.isArray(body.jobKeywords) ? body.jobKeywords.map(String) : [],
      faqs: Array.isArray(body.faqs) ? body.faqs : [],
      stats: Array.isArray(body.stats) ? body.stats : [],
      typical_roles: String(body.typicalRoles ?? "").trim(),
      vetting_process: String(body.vettingProcess ?? "").trim(),
      market_context: String(body.marketContext ?? "").trim(),
      engagement_models: String(body.engagementModels ?? "").trim(),
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(INDUSTRIES_CACHE_TAG, "max");
  return NextResponse.json(mapIndustryRow(data as IndustryRow));
}
