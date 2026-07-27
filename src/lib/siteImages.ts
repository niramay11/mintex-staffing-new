import { unstable_cache, revalidateTag } from "next/cache";
import { supabase } from "./supabase";
import { IMAGE_LOCATIONS } from "./imageLocations";

export { IMAGE_LOCATIONS };
export type { ImageLocation } from "./imageLocations";

const CACHE_TAG = "site-images";
const CACHE_TTL_SECONDS = 60;

async function fetchSiteImages(): Promise<Record<string, string>> {
  const defaults = Object.fromEntries(IMAGE_LOCATIONS.map((loc) => [loc.locationKey, loc.defaultSrc]));
  const { data } = await supabase
    .from("site_images")
    .select("location_key, file_path")
    .not("location_key", "is", null);

  for (const row of data ?? []) {
    if (row.file_path) defaults[row.location_key as string] = row.file_path;
  }

  return defaults;
}

// unstable_cache persists via Next's shared Data Cache rather than plain
// in-process memory — a hand-rolled `let cache` variable resets on every
// fresh serverless invocation, so a warm instance and a cold one could
// disagree on whether an admin's image update had landed yet (same class of
// bug fixed in jobsCache.ts).
const getCachedSiteImages = unstable_cache(fetchSiteImages, [CACHE_TAG], {
  revalidate: CACHE_TTL_SECONDS,
  tags: [CACHE_TAG],
});

// Server-side only: merged map of every known location's effective URL
// (override if one exists in the DB, else its coded default), keyed by locationKey.
export async function getSiteImages(): Promise<Record<string, string>> {
  return getCachedSiteImages();
}

export function invalidateSiteImagesCache() {
  revalidateTag(CACHE_TAG, "max");
}
