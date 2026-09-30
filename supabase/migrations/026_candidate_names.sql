-- Permanent Ceipal candidate-name lookup for the Client Portal
-- (src/lib/portalSubmissions.ts). Ceipal's submission records carry only a
-- job_seeker_id, and resolving it to a name (getApplicantDetails) takes
-- ~10-20s per candidate — so each name is looked up once, ever, and stored
-- here. Names don't change, so rows never expire.
-- Read/written only via the service-role key from the portal API routes —
-- no public policy.
CREATE TABLE IF NOT EXISTS candidate_names (
  job_seeker_id  TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE candidate_names ENABLE ROW LEVEL SECURITY;
