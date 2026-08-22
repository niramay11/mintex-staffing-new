-- Permanent, code-addressable snapshots of a Hiring Cost Calculator result,
-- created when a visitor clicks "Save these numbers". Unlike the older
-- share-link format (numbers packed into a URL fragment, never touching the
-- server), this table lets the same short link keep working from any device
-- forever, independent of the calculator's own formulas ever changing later.
-- Read/written only via the service-role key in /api/hiring-cost-calculator/save
-- and the saved-results page — no public SELECT policy; the short `code`
-- itself is the access control (a capability link), same model as the
-- job-alert unsubscribe token.
CREATE TABLE IF NOT EXISTS calculator_saved_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  mode            TEXT NOT NULL,
  heading         TEXT NOT NULL,
  headline_label  TEXT NOT NULL,
  headline_value  TEXT NOT NULL,
  lines           JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calculator_saved_results ENABLE ROW LEVEL SECURITY;
