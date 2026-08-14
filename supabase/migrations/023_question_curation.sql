-- Adds a lightweight recruiter-review flag to question_feedback so the
-- admin curation queue can track which well-liked questions have already
-- been looked at, without needing a separate table. Doesn't gate indexing
-- (public kits stay indexed on generation, unchanged) — this is purely a
-- "have I reviewed this one yet" checkbox for the recruiter's own workflow.
ALTER TABLE question_feedback ADD COLUMN IF NOT EXISTS reviewed BOOLEAN NOT NULL DEFAULT false;
