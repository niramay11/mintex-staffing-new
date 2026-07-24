import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/job-alerts/unsubscribe?token=... — public, deactivates one alert subscription.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("job_alerts")
    .update({ is_active: false })
    .eq("unsubscribe_token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return new NextResponse(
    `<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#0f172a;">
      <h2>You've been unsubscribed</h2>
      <p>You won't receive any more emails for this job alert.</p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
