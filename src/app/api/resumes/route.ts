import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendResumeConfirmation, sendResumeNotification } from "@/lib/mailer";

const BUCKET = "resumes";
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;
  await supabaseAdmin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_SIZE,
  });
}

// POST /api/resumes — public, saves a shared resume + notifies admin and candidate by email.
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const industry = String(form.get("industry") ?? "").trim();
  const resume = form.get("resume");

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!(resume instanceof File) || resume.size === 0) {
    return NextResponse.json({ error: "A resume file is required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(resume.type)) {
    return NextResponse.json({ error: "Resume must be a PDF or Word document" }, { status: 400 });
  }
  if (resume.size > MAX_SIZE) {
    return NextResponse.json({ error: "Resume must be under 8MB" }, { status: 400 });
  }

  await ensureBucket();

  const ext = resume.name.split(".").pop() || "pdf";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, resume, { contentType: resume.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error: insertError } = await supabaseAdmin.from("resume_submissions").insert({
    name, email, industry: industry || null, resume_path: path, resume_filename: resume.name,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  try {
    await Promise.all([
      sendResumeNotification({ name, email, industry, resumeFilename: resume.name }),
      sendResumeConfirmation(email, name),
    ]);
  } catch (err) {
    // Submission is already saved — surface the email failure without failing the request.
    console.error("Failed to send resume notification email(s):", err);
  }

  return NextResponse.json({ success: true });
}
