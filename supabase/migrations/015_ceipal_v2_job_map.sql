-- Persisted, incrementally-merged copy of the Ceipal v2 job_code -> id map.
-- Mirrors ceipal_jobs_cache's reasoning (see migration 014) — a full v2 pull
-- (~1,500+ jobs) doesn't reliably finish within Vercel's time limit in one
-- cycle, so this merges whatever a cycle manages to fetch instead of
-- replacing the whole map wholesale, keeping previously-resolved job IDs
-- available even when a later cycle is slow or partial. See
-- ceipal-job-map.ts.
--
-- Read/written only via the service-role key in ceipal-job-map.ts — no
-- public SELECT policy, same pattern as ceipal_jobs_cache.
CREATE TABLE IF NOT EXISTS ceipal_v2_job_map (
  job_code   TEXT PRIMARY KEY,
  v2_id      TEXT NOT NULL,
  synced_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ceipal_v2_job_map ENABLE ROW LEVEL SECURITY;
