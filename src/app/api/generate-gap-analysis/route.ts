import { NextRequest, NextResponse } from "next/server";
import { generateGapAnalysis, KitGenerationError, RESUME_MAX_CHARS } from "@/lib/interviewKit/gapGenerate";
import { extractResumeText, isSupportedResumeType, ResumeParseError } from "@/lib/interviewKit/resumeParse";
import { InterviewKitSchema } from "@/lib/interviewKit/schema";
import { checkRateLimit, getClientIp } from "@/lib/interviewKit/rateLimit";

export const maxDuration = 60;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// POST /api/generate-gap-analysis — public, no auth. Private path: the
// resume (pasted text or an uploaded file) is parsed in memory for the
// duration of this call only — the uploaded file's bytes never touch disk,
// and nothing here is written to any cache. The client sends back the kit
// it already has (from either the public cached page or the JD-paste path)
// so this route never needs its own storage.
//
// Accepts EITHER application/json ({ resumeText, kit, jdContext }) for the
// paste path, or multipart/form-data (resumeFile, kit, jdContext as a JSON
// string field) for the upload path — same downstream logic either way.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit("generate-gap-analysis", getClientIp(req));
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again in a bit." }, { status: 429 });

  const contentType = req.headers.get("content-type") ?? "";

  let resumeText: string;
  let kitRaw: unknown;
  let jdContextRaw: unknown;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

    const file = form.get("resumeFile");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing resumeFile" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
    }
    if (!isSupportedResumeType(file.type)) {
      return NextResponse.json({ error: "Unsupported file type — upload a PDF or Word (.docx) file." }, { status: 400 });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      resumeText = await extractResumeText(buffer, file.type);
    } catch (err) {
      const message = err instanceof ResumeParseError ? err.message : "Couldn't read that file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    kitRaw = JSON.parse(String(form.get("kit") ?? "null"));
    jdContextRaw = form.get("jdContext") ? JSON.parse(String(form.get("jdContext"))) : undefined;
  } else {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    resumeText = String(body.resumeText ?? "").slice(0, RESUME_MAX_CHARS + 1000);
    kitRaw = body.kit;
    jdContextRaw = body.jdContext;
  }

  const kitParse = InterviewKitSchema.safeParse(kitRaw);
  if (!kitParse.success) {
    return NextResponse.json({ error: "Missing or invalid kit — generate a kit first." }, { status: 400 });
  }

  const context =
    jdContextRaw && typeof jdContextRaw === "object"
      ? {
          mustHaveSkills: Array.isArray((jdContextRaw as Record<string, unknown>).mustHaveSkills)
            ? (jdContextRaw as Record<string, unknown[]>).mustHaveSkills.map(String).slice(0, 15)
            : undefined,
          namedTools: Array.isArray((jdContextRaw as Record<string, unknown>).namedTools)
            ? (jdContextRaw as Record<string, unknown[]>).namedTools.map(String).slice(0, 20)
            : undefined,
        }
      : undefined;

  try {
    const gapAnalysis = await generateGapAnalysis(resumeText, kitParse.data, context);
    return NextResponse.json({ gapAnalysis }, { headers: { "X-Robots-Tag": "noindex" } });
  } catch (err) {
    if (err instanceof KitGenerationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Gap analysis generation failed:", err);
    return NextResponse.json({ error: "Something went wrong analyzing your resume." }, { status: 500 });
  }
}
