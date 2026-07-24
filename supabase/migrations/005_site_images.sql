-- Admin-managed image overrides, mapped to their exact page + section usage.
-- A row with location_key set is a known, code-registered slot (see
-- src/lib/imageLocations.ts) and always has a rendering fallback. A row with
-- location_key NULL is an "orphan" — a static file found under /public that
-- no component currently references, tracked purely so the admin can assign it.
CREATE TABLE IF NOT EXISTS site_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_key  TEXT UNIQUE,
  page_name     TEXT NOT NULL,
  section_name  TEXT,
  file_path     TEXT NOT NULL,
  alt_text      TEXT,
  is_static     BOOLEAN DEFAULT true,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read (rendered on the public site); writes only via the
-- service-role key in the /api/site-images routes.
CREATE POLICY "Public can read site images" ON site_images
  FOR SELECT USING (true);

CREATE TRIGGER site_images_updated_at
  BEFORE UPDATE ON site_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
