-- Optional author bio fields for /insights posts (E-E-A-T: named, credentialed
-- authors instead of a bare name string). Nullable and additive — existing
-- posts keep working unchanged; the "About the author" card on a post only
-- renders once author_bio is filled in via the admin panel.
ALTER TABLE insights ADD COLUMN IF NOT EXISTS author_title TEXT;
ALTER TABLE insights ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE insights ADD COLUMN IF NOT EXISTS author_photo_url TEXT;
