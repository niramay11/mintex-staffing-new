import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

const BUCKET = "resumes";
const SIGNED_URL_TTL = 60; // seconds

// GET /api/admin/resumes/download?id=... — admin-guarded, returns a short-lived signed
// download URL for the candidate's original resume file.
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: row, error: fetchError } = await supabaseAdmin
    .from("resume_submissions")
    .select("resume_path, resume_filename")
    .eq("id", id)
    .single();
  if (fetchError || !row) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(row.resume_path, SIGNED_URL_TTL, { download: row.resume_filename });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl, filename: row.resume_filename });
}
