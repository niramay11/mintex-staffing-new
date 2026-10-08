-- Two more optional fields for the Marketing "Industry Rewrite" copy. Both
-- nullable — an industry with them empty renders exactly as before.
--
--   seo_title    exact <title> text (brand included); falls back to hero_title
--                plus the usual " | Mintex Staffing" suffix
--   short_name   lowercase name used inside headings ("Open {short_name}
--                roles"); falls back to name minus its trailing "Staffing"
ALTER TABLE industries ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS short_name TEXT;
