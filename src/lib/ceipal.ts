// ─── Credentials (from .env) ──────────────────────────────────────────────────
const EMAIL    = process.env.CEIPAL_EMAIL    || 'kumar@mintextech.com';
const PASSWORD = process.env.CEIPAL_PASSWORD || 'Mintex@123';
const API_KEY  = process.env.CEIPAL_API_KEY  || '';

// ─── Auth URLs ────────────────────────────────────────────────────────────────
const AUTH_URL_V1 = 'https://api.ceipal.com/v1/createAuthtoken/';
const AUTH_URL_V2 = 'https://api.ceipal.com/v2/createAuthtoken/';

// ─── Data Endpoints ───────────────────────────────────────────────────────────
export const CEIPAL_JOBS_URL =
  'https://api.ceipal.com/getCustomJobPostingDetails/Z3RkUkt2OXZJVld2MjFpOVRSTXoxZz09/afddc10aa5424b2974b109624f0ca710/';

export const CEIPAL_PLACEMENTS_URL =
  'https://api.ceipal.com/v2/getCustomPlacementDetails/VnllY0Q0TTRBbnp3dGJYYVZzZUkzdz09/fbcfaa69a0dcc8e55e39edfa680c36a9/';

// ─── Token cache ──────────────────────────────────────────────────────────────
type TokenCache = { token: string; expiresAt: number };
let cacheV1: TokenCache | null = null;
let cacheV2: TokenCache | null = null;
// Single-flight guards: without these, every caller that finds a cold/expired
// cache at the same moment (e.g. the instrumentation.ts boot warm-up hitting
// several job/placement caches in parallel) fires its own concurrent auth
// request — Ceipal can reject that burst, which then cascades into an empty
// jobs list getting cached for the full revalidate window. Coalescing to one
// shared in-flight request per token type removes that race entirely.
let inflightV1: Promise<string> | null = null;
let inflightV2: Promise<string> | null = null;

function parseXmlToken(xml: string): string {
  const m = xml.match(/<access_token>(.*?)<\/access_token>/);
  if (!m?.[1]) throw new Error('No access_token in CEIPAL response');
  return m[1];
}

// Fetch with a per-request timeout so hung connections fail fast
function fetchWithTimeout(url: string, options: RequestInit, ms = 20_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function fetchToken(authUrl: string): Promise<string> {
  if (!API_KEY) throw new Error('CEIPAL_API_KEY env var is missing');

  const res = await fetchWithTimeout(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, api_key: API_KEY, json: 1 }),
  }, 15_000);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`CEIPAL auth failed: ${res.status} — ${body}`);
  }
  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (json?.access_token) return json.access_token;
    if (json?.token)        return json.token;
  } catch {
    // fall through to XML parse
  }
  return parseXmlToken(text);
}

// ─── Public token getters ─────────────────────────────────────────────────────
export async function getCeipalToken(): Promise<string> {
  const BUFFER = 5 * 60 * 1000;
  if (cacheV1 && Date.now() < cacheV1.expiresAt - BUFFER) return cacheV1.token;
  if (!inflightV1) {
    inflightV1 = fetchToken(AUTH_URL_V1)
      .then(token => { cacheV1 = { token, expiresAt: Date.now() + 50 * 60 * 1000 }; return token; })
      .finally(() => { inflightV1 = null; });
  }
  return inflightV1;
}

export async function getCeipalTokenV2(): Promise<string> {
  const BUFFER = 5 * 60 * 1000;
  if (cacheV2 && Date.now() < cacheV2.expiresAt - BUFFER) return cacheV2.token;
  if (!inflightV2) {
    inflightV2 = fetchToken(AUTH_URL_V2)
      .then(token => { cacheV2 = { token, expiresAt: Date.now() + 50 * 60 * 1000 }; return token; })
      .finally(() => { inflightV2 = null; });
  }
  return inflightV2;
}

// ─── Authenticated fetch helpers ──────────────────────────────────────────────
async function doFetch(url: string, getToken: () => Promise<string>, timeoutMs?: number): Promise<Response> {
  let token = await getToken();
  let res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  }, timeoutMs);

  if (res.status === 401 || res.status === 403) {
    cacheV1 = null;
    cacheV2 = null;
    token = await getToken();
    res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }, timeoutMs);
  }
  return res;
}

// timeoutMs is optional — omit it to keep the default 20s used everywhere
// else. getApplicantDetails specifically needs longer (confirmed live: a
// single lookup can take ~15-16s even with no contention, and multiple
// concurrent lookups slow Ceipal down further), so its caller passes a
// larger value rather than raising the shared default for every endpoint.
export function ceipalFetch(url: string, timeoutMs?: number)   { return doFetch(url, getCeipalToken, timeoutMs);   }
export function ceipalFetchV2(url: string, timeoutMs?: number) { return doFetch(url, getCeipalTokenV2, timeoutMs); }
