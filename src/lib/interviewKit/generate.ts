import { InterviewKitSchema, type GenerateKitInput, type InterviewKit } from "./schema";
import { buildKitPrompt, buildRepairPrompt } from "./prompt";
import { getVerifiedRights } from "./legalRights";
import { generateWithSchema, KitGenerationError } from "./aiClient";

export { KitGenerationError };

// The model is instructed (see prompt.ts rule 7) to leave your_rights empty
// rather than invent legal content. This is where the real, verified data
// actually gets attached — kept separate from the AI call so a schema retry
// never accidentally regenerates legal content. Exported for reuse by the
// JD path (jdGenerate.ts), which needs the exact same injection.
export function withVerifiedRights(kit: InterviewKit): InterviewKit {
  const verified = getVerifiedRights(kit.region.state);
  return {
    ...kit,
    your_rights: {
      cannot_be_asked: verified.cannot_be_asked,
      state_specific: verified.state_specific,
    },
  };
}

export async function generateInterviewKit(input: GenerateKitInput): Promise<InterviewKit> {
  const prompt = buildKitPrompt(input);
  const kit = await generateWithSchema(
    InterviewKitSchema,
    prompt,
    (previousOutput, validationError) => buildRepairPrompt(previousOutput, validationError),
    "interview kit"
  );
  return withVerifiedRights(kit);
}
