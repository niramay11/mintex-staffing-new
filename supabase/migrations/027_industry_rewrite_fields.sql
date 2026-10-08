-- Fields the Marketing "Industry Rewrite" copy needs that the industry page
-- template couldn't show before. All nullable/optional — an industry with
-- these left empty renders exactly as it did before this migration.
--
--   meta_description    <meta name="description">; falls back to seo_subheading
--   cta_label           hero/closing button text; falls back to "Hire {name} Talent"
--   intro_heading       H2 over the intro paragraph (featured-snippet target)
--   closing_cta_title   closing CTA section heading; section hidden when empty
--   closing_cta_body    closing CTA section text
ALTER TABLE industries ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS cta_label TEXT;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS intro_heading TEXT;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS closing_cta_title TEXT;
ALTER TABLE industries ADD COLUMN IF NOT EXISTS closing_cta_body TEXT;

-- Ties a testimonial to one industry page. An industry page shows only its
-- own tagged testimonials; one with none tagged keeps showing all of them.
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS industry_slug TEXT;
