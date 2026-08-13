import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import type { InterviewKit } from "./schema";

export const DOWN_REASONS = ["too_generic", "not_relevant_to_role", "wrong_difficulty"] as const;
export type DownReason = (typeof DOWN_REASONS)[number];

// A single downvote must not kill a good question, and one bored visitor
// upvoting once shouldn't promote a mediocre one either.
export const SUPPRESS_MIN_DOWN = 3;
export const SUPPRESS_MIN_RATIO = 0.6;
export const PROMOTE_MIN_UP = 5;
export const PROMOTE_MIN_RATIO = 0.85;

interface FeedbackRow {
  hash: string;
  up: number;
  down: number;
}

/** Normalise before hashing so trivial wording variants collide on the same record. */
export function normaliseForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashQuestion(text: string): string {
  return crypto.createHash("sha256").update(normaliseForHash(text)).digest("hex");
}

export function isSuppressed(row: FeedbackRow): boolean {
  const total = row.up + row.down;
  return total > 0 && row.down >= SUPPRESS_MIN_DOWN && row.down / total > SUPPRESS_MIN_RATIO;
}

export function isPromotionCandidate(row: FeedbackRow): boolean {
  const total = row.up + row.down;
  return total > 0 && row.up >= PROMOTE_MIN_UP && row.up / total > PROMOTE_MIN_RATIO;
}

export async function recordQuestionVote(
  questionText: string,
  vote: "up" | "down",
  reason: DownReason | null,
  roleSlug: string | null
): Promise<void> {
  const hash = hashQuestion(questionText);
  const { error } = await supabaseAdmin.rpc("record_question_vote", {
    p_hash: hash,
    p_text: questionText.slice(0, 500),
    p_role_slug: roleSlug,
    p_vote: vote,
    p_reason: reason,
  });
  if (error) throw new Error(`record_question_vote failed: ${error.message}`);
}

/**
 * Suppression is a POST-FILTER, not a prompt instruction — asking the model
 * to avoid a list of bad questions is unreliable, filtering its output
 * after the fact is not. Applied at read time (not baked into the cached
 * kit itself), so vote data collected after a kit was cached still takes
 * effect on the next view without needing to bust the cache.
 *
 * Never drops a section to zero questions — better to show one
 * previously-suppressed question than violate the kit's own "at least one
 * question per round" shape. A real "top up via a fresh expansion call"
 * (per the original design) isn't built yet; this is the safe fallback
 * until it is.
 */
export async function applySuppression(kit: InterviewKit): Promise<InterviewKit> {
  const allQuestions = kit.sections.flatMap((s) => s.questions);
  if (allQuestions.length === 0) return kit;

  const hashByQuestionId = new Map(allQuestions.map((q) => [q.id, hashQuestion(q.question)] as const));
  const hashes = [...new Set(hashByQuestionId.values())];

  const { data, error } = await supabaseAdmin
    .from("question_feedback")
    .select("hash, up, down")
    .in("hash", hashes);

  if (error || !data || data.length === 0) return kit;

  const suppressedHashes = new Set(data.filter((row: FeedbackRow) => isSuppressed(row)).map((row) => row.hash));
  if (suppressedHashes.size === 0) return kit;

  const sections = kit.sections.map((section) => {
    const kept = section.questions.filter((q) => !suppressedHashes.has(hashByQuestionId.get(q.id)!));
    return kept.length > 0 ? { ...section, questions: kept } : section;
  });

  return { ...kit, sections };
}
