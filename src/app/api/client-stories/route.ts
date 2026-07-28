import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

// GET /api/client-stories — public, used by the homepage and the admin panel
export async function GET() {
  const { data, error } = await supabase
    .from("client_stories")
    .select("id, quote, author, role, video_url, thumbnail_url, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// PUT /api/client-stories — admin-guarded, replaces the full list
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { password, stories } = body ?? {};

  if (!verifyAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Array.isArray(stories)) {
    return NextResponse.json({ error: "stories must be an array" }, { status: 400 });
  }

  const cleaned = stories.map((story, i) => ({
    id: String(story.id ?? `story_${Date.now()}_${i}`),
    quote: String(story.quote ?? "").trim(),
    author: String(story.author ?? "").trim(),
    role: String(story.role ?? "").trim() || null,
    video_url: String(story.video_url ?? "").trim(),
    thumbnail_url: String(story.thumbnail_url ?? "").trim() || null,
    sort_order: i,
  }));

  // Only a video URL is required — quote/author are optional. Reject (rather than
  // silently drop) any row missing it, so a save never looks like it "worked" when it didn't.
  const missing = cleaned.filter((story) => !story.video_url);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Video ${cleaned.indexOf(missing[0]) + 1} is missing a video URL — remove it or fill it in.` },
      { status: 400 }
    );
  }

  const clean = cleaned;

  const { error: deleteError } = await supabaseAdmin.from("client_stories").delete().not("id", "is", null);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (clean.length > 0) {
    const { error: insertError } = await supabaseAdmin.from("client_stories").insert(clean);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // The homepage is statically rendered (see /api/client-stories/section's
  // matching comment) — without this, a saved video/quote change would never
  // show up there until the next full rebuild/redeploy, even though the
  // section-visibility toggle already revalidates it.
  revalidatePath("/");

  return NextResponse.json({ success: true, data: clean });
}
