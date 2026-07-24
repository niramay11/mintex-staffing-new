-- Inquiries submitted through the "Connect with our experts" hiring inquiry form
-- (HiringInquiryForm.tsx) on the Seek Talent service pages.
-- preferred_contact is how the requester wants to be reached back ("phone" or
-- "email"). An admin accepts the inquiry via /api/admin/hiring-inquiries/[id]
-- (accepted_at set, requester emailed that their conversation was accepted).
-- Read/written only via the service-role key in /api/hiring-inquiries and
-- /api/admin/hiring-inquiries — no public SELECT policy.
CREATE TABLE IF NOT EXISTS hiring_inquiries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title          TEXT NOT NULL,
  zip_code           TEXT NOT NULL,
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT NOT NULL,
  company            TEXT NOT NULL,
  position           TEXT NOT NULL,
  preferred_contact  TEXT NOT NULL CHECK (preferred_contact IN ('phone', 'email')),
  accepted_at        TIMESTAMPTZ,
  is_read            BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hiring_inquiries ENABLE ROW LEVEL SECURITY;
