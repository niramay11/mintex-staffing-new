import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";

const BUCKET = "client-story-videos";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB — this Supabase project's global storage limit

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return null;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_SIZE,
  });
  return error;
}

// POST /api/client-stories/upload — admin-guarded, uploads a video file to storage
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const file = form.get("file");

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("video/")) {
    return NextResponse.json({ error: "File must be a video" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Video must be under 50MB" }, { status: 400 });
  }

  const bucketError = await ensureBucket();
  if (bucketError) return NextResponse.json({ error: bucketError.message }, { status: 500 });

  const ext = file.name.split(".").pop() || "mp4";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
