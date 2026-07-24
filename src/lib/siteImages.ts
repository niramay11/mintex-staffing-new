import { supabase } from "./supabase";
import { IMAGE_LOCATIONS } from "./imageLocations";

export { IMAGE_LOCATIONS };
export type { ImageLocation } from "./imageLocations";

const CACHE_TTL = 60_000; // 1 minute
let cache: { data: Record<string, string>; at: number } | null = null;

// Server-side only: merged map of every known location's effective URL
// (override if one exists in the DB, else its coded default), keyed by locationKey.
export async function getSiteImages(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL) return cache.data;

  const defaults = Object.fromEntries(IMAGE_LOCATIONS.map((loc) => [loc.locationKey, loc.defaultSrc]));
  const { data } = await supabase
    .from("site_images")
    .select("location_key, file_path")
    .not("location_key", "is", null);

  for (const row of data ?? []) {
    if (row.file_path) defaults[row.location_key as string] = row.file_path;
  }

  cache = { data: defaults, at: now };
  return defaults;
}

export function invalidateSiteImagesCache() {
  cache = null;
}
