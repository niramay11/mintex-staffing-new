import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { sendInquiryAccepted } from "@/lib/mailer";

function adminGuard(req: NextRequest): boolean {
  return verifyAdminPassword(req.headers.get("x-admin-password") ?? "");
}

// PUT /api/admin/hiring-inquiries/[id] — admin-guarded. Marks an inquiry
// read/unread, and/or accepts it: stamps accepted_at (only once — a repeat
// accept is a no-op) and emails the requester that their conversation was
// accepted.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};
  if ("is_read" in body) updates.is_read = Boolean(body.is_read);

  let notifyAcceptance = false;
  if (body.accepted) {
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("hiring_inquiries")
      .select("accepted_at")
      .eq("id", id)
      .single();
    if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 500 });
    if (!existing.accepted_at) {
      updates.accepted_at = new Date().toISOString();
      notifyAcceptance = true;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("hiring_inquiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (notifyAcceptance) {
    try {
      await sendInquiryAccepted({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
      });
    } catch (err) {
      // Inquiry is already marked accepted — surface the email failure without failing the request.
      console.error("Failed to send inquiry accepted email:", err);
    }
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/hiring-inquiries/[id] — admin-guarded, deletes an inquiry.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await supabaseAdmin.from("hiring_inquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
