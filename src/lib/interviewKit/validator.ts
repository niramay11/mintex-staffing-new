import crypto from "node:crypto";
import type { InterviewKit } from "./schema";
import { FOCUS_QUOTAS } from "./promptFragments";
import { normaliseForHash } from "./textNormalize";

// Hashes independently rather than importing feedback.ts's hashQuestion —
// that module pulls in the Supabase admin client, and this validator has
// no reason to depend on that just to hash a string. Kept deliberately
// small and dependency-free (see textNormalize.ts's own reasoning: one
// accidental import chain into a Supabase/API-key-reading module already
// broke a client bundle once). Exported for reuse by expandGenerate.ts,
// which needs to check new questions against the existing kit's questions.
export function hashQuestion(text: string): string {
  return crypto.createHash("sha256").update(normaliseForHash(text)).digest("hex");
}

// Runs AFTER generation, on every path, before the kit is ever cached or
// shown. Prompts drift between runs — my own test generating a Marketing
// Manager kit produced "our primary CRM" despite the prompt explicitly
// banning employer possessives — so this is the actual enforcement, not
// the prompt text alone.

// "our" is caught unconditionally, whatever noun follows it — a real test
// caught "our lead conversion rate" slipping through an earlier word-list
// version of this check ("lead" wasn't on the list). There's no legitimate
// use of "our" on the public path: the candidate is always addressed as
// "you", and the employer is unknown, so "our anything" always asserts a
// fact the model doesn't have. "we" is narrower — generic hiring-manager
// voice ("we'd like to know...") is fine, only specific factual claims
// ("we use X", "we currently Y") are banned.
const EMPLOYER_POSSESSIVE = [
  /\bour\b/i,
  /\bwe (use|currently|value|prioriti[sz]e)\b/i,
  /\bthis (company|firm|agency)'s\b/i,
];

// The defect that silently corrupted every sample output in the original
// design doc — the model assuming the EMPLOYER is a staffing/recruiting
// firm just because this tool happens to be built by one.
const STAFFING_LEAK = /\b(staffing|recruiting) (firm|agency|industry|model)\b/i;

const UNPROMPTED_VENDORS =
  /\b(HubSpot|Bullhorn|Salesforce|Workday|Greenhouse|Lever|Marketo|Pardot|Zendesk|ServiceNow|SAP|Oracle NetSuite)\b/i;

const LEGAL_LEAK = /\b(illegal|unlawful|discriminat\w*|salary history|protected class)\b/i;

/** Concatenates every model-generated free-text field. Excludes your_rights
 * entirely — that's always verified static data (legalRights.ts), never
 * model output, and its own legitimate legal language would otherwise
 * false-positive against LEGAL_LEAK. */
function allGeneratedText(kit: InterviewKit): string {
  const parts: string[] = [kit.role.summary];

  for (const c of kit.competency_map) {
    parts.push(c.competency, c.why_it_matters);
  }
  for (const section of kit.sections) {
    for (const q of section.questions) {
      parts.push(q.question, q.subtext, ...q.what_strong_looks_like, ...q.what_weak_looks_like, ...q.follow_up_probes);
    }
  }
  for (const dim of kit.how_youll_be_scored) {
    parts.push(dim.dimension, dim.anchors["1"], dim.anchors["3"], dim.anchors["5"]);
  }
  parts.push(...kit.prep.star_prompts, ...kit.prep.questions_to_ask_them, ...kit.prep.likely_skills_tests);

  return parts.join(" \n ");
}

function checkNoDuplicateQuestions(kit: InterviewKit): string[] {
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const section of kit.sections) {
    for (const q of section.questions) {
      const hash = hashQuestion(q.question);
      const prior = seen.get(hash);
      if (prior) {
        errors.push(`duplicate question: "${q.id}" repeats "${prior}"`);
      } else {
        seen.set(hash, q.id);
      }
    }
  }
  return errors;
}

/** Rubric shape (2-6 dimensions, 1/3/5 anchors each) is already enforced by
 * the zod schema — this catches the lazier failure of pasting the same
 * anchor text across multiple "different" dimensions. */
function checkRubricDistinct(kit: InterviewKit): string[] {
  const errors: string[] = [];
  const seenAnchors = new Set<string>();
  for (const dim of kit.how_youll_be_scored) {
    const key = dim.anchors["3"].trim().toLowerCase();
    if (seenAnchors.has(key)) {
      errors.push(`rubric dimension "${dim.dimension}" reuses another dimension's anchor text`);
    }
    seenAnchors.add(key);
  }
  return errors;
}

function checkQuotas(kit: InterviewKit, focus: string | undefined): string[] {
  const errors: string[] = [];
  const mode = focus || "balanced";
  const quota = FOCUS_QUOTAS[mode];
  if (!quota) return errors;

  const allQuestions = kit.sections.flatMap((s) => s.questions);
  const total = allQuestions.length;
  if (total === 0) return errors;

  const countByType = new Map<string, number>();
  for (const q of allQuestions) countByType.set(q.type, (countByType.get(q.type) ?? 0) + 1);

  if (quota.maxPercentAnyType) {
    for (const [type, count] of countByType) {
      if (count / total > quota.maxPercentAnyType) {
        errors.push(`focus quota: "${type}" is ${Math.round((count / total) * 100)}% of questions, over the ${Math.round(quota.maxPercentAnyType * 100)}% cap for balanced mode`);
      }
    }
  }
  if (quota.minDistinctTypes && countByType.size < quota.minDistinctTypes) {
    errors.push(`focus quota: only ${countByType.size} distinct question types, balanced mode needs at least ${quota.minDistinctTypes}`);
  }
  if (quota.minPercentOfTypes) {
    const { types, minPercent } = quota.minPercentOfTypes;
    const matching = allQuestions.filter((q) => types.includes(q.type)).length;
    if (matching / total < minPercent) {
      errors.push(`focus quota: only ${Math.round((matching / total) * 100)}% of questions are ${types.join("/")}, needs at least ${Math.round(minPercent * 100)}% for ${mode} mode`);
    }
  }
  if (quota.maxCountOfType) {
    const { type, max } = quota.maxCountOfType;
    const count = countByType.get(type) ?? 0;
    if (count > max) {
      errors.push(`focus quota: ${count} "${type}" questions, ${mode} mode allows at most ${max}`);
    }
  }

  return errors;
}

export interface ContentScanOptions {
  /** "public": no possessives ever allowed. "jd": possessives are fine, but
   * named vendors must actually appear in the source JD. */
  path: "public" | "jd";
  industryName: string;
  /** JD path only — tools/vendors actually named in the source posting. */
  allowedVendors?: string[];
}

/**
 * The possessive/staffing-leak/vendor/legal-leak checks, extracted so
 * expandGenerate.ts (the "+" button, adding 4 questions to an existing
 * kit) can run the same content checks without needing a full kit shape
 * to validate against — a 4-question batch has no rubric, no sections, no
 * focus quota of its own.
 */
export function scanContentIssues(text: string, options: ContentScanOptions): string[] {
  const errors: string[] = [];

  if (options.path === "public") {
    for (const pattern of EMPLOYER_POSSESSIVE) {
      if (pattern.test(text)) errors.push(`employer-possessive language found (matches ${pattern})`);
    }
    const vendorMatch = text.match(UNPROMPTED_VENDORS);
    if (vendorMatch) errors.push(`invented vendor name: "${vendorMatch[0]}" — the employer's tools are unknown on this path`);
  }

  if (options.path === "jd") {
    const allowed = new Set((options.allowedVendors ?? []).map((v) => v.toLowerCase()));
    const found = text.match(new RegExp(UNPROMPTED_VENDORS, "gi")) ?? [];
    for (const vendor of found) {
      if (!allowed.has(vendor.toLowerCase())) {
        errors.push(`vendor "${vendor}" mentioned but not named in the source job description`);
      }
    }
  }

  if (options.industryName !== "Staffing & Recruiting" && STAFFING_LEAK.test(text)) {
    errors.push("staffing-agency projection: kit assumes the employer is a staffing/recruiting firm");
  }

  if (LEGAL_LEAK.test(text)) {
    errors.push("model generated legal/compliance content — this must come only from the verified dataset");
  }

  return errors;
}

export interface ValidateKitOptions extends ContentScanOptions {
  focus?: string;
}

export function validateKit(kit: InterviewKit, options: ValidateKitOptions): string[] {
  const errors = scanContentIssues(allGeneratedText(kit), options);

  errors.push(...checkQuotas(kit, options.focus));
  errors.push(...checkRubricDistinct(kit));
  errors.push(...checkNoDuplicateQuestions(kit));

  return errors;
}

/**
 * Content-validation repair prompt — distinct from the schema-repair
 * prompt in aiClient.ts. That one fixes wrong shapes/types; this one fixes
 * wrong CONTENT (a possessive that slipped through, an invented vendor).
 * Only one repair attempt, matching the "fail one check -> repair, not
 * full regeneration" rule used everywhere else in this pipeline.
 */
export function buildValidatorRepairPrompt(previousOutput: string, errors: string[]): string {
  return `Your previous JSON output has content problems, not a format problem:

${errors.map((e) => `- ${e}`).join("\n")}

Here is what you produced:
${previousOutput}

Fix ONLY the specific problems listed above — keep everything else (question
wording, structure, ids) exactly the same unless it's directly implicated in one of
the issues. Output ONLY valid JSON matching the same schema, no prose, no markdown
fences.`;
}
