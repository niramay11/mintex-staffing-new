// Shared prompt text AND the numeric thresholds behind it — used by both
// the public path (prompt.ts) and the JD path (jdPrompt.ts) to build the
// instruction text, and by validator.ts to actually check the model's
// output against the same numbers. Single source of truth: the prompt text
// is derived FROM the threshold data below, not hand-typed separately, so
// what we ask the model to do and what we check it against can't drift
// apart from each other.

export const DIFFICULTY_LEVEL_DEFINITIONS = `Difficulty levels mean:
  1 — factual recall or basic self-description
  2 — routine competence expected of anyone in the role
  3 — applied judgement in a familiar situation
  4 — ambiguous tradeoffs, competing priorities, no clean answer
  5 — strategic or organisational reasoning beyond the immediate role`;

export interface FocusQuota {
  /** e.g. technical/case/work_sample must be >=60% of all questions. */
  minPercentOfTypes?: { types: string[]; minPercent: number };
  /** e.g. at most 1 culture question. */
  maxCountOfType?: { type: string; max: number };
  /** balanced mode: no single type may exceed this share. */
  maxPercentAnyType?: number;
  /** balanced mode: at least this many distinct types must appear. */
  minDistinctTypes?: number;
}

export const FOCUS_QUOTAS: Record<string, FocusQuota> = {
  balanced: { maxPercentAnyType: 0.25, minDistinctTypes: 6 },
  behavioral: {
    minPercentOfTypes: { types: ["behavioral", "situational"], minPercent: 0.7 },
    maxCountOfType: { type: "technical", max: 1 },
  },
  technical: {
    minPercentOfTypes: { types: ["technical", "case", "work_sample"], minPercent: 0.6 },
    maxCountOfType: { type: "culture", max: 1 },
  },
  culture: {
    minPercentOfTypes: { types: ["culture", "motivation", "competency"], minPercent: 0.6 },
    maxCountOfType: { type: "technical", max: 1 },
  },
  // Safety's real quota is about CONTENT (the hazard domain), which a type
  // percentage can only approximate — situational/process is a reasonable
  // proxy since that's how the prompt is told to frame hazard questions,
  // but this one is inherently softer than the others.
  safety: {
    minPercentOfTypes: { types: ["situational", "process"], minPercent: 0.6 },
  },
};

function quotaToText(mode: string, quota: FocusQuota, hazardDomain?: string): string {
  const parts: string[] = [];
  if (quota.maxPercentAnyType) {
    parts.push(`no single question type exceeds ${Math.round(quota.maxPercentAnyType * 100)}% of all questions`);
  }
  if (quota.minDistinctTypes) {
    parts.push(`at least ${quota.minDistinctTypes} distinct types are used`);
  }
  if (quota.minPercentOfTypes) {
    const { types, minPercent } = quota.minPercentOfTypes;
    const label =
      mode === "safety" && hazardDomain
        ? `questions addressing ${hazardDomain}`
        : `${types.join(", ")} questions`;
    parts.push(`at least ${Math.round(minPercent * 100)}% of questions are ${label}`);
  }
  if (quota.maxCountOfType) {
    parts.push(`at most ${quota.maxCountOfType.max} ${quota.maxCountOfType.type} question`);
  }
  return parts.join("; ");
}

/**
 * Focus modes must be visibly different from each other — a question that
 * would appear unchanged in three or more modes is too generic. Quotas are
 * counted by the model before it returns, not just suggested.
 */
export function getFocusQuotaInstruction(focus: string | undefined, hazardDomain?: string): string {
  const mode = focus || "balanced";
  const quota = FOCUS_QUOTAS[mode] ?? FOCUS_QUOTAS.balanced;
  const quotaText = quotaToText(mode, quota, hazardDomain);

  return `FOCUS MODE QUOTA — count before returning: ${quotaText}.

Focus modes must be visibly different from each other. If a question would read the
same in three or more modes, it is too generic — replace it. Do not default to the
generic pivot question ("describe a time you changed course because the data showed
X") unless the mode is behavioral.`;
}
