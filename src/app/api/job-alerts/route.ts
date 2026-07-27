import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendJobAlertConfirmation } from "@/lib/mailer";
import { SITE_URL } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/job-alerts — public, saves a job-alert subscription and emails a confirmation.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const email = String(body.email ?? "").trim();
  const keyword = String(body.keyword ?? "").trim();
  const location = String(body.location ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const unsubscribeToken = randomBytes(24).toString("hex");

  const { error } = await supabaseAdmin.from("job_alerts").insert({
    email,
    keyword: keyword || null,
    location: location || null,
    unsubscribe_token: unsubscribeToken,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const siteUrl = SITE_URL;
  const unsubscribeUrl = `${siteUrl}/api/job-alerts/unsubscribe?token=${unsubscribeToken}`;

  try {
    await sendJobAlertConfirmation(email, unsubscribeUrl);
  } catch (err) {
    // Subscription is already saved — surface the email failure without failing the request.
    console.error("Failed to send job alert confirmation email:", err);
  }

  return NextResponse.json({ success: true });
}
