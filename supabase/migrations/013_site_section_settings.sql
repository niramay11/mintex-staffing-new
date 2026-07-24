-- Lets admins temporarily show/hide a homepage section without deleting its
-- content (first use: the Client Stories section).
CREATE TABLE IF NOT EXISTS site_section_settings (
  section_key TEXT PRIMARY KEY,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_section_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (checked on the public homepage); writes only happen via
-- the service-role key in /api/client-stories/section (PUT).
CREATE POLICY "Public can read section settings" ON site_section_settings
  FOR SELECT USING (true);

INSERT INTO site_section_settings (section_key, enabled)
VALUES ('client_stories', true)
ON CONFLICT (section_key) DO NOTHING;
