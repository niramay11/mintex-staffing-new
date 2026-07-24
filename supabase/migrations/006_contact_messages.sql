-- Messages submitted through the public Contact Us form.
-- Read/written only via the service-role key in the /api/contact and
-- /api/admin/messages routes — no public SELECT policy.
CREATE TABLE IF NOT EXISTS contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  phone       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
