import { NextRequest, NextResponse } from "next/server";
import { expandKit, parseExpansionAxis, KitGenerationError } from "@/lib/interviewKit/expandGenerate";
import { InterviewKitSchema } from "@/lib/interviewKit/schema";
import { checkRateLimit, getClientIp } from "@/lib/interviewKit/rateLimit";

export const maxDuration = 60;

// POST /api/expand-kit — public, no auth. The client sends back the kit it
// already has (from either the public cached page or the JD-paste path),
// same pattern as /api/generate-gap-analysis — this route never needs its
// own storage, and the 4 new questions are appended client-side, not
// re-cached under the original slug.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit("expand-kit", getClientIp(req));
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again in a bit." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const kitParse = InterviewKitSchema.safeParse(body.kit);
  if (!kitParse.success) {
    return NextResponse.json({ error: "Missing or invalid kit — generate a kit first." }, { status: 400 });
  }

  const path = body.path === "jd" ? "jd" : "public";
  const axis = parseExpansionAxis(String(body.axis ?? ""), kitParse.data);
  if (!axis) {
    return NextResponse.json({ error: "Invalid expansion axis." }, { status: 400 });
  }

  try {
    const questions = await expandKit(kitParse.data, axis, path);
    return NextResponse.json({ questions });
  } catch (err) {
    if (err instanceof KitGenerationError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Kit expansion failed:", err);
    return NextResponse.json({ error: "Something went wrong adding more questions." }, { status: 500 });
  }
}
