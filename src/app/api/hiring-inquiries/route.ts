import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendHiringInquiryNotification } from "@/lib/mailer";

// POST /api/hiring-inquiries — public, saves the inquiry and emails the admin
// inboxes immediately.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const jobTitle = String(body.jobTitle ?? "").trim();
  const zipCode = String(body.zipCode ?? "").trim();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const company = String(body.company ?? "").trim();
  const position = String(body.position ?? "").trim();
  const preferredContact = String(body.preferredContact ?? "").trim();

  if (!jobTitle || !zipCode || !firstName || !lastName || !email || !phone || !company || !position) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (preferredContact !== "phone" && preferredContact !== "email") {
    return NextResponse.json({ error: "Invalid preferred contact method" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("hiring_inquiries").insert({
    job_title: jobTitle,
    zip_code: zipCode,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    company,
    position,
    preferred_contact: preferredContact,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    await sendHiringInquiryNotification({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      company,
      position,
      jobTitle,
      zipCode,
      preferredContact,
    });
  } catch (err) {
    // Inquiry is already saved — surface the email failure without failing the request.
    console.error("Failed to send hiring inquiry notification email:", err);
  }

  return NextResponse.json({ success: true });
}
