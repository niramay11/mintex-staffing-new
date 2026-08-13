import { InterviewKitSchema, type GenerateKitInput, type InterviewKit } from "./schema";
import { JobDescriptionExtractionSchema, JD_MAX_CHARS, type JobDescriptionExtraction } from "./jdSchema";
import {
  buildExtractionPrompt,
  buildExtractionRepairPrompt,
  buildJdKitPrompt,
  buildJdKitRepairPrompt,
} from "./jdPrompt";
import { generateWithSchema, KitGenerationError } from "./aiClient";
import { withVerifiedRights } from "./generate";
import { applySuppression } from "./feedback";

export { KitGenerationError, JD_MAX_CHARS };

// Private path: never cached, never indexed. Every pasted JD is unique, so
// there's no cache key to hit anyway (see cache.ts's approach, which only
// makes sense for the finite, repeatable public title/state/seniority/focus
// combinations).
export async function extractJobDescription(rawJobDescription: string): Promise<JobDescriptionExtraction> {
  const prompt = buildExtractionPrompt(rawJobDescription);
  return generateWithSchema(JobDescriptionExtractionSchema, prompt, buildExtractionRepairPrompt, "JD extraction");
}

export async function generateJdInterviewKit(
  rawJobDescription: string,
  input: Omit<GenerateKitInput, "jobTitle" | "industryName">
): Promise<{ kit: InterviewKit; extraction: JobDescriptionExtraction }> {
  if (!rawJobDescription.trim()) {
    throw new KitGenerationError("Paste the job description text.", 400);
  }
  if (rawJobDescription.length > JD_MAX_CHARS) {
    throw new KitGenerationError(
      `That's too long (${rawJobDescription.length} characters, max ${JD_MAX_CHARS}) — paste just the job posting, not a whole careers page.`,
      400
    );
  }

  const extraction = await extractJobDescription(rawJobDescription);

  const kitInput: GenerateKitInput = {
    ...input,
    jobTitle: extraction.jobTitle,
    industryName: extraction.industry ?? "Not specified",
    namedTools: extraction.namedTools,
    mustHaveSkills: extraction.mustHaveSkills,
  };

  const prompt = buildJdKitPrompt(extraction, kitInput);
  const kit = await generateWithSchema(InterviewKitSchema, prompt, buildJdKitRepairPrompt, "JD interview kit");
  const withRights = withVerifiedRights(kit);
  const suppressed = await applySuppression(withRights).catch(() => withRights);

  return { kit: suppressed, extraction };
}
