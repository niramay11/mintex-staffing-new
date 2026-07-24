-- Social media links shown in the site footer, managed from the admin panel
CREATE TABLE IF NOT EXISTS social_links (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read the links (they're rendered on the public site);
-- writes only happen via the service-role key in /api/social-links (PUT).
CREATE POLICY "Public can read social links" ON social_links
  FOR SELECT USING (true);
