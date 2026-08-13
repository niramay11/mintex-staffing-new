import { NextRequest, NextResponse } from "next/server";
import { recordQuestionVote, DOWN_REASONS } from "@/lib/interviewKit/feedback";

// POST /api/question-feedback — public, no auth. Stores the vote against
// the question's hash, never against a person: no user id, session, or IP
// is recorded (see feedback.ts and the migration for the full reasoning).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const questionText = String(body.questionText ?? "").trim().slice(0, 500);
  const vote = String(body.vote ?? "");
  const reason = body.reason ? String(body.reason) : null;
  const roleSlug = body.roleSlug ? String(body.roleSlug).slice(0, 200) : null;

  if (!questionText) {
    return NextResponse.json({ error: "Missing questionText" }, { status: 400 });
  }
  if (vote !== "up" && vote !== "down") {
    return NextResponse.json({ error: "vote must be 'up' or 'down'" }, { status: 400 });
  }
  if (reason && !DOWN_REASONS.includes(reason as (typeof DOWN_REASONS)[number])) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  try {
    await recordQuestionVote(questionText, vote, reason as (typeof DOWN_REASONS)[number] | null, roleSlug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to record question vote:", err);
    return NextResponse.json({ error: "Something went wrong recording your feedback." }, { status: 500 });
  }
}
