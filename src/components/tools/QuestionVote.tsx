"use client";

import { useState } from "react";

const DOWN_REASON_LABELS: Record<string, string> = {
  too_generic: "Too generic",
  not_relevant_to_role: "Not relevant to this role",
  wrong_difficulty: "Wrong difficulty",
};

type VoteState = "idle" | "voted";

// One tap, optimistic, no login. A single vote never blocks on the network
// response — the UI commits immediately and the request fires in the
// background, matching "one tap" from the design (a spinner here would be
// friction for a feature whose entire value is being frictionless).
export default function QuestionVote({ questionText, roleSlug }: { questionText: string; roleSlug?: string }) {
  const [state, setState] = useState<VoteState>("idle");
  const [showReasons, setShowReasons] = useState(false);

  function sendVote(vote: "up" | "down", reason?: string) {
    setState("voted");
    setShowReasons(false);
    fetch("/api/question-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText, vote, reason, roleSlug }),
    }).catch(() => {
      // Best-effort — a dropped vote isn't worth surfacing an error for.
    });
  }

  if (state === "voted") {
    return <span className="text-xs text-navy/40">Thanks for the feedback</span>;
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        aria-label="This question is helpful"
        onClick={() => sendVote("up")}
        className="rounded-full p-1.5 text-navy/40 hover:bg-mist hover:text-navy"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 5-7a2 2 0 0 1 3.6 1.2L14.5 9H19a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 17.6 21H7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="This question needs work"
        onClick={() => setShowReasons((v) => !v)}
        className="rounded-full p-1.5 text-navy/40 hover:bg-mist hover:text-navy"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3Zm0 0-5 7a2 2 0 0 1-3.6-1.2l1.1-4.8H5a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 6.4 3H17" />
        </svg>
      </button>

      {showReasons && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-navy/10 bg-white p-2 shadow-lg">
          {Object.entries(DOWN_REASON_LABELS).map(([reason, label]) => (
            <button
              key={reason}
              type="button"
              onClick={() => sendVote("down", reason)}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-navy/70 hover:bg-mist"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
