import { NextRequest, NextResponse } from "next/server";
import { sendInterviewKitEmail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 120;
const MAX_ITEMS = 12;

// POST /api/interview-kit/email — public. The kit itself is deterministic
// from its slug (same cache the page reads), so this just emails a durable
// link plus the preview data the client already rendered — no need to
// re-derive the kit server-side (and no need to burn the page's rate limit
// doing so).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const email = String(body.email ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  if (!/^[a-z0-9_-]{1,140}$/.test(slug)) {
    return NextResponse.json({ error: "Missing kit reference" }, { status: 400 });
  }

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
          return {
            label: String(row.label ?? "").trim().slice(0, MAX_TEXT),
            count: Math.max(0, Math.min(999, Number(row.count) || 0)),
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
      kitUrl: `${SITE_URL}/interview-questions/${slug}`,
    });
  } catch (err) {
    console.error("Failed to send interview kit email:", err);
    return NextResponse.json({ error: "Couldn't send that email — please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
