import { ANSWER_FRAMEWORKS, FOCUS_TYPES, type InterviewKit } from "./schema";

export const FIXED_EXPANSION_AXES = ["more_behavioral", "more_technical", "harder"] as const;
export type FixedExpansionAxis = (typeof FIXED_EXPANSION_AXES)[number];
/** Dynamic axes: `competency:${name}` must match the kit's competency_map;
 * `stage:${stage}` must match one of the kit's own section stages — this is
 * the per-round "+" icon next to a section header, not a cross-cutting axis. */
export type ExpansionAxis = FixedExpansionAxis | `competency:${string}` | `stage:${string}`;

function axisInstruction(axis: ExpansionAxis): string {
  if (axis === "more_behavioral") return `Generate 4 new questions, "type" must be "behavioral" or "situational" only.`;
  if (axis === "more_technical") return `Generate 4 new questions, "type" must be "technical", "case", or "work_sample" only.`;
  if (axis === "harder") return `Generate 4 new questions, "difficulty" must be 4 or 5 (any type).`;
  if (axis.startsWith("stage:")) {
    const stage = axis.slice("stage:".length);
    return `Generate 4 new questions specifically for the "${stage}" round of this kit. Cover a realistic mix of question types and difficulty appropriate for that round — don't skew every question to the same type.`;
  }
  const competency = axis.slice("competency:".length);
  return `Generate 4 new questions, all with "competency" set to exactly "${competency}", each probing it from a different angle (don't write 4 variations of the same probe).`;
}

/**
 * The "+" button — adds 4 questions to an already-generated kit without
 * starting over. Passing every existing question's full text is not
 * optional: without it, a second batch substantially duplicates the
 * first, and this model already shows a strong pull toward the same pivot
 * question across runs.
 */
export function buildExpansionPrompt(kit: InterviewKit, axis: ExpansionAxis): string {
  const existingQuestions = kit.sections.flatMap((s) => s.questions);

  return `You add questions to an existing interview kit. Output JSON only.

ROLE:
  Job title: ${kit.role.title}
  Industry: ${kit.role.industry}
  Seniority: ${kit.role.seniority}
  State: ${kit.region.state}

Competencies available: ${kit.competency_map.map((c) => c.competency).join(", ")}

EVERY QUESTION ALREADY IN THIS KIT (do not repeat or rephrase any of these):
${existingQuestions.map((q) => `- ${q.question}`).join("\n")}

## Hard requirement

Do not repeat or rephrase any existing question above. A reworded duplicate is a
failure. If a candidate question you're about to write overlaps an existing one in
what it actually probes, discard it and write a genuinely different one.

## What to generate

${axisInstruction(axis)}

Same fields as every other question in this kit:
{
  "questions": [
    {
      "id": string (continue numbering after the existing questions, e.g. "q${existingQuestions.length + 1}"),
      "question": string,
      "competency": string,  // must match a competency listed above
      "type": one of ${JSON.stringify(FOCUS_TYPES)},
      "difficulty": integer 1-5,
      "subtext": string,
      "answer_framework": one of ${JSON.stringify(ANSWER_FRAMEWORKS)},
      "what_strong_looks_like": string[],  // 2-5 items
      "what_weak_looks_like": string[],    // 2-5 items
      "follow_up_probes": string[]         // 1-3 items
    }
  ]  // exactly 4 items
}

RULES:
1. Never generate questions touching: age, race, national origin, religion,
   disability or medical history, pregnancy or family plans, marital status,
   sexual orientation, gender identity, citizenship (beyond work authorization),
   prior salary, criminal history, or credit history.
2. Do not use first-person-company possessives ("our team", "we use", etc.) unless
   this kit was built from a specific job posting that actually named those facts.
3. Output ONLY the { "questions": [...] } object. No prose, no markdown fences,
   no other top-level fields.`;
}

export function buildExpansionRepairPrompt(previousOutput: string, errors: string[]): string {
  return `Your previous JSON output has problems:

${errors.map((e) => `- ${e}`).join("\n")}

Here is what you produced:
${previousOutput}

Return a corrected version — exactly 4 questions, fixing only the issues listed
above. Output ONLY { "questions": [...] }, no prose, no markdown fences.`;
}
