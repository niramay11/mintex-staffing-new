// Pure data — only imports plain content data (no supabase.ts), so this stays
// safe to bundle into client components (e.g. the admin panel) without pulling
// in supabase.ts's server-only supabaseAdmin client (see memory:
// mintex-supabase-admin-client-bundle-gotcha for why that matters).
//
// Every real <Image> call site in the app has its own entry here, keyed by a
// stable locationKey. Where the same file is currently reused across pages,
// each usage still gets its own entry (own locationKey) so they can be
// overridden independently — only their defaultSrc happens to match today.
import { hiringServices } from "@/content/hiringServices";

// What shape/size an uploaded replacement image needs to look right in that
// specific spot. "logo" categories render with object-fit: contain (the
// whole image always shows, no cropping, but a very different real shape
// than the box will show letterboxed) — "photo" categories render with
// object-fit: cover (always fills the box, no letterboxing, but content
// outside the box's shape gets cropped). minWidth/minHeight are the
// resolution below which an image will look visibly soft once stretched up
// to fill its real display size on the page.
export type ImageCategory = "logo-wide" | "logo-mark" | "logo-decorative" | "photo-landscape" | "photo-portrait" | "photo-square";

export const IMAGE_CATEGORY_INFO: Record<
  ImageCategory,
  { label: string; aspect: string; minWidth: number; minHeight: number; fit: "contain" | "cover" }
> = {
  "logo-wide":       { label: "Wide logo",             aspect: "6 / 1", minWidth: 600, minHeight: 100, fit: "contain" },
  "logo-mark":       { label: "Square logo mark",      aspect: "1 / 1", minWidth: 200, minHeight: 200, fit: "contain" },
  // The decorative "M" watermarks are rendered at 784x395 on the real
  // pages (roughly 2:1) — distinct from the much thinner ~7:1 text logo.
  // Reusing "logo-wide"'s box for these left a lot of empty space above and
  // below the mark since its real shape is much closer to a rectangle than
  // a thin strip.
  "logo-decorative": { label: "Decorative mark",       aspect: "2 / 1", minWidth: 600, minHeight: 300, fit: "contain" },
  "photo-landscape": { label: "Wide photo",            aspect: "16 / 9", minWidth: 1600, minHeight: 900,  fit: "cover" },
  "photo-portrait":  { label: "Tall photo",            aspect: "4 / 5",  minWidth: 1000, minHeight: 1250, fit: "cover" },
  "photo-square":    { label: "Square-ish photo",      aspect: "4 / 3",  minWidth: 1000, minHeight: 750,  fit: "cover" },
};

export type ImageLocation = {
  locationKey: string;
  pageName: string;
  sectionName: string;
  defaultSrc: string;
  category: ImageCategory;
};

export const IMAGE_LOCATIONS: ImageLocation[] = [
  // Global — shared chrome, intentionally one instance site-wide
  { locationKey: "global:header-logo-mark",  pageName: "Global", sectionName: "Header Logo (mobile mark)", defaultSrc: "/logo-mark-navy.png", category: "logo-mark" },
  { locationKey: "global:header-logo",       pageName: "Global", sectionName: "Header Logo (desktop)",     defaultSrc: "/logo-navy.png",      category: "logo-wide" },
  { locationKey: "global:footer-logo",       pageName: "Global", sectionName: "Footer Logo",               defaultSrc: "/logo-white.png",     category: "logo-wide" },
  { locationKey: "global:navy-section-mark", pageName: "Global", sectionName: "Decorative Navy Mark",      defaultSrc: "/mintex-m.svg",       category: "logo-decorative" },

  { locationKey: "client-portal:header-logo", pageName: "Client Portal", sectionName: "Header Logo", defaultSrc: "/logo-navy.png", category: "logo-wide" },

  // Home
  { locationKey: "home:hero-banner",        pageName: "Home", sectionName: "Hero Banner",                defaultSrc: "/hero-office-3.png", category: "photo-landscape" },
  { locationKey: "home:industries-mark",    pageName: "Home", sectionName: "Industries Decorative Mark", defaultSrc: "/mintex-m-navy.svg", category: "logo-decorative" },
  { locationKey: "home:industries-collage", pageName: "Home", sectionName: "Industries Collage",         defaultSrc: "/collage-2.webp",    category: "photo-square" },

  // About
  { locationKey: "about:hero-visual",  pageName: "About", sectionName: "Hero Visual",       defaultSrc: "/about.png",              category: "photo-landscape" },
  { locationKey: "about:story-visual", pageName: "About", sectionName: "Our Story Visual",  defaultSrc: "/interview-handshake.jpg", category: "photo-square" },

  // Get Hired
  { locationKey: "get-hired:hero-visual", pageName: "Get Hired", sectionName: "Hero Visual", defaultSrc: "/collage-1.webp", category: "photo-portrait" },

  // Share Resume
  { locationKey: "share-resume:hero-visual", pageName: "Share Resume", sectionName: "Hero Visual", defaultSrc: "/collage-3.webp", category: "photo-portrait" },

  // Seek Talent (index)
  { locationKey: "seek-talent:hero-visual",         pageName: "Seek Talent", sectionName: "Hero Visual",              defaultSrc: "/interview-handshake.jpg", category: "photo-portrait" },
  { locationKey: "seek-talent:cta-visual",          pageName: "Seek Talent", sectionName: "“How can we help” Visual", defaultSrc: "/hero-office-3.png",       category: "photo-square" },

  // Seek Talent — How We Work
  { locationKey: "seek-talent:how-we-work-visual", pageName: "Seek Talent", sectionName: "How We Work Visual", defaultSrc: "/collage-2.webp", category: "photo-portrait" },

  // Seek Talent — Get Started (hiring inquiry form page)
  { locationKey: "seek-talent:get-started-visual", pageName: "Seek Talent", sectionName: "Get Started Visual", defaultSrc: "/interview-confident.jpg", category: "photo-square" },

  // Seek Talent — templated service pages, one row per point image
  ...hiringServices.flatMap((service) =>
    service.points.map((point, index) => ({
      locationKey: `seek-talent-service:${service.slug}:point-${index + 1}-visual`,
      pageName: "Seek Talent Services",
      sectionName: `${service.name} — Point ${index + 1}: ${point.title}`,
      defaultSrc: "/hero-office.webp",
      category: "photo-square" as ImageCategory,
    }))
  ),

  // Resources
  { locationKey: "resources:hiring-cost-card",      pageName: "Resources", sectionName: "Hiring Cost Calculator Card",     defaultSrc: "/hero-office.webp",       category: "photo-portrait" },
  { locationKey: "resources:ai-interview-card",     pageName: "Resources", sectionName: "AI Interview Generator Card",     defaultSrc: "/interview-confident.jpg", category: "photo-portrait" },
  { locationKey: "resources:point-1-visual",        pageName: "Resources", sectionName: "Point 1: Free, practical tools",  defaultSrc: "/hero-office.webp",       category: "photo-square" },
  { locationKey: "resources:point-2-visual",        pageName: "Resources", sectionName: "Point 2: Hiring Cost Calculator", defaultSrc: "/hero-office.webp",       category: "photo-square" },
  { locationKey: "resources:point-3-visual",        pageName: "Resources", sectionName: "Point 3: AI Interview Generator", defaultSrc: "/interview-confident.jpg", category: "photo-square" },
  { locationKey: "resources:point-4-visual",        pageName: "Resources", sectionName: "Point 4: Explore the resources",  defaultSrc: "/interview-handshake.jpg", category: "photo-square" },

  // AI Interview Generator
  { locationKey: "ai-interview-generator:handshake-visual", pageName: "AI Interview Generator", sectionName: "Handshake Visual", defaultSrc: "/interview-handshake.jpg", category: "photo-square" },
  { locationKey: "ai-interview-generator:confident-visual", pageName: "AI Interview Generator", sectionName: "Confident Visual", defaultSrc: "/interview-confident.jpg", category: "photo-square" },
  { locationKey: "ai-interview-generator:meeting-visual",   pageName: "AI Interview Generator", sectionName: "Meeting Visual",   defaultSrc: "/interview-meeting.jpg",   category: "photo-square" },
];
