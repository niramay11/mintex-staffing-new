-- Persisted, incrementally-merged copy of the public Ceipal job list.
-- A full live pull from Ceipal (~1,500-2,300+ postings, paginated) doesn't
-- reliably finish inside Vercel's hard 60s function limit, so each cache
-- cycle now upserts whatever pages it manages to fetch this time instead of
-- replacing the whole list wholesale — a slow/incomplete Ceipal cycle just
-- leaves untouched jobs stale instead of making them (or their description)
-- vanish from the site until the next lucky complete pull. See jobsCache.ts.
--
-- Read/written only via the service-role key in jobsCache.ts — no public
-- SELECT policy, same pattern as job_alert_seen_jobs.
CREATE TABLE IF NOT EXISTS ceipal_jobs_cache (
  job_code    TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ceipal_jobs_cache ENABLE ROW LEVEL SECURITY;
