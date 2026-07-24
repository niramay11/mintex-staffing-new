export type JobType = "Contract" | "Permanent" | "Executive" | "Temp-to-Hire";

export interface Job {
  id: string;
  title: string;
  industrySlug: string;
  location: string;
  type: JobType;
  salaryRange: string;
  postedAt: string;
  summary: string;
}

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
