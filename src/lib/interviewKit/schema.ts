import { z } from "zod";

// Kit schema — v2 subset of the full spec (plan_1.md). Candidate-only framing:
// no employer-facing fields (dropped `red_flags`, renamed the rubric and
// compliance sections to read from the candidate's point of view). Still
// missing the pieces that need real external data we haven't wired up yet —
// O*NET grounding, BLS wages, CareerOneStop licensing, and the harvested
// `sourced_questions` — those stay out until that data exists rather than
// faking them (see plan_1.md §2.2's "honest degradation" rule).

export const FOCUS_TYPES = [
  "screening",
  "technical",
  "process",
  "behavioral",
  "situational",
  "competency",
  "culture",
  "motivation",
  "logistics",
  "safety",
  "case",
  "stress",
  "leadership",
  "stakeholder",
  "work_sample",
] as const;

export const ANSWER_FRAMEWORKS = ["star", "car", "soar", "process", "direct", "case"] as const;
export const INTERVIEW_STAGES = ["phone_screen", "technical", "panel", "final"] as const;
export const SENIORITIES = ["entry", "mid", "senior"] as const;

// 50 states + DC. No metro/CBSA breakdown yet — that needs real BLS metro
// data (plan_1.md §2.2 system #1), so the region layer is state-only for now.
export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
] as const;

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(8),
  competency: z.string(),
  type: z.enum(FOCUS_TYPES),
  difficulty: z.number().int().min(1).max(5),
  subtext: z.string().describe("One line decoding what the interviewer is really checking for."),
  answer_framework: z.enum(ANSWER_FRAMEWORKS),
  what_strong_looks_like: z.array(z.string()).min(2).max(5),
  what_weak_looks_like: z.array(z.string()).min(2).max(5),
  follow_up_probes: z.array(z.string()).min(1).max(3),
});

export const InterviewSectionSchema = z.object({
  stage: z.enum(INTERVIEW_STAGES),
  duration_minutes: z.number().int().positive(),
  questions: z.array(InterviewQuestionSchema).min(1),
});

export const CompetencySchema = z.object({
  competency: z.string(),
  why_it_matters: z.string(),
  weight: z.enum(["critical", "important", "nice-to-have"]),
});

// Renamed from v1's `ask_instead` (which told an interviewer what to ask
// instead) to `how_to_respond` — a candidate can't rewrite the interviewer's
// question, they can only redirect their own answer toward the legitimate
// requirement. Per plan_1.md §5.2: calm and practical, never tells the
// candidate to confront the interviewer.
export const CannotBeAskedSchema = z.object({
  question: z.string(),
  why: z.string(),
  how_to_respond: z.string(),
});

export const InterviewKitSchema = z.object({
  role: z.object({
    title: z.string(),
    seniority: z.enum(SENIORITIES),
    industry: z.string(),
    summary: z.string(),
  }),
  region: z.object({
    state: z.enum(US_STATES),
  }),
  competency_map: z.array(CompetencySchema).min(3).max(10),
  sections: z.array(InterviewSectionSchema).min(1),
  how_youll_be_scored: z.object({
    scale: z.literal(5),
    anchors: z.object({ "1": z.string(), "3": z.string(), "5": z.string() }),
    dimensions: z.array(z.string()).min(2).max(6),
  }),
  your_rights: z.object({
    cannot_be_asked: z.array(CannotBeAskedSchema).max(5),
    state_specific: z.array(z.string()).max(6),
  }),
  prep: z.object({
    star_prompts: z.array(z.string()).min(1).max(5),
    questions_to_ask_them: z.array(z.string()).min(2).max(6),
    likely_skills_tests: z.array(z.string()).max(4),
  }),
});

export type InterviewKit = z.infer<typeof InterviewKitSchema>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;

export interface GenerateKitInput {
  jobTitle: string;
  industryName: string;
  seniority: (typeof SENIORITIES)[number];
  state: (typeof US_STATES)[number];
  focus?: string;
}
