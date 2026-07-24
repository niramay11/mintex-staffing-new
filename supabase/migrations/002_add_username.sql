ALTER TABLE clients ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ceipal_id TEXT;

-- make email optional (username is the login identifier now)
ALTER TABLE clients ALTER COLUMN email DROP NOT NULL;
