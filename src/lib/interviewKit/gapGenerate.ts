import type { InterviewKit } from "./schema";
import { GapAnalysisSchema, RESUME_MAX_CHARS, findPII, type GapAnalysis } from "./gapSchema";
import { buildGapAnalysisPrompt, buildGapAnalysisRepairPrompt, type GapAnalysisContext } from "./gapPrompt";
import { generateWithSchema, KitGenerationError } from "./aiClient";

export { KitGenerationError, RESUME_MAX_CHARS };

export async function generateGapAnalysis(
  resumeText: string,
  kit: InterviewKit,
  context?: GapAnalysisContext
): Promise<GapAnalysis> {
  if (!resumeText.trim()) {
    throw new KitGenerationError("Paste your resume text.", 400);
  }
  if (resumeText.length > RESUME_MAX_CHARS) {
    throw new KitGenerationError(
      `That's too long (${resumeText.length} characters, max ${RESUME_MAX_CHARS}).`,
      400
    );
  }

  const prompt = buildGapAnalysisPrompt(resumeText, kit, context);
  const analysis = await generateWithSchema(GapAnalysisSchema, prompt, buildGapAnalysisRepairPrompt, "gap analysis");

  // Hard fail, not degrade — a resume-derived response leaking a name, phone
  // number, or SSN is a materially different category of problem than a
  // mediocre interview question. Discard entirely rather than attempt to
  // redact and serve a partial result.
  const piiHits = findPII(JSON.stringify(analysis));
  if (piiHits.length > 0) {
    console.error("Gap analysis discarded — PII detected in output:", piiHits);
    throw new KitGenerationError(
      "That result was discarded because it may have contained personal information from your resume. Nothing was saved. Please try again.",
      500
    );
  }

  return analysis;
}
