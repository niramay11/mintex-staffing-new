import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

// DELETE /api/admin/calculator-saved-results/[id] — admin-guarded, removes a
// saved calculator snapshot (the code stops resolving to anything after this).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminPassword(req.headers.get("x-admin-password") ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const { error } = await supabaseAdmin.from("calculator_saved_results").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
