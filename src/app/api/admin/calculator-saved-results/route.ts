import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

// GET /api/admin/calculator-saved-results — admin-guarded, lists every
// "Save these numbers" snapshot created from the Hiring Cost Calculator.
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("calculator_saved_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
