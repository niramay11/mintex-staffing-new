-- Merges the separate "Industry Stats" admin tab (previously a JSON file in
-- Supabase Storage, matched to an industry only by a loose slug string) into
-- the industries table itself, so an industry's numbers live and get edited
-- in the same place as its content. Purely additive — existing rows and
-- columns are untouched; a follow-up script copies today's live numbers into
-- this new column before the old storage file and its code path are removed.
ALTER TABLE industries ADD COLUMN IF NOT EXISTS stats JSONB NOT NULL DEFAULT '[]';
