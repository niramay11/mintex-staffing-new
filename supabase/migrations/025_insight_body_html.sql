-- Rich-text body for /insights posts, authored via a real editor (Tiptap) in
-- the admin panel instead of the old plain-text convention system (short
-- line = heading, "-> " = CTA button, etc.). Nullable and additive — posts
-- written before this column existed keep rendering through the legacy
-- paragraph-array path; a post only switches to rich rendering once it has
-- non-empty body_html.
ALTER TABLE insights ADD COLUMN IF NOT EXISTS body_html TEXT;
