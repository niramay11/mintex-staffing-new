import { z } from "zod";

// Resume text, like a pasted JD, is untrusted free text and is capped the
// same way. Never cached, never indexed, never stored server-side — the
// analysis is generated once per request and handed straight back.
export const RESUME_MAX_CHARS = 15000;

export const GapAnalysisSchema = z.object({
  strengths: z
    .array(z.object({ what: z.string(), how_to_lead_with_it: z.string() }))
    .min(2)
    .max(4),
  gaps: z
    .array(
      z.object({
        requirement: z.string(),
        what_is_missing: z.string(),
        probability: z.enum(["high", "medium", "low"]),
        how_to_address: z.string(),
      })
    )
    .max(8),
  likely_probes: z
    .array(z.object({ observation: z.string(), how_to_handle: z.string() }))
    .max(6),
  // ids referencing InterviewQuestion.id from the kit this analysis was run
  // against — not embedded question text, so nothing here goes stale if the
  // kit's wording changes.
  questions_most_likely_for_you: z
    .array(z.object({ question_id: z.string(), why: z.string() }))
    .max(5),
});

export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

// Absolute privacy backstop, matched against the WHOLE serialized output —
// not a prompt instruction (those are unreliable), a hard structural check.
// A resume-derived page/response leaking a name, phone number, or SSN is a
// materially different category of failure than a mediocre interview
// question, so this fails closed: discard the output entirely, never
// display a partially-redacted version.
const PII_PATTERNS = {
  email: /[\w.+-]+@[\w-]+\.[\w.]+/,
  phone: /(\+?\d[\d\s().-]{9,}\d)/,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/,
};

export function findPII(text: string): string[] {
  const hits: string[] = [];
  for (const [name, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) hits.push(name);
  }
  return hits;
}
