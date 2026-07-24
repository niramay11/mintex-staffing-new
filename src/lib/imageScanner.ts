import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "./supabase";
import { IMAGE_LOCATIONS } from "./imageLocations";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".avif"]);
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function listImageFiles(dir: string, base = ""): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listImageFiles(path.join(dir, entry.name), relPath)));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(`/${relPath}`);
    }
  }
  return files;
}

// Walks /public, and registers any image file not already known (as a coded
// location default or an existing DB row) as a new "Unassigned" orphan row.
export async function scanForOrphans(): Promise<void> {
  const diskFiles = await listImageFiles(PUBLIC_DIR);

  const known = new Set(IMAGE_LOCATIONS.map((loc) => loc.defaultSrc));
  const { data: existing } = await supabaseAdmin.from("site_images").select("file_path");
  for (const row of existing ?? []) known.add(row.file_path);

  const newOrphans = diskFiles.filter((f) => !known.has(f));
  if (newOrphans.length === 0) return;

  await supabaseAdmin.from("site_images").insert(
    newOrphans.map((file_path) => ({
      location_key: null,
      page_name: "Unassigned",
      section_name: null,
      file_path,
      is_static: true,
    }))
  );
}
