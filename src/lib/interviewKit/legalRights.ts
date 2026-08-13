import type { CannotBeAskedSchema } from "./schema";
import { z } from "zod";

// Verified legal content — never model-generated. The AI has no reliable
// grounding for employment law and previously invented statute-adjacent
// claims live per request. This file is the single source of truth for the
// "your_rights" section; prompt.ts now tells the model to leave those
// fields empty, and generate.ts overwrites them with what's here.
//
// IMPORTANT: the entries below were drafted from general knowledge, not
// pulled from a live legal database. Each one MUST be checked against its
// cited source before this feature is presented as authoritative, and
// `lastVerified` should be bumped whenever that check happens. Until then,
// treat this as a structural placeholder that is already more accurate and
// more consistent than asking the model to guess on every request.

type CannotBeAsked = z.infer<typeof CannotBeAskedSchema>;

export interface VerifiedRights {
  cannot_be_asked: CannotBeAsked[];
  state_specific: string[];
  /** ISO date the content below was last checked against its source. Empty = not yet verified. */
  lastVerified: string;
}

const FEDERAL_CANNOT_BE_ASKED: CannotBeAsked[] = [
  {
    question: "How old are you? / What year did you graduate?",
    why: "Federal law protects workers aged 40 and over from age discrimination, and graduation year is a common indirect route to the same information.",
    how_to_respond: "Redirect to experience: \"I've got the experience level this role calls for — happy to walk through the relevant work.\"",
    lawful_alternative: "Ask about years of relevant experience directly, or \"Are you over 18?\" if that is genuinely required for the role.",
  },
  {
    question: "What is your race, religion, or national origin?",
    why: "Federal law prohibits discrimination on these grounds, and asking about them during hiring is impermissible.",
    how_to_respond: "\"I'd rather focus on my qualifications for the role\" is a complete answer — nothing about this belongs in an interview.",
    lawful_alternative: "Nothing about these belongs in an interview. If you need to know about availability around religious observance, ask about schedule requirements instead.",
  },
  {
    question: "Are you pregnant, or planning to become pregnant?",
    why: "Pregnancy-related discrimination is prohibited under federal law.",
    how_to_respond: "\"I'm able to meet the schedule and requirements of this role\" addresses the legitimate concern without disclosing anything personal.",
    lawful_alternative: "State the role's schedule and physical requirements directly and ask whether the candidate can meet them.",
  },
  {
    question: "Do you have a disability, or have you filed a workers' comp claim?",
    why: "Pre-offer disability inquiries are prohibited. Medical questions are only permitted after a conditional offer, and only applied uniformly.",
    how_to_respond: "\"I'm able to perform all the essential functions of the role\" is the expected, sufficient answer at this stage.",
    lawful_alternative: "Describe the essential functions of the role and ask whether the candidate can perform them, with or without reasonable accommodation.",
  },
];

const FEDERAL_STATE_SPECIFIC = [
  "Federal law prohibits discrimination based on race, color, religion, sex, national origin, age (40+), disability, and genetic information.",
  "Many states and cities provide broader protections than federal law, including on salary history and sexual orientation — check your state's labor office for what applies where you're interviewing.",
];

const STATE_OVERRIDES: Record<string, { cannot_be_asked: CannotBeAsked[]; state_specific: string[] }> = {
  "New Jersey": {
    cannot_be_asked: [
      {
        question: "What is your current or previous salary?",
        why: "New Jersey prohibits employers from asking about salary history, including prior wages and benefits.",
        how_to_respond: "\"I'd rather not go into my salary history, but I'm happy to discuss expectations — what range have you budgeted for this role?\"",
        lawful_alternative: "Lead with your own budgeted range: \"This role is budgeted at $X to $Y — does that work for you?\" It's legal, faster, and screens more accurately than history ever did.",
      },
      {
        question: "Do you have children, or are you planning to start a family?",
        why: "Questions about familial status, pregnancy, or caregiving are prohibited under the New Jersey Law Against Discrimination.",
        how_to_respond: "\"I'm fully able to meet the requirements of the role — was there something specific about the schedule you wanted to cover?\"",
        lawful_alternative: "Ask about the requirement, not the circumstance: \"This role needs occasional weekend coverage and about 20% travel — can you meet that?\"",
      },
      {
        question: "Have you ever been convicted of a crime?",
        why: "New Jersey's Opportunity to Compete Act restricts when criminal history may be raised — generally not during the initial application stage.",
        how_to_respond: "\"I'm happy to discuss that later in the process if it's relevant to the role.\"",
        lawful_alternative: "Wait until after the first interview, then ask only about convictions genuinely relevant to the role's duties — and be ready to explain that relevance.",
      },
    ],
    state_specific: [
      "New Jersey's Law Against Discrimination covers more protected categories than federal law, including marital status, domestic partnership status, and gender identity.",
      "New Jersey restricts adverse action based solely on lawful off-duty cannabis use, with some carve-outs for safety-sensitive roles.",
    ],
  },
};

/**
 * Merges federal baseline with any state-specific facts. Returns
 * isFederalOnly=true when the state has no dedicated entry yet, so the UI
 * can label the section honestly instead of implying it's state-verified.
 */
export function getVerifiedRights(state: string): VerifiedRights & { isFederalOnly: boolean } {
  const override = STATE_OVERRIDES[state];

  if (!override) {
    return {
      cannot_be_asked: FEDERAL_CANNOT_BE_ASKED,
      state_specific: FEDERAL_STATE_SPECIFIC,
      lastVerified: "",
      isFederalOnly: true,
    };
  }

  return {
    cannot_be_asked: [...override.cannot_be_asked, ...FEDERAL_CANNOT_BE_ASKED].slice(0, 5),
    state_specific: [...override.state_specific, ...FEDERAL_STATE_SPECIFIC].slice(0, 6),
    lastVerified: "",
    isFederalOnly: false,
  };
}
