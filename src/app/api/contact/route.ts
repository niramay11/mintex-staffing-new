import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendContactNotification } from "@/lib/mailer";

// POST /api/contact — public, saves the message and emails the admin inboxes.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Name, email, subject, and message are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("contact_messages").insert({
    name, email, company: company || null, phone: phone || null, subject, message,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await sendContactNotification({ name, email, company, phone, subject, message });
  } catch (err) {
    // Message is already saved — surface the email failure without failing the request.
    console.error("Failed to send contact notification email:", err);
  }

  return NextResponse.json({ success: true });
}
