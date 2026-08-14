import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { CACHE_TAG } from "@/lib/interviewKit/cache";

// POST /api/admin/revalidate-interview-kits — admin-guarded. Forces every
// cached interview kit to regenerate on next view. Needed whenever the
// InterviewKit shape changes (like adding `source` to your_rights) —
// without this, kits cached under the old shape 500 on render until their
// 30-day TTL naturally expires. A real fix for a real problem, not a
// standing feature — expected to be hit manually, rarely, right after a
// schema change ships.
export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // { expire: 0 } for immediate expiration — the default "max" profile is
  // stale-while-revalidate, which would still serve one more broken
  // response (from the old cached shape) before refreshing in the
  // background. That's not acceptable when the reason we're revalidating
  // is that the old shape 500s on render.
  revalidateTag(CACHE_TAG, { expire: 0 });
  return NextResponse.json({ success: true, revalidated: CACHE_TAG });
}
