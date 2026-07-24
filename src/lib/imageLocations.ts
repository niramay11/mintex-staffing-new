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

export type ImageLocation = {
  locationKey: string;
  pageName: string;
  sectionName: string;
  defaultSrc: string;
};

export const IMAGE_LOCATIONS: ImageLocation[] = [
  // Global — shared chrome, intentionally one instance site-wide
  { locationKey: "global:header-logo-mark",  pageName: "Global", sectionName: "Header Logo (mobile mark)", defaultSrc: "/logo-mark-navy.png" },
  { locationKey: "global:header-logo",       pageName: "Global", sectionName: "Header Logo (desktop)",     defaultSrc: "/logo-navy.png" },
  { locationKey: "global:footer-logo",       pageName: "Global", sectionName: "Footer Logo",               defaultSrc: "/logo-white.png" },
  { locationKey: "global:navy-section-mark", pageName: "Global", sectionName: "Decorative Navy Mark",      defaultSrc: "/mintex-m.svg" },

  { locationKey: "client-portal:header-logo", pageName: "Client Portal", sectionName: "Header Logo", defaultSrc: "/logo-navy.png" },

  // Home
  { locationKey: "home:hero-banner",        pageName: "Home", sectionName: "Hero Banner",                defaultSrc: "/hero-office-3.png" },
  { locationKey: "home:industries-mark",    pageName: "Home", sectionName: "Industries Decorative Mark", defaultSrc: "/mintex-m-navy.svg" },
  { locationKey: "home:industries-collage", pageName: "Home", sectionName: "Industries Collage",         defaultSrc: "/collage-2.webp" },

  // About
  { locationKey: "about:hero-visual",  pageName: "About", sectionName: "Hero Visual",       defaultSrc: "/about.png" },
  { locationKey: "about:story-visual", pageName: "About", sectionName: "Our Story Visual",  defaultSrc: "/interview-handshake.jpg" },

  // Get Hired
  { locationKey: "get-hired:hero-visual", pageName: "Get Hired", sectionName: "Hero Visual", defaultSrc: "/collage-1.webp" },

  // Share Resume
  { locationKey: "share-resume:hero-visual", pageName: "Share Resume", sectionName: "Hero Visual", defaultSrc: "/collage-3.webp" },

  // Seek Talent (index)
  { locationKey: "seek-talent:hero-visual",         pageName: "Seek Talent", sectionName: "Hero Visual",              defaultSrc: "/interview-handshake.jpg" },
  { locationKey: "seek-talent:cta-visual",          pageName: "Seek Talent", sectionName: "“How can we help” Visual", defaultSrc: "/hero-office-3.png" },

  // Seek Talent — How We Work
  { locationKey: "seek-talent:how-we-work-visual", pageName: "Seek Talent", sectionName: "How We Work Visual", defaultSrc: "/collage-2.webp" },

  // Seek Talent — templated service pages, one row per point image + one for the contact-form visual
  ...hiringServices.flatMap((service) => [
    ...service.points.map((point, index) => ({
      locationKey: `seek-talent-service:${service.slug}:point-${index + 1}-visual`,
      pageName: "Seek Talent Services",
      sectionName: `${service.name} — Point ${index + 1}: ${point.title}`,
      defaultSrc: "/hero-office.webp",
    })),
    {
      locationKey: `seek-talent-service:${service.slug}:recruiter-visual`,
      pageName: "Seek Talent Services",
      sectionName: `${service.name} — Recruiter Visual`,
      defaultSrc: "/interview-confident.jpg",
    },
  ]),

  // Resources
  { locationKey: "resources:hiring-cost-card",      pageName: "Resources", sectionName: "Hiring Cost Calculator Card",     defaultSrc: "/hero-office.webp" },
  { locationKey: "resources:ai-interview-card",     pageName: "Resources", sectionName: "AI Interview Generator Card",     defaultSrc: "/interview-confident.jpg" },

  // AI Interview Generator
  { locationKey: "ai-interview-generator:handshake-visual", pageName: "AI Interview Generator", sectionName: "Handshake Visual", defaultSrc: "/interview-handshake.jpg" },
  { locationKey: "ai-interview-generator:confident-visual", pageName: "AI Interview Generator", sectionName: "Confident Visual", defaultSrc: "/interview-confident.jpg" },
  { locationKey: "ai-interview-generator:meeting-visual",   pageName: "AI Interview Generator", sectionName: "Meeting Visual",   defaultSrc: "/interview-meeting.jpg" },
];
