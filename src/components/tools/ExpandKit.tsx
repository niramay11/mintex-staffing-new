"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import QuestionCard from "@/components/tools/QuestionCard";
import type { InterviewKit, InterviewQuestion } from "@/lib/interviewKit/schema";

// The "+" button — adds 4 more questions to an already-generated kit
// without starting over. Added questions live only in this component's own
// state: they render immediately, but (like everything else client-side
// here) don't get written back into whatever cached the original kit —
// this is a per-viewing-session addition, not a permanent kit edit.
export default function ExpandKit({ kit, path }: { kit: InterviewKit; path: "public" | "jd" }) {
  const [extraQuestions, setExtraQuestions] = useState<InterviewQuestion[]>([]);
  const [loadingAxis, setLoadingAxis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestMore(axis: string) {
    setLoadingAxis(axis);
    setError(null);
    try {
      // Fold any questions already added this session into the last section
      // before sending — the server only reads kit.sections.flatMap(...) to
      // know what already exists, so this is just how earlier "+" clicks
      // stay visible to duplicate-checking on the next one.
      const sections = kit.sections.map((s, i) =>
        i === kit.sections.length - 1 ? { ...s, questions: [...s.questions, ...extraQuestions] } : s
      );
      const fullKit: InterviewKit = { ...kit, sections };
      const res = await fetch("/api/expand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kit: fullKit, axis, path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setExtraQuestions((prev) => [...prev, ...(data.questions as InterviewQuestion[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingAxis(null);
    }
  }

  return (
    <section>
      {extraQuestions.length > 0 && (
        <div className="mb-4 space-y-3">
          {extraQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} isEmployer={false} />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-navy/15 bg-mist/40 p-5 dark:border-white/15 dark:bg-navy-800/60">
        <p className="text-sm font-semibold text-navy dark:text-cream">Want more questions?</p>
        <p className="mt-1 text-xs text-navy/70 dark:text-cream/70">Adds 4 new questions — never repeats what&apos;s already above.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={loadingAxis !== null}
            onClick={() => requestMore("more_behavioral")}
          >
            {loadingAxis === "more_behavioral" ? "Adding…" : "+ More behavioral"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loadingAxis !== null}
            onClick={() => requestMore("more_technical")}
          >
            {loadingAxis === "more_technical" ? "Adding…" : "+ More technical"}
          </Button>
          <Button type="button" variant="secondary" disabled={loadingAxis !== null} onClick={() => requestMore("harder")}>
            {loadingAxis === "harder" ? "Adding…" : "+ Harder"}
          </Button>
          {kit.competency_map.map((c) => {
            const axis = `competency:${c.competency}`;
            return (
              <Button
                key={c.competency}
                type="button"
                variant="secondary"
                disabled={loadingAxis !== null}
                onClick={() => requestMore(axis)}
              >
                {loadingAxis === axis ? "Adding…" : `+ More on ${c.competency}`}
              </Button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </section>
  );
}
