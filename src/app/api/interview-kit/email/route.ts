import { NextRequest, NextResponse } from "next/server";
import { sendInterviewKitEmail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 120;
const MAX_ITEMS = 12;
const MAX_QUESTIONS_PER_SECTION = 20;
const MAX_QUESTION_TEXT = 400;

// POST /api/interview-kit/email — public.
//
// The by-title flow (/interview-questions/[slug]) has a stable page, so its
// kit is deterministic from the slug — this just emails a durable link back
// plus the preview data the client already rendered, no need to re-derive
// the kit server-side.
//
// The JD-paste/resume flow has no such page — that kit only ever lives in
// the browser tab's sessionStorage, by design (see KitPreviewClient), so
// there's no slug and nothing to link to. For that case the client sends
// the full question text per section instead, and the email IS the kit
// rather than a pointer to one.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const email = String(body.email ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const rawSlug = String(body.slug ?? "").trim();
  if (rawSlug && !/^[a-z0-9_-]{1,140}$/.test(rawSlug)) {
    return NextResponse.json({ error: "Missing kit reference" }, { status: 400 });
  }
  const slug = rawSlug || null;

  const roleTitle = String(body.roleTitle ?? "").trim().slice(0, MAX_TEXT);
  const state = String(body.state ?? "").trim().slice(0, MAX_TEXT);
  if (!roleTitle || !state) {
    return NextResponse.json({ error: "Missing kit data" }, { status: 400 });
  }

  const competencies = Array.isArray(body.competencies)
    ? body.competencies
        .map((c: unknown) => String(c ?? "").trim().slice(0, MAX_TEXT))
        .filter(Boolean)
        .slice(0, MAX_ITEMS)
    : [];

  const sections = Array.isArray(body.sections)
    ? body.sections
        .map((s: unknown) => {
          const row = (s ?? {}) as Record<string, unknown>;
          const rawQuestions = Array.isArray(row.questions) ? row.questions : [];
          const questions = rawQuestions
            .map((q: unknown) => String(q ?? "").trim().slice(0, MAX_QUESTION_TEXT))
            .filter(Boolean)
            .slice(0, MAX_QUESTIONS_PER_SECTION);
          return {
            label: String(row.label ?? "").trim().slice(0, MAX_TEXT),
            count: Math.max(0, Math.min(999, Number(row.count) || 0)),
            ...(questions.length > 0 ? { questions } : {}),
          };
        })
        .filter((s: { label: string; count: number }) => s.label)
        .slice(0, MAX_ITEMS)
    : [];

  try {
    await sendInterviewKitEmail({
      to: email,
      roleTitle,
      state,
      competencies,
      sections,
      kitUrl: slug ? `${SITE_URL}/interview-questions/${slug}` : null,
    });
  } catch (err) {
    console.error("Failed to send interview kit email:", err);
    return NextResponse.json({ error: "Couldn't send that email — please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
