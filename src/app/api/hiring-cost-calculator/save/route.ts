import { NextRequest, NextResponse } from "next/server";
import { sanitizeBreakdownPayload } from "@/lib/calculatorShare";
import { saveCalculatorResult } from "@/lib/calculatorSaves";
import { checkRateLimit, getClientIp } from "@/lib/interviewKit/rateLimit";

// POST /api/hiring-cost-calculator/save — public, stores the calculator
// breakdown the caller already computed client-side under a short code, so
// "Save these numbers" keeps working from any device, indefinitely.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit("calculator-save", getClientIp(req), { windowSeconds: 60 * 60, maxRequests: 30 });
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again in a bit." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const payload = sanitizeBreakdownPayload(body);
  if (!payload) return NextResponse.json({ error: "Missing breakdown data" }, { status: 400 });

  try {
    const code = await saveCalculatorResult(payload);
    return NextResponse.json({ code });
  } catch (err) {
    console.error("Failed to save calculator result:", err);
    return NextResponse.json({ error: "Couldn't save — please try again." }, { status: 500 });
  }
}
