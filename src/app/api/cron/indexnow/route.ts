import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

export const maxDuration = 60;

// IndexNow (https://www.indexnow.org) — tells Bing (and Copilot, Yandex,
// Seznam…) which URLs changed, so they re-crawl them quickly. Google does not
// use it. The key below must match the file served at /<key>.txt (in
// /public), which is how IndexNow verifies we own the domain.
const INDEXNOW_KEY = "20072fd1435317dff0f4958fbf5ae0b5";
const RECENT_DAYS = 2;

// GET /api/cron/indexnow            → submits sitemap URLs changed in the last 2 days (daily cron)
// GET /api/cron/indexnow?all=1      → submits every sitemap URL (run once after a big deploy)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const provided = auth === `Bearer ${secret}` ? secret : url.searchParams.get("secret");
    if (provided !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const site = new URL(SITE_URL);
  // Never ping IndexNow from local dev / preview deployments.
  if (site.hostname === "localhost" || site.hostname.endsWith(".vercel.app")) {
    return NextResponse.json({ ok: false, skipped: `not a production host (${site.hostname})` });
  }

  const all = url.searchParams.get("all") === "1";
  const cutoff = Date.now() - RECENT_DAYS * 86_400_000;
  const entries = await sitemap();
  const urlList = entries
    .filter((e) => all || (e.lastModified && new Date(e.lastModified).getTime() >= cutoff))
    .map((e) => e.url)
    .slice(0, 10_000); // IndexNow's per-request limit

  if (urlList.length === 0) return NextResponse.json({ ok: true, submitted: 0 });

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${site.origin}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  // 200/202 = accepted. 403 = key file not reachable yet, 422 = URL/host mismatch.
  return NextResponse.json({ ok: res.ok, status: res.status, submitted: urlList.length }, { status: res.ok ? 200 : 502 });
}
