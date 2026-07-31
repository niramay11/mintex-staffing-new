-- Leadership/team member bio cards shown on /about. Fully admin-managed via
-- /api/admin/team-members. Seeded with placeholder rows so the /about
-- section renders something sensible before real people are added — replace
-- via the admin panel's "Team" tab.
CREATE TABLE IF NOT EXISTS team_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  title        TEXT NOT NULL,
  bio          TEXT,
  photo_url    TEXT,
  linkedin_url TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read team members" ON team_members
  FOR SELECT USING (true);

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Placeholder rows — replace name/title/bio/photo via the admin panel.
INSERT INTO team_members (name, title, bio, sort_order) VALUES
('Add Your Name', 'Founder & CEO', 'Replace this with a short founder bio: background, years of experience, and what drives the company mission.', 0),
('Add Your Name', 'Director of Recruiting', 'Replace this with a short leadership bio highlighting relevant staffing/recruiting experience.', 1);
