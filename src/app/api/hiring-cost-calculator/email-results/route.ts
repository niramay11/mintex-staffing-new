import { NextRequest, NextResponse } from "next/server";
import { sendHiringCalculatorBreakdown } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LINES = 40;
const MAX_TEXT = 200;

interface RawLine {
  label?: unknown;
  value?: unknown;
  strong?: unknown;
  accent?: unknown;
}

// POST /api/hiring-cost-calculator/email-results — public, emails the calculator
// breakdown the caller already computed client-side (no calculation logic here).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const email = String(body.email ?? "").trim();
  const heading = String(body.heading ?? "").trim().slice(0, MAX_TEXT);
  const headlineLabel = String(body.headlineLabel ?? "").trim().slice(0, MAX_TEXT);
  const headlineValue = String(body.headlineValue ?? "").trim().slice(0, MAX_TEXT);
  const rawLines = Array.isArray(body.lines) ? (body.lines as RawLine[]) : [];

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!heading || !headlineLabel || !headlineValue || rawLines.length === 0) {
    return NextResponse.json({ error: "Missing breakdown data" }, { status: 400 });
  }

  const lines = rawLines.slice(0, MAX_LINES).map((line) => ({
    label: String(line.label ?? "").trim().slice(0, MAX_TEXT),
    value: String(line.value ?? "").trim().slice(0, MAX_TEXT),
    strong: line.strong === true,
    accent: line.accent === true,
  })).filter((line) => line.label && line.value);

  if (lines.length === 0) {
    return NextResponse.json({ error: "Missing breakdown data" }, { status: 400 });
  }

  try {
    await sendHiringCalculatorBreakdown({ to: email, heading, headlineLabel, headlineValue, lines });
  } catch (err) {
    console.error("Failed to send hiring calculator breakdown email:", err);
    return NextResponse.json({ error: "Couldn't send that email — please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
