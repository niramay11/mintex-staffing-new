-- Client / candidate / other testimonials shown on /case-studies.
-- Fully admin-managed via /api/admin/case-studies, including an optional
-- testimonial video (uploaded to the case-study-videos storage bucket).
CREATE TABLE IF NOT EXISTS case_studies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('client', 'candidate', 'other')),
  title         TEXT NOT NULL,
  quote         TEXT NOT NULL,
  author        TEXT NOT NULL,
  role          TEXT,
  video_url     TEXT,
  thumbnail_url TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read case studies" ON case_studies
  FOR SELECT USING (true);

CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed with the case studies that were previously hardcoded in src/content/caseStudies.ts
INSERT INTO case_studies (type, title, quote, author, role, sort_order) VALUES
(
  'client', 'Scaling an Engineering Team From 12 to 40 in One Year',
  $q$Mintex didn't just send us resumes, they became an extension of our hiring team. We hit our headcount plan two months early without lowering our bar.$q$,
  'VP of Engineering', 'Series C SaaS Company', 0
),
(
  'client', 'Cutting Time-to-Fill in Half for a Regional Hospital Network',
  $q$We were losing nurses to slower-moving competitors. Mintex's credentialing-first process meant we could make offers within days, not weeks.$q$,
  'Director of Talent Acquisition', 'Regional Healthcare Network', 1
),
(
  'candidate', 'From Contract Role to VP of Finance in Three Years',
  $q$My recruiter actually listened to what I wanted long-term, not just the next paycheck. That contract placement turned into the best career move I've made.$q$,
  'Former Candidate', 'Now VP of Finance', 0
),
(
  'candidate', 'Landing a Remote Role After a Cross-Country Relocation',
  $q$I was worried relocating would tank my job search. My recruiter had three remote-friendly roles lined up before I'd even finished unpacking.$q$,
  'Former Candidate', 'Now Customer Success Manager', 1
),
(
  'other', 'Standing Up a Full Distribution Center Team in 30 Days',
  $q$A last-minute contract win meant we needed 25 warehouse staff in a month. Mintex delivered a fully vetted team in three weeks.$q$,
  'Operations Director', 'National Logistics Provider', 0
),
(
  'other', 'Supporting a Manufacturing Client Through a Plant Relaunch',
  $q$Mintex staffed our entire relaunch, from line supervisors to quality engineers, on a timeline most agencies said was impossible.$q$,
  'Plant Manager', 'Automotive Parts Manufacturer', 1
);
