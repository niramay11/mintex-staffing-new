import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// DELETE /api/site-images/orphans/[id] — admin-guarded, dismiss an orphan
// tracking row (does not delete the physical file from /public).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("site_images").delete().eq("id", id).is("location_key", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
