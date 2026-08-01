// Row shape from the `industries` Supabase table (admin-managed via /api/admin/industries).
export interface Industry {
  id: string;
  slug: string;
  name: string;
  heroTitle: string;
  seoSubheading: string;
  intro: string;
  sectorInsight: {
    title: string;
    body: string;
  };
  workStyle: string;
  // Keywords matched against a live Ceipal job's title + skills text to decide
  // whether it belongs on this industry's page. Deliberately NOT matched
  // against Ceipal's `industry` field — that field records the hiring
  // CLIENT's business sector, not the job's function (confirmed live: a
  // "Senior Software Engineer" role came through tagged "Healthcare" because
  // the client company is a healthcare business), so it would misclassify
  // real jobs. Title/skills text reflects what the role actually is.
  jobKeywords: string[];
  faqs: { question: string; answer: string }[];
  // Deeper, vertical-specific prose sections (Action Plan Item 13) — each
  // grounded in facts already stated elsewhere on the site (avg. time to
  // hire, engagement models, etc.), not invented statistics.
  typicalRoles: string;
  vettingProcess: string;
  marketContext: string;
  engagementModels: string;
  sortOrder: number;
  // Small stat cards (e.g. "1,200+ IT placements made") — the first one is
  // shown on the homepage card, all of them on the industry's own page.
  stats: { label: string; value: string }[];
}

// Row shape from the `insight_categories` Supabase table (admin-managed via /api/insight-categories).
export interface InsightCategoryRow {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
}

// Row shape from the `insights` Supabase table (admin-managed via /api/admin/insights).
// `category` is a free-form slug matching an InsightCategoryRow, not a fixed enum.
export interface InsightPost {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  published_at: string;
  author: string;
  image_url: string | null;
  author_title: string | null;
  author_bio: string | null;
  author_photo_url: string | null;
}

// Row shape from the `team_members` Supabase table (admin-managed via /api/admin/team-members).
export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  sort_order: number;
}

export type CaseStudyType = "client" | "candidate" | "other";

// Row shape from the `case_studies` Supabase table (admin-managed via /api/admin/case-studies).
export interface CaseStudy {
  id: string;
  type: CaseStudyType;
  title: string;
  quote: string;
  author: string;
  role: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
}

export interface InterviewQuestionSet {
  industrySlug: string;
  roleLevel: "Entry" | "Mid" | "Senior";
  questions: string[];
}
