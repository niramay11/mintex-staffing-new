import { US_STATES, type CannotBeAskedSchema, type StateSpecificNoteSchema, type LegallyConfusedSchema } from "./schema";
import { STATE_TO_ABBR } from "./slug";
import { z } from "zod";

// Standard, reusable banner for federal-only content — shown wherever a
// state has no dedicated entry yet. One sentence, always the same wording,
// so it reads as a deliberate policy rather than an ad-hoc apology.
export const FEDERAL_DISPLAY_NOTICE =
  "These are federal protections that apply everywhere. Your state may protect you further — many do. Check your state labor office.";

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
//
// Sources cite the recognizable ACT NAME only, never a pinpoint statute
// section — those are easy to get subtly wrong and need a lawyer to check.
// urls are left empty on purpose until independently verified.

type CannotBeAsked = z.infer<typeof CannotBeAskedSchema>;
type StateSpecificNote = z.infer<typeof StateSpecificNoteSchema>;
type LegallyConfused = z.infer<typeof LegallyConfusedSchema>;

export interface VerifiedRights {
  cannot_be_asked: CannotBeAsked[];
  state_specific: StateSpecificNote[];
  legally_confused: LegallyConfused[];
  /** ISO date the content below was last checked against its source. Empty = not yet verified. */
  lastVerified: string;
  /** Two-letter code, e.g. "NJ". Always the requested state's own code —
   * this app never generates a kit with no state selected, so unlike the
   * reference dataset there's no separate "US"/no-state case to handle. */
  stateCode: string;
}

const FEDERAL_CANNOT_BE_ASKED: CannotBeAsked[] = [
  {
    question: "How old are you? / What year did you graduate?",
    why: "Federal law protects workers aged 40 and over from age discrimination, and graduation year is a common indirect route to the same information.",
    how_to_respond: "Redirect to experience: \"I've got the experience level this role calls for — happy to walk through the relevant work.\" Answering directly is a fine choice too, if you'd rather just say it.",
    lawful_alternative: "Ask about years of relevant experience directly, or \"Are you over 18?\" if that is genuinely required for the role.",
    source: { label: "Age Discrimination in Employment Act (ADEA)", url: "" },
  },
  {
    question: "What is your race, religion, or national origin?",
    why: "Federal law prohibits discrimination on these grounds, and asking about them during hiring is impermissible.",
    how_to_respond: "\"I'd rather focus on my qualifications for the role\" is a complete answer — nothing about this belongs in an interview. Answering anyway is your call too — you're just never obligated to.",
    lawful_alternative: "Nothing about these belongs in an interview. If you need to know about availability around religious observance, ask about schedule requirements instead.",
    source: { label: "Title VII of the Civil Rights Act of 1964", url: "" },
  },
  {
    question: "Are you pregnant, or planning to become pregnant?",
    why: "Pregnancy-related discrimination is prohibited under federal law.",
    how_to_respond: "\"I'm able to meet the schedule and requirements of this role\" addresses the legitimate concern without disclosing anything personal. Sharing more if you want to is a legitimate choice too — you're just never required to.",
    lawful_alternative: "State the role's schedule and physical requirements directly and ask whether the candidate can meet them.",
    source: { label: "Pregnancy Discrimination Act", url: "" },
  },
  {
    question: "Do you have a disability, or have you filed a workers' comp claim?",
    why: "Pre-offer disability inquiries are prohibited. Medical questions are only permitted after a conditional offer, and only applied uniformly.",
    how_to_respond: "\"I'm able to perform all the essential functions of the role\" is the expected, sufficient answer at this stage. Answering more fully is your choice too, if you're comfortable doing so.",
    lawful_alternative: "Describe the essential functions of the role and ask whether the candidate can perform them, with or without reasonable accommodation.",
    source: { label: "Americans with Disabilities Act (ADA)", url: "" },
  },
];

const FEDERAL_STATE_SPECIFIC: StateSpecificNote[] = [
  {
    text: "Federal law prohibits discrimination based on race, color, religion, sex, national origin, age (40+), disability, and genetic information.",
    source: { label: "EEOC", url: "" },
  },
  {
    text: "Many states and cities provide broader protections than federal law, including on salary history and sexual orientation — check your state's labor office for what applies where you're interviewing.",
    source: { label: "State labor offices vary", url: "" },
  },
];

// Distinct from FEDERAL_CANNOT_BE_ASKED — these are things a candidate
// commonly assumes are illegal but aren't. Not state-specific by nature
// (the legal facts here don't vary), so served identically everywhere
// rather than merged per-state like the other two categories.
const FEDERAL_LEGALLY_CONFUSED: LegallyConfused[] = [
  {
    question: "What are your salary expectations?",
    why: "Legal everywhere federally. It's salary HISTORY (what you were previously paid) that some states and cities restrict — expectations going forward are always fair game to ask.",
    guidance: "Come with a researched range rather than a single number, and give the range, not a number you'd anchor too low or too high.",
  },
  {
    question: "Are you legally authorized to work in the United States?",
    why: "Employers may — and generally must — confirm work authorization for every hire, regardless of citizenship or background.",
    guidance: "Answer directly (yes/no). You're not obligated to volunteer visa type, sponsorship needs, or immigration details unless the employer separately asks and it's relevant.",
  },
  {
    question: "Why did you leave your last role?",
    why: "One of the most standard interview questions there is — asking about your employment history and reasons for moving on isn't discriminatory in any way.",
    guidance: "Keep it brief and forward-looking (new opportunity, career growth, restructuring) rather than dwelling on conflict, even if the real reason was negative.",
  },
];

const STATE_OVERRIDES: Record<
  string,
  { cannot_be_asked: CannotBeAsked[]; state_specific: StateSpecificNote[]; legally_confused?: LegallyConfused[] }
> = {
  "New Jersey": {
    cannot_be_asked: [
      // _verify: covered employer scope, and whether a candidate may voluntarily disclose.
      {
        question: "What is your current or previous salary?",
        why: "New Jersey prohibits employers from asking about salary history, including prior wages and benefits.",
        how_to_respond: "\"I'd rather not go into my salary history, but I'm happy to discuss expectations — what range have you budgeted for this role?\" If you'd rather just share the number, that's a fine choice too — the law protects you either way.",
        lawful_alternative: "Lead with your own budgeted range: \"This role is budgeted at $X to $Y — does that work for you?\" It's legal, faster, and screens more accurately than history ever did.",
        source: { label: "NJ salary history ban (A1094, effective January 1, 2020)", url: "" },
      },
      {
        question: "Do you have children, or are you planning to start a family?",
        why: "Questions about familial status, pregnancy, or caregiving are prohibited under the New Jersey Law Against Discrimination.",
        how_to_respond: "\"I'm fully able to meet the requirements of the role — was there something specific about the schedule you wanted to cover?\" Answering directly is also a legitimate choice, if that's what you'd prefer.",
        lawful_alternative: "Ask about the requirement, not the circumstance: \"This role needs occasional weekend coverage and about 20% travel — can you meet that?\"",
        source: { label: "New Jersey Law Against Discrimination (NJLAD), N.J.S.A. 10:5-1 et seq.", url: "" },
      },
      // _verify: exact stage at which inquiry becomes permissible, and the employer-size threshold.
      {
        question: "Have you ever been convicted of a crime?",
        why: "New Jersey's Opportunity to Compete Act restricts when criminal history may be raised — generally not during the initial application stage.",
        how_to_respond: "\"I'm happy to discuss that later in the process if it's relevant to the role.\" Bringing it up now instead is fine too, if you'd rather get ahead of it.",
        lawful_alternative: "Wait until after the first interview, then ask only about convictions genuinely relevant to the role's duties — and be ready to explain that relevance.",
        source: { label: "New Jersey Opportunity to Compete Act (Ban the Box)", url: "" },
      },
      {
        question: "Do you have a disability, or a health condition I should know about?",
        why: "New Jersey prohibits disability-related inquiries before a conditional offer, on top of the federal ADA baseline.",
        how_to_respond: "\"I'm able to perform all the essential functions of the role\" is the expected, sufficient answer at this stage. Answering more fully is your choice too, if you're comfortable doing so.",
        lawful_alternative: "Describe the essential functions of the role and ask whether the candidate can perform them, with or without reasonable accommodation.",
        source: { label: "New Jersey Law Against Discrimination (NJLAD) and the federal Americans with Disabilities Act (ADA)", url: "" },
      },
    ],
    state_specific: [
      {
        text: "New Jersey's Law Against Discrimination covers more protected categories than federal law, including marital status, domestic partnership status, gender identity and expression, and familial status.",
        source: { label: "New Jersey Law Against Discrimination (NJLAD), N.J.S.A. 10:5-1 et seq.", url: "" },
      },
      // _verify: carve-outs for federally-regulated/safety-sensitive roles.
      {
        text: "New Jersey restricts adverse action based solely on lawful off-duty cannabis use, with some carve-outs for safety-sensitive roles.",
        source: { label: "New Jersey Cannabis Regulatory, Enforcement Assistance, and Marketplace Modernization Act (CREAMMA)", url: "" },
      },
    ],
    legally_confused: [
      {
        question: "Can an employer ask about criminal history at all in New Jersey?",
        why: "Yes, just not during the initial application stage. The Opportunity to Compete Act delays the question — it doesn't ban it outright.",
        guidance: "Expect it later in the process (often after a first interview), and only for convictions genuinely relevant to the role's duties.",
      },
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
  const stateCode = (STATE_TO_ABBR[state] ?? "").toUpperCase();

  if (!override) {
    return {
      cannot_be_asked: FEDERAL_CANNOT_BE_ASKED,
      state_specific: FEDERAL_STATE_SPECIFIC,
      legally_confused: FEDERAL_LEGALLY_CONFUSED,
      lastVerified: "",
      stateCode,
      isFederalOnly: true,
    };
  }

  return {
    cannot_be_asked: [...override.cannot_be_asked, ...FEDERAL_CANNOT_BE_ASKED].slice(0, 8),
    state_specific: [...override.state_specific, ...FEDERAL_STATE_SPECIFIC].slice(0, 6),
    legally_confused: [...(override.legally_confused ?? []), ...FEDERAL_LEGALLY_CONFUSED].slice(0, 4),
    lastVerified: "",
    stateCode,
    isFederalOnly: false,
  };
}

/** Full state name -> URL slug, e.g. "New Jersey" -> "new-jersey". Used by
 * /interview-rights/[state] — a standalone, indexed reference page separate
 * from any generated kit, so it needs its own stable, readable identity. */
export function stateToSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

export function slugToState(slug: string): string | null {
  return US_STATES.find((state) => stateToSlug(state) === slug) ?? null;
}
