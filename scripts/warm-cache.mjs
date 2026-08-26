// Run this once right after every deploy: `npm run warm-cache`
//
// Vercel's free Hobby plan can't run a scheduled cron more than once a day,
// and this project intentionally isn't using a third-party cron service —
// so nothing keeps the Ceipal job cache warm automatically after a deploy.
// Without this, the first real visitor after each deploy is the one stuck
// waiting up to ~40s for a live Ceipal pull. Running this manually once
// after deploying does that wait yourself, up front, so every real visitor
// after you lands on an already-warm cache instead.
import { readFileSync } from "node:fs";

const SITE_URL = process.env.WARM_CACHE_URL || "https://www.mintexstaffing.com";

function readEnvLocal(key) {
  try {
    const content = readFileSync(".env.local", "utf8");
    const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
    if (!line) return null;
    return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return null;
  }
}

async function main() {
  const secret = readEnvLocal("CRON_SECRET");
  const url = new URL("/api/cron/warm-cache", SITE_URL);
  if (secret) url.searchParams.set("secret", secret);

  console.log(`Warming ${SITE_URL} ... (this can take up to ~40s, please wait)`);
  const startedAt = Date.now();

  const res = await fetch(url, { signal: AbortSignal.timeout(65_000) });
  const body = await res.json().catch(() => ({}));
  const took = ((Date.now() - startedAt) / 1000).toFixed(1);

  if (!res.ok) {
    console.error(`Failed (HTTP ${res.status}) after ${took}s:`, body);
    process.exit(1);
  }

  console.log(`Done in ${took}s:`, body);
}

main().catch((err) => {
  console.error("warm-cache script failed:", err.message);
  process.exit(1);
});
