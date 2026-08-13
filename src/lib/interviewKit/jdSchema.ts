import { z } from "zod";

// JDs longer than this are almost always a whole careers page pasted in
// rather than a single posting — reject rather than truncate silently.
export const JD_MAX_CHARS = 15000;

// Extraction runs first and separately from generation (see jdPrompt.ts) —
// cheap, and it keeps the untrusted pasted text out of the generation
// prompt entirely. `suspiciousContent` surfaces anything in the JD that
// reads as an instruction to the model rather than job-posting content
// (prompt injection); extraction still completes around it rather than
// blocking the user, since most hits are boilerplate legalese, not attacks.
export const JobDescriptionExtractionSchema = z.object({
  jobTitle: z.string().min(1),
  industry: z.string().nullable(),
  employerName: z.string().nullable(),
  namedTools: z.array(z.string()).max(20),
  mustHaveSkills: z.array(z.string()).max(15),
  niceToHaveSkills: z.array(z.string()).max(10),
  responsibilities: z.array(z.string()).max(15),
  statedValues: z.array(z.string()).max(10),
  suspiciousContent: z.string().nullable(),
});

export type JobDescriptionExtraction = z.infer<typeof JobDescriptionExtractionSchema>;
