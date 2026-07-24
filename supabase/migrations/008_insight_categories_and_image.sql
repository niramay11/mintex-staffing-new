-- Admin-managed categories for insights (replaces the fixed career/market/trends
-- enum — admins can add, rename, or remove categories from the admin panel).
CREATE TABLE IF NOT EXISTS insight_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE insight_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read insight categories" ON insight_categories
  FOR SELECT USING (true);

CREATE TRIGGER insight_categories_updated_at
  BEFORE UPDATE ON insight_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO insight_categories (slug, label, sort_order) VALUES
  ('career', 'Career Insights',     0),
  ('market', 'Job Market Insights', 1),
  ('trends', 'Hiring Trends',       2)
ON CONFLICT (slug) DO NOTHING;

-- Cover image for the insight card + article header. Nullable — falls back to a
-- plain category-labeled card when unset.
ALTER TABLE insights ADD COLUMN IF NOT EXISTS image_url TEXT;
