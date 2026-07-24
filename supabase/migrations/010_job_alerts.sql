-- Job alert subscriptions created from the "Create a Job Alert" modal.
-- Read/written only via the service-role key in /api/job-alerts and the
-- job-alert notifier — no public SELECT policy.
CREATE TABLE IF NOT EXISTS job_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  keyword             TEXT,
  location            TEXT,
  unsubscribe_token   TEXT NOT NULL UNIQUE,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS job_alerts_active_idx ON job_alerts (is_active);

-- Snapshot of every Ceipal job_code the notifier has already seen, so it can
-- diff each poll against this table to find newly-posted jobs. The table is
-- seeded (without emailing anyone) the first time the notifier runs, so
-- existing jobs never trigger a backlog of alert emails.
CREATE TABLE IF NOT EXISTS job_alert_seen_jobs (
  job_code    TEXT PRIMARY KEY,
  first_seen_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_alert_seen_jobs ENABLE ROW LEVEL SECURITY;
