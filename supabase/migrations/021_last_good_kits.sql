-- One row per (job title, industry, seniority, state, focus) combination
-- on the PUBLIC interview-kit path only — the last kit that generated and
-- validated successfully. If a later regeneration fails twice in a row
-- (transient Gemini outage, model returning bad content twice running),
-- this is what gets served instead of an error page. A slightly stale but
-- good kit beats a broken one.
-- No PII: cache_key is derived only from the public form's own inputs
-- (title/industry/seniority/state/focus), same as the cache key already
-- used for the 30-day generation cache.
-- Read/written only via the service-role key in the generation pipeline —
-- no public policy.
CREATE TABLE IF NOT EXISTS last_good_kits (
  cache_key   TEXT PRIMARY KEY,
  kit         JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE last_good_kits ENABLE ROW LEVEL SECURITY;
