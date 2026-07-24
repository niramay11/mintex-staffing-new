import { ceipalFetch } from './ceipal';

// Maps lowercase client name → CEIPAL numeric company ID
// Used to match portal clients to their V2 jobs (jobs.company field)
type ClientMap = Record<string, number | string>;

let cache: { map: ClientMap; at: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export async function getClientMap(): Promise<ClientMap> {
  if (cache && Date.now() < cache.at + CACHE_TTL) return cache.map;

  const map: ClientMap = {};

  try {
    // Try V2 clients list first
    const res = await ceipalFetch('https://api.ceipal.com/v2/getClientsList/?paging_length=200&page=1');
    if (res.ok) {
      const data = await res.json();
      const clients: Record<string, unknown>[] = Array.isArray(data?.results)
        ? data.results : Array.isArray(data) ? data : [];

      for (const c of clients) {
        // Common field names for client name and ID
        const name = String(
          c.company_name ?? c.name ?? c.client_name ?? c.display_name ?? ''
        ).toLowerCase().trim();
        const id = c.id ?? c.company_id ?? c.client_id;
        if (name && id !== undefined && id !== null && id !== '') {
          map[name] = id as number | string;
        }
      }
    }
  } catch { /* ignore, fall through */ }

  cache = { map, at: Date.now() };
  return map;
}

// Look up company ID by any partial/full client name variant
export async function resolveCompanyId(
  clientName: string
): Promise<string | number | null> {
  if (!clientName) return null;
  const map = await getClientMap();
  const lower = clientName.toLowerCase().trim();

  // Exact match first
  if (map[lower] !== undefined) return map[lower];

  // Partial match
  for (const [name, id] of Object.entries(map)) {
    if (name.includes(lower) || lower.includes(name)) return id;
  }

  return null;
}
