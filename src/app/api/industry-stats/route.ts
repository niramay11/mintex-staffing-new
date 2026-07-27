import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { getIndustryStats, saveIndustryStats, type IndustryStat } from "@/lib/industryStats";

// GET /api/industry-stats — public, used by the homepage, industry pages, and the admin panel.
export async function GET() {
  const stats = await getIndustryStats();
  return NextResponse.json(stats);
}

// PUT /api/industry-stats — admin-guarded, replaces the full list.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { password, stats } = body ?? {};

  if (!verifyAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Array.isArray(stats)) {
    return NextResponse.json({ error: "stats must be an array" }, { status: 400 });
  }

  const clean: IndustryStat[] = stats
    .map((s) => ({
      industry_slug: String(s.industry_slug ?? "").trim(),
      label: String(s.label ?? "").trim(),
      value: String(s.value ?? "").trim(),
    }))
    .filter((s) => s.industry_slug && s.label && s.value);

  const { error } = await saveIndustryStats(clean);
  if (error) return NextResponse.json({ error }, { status: 500 });

  // Home page embeds industry stats directly and has no revalidate export,
  // so it stays static/stale until explicitly revalidated here.
  revalidatePath("/");
  return NextResponse.json({ success: true, data: clean });
}
