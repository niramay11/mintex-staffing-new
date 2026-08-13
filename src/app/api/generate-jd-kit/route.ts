import { NextRequest, NextResponse } from "next/server";
import { generateJdInterviewKit, KitGenerationError, JD_MAX_CHARS } from "@/lib/interviewKit/jdGenerate";
import { SENIORITIES, US_STATES } from "@/lib/interviewKit/schema";

export const maxDuration = 60;

// POST /api/generate-jd-kit — public, no auth. Private path: the result is
// returned directly in the response and rendered client-side, never given
// its own indexed URL or server-side cache entry (every pasted JD is
// unique, and a resume-adjacent page sitting on a guessable route is
// exactly the privacy failure mode this path has to avoid).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const jobDescription = String(body.jobDescription ?? "").slice(0, JD_MAX_CHARS + 1000);
  const seniority = String(body.seniority ?? "").trim();
  const state = String(body.state ?? "").trim();
  const focus = body.focus ? String(body.focus).trim().slice(0, 60) : undefined;

  if (!jobDescription.trim()) {
    return NextResponse.json({ error: "Paste the job description text." }, { status: 400 });
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
