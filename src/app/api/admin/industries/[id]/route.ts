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

// PUT /api/admin/industries/[id] — admin-guarded, updates an industry.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined)               updates.name = String(body.name).trim();
  if (body.slug !== undefined)                updates.slug = slugify(String(body.slug));
  if (body.heroTitle !== undefined)           updates.hero_title = String(body.heroTitle).trim();
  if (body.seoSubheading !== undefined)       updates.seo_subheading = String(body.seoSubheading).trim();
  if (body.intro !== undefined)               updates.intro = String(body.intro).trim();
  if (body.sectorInsightTitle !== undefined)  updates.sector_insight_title = String(body.sectorInsightTitle).trim();
  if (body.sectorInsightBody !== undefined)   updates.sector_insight_body = String(body.sectorInsightBody).trim();
  if (body.workStyle !== undefined)           updates.work_style = String(body.workStyle).trim();
  if (body.jobKeywords !== undefined)         updates.job_keywords = Array.isArray(body.jobKeywords) ? body.jobKeywords.map(String) : [];
  if (body.faqs !== undefined)                updates.faqs = Array.isArray(body.faqs) ? body.faqs : [];
  if (body.stats !== undefined)               updates.stats = Array.isArray(body.stats) ? body.stats : [];
  if (body.typicalRoles !== undefined)        updates.typical_roles = String(body.typicalRoles).trim();
  if (body.vettingProcess !== undefined)      updates.vetting_process = String(body.vettingProcess).trim();
  if (body.marketContext !== undefined)       updates.market_context = String(body.marketContext).trim();
  if (body.engagementModels !== undefined)    updates.engagement_models = String(body.engagementModels).trim();
  if (body.sortOrder !== undefined)           updates.sort_order = Number(body.sortOrder) || 0;

  if (!updates.slug || updates.slug === "") delete updates.slug;

  const { data, error } = await supabaseAdmin
    .from("industries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(INDUSTRIES_CACHE_TAG, "max");
  return NextResponse.json(mapIndustryRow(data as IndustryRow));
}

// DELETE /api/admin/industries/[id] — admin-guarded, deletes an industry.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("industries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag(INDUSTRIES_CACHE_TAG, "max");
  return NextResponse.json({ success: true });
}
