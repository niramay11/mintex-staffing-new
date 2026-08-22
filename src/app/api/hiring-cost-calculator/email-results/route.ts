import { NextRequest, NextResponse } from "next/server";
import { sendHiringCalculatorBreakdown } from "@/lib/mailer";
import { sanitizeBreakdownPayload } from "@/lib/calculatorShare";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/hiring-cost-calculator/email-results — public, emails the calculator
// breakdown the caller already computed client-side (no calculation logic here).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const email = String(body.email ?? "").trim();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const payload = sanitizeBreakdownPayload(body);
  if (!payload) return NextResponse.json({ error: "Missing breakdown data" }, { status: 400 });

  try {
    const { heading, headlineLabel, headlineValue, lines } = payload;
    await sendHiringCalculatorBreakdown({ to: email, heading, headlineLabel, headlineValue, lines });
  } catch (err) {
    console.error("Failed to send hiring calculator breakdown email:", err);
    return NextResponse.json({ error: "Couldn't send that email — please try again." }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
