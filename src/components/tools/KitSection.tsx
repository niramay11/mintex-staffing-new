"use client";

import { useState } from "react";
import QuestionCard from "@/components/tools/QuestionCard";
import type { InterviewKit, InterviewQuestion } from "@/lib/interviewKit/schema";

export const STAGE_LABELS: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical Round",
  panel: "Panel",
  final: "Final Round",
};

function PlusIcon({ spinning }: { spinning?: boolean }) {
  if (spinning) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

// One "+" icon per round — adds 4 more questions scoped to THIS section
// specifically (a "stage:" expansion axis, see expandPrompt.ts), separate
// from ExpandKit's cross-cutting axes (more behavioral, harder, etc). Kept
// as its own small client component so each section owns its own "extra
// questions added this session" state independently of its siblings.
export default function KitSection({
  kit,
  section,
  isEmployer,
  roleSlug,
  path,
}: {
  kit: InterviewKit;
  section: InterviewKit["sections"][number];
  isEmployer: boolean;
  roleSlug?: string;
  path: "public" | "jd";
}) {
  const [extra, setExtra] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddMore() {
    setLoading(true);
    setError(null);
    try {
      const sections = kit.sections.map((s) =>
        s.stage === section.stage ? { ...s, questions: [...s.questions, ...extra] } : s
      );
      const fullKit: InterviewKit = { ...kit, sections };
      const res = await fetch("/api/expand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kit: fullKit, axis: `stage:${section.stage}`, path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setExtra((prev) => [...prev, ...(data.questions as InterviewQuestion[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h3 className="flex items-center justify-between font-heading text-xl font-semibold text-navy dark:text-cream">
        <span>
          {STAGE_LABELS[section.stage] ?? section.stage}
          <span className="ml-2 text-sm font-normal text-navy/50 dark:text-cream/50">~{section.duration_minutes} min</span>
        </span>
        {!isEmployer && (
          <button
            type="button"
            onClick={handleAddMore}
            disabled={loading}
            title={`Add more ${STAGE_LABELS[section.stage] ?? section.stage} questions`}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-navy bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-mist disabled:opacity-50 print:hidden dark:border-cream/30 dark:bg-navy-900 dark:text-cream dark:hover:bg-navy-800"
          >
            <PlusIcon spinning={loading} />
            {loading ? "Generating…" : "Generate more Questions"}
          </button>
        )}
      </h3>
      <div className="mt-3 space-y-3">
        {section.questions.map((q) => (
          <QuestionCard key={q.id} question={q} isEmployer={isEmployer} roleSlug={roleSlug} />
        ))}
        {extra.map((q) => (
          <QuestionCard key={q.id} question={q} isEmployer={isEmployer} roleSlug={roleSlug} />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </section>
  );
}
