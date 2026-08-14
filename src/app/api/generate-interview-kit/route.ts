import { NextRequest, NextResponse } from "next/server";
import { KitGenerationError } from "@/lib/interviewKit/generate";
import { getCachedInterviewKit } from "@/lib/interviewKit/cache";
import { SENIORITIES, US_STATES } from "@/lib/interviewKit/schema";
import { checkRateLimit, getClientIp } from "@/lib/interviewKit/rateLimit";

export const maxDuration = 60;

// POST /api/generate-interview-kit — public, no auth. Generates a structured
// interview kit (not a flat question list) for the given role. See
// src/lib/interviewKit for the schema/prompt/provider pieces.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit("generate-interview-kit", getClientIp(req));
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again in a bit." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const jobTitle = String(body.jobTitle ?? "").trim().slice(0, 120);
  const industryName = String(body.industryName ?? "").trim().slice(0, 120);
  const seniority = String(body.seniority ?? "").trim();
  const state = String(body.state ?? "").trim();
  const focus = body.focus ? String(body.focus).trim().slice(0, 60) : undefined;

  if (!jobTitle || !industryName) {
    return NextResponse.json({ error: "jobTitle and industryName are required" }, { status: 400 });
  }
  if (!SENIORITIES.includes(seniority as (typeof SENIORITIES)[number])) {
    return NextResponse.json({ error: "seniority must be entry, mid, or senior" }, { status: 400 });
  }
  if (!US_STATES.includes(state as (typeof US_STATES)[number])) {
    return NextResponse.json({ error: "state must be a valid US state or DC" }, { status: 400 });
  }

  try {
    const kit = await getCachedInterviewKit({
      jobTitle,
      industryName,
      seniority: seniority as (typeof SENIORITIES)[number],
      state: state as (typeof US_STATES)[number],
      focus,
    });
    return NextResponse.json({ kit });
  } catch (err) {
    if (err instanceof KitGenerationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Interview kit generation failed:", err);
    return NextResponse.json({ error: "Something went wrong generating the kit." }, { status: 500 });
  }
}
