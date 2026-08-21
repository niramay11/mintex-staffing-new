-- IP-based rate limiting for the interview-kit AI endpoints (generate,
-- expand, JD, resume gap analysis). These are public, unauthenticated, and
-- each call costs real Gemini API spend — this is purely abuse control,
-- not a feature limit for legitimate use.
-- No PII beyond the IP address itself, which is not linked to any other
-- record in this database.
-- Read/written only via the service-role key in the rate-limit check —
-- no public policy.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key    TEXT PRIMARY KEY,
  count         INTEGER NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic fixed-window counter. A single UPSERT so concurrent requests from
-- the same IP can't race past each other the way a naive read-then-write
-- would. Returns true (allowed) if the count after this request is still
-- within the limit, false if it's over.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_bucket_key TEXT,
  p_window_seconds INTEGER,
  p_max_requests INTEGER
) RETURNS BOOLEAN AS $$
DECLARE 
  v_count INTEGER;
BEGIN
  INSERT INTO rate_limits (bucket_key, count, window_start)
  VALUES (p_bucket_key, 1, now())
  ON CONFLICT (bucket_key) DO UPDATE SET
    count = CASE
      WHEN rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        THEN 1
      ELSE rate_limits.count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start < now() - (p_window_seconds || ' seconds')::interval
        THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql;
