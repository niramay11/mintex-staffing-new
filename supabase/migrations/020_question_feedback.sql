-- Global, anonymous thumbs up/down feedback on individual interview
-- questions from the AI interview kit generator. Stores THE QUESTION, never
-- the person — no user id, no session, no IP. An API call to the model is
-- stateless (a downvote sent to Gemini has zero effect on any future call),
-- so for a bad question to actually stop appearing, something has to
-- remember it was bad — this table is that memory. Suppression/promotion
-- thresholds live in application code (src/lib/interviewKit/feedback.ts),
-- not here, so they can be tuned without a migration.
-- Read/written only via the service-role key in /api/question-feedback and
-- the kit-loading code path — no public policy.
CREATE TABLE IF NOT EXISTS question_feedback (
  hash          TEXT PRIMARY KEY,
  text          TEXT NOT NULL,
  role_slug     TEXT,
  up            INTEGER NOT NULL DEFAULT 0,
  down          INTEGER NOT NULL DEFAULT 0,
  down_reasons  JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_voted    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;

-- Atomic increment. The JS client's upsert() can't express "up = up + 1"
-- directly, and a naive read-then-write from an API route would lose votes
-- under concurrent requests on the same question.
CREATE OR REPLACE FUNCTION record_question_vote(
  p_hash TEXT,
  p_text TEXT,
  p_role_slug TEXT,
  p_vote TEXT,     -- 'up' | 'down'
  p_reason TEXT     -- one of the fixed down reasons, or NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO question_feedback (hash, text, role_slug, up, down, down_reasons, first_seen, last_voted)
  VALUES (
    p_hash, p_text, p_role_slug,
    CASE WHEN p_vote = 'up' THEN 1 ELSE 0 END,
    CASE WHEN p_vote = 'down' THEN 1 ELSE 0 END,
    CASE WHEN p_vote = 'down' AND p_reason IS NOT NULL
      THEN jsonb_build_object(p_reason, 1)
      ELSE '{}'::jsonb
    END,
    now(), now()
  )
  ON CONFLICT (hash) DO UPDATE SET
    up = question_feedback.up + (CASE WHEN p_vote = 'up' THEN 1 ELSE 0 END),
    down = question_feedback.down + (CASE WHEN p_vote = 'down' THEN 1 ELSE 0 END),
    down_reasons = CASE
      WHEN p_vote = 'down' AND p_reason IS NOT NULL THEN
        jsonb_set(
          question_feedback.down_reasons,
          ARRAY[p_reason],
          to_jsonb(COALESCE((question_feedback.down_reasons ->> p_reason)::int, 0) + 1)
        )
      ELSE question_feedback.down_reasons
    END,
    last_voted = now(),
    text = p_text,
    role_slug = COALESCE(question_feedback.role_slug, p_role_slug);
END;
$$ LANGUAGE plpgsql;
