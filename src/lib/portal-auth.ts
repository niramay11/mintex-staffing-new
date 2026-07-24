import { randomBytes, pbkdf2Sync } from 'crypto';
import { supabaseAdmin } from './supabase';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Password hashing ─────────────────────────────────────────────────────────
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(plain, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = pbkdf2Sync(plain, salt, 10000, 64, 'sha512').toString('hex');
  return derived === hash;
}

// ─── Session management ───────────────────────────────────────────────────────
export async function createSession(clientId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await supabaseAdmin.from('client_sessions').insert({ client_id: clientId, token, expires_at: expiresAt });
  return token;
}

export async function verifySession(token: string) {
  if (!token) return null;

  const { data } = await supabaseAdmin
    .from('client_sessions')
    .select('client_id, expires_at, clients(id, name, email, company, ceipal_client_name, allowed_job_codes, permissions, is_active)')
    .eq('token', token)
    .single();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await supabaseAdmin.from('client_sessions').delete().eq('token', token);
    return null;
  }

  const client = data.clients as unknown as Record<string, unknown> | null;
  if (!client || !client.is_active) return null;
  return client;
}

export async function deleteSession(token: string): Promise<void> {
  await supabaseAdmin.from('client_sessions').delete().eq('token', token);
}

// ─── Admin auth ───────────────────────────────────────────────────────────────
export function verifyAdminPassword(password: string): boolean {
  return password === (process.env.ADMIN_PASSWORD || 'admin123');
}
