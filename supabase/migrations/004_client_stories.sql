-- Client story videos shown in the homepage "You need to see it to believe it" section
CREATE TABLE IF NOT EXISTS client_stories (
  id            TEXT PRIMARY KEY,
  quote         TEXT NOT NULL,
  author        TEXT NOT NULL,
  role          TEXT,
  video_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_stories ENABLE ROW LEVEL SECURITY;

-- Anyone can read (rendered on the public homepage);
-- writes only happen via the service-role key in /api/client-stories (PUT).
CREATE POLICY "Public can read client stories" ON client_stories
  FOR SELECT USING (true);
