import { InterviewKitSchema, type GenerateKitInput, type InterviewKit } from "./schema";
import { buildKitPrompt, buildRepairPrompt } from "./prompt";
import { getVerifiedRights } from "./legalRights";
import { generateWithSchema, KitGenerationError } from "./aiClient";
import { validateKit, buildValidatorRepairPrompt } from "./validator";
import { buildLastGoodKitKey, saveLastGoodKit, getLastGoodKit } from "./lastGoodKit";

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
      legally_confused: verified.legally_confused,
    },
  };
}

export async function generateInterviewKit(input: GenerateKitInput): Promise<InterviewKit> {
  const cacheKey = buildLastGoodKitKey(input);

  const prompt = buildKitPrompt(input);
  const first = await generateWithSchema(InterviewKitSchema, prompt, buildRepairPrompt, "interview kit");

  const validateOptions = { path: "public" as const, industryName: input.industryName, focus: input.focus };
  const validationErrors = validateKit(first, validateOptions);

  if (validationErrors.length === 0) {
    const kit = withVerifiedRights(first);
    saveLastGoodKit(cacheKey, kit).catch(() => {});
    return kit;
  }

  // Schema was valid but the CONTENT wasn't — a possessive slipped through,
  // a vendor got invented, etc. One targeted repair, same policy as schema
  // errors: fail one check -> repair, not full regeneration.
  console.error("Interview kit failed content validation (attempt 1):", validationErrors);
  const repairPrompt = buildValidatorRepairPrompt(JSON.stringify(first), validationErrors);
  const repaired = await generateWithSchema(InterviewKitSchema, repairPrompt, buildRepairPrompt, "interview kit (validator repair)");

  const remainingErrors = validateKit(repaired, validateOptions);
  if (remainingErrors.length === 0) {
    const kit = withVerifiedRights(repaired);
    saveLastGoodKit(cacheKey, kit).catch(() => {});
    return kit;
  }

  // Failed twice. A slightly stale but clean kit beats serving one with a
  // known content problem — fall back to whatever last generated cleanly
  // for this exact role, if anything ever has.
  console.error("Interview kit still failed content validation after repair:", remainingErrors);
  const lastGood = await getLastGoodKit(cacheKey).catch(() => null);
  if (lastGood) {
    console.error("Serving last known-good kit instead for:", cacheKey);
    return lastGood;
  }

  // Nothing to fall back to (first-ever generation for this role) — serve
  // the flawed result rather than block the visitor entirely.
  return withVerifiedRights(repaired);
}
