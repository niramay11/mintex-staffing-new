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

// Named source for a legal claim — never a pinpoint statute section (those
// are easy to get subtly wrong and need a lawyer to check), just the
// recognizable act name a reader could look up themselves. url is left
// empty until independently verified; see legalRights.ts.
export const SourceSchema = z.object({
  label: z.string(),
  url: z.string(),
});

// Renamed from v1's `ask_instead` (which told an interviewer what to ask
// instead) to `how_to_respond` — a candidate can't rewrite the interviewer's
// question, they can only redirect their own answer toward the legitimate
// requirement. Per plan_1.md §5.2: calm and practical, never tells the
// candidate to confront the interviewer.
//
// `lawful_alternative` is the employer-facing counterpart — "don't ask
// this" is half an answer for a hiring manager, the lawful rephrasing that
// gets the same legitimate information is the other half. Both fields are
// always populated by the verified dataset (legalRights.ts), never by the
// model; the candidate view shows how_to_respond, the employer view shows
// lawful_alternative.
export const CannotBeAskedSchema = z.object({
  question: z.string(),
  why: z.string(),
  how_to_respond: z.string(),
  lawful_alternative: z.string(),
  source: SourceSchema,
});

export const StateSpecificNoteSchema = z.object({
  text: z.string(),
  source: SourceSchema,
});

// Distinct from cannot_be_asked: things a candidate commonly BELIEVES are
// illegal but aren't ("Are you legally authorized to work?" is not just
// legal, it's usually required). Reduces false anxiety instead of adding
// to the "everything might be a violation" pile — a different failure mode
// than the prohibited-questions list, so it gets its own category rather
// than a caveat bolted onto that one.
export const LegallyConfusedSchema = z.object({
  question: z.string(),
  why: z.string(),
  guidance: z.string(),
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
  your_rights: z.object({
    cannot_be_asked: z.array(CannotBeAskedSchema).max(8),
    state_specific: z.array(StateSpecificNoteSchema).max(6),
    legally_confused: z.array(LegallyConfusedSchema).max(4),
  }),
  prep: z.object({
    star_prompts: z.array(z.string()).min(1).max(5),
    questions_to_ask_them: z.array(z.string()).min(2).max(6),
    likely_skills_tests: z.array(z.string()).max(4),
  }),
  // JD path only: maps each mustHaveSkill from the extracted job description
  // to the question ids that probe it, so the candidate can see nothing in
  // the JD went unaddressed. Absent on the public (title-only) path.
  coverage: z.record(z.string(), z.array(z.string())).optional(),
});

export type InterviewKit = z.infer<typeof InterviewKitSchema>;
export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type CannotBeAsked = z.infer<typeof CannotBeAskedSchema>;
export type StateSpecificNote = z.infer<typeof StateSpecificNoteSchema>;
export type LegallyConfused = z.infer<typeof LegallyConfusedSchema>;
export type Source = z.infer<typeof SourceSchema>;

export interface GenerateKitInput {
  jobTitle: string;
  industryName: string;
  seniority: (typeof SENIORITIES)[number];
  state: (typeof US_STATES)[number];
  focus?: string;
  // JD path only (see jdGenerate.ts): facts extracted from a real job
  // posting. Absent on the public, title-only path — the model is never
  // grounded in specifics it can't actually know there.
  namedTools?: string[];
  mustHaveSkills?: string[];
}
