import type { InterviewQuestion } from "@/lib/interviewKit/schema";
import QuestionVote from "@/components/tools/QuestionVote";

// Extracted from InterviewKitView so newly-expanded questions (the "+"
// button, see ExpandKit.tsx) render identically to the ones from the
// original generation — same card, same vote control, same employer
// scorecard fields, just appended after the fact instead of coming from
// the initial kit.
export default function QuestionCard({
  question: q,
  isEmployer,
  roleSlug,
}: {
  question: InterviewQuestion;
  isEmployer: boolean;
  roleSlug?: string;
}) {
  return (
    <details className="group rounded-2xl border border-navy/10 bg-white p-5 dark:border-white/10 dark:bg-navy-900" open={isEmployer}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <span className="text-sm font-medium text-navy dark:text-cream">{q.question}</span>
        <span className="flex flex-shrink-0 items-center gap-2 print:hidden">
          <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-navy/60 dark:bg-navy-800 dark:text-cream/60">
            {q.type.replace("_", " ")}
          </span>
          <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-navy/60 dark:bg-navy-800 dark:text-cream/60">Lvl {q.difficulty}</span>
        </span>
      </summary>
      <div className="mt-4 space-y-3 border-t border-navy/10 pt-4 text-sm text-navy/75 dark:border-white/10 dark:text-cream/75">
        <p className="italic text-navy/80 dark:text-cream/80">{q.subtext}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-navy dark:text-cream">Strong answer includes</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              {q.what_strong_looks_like.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-navy dark:text-cream">Weak answer looks like</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              {q.what_weak_looks_like.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <p className="font-semibold text-navy dark:text-cream">Follow-up probes</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4">
            {q.follow_up_probes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {!isEmployer && (
          <div className="flex items-center justify-between border-t border-navy/10 pt-3 print:hidden dark:border-white/10">
            <span className="text-xs text-navy/40 dark:text-cream/40">Was this question useful?</span>
            <QuestionVote questionText={q.question} roleSlug={roleSlug} />
          </div>
        )}
        {isEmployer && (
          <div className="grid grid-cols-5 gap-2 border-t border-navy/10 pt-3 print:mt-2 dark:border-white/10">
            <span className="col-span-5 text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">Score</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-xs text-navy/60 dark:border-white/10 dark:text-cream/60"
              >
                {n}
              </span>
            ))}
            <div className="col-span-5 mt-1 h-10 rounded-lg border border-dashed border-navy/20 print:h-12 dark:border-white/10" />
          </div>
        )}
      </div>
    </details>
  );
}
