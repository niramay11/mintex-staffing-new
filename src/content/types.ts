export interface Industry {
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
