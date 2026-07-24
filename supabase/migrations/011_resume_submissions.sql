-- Resumes submitted through the public "Share Your Resume" form.
-- The actual file lives in the private "resumes" Storage bucket; this table
-- tracks the candidate's details plus the storage path so the admin panel
-- can list submissions and generate a signed download URL on demand.
-- Read/written only via the service-role key in /api/resumes and
-- /api/admin/resumes — no public SELECT policy.
CREATE TABLE IF NOT EXISTS resume_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  industry         TEXT,
  resume_path      TEXT NOT NULL,
  resume_filename  TEXT NOT NULL,
  is_read          BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE resume_submissions ENABLE ROW LEVEL SECURITY;
