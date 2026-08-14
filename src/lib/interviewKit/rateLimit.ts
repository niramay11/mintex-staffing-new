import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

// Purely abuse control on the public, unauthenticated, API-cost-incurring
// endpoints (generate, expand, JD, resume gap analysis) — not a feature
// limit for legitimate use. Server-only, same reasoning as feedback.ts:
// never import this into anything reachable from a "use client" component.

export interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

export class RateLimitError extends Error {
  constructor(message = "Too many requests — please try again in a bit.") {
    super(message);
  }
}

/** ~20/hour per endpoint per IP — generous for a real visitor generating a
 * few kits, tight enough to blunt a scripted hammering of the AI endpoints. */
export const GENEROUS_HOURLY_LIMIT: RateLimitConfig = { windowSeconds: 60 * 60, maxRequests: 20 };

function extractIp(headers: Headers): string {
  // Vercel and most reverse proxies set x-forwarded-for; the first entry is
  // the original client, later ones are intermediate proxies.
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function getClientIp(req: Request): string {
  return extractIp(req.headers);
}

/** Server Component variant — page.tsx has no Request object, only
 * next/headers' headers(). Must be called OUTSIDE any unstable_cache scope
 * (accessing headers inside a cache scope is unsupported and will throw),
 * which is exactly why this check lives in loadKit.ts rather than inside
 * the cached generateInterviewKit itself. */
export async function getClientIpFromHeaders(): Promise<string> {
  return extractIp(await headers());
}

/**
 * Returns true if the request is allowed. Fails OPEN on any error talking
 * to Supabase — a rate limiter that's temporarily broken should not take
 * the entire feature down with it; abuse control silently not working for
 * a few minutes is a far smaller problem than every visitor getting a 429.
 */
export async function checkRateLimit(bucket: string, ip: string, config: RateLimitConfig = GENEROUS_HOURLY_LIMIT): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_bucket_key: `${bucket}:${ip}`,
    p_window_seconds: config.windowSeconds,
    p_max_requests: config.maxRequests,
  });
  if (error) {
    console.error(`Rate limit check failed for bucket "${bucket}", allowing request:`, error);
    return true;
  }
  return data === true;
}
