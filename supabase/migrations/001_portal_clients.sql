-- Client accounts for the portal
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  company         TEXT,
  ceipal_client_name TEXT,            -- client name as it appears in CEIPAL (for filtering placements)
  allowed_job_codes  TEXT[] DEFAULT '{}', -- CEIPAL job codes this client can see
  permissions     JSONB DEFAULT '{
    "show_bill_rate": false,
    "show_pay_rate": false,
    "show_candidate_contact": true,
    "show_candidate_resume": true,
    "show_job_salary": false
  }'::jsonb,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Portal session tokens (replaces JWT dependency)
CREATE TABLE IF NOT EXISTS client_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on clients
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
