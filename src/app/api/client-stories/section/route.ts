import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { getSectionEnabled, setSectionEnabled } from "@/lib/siteSectionSettings";

const SECTION_KEY = "client_stories";

// GET /api/client-stories/section — public, used by the admin panel to show
// current visibility state (the homepage itself reads getSectionEnabled()
// directly server-side, not via this route).
export async function GET() {
  const enabled = await getSectionEnabled(SECTION_KEY);
  return NextResponse.json({ enabled });
}

// PUT /api/client-stories/section — admin-guarded, shows/hides the whole
// Client Stories section on the homepage without touching the video list.
export async function PUT(req: NextRequest) {
  const { password, enabled } = await req.json();

  if (!verifyAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await setSectionEnabled(SECTION_KEY, !!enabled);
  if (error) return NextResponse.json({ error }, { status: 500 });

  // The homepage is statically rendered — without this, the new value
  // wouldn't show up there until the next full rebuild/redeploy.
  revalidatePath("/");

  return NextResponse.json({ success: true, enabled: !!enabled });
}
