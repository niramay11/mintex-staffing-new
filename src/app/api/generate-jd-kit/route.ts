import { NextRequest, NextResponse } from "next/server";
import { generateJdInterviewKit, KitGenerationError, JD_MAX_CHARS } from "@/lib/interviewKit/jdGenerate";
import { extractResumeText, isSupportedResumeType, ResumeParseError } from "@/lib/interviewKit/resumeParse";
import { SENIORITIES, US_STATES } from "@/lib/interviewKit/schema";
import { checkRateLimit, getClientIp } from "@/lib/interviewKit/rateLimit";

export const maxDuration = 60;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// POST /api/generate-jd-kit — public, no auth. Private path: the result is
// returned directly in the response and rendered client-side, never given
// its own indexed URL or server-side cache entry (every pasted JD is
// unique, and a resume-adjacent page sitting on a guessable route is
// exactly the privacy failure mode this path has to avoid).
//
// Accepts EITHER application/json ({ jobDescription, ... }) for the paste
// path, or multipart/form-data (jdFile, ...) for the upload path — reuses
// the exact same PDF/DOCX parser built for resumes (resumeParse.ts), same
// in-memory-only handling.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit("generate-jd-kit", getClientIp(req));
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again in a bit." }, { status: 429 });

  const contentType = req.headers.get("content-type") ?? "";

  let jobDescription: string;
  let seniority: string;
  let state: string;
  let focus: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

    const file = form.get("jdFile");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing jdFile" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large (max 5MB)." }, { status: 400 });
    }
    if (!isSupportedResumeType(file.type)) {
      return NextResponse.json({ error: "Unsupported file type — upload a PDF or Word (.docx) file." }, { status: 400 });
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      jobDescription = (await extractResumeText(buffer, file.type)).slice(0, JD_MAX_CHARS + 1000);
    } catch (err) {
      const message = err instanceof ResumeParseError ? err.message : "Couldn't read that file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    seniority = String(form.get("seniority") ?? "").trim();
    state = String(form.get("state") ?? "").trim();
    focus = form.get("focus") ? String(form.get("focus")).trim().slice(0, 60) : undefined;
  } else {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    jobDescription = String(body.jobDescription ?? "").slice(0, JD_MAX_CHARS + 1000);
    seniority = String(body.seniority ?? "").trim();
    state = String(body.state ?? "").trim();
    focus = body.focus ? String(body.focus).trim().slice(0, 60) : undefined;
  }

  if (!jobDescription.trim()) {
    return NextResponse.json({ error: "Paste or upload the job description." }, { status: 400 });
  }
  if (!SENIORITIES.includes(seniority as (typeof SENIORITIES)[number])) {
    return NextResponse.json({ error: "seniority must be entry, mid, or senior" }, { status: 400 });
  }
  if (!US_STATES.includes(state as (typeof US_STATES)[number])) {
    return NextResponse.json({ error: "state must be a valid US state or DC" }, { status: 400 });
  }

  try {
    const { kit, extraction } = await generateJdInterviewKit(jobDescription, {
      seniority: seniority as (typeof SENIORITIES)[number],
      state: state as (typeof US_STATES)[number],
      focus,
    });
    return NextResponse.json(
      { kit, jdContext: { mustHaveSkills: extraction.mustHaveSkills, namedTools: extraction.namedTools } },
      { headers: { "X-Robots-Tag": "noindex" } }
    );
  } catch (err) {
    if (err instanceof KitGenerationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("JD interview kit generation failed:", err);
    return NextResponse.json({ error: "Something went wrong generating the kit." }, { status: 500 });
  }
}
