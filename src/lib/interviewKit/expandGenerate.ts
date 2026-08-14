import { z } from "zod";
import { InterviewQuestionSchema, type InterviewKit, type InterviewQuestion } from "./schema";
import { buildExpansionPrompt, buildExpansionRepairPrompt, FIXED_EXPANSION_AXES, type ExpansionAxis } from "./expandPrompt";
import { generateWithSchema, KitGenerationError } from "./aiClient";
import { scanContentIssues, hashQuestion } from "./validator";

export { KitGenerationError };

const ExpansionResultSchema = z.object({
  questions: z.array(InterviewQuestionSchema).length(4),
});

export function parseExpansionAxis(raw: string, kit: InterviewKit): ExpansionAxis | null {
  if ((FIXED_EXPANSION_AXES as readonly string[]).includes(raw)) return raw as ExpansionAxis;
  if (raw.startsWith("competency:")) {
    const name = raw.slice("competency:".length);
    const exists = kit.competency_map.some((c) => c.competency === name);
    return exists ? (raw as ExpansionAxis) : null;
  }
  if (raw.startsWith("stage:")) {
    const stage = raw.slice("stage:".length);
    const exists = kit.sections.some((s) => s.stage === stage);
    return exists ? (raw as ExpansionAxis) : null;
  }
  return null;
}

function validateExpansion(
  questions: InterviewQuestion[],
  existingHashes: Set<string>,
  path: "public" | "jd",
  industryName: string
): string[] {
  const errors: string[] = [];
  const seenNew = new Map<string, string>();

  for (const q of questions) {
    const hash = hashQuestion(q.question);
    if (existingHashes.has(hash)) errors.push(`"${q.id}" duplicates a question already in the kit`);
    const priorNew = seenNew.get(hash);
    if (priorNew) errors.push(`"${q.id}" duplicates new question "${priorNew}"`);
    else seenNew.set(hash, q.id);
  }

  const text = questions
    .map((q) => [q.question, q.subtext, ...q.what_strong_looks_like, ...q.what_weak_looks_like, ...q.follow_up_probes].join(" "))
    .join(" \n ");
  errors.push(...scanContentIssues(text, { path, industryName }));

  return errors;
}

/**
 * The "+" button. One targeted repair on failure, same policy as the base
 * kit — but unlike the base kit, there's no "nothing to fall back to"
 * failure mode worth blocking on: a duplicate question slipping through is
 * annoying, not harmful, so the best-effort result is still returned even
 * if the repair attempt doesn't fully clear every issue.
 */
export async function expandKit(
  kit: InterviewKit,
  axis: ExpansionAxis,
  path: "public" | "jd"
): Promise<InterviewQuestion[]> {
  const existingHashes = new Set(kit.sections.flatMap((s) => s.questions.map((q) => hashQuestion(q.question))));
  const industryName = kit.role.industry;

  // generateWithSchema's own internal retry is for SCHEMA-shape failures
  // and expects a single validationError string; buildExpansionRepairPrompt
  // takes a list (reused below for the CONTENT-validation repair too), so
  // it's wrapped here for that narrower use.
  const schemaRepairPrompt = (previousOutput: string, validationError: string) =>
    buildExpansionRepairPrompt(previousOutput, [validationError]);

  const prompt = buildExpansionPrompt(kit, axis);
  const first = await generateWithSchema(ExpansionResultSchema, prompt, schemaRepairPrompt, "kit expansion");

  const errors = validateExpansion(first.questions, existingHashes, path, industryName);
  if (errors.length === 0) return first.questions;

  console.error("Kit expansion failed content validation (attempt 1):", errors);
  const repairPrompt = buildExpansionRepairPrompt(JSON.stringify(first), errors);
  const repaired = await generateWithSchema(ExpansionResultSchema, repairPrompt, schemaRepairPrompt, "kit expansion (repair)");

  const remainingErrors = validateExpansion(repaired.questions, existingHashes, path, industryName);
  if (remainingErrors.length > 0) {
    console.error("Kit expansion still failed content validation after repair:", remainingErrors);
  }

  return repaired.questions;
}
