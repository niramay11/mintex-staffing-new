import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminPassword } from "@/lib/portal-auth";
import { IMAGE_LOCATIONS, invalidateSiteImagesCache } from "@/lib/siteImages";
import { scanForOrphans } from "@/lib/imageScanner";

// GET /api/site-images — admin-guarded (rescans /public as a side effect).
// Returns every known location merged with its DB override, plus any
// auto-detected orphan files not yet assigned to a location.
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await scanForOrphans();

  const { data, error } = await supabaseAdmin.from("site_images").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const overrides = new Map((data ?? []).filter((r) => r.location_key).map((r) => [r.location_key, r]));
  const locations = IMAGE_LOCATIONS.map((loc) => {
    const override = overrides.get(loc.locationKey);
    return {
      location_key: loc.locationKey,
      page_name: loc.pageName,
      section_name: loc.sectionName,
      default_src: loc.defaultSrc,
      file_path: override?.file_path ?? loc.defaultSrc,
      alt_text: override?.alt_text ?? null,
      is_static: override?.is_static ?? true,
    };
  });

  const orphans = (data ?? []).filter((r) => !r.location_key);

  return NextResponse.json({ locations, orphans });
}

// PUT /api/site-images — admin-guarded, upserts one or more location overrides by location_key.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { password, locations } = body ?? {};

  if (!verifyAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!Array.isArray(locations)) {
    return NextResponse.json({ error: "locations must be an array" }, { status: 400 });
  }

  const validKeys = new Set(IMAGE_LOCATIONS.map((loc) => loc.locationKey));
  const byKey = new Map(IMAGE_LOCATIONS.map((loc) => [loc.locationKey, loc]));

  const clean = locations
    .map((loc) => ({
      location_key: String(loc.location_key ?? ""),
      file_path: String(loc.file_path ?? "").trim(),
      alt_text: loc.alt_text ? String(loc.alt_text).trim() : null,
    }))
    .filter((loc) => validKeys.has(loc.location_key) && loc.file_path)
    .map((loc) => ({
      location_key: loc.location_key,
      page_name: byKey.get(loc.location_key)!.pageName,
      section_name: byKey.get(loc.location_key)!.sectionName,
      file_path: loc.file_path,
      alt_text: loc.alt_text,
      is_static: loc.file_path.startsWith("/"),
    }));

  if (clean.length > 0) {
    const { error } = await supabaseAdmin.from("site_images").upsert(clean, { onConflict: "location_key" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateSiteImagesCache();
  // Every page reading getSiteImages() is statically prerendered, so the DB
  // write above is invisible until the whole app's cache is revalidated.
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true, data: clean });
}
