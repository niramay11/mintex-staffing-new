import type { GapAnalysis } from "@/lib/interviewKit/gapSchema";
import type { InterviewKit } from "@/lib/interviewKit/schema";

const PROBABILITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  low: "bg-mist text-navy/60 dark:bg-navy-800 dark:text-cream/60",
};

export default function GapAnalysisView({ analysis, kit }: { analysis: GapAnalysis; kit: InterviewKit }) {
  const questionsById = new Map(
    kit.sections.flatMap((s) => s.questions.map((q) => [q.id, q.question] as const))
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
        <h3 className="font-heading text-xl font-semibold text-navy dark:text-cream">Your strengths for this role</h3>
        <div className="mt-4 space-y-3">
          {analysis.strengths.map((s) => (
            <div key={s.what} className="rounded-xl bg-mist p-4 text-sm dark:bg-navy-800">
              <p className="font-medium text-navy dark:text-cream">{s.what}</p>
              <p className="mt-1 text-navy/70 dark:text-cream/70">{s.how_to_lead_with_it}</p>
            </div>
          ))}
        </div>
      </section>

      {analysis.gaps.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
          <h3 className="font-heading text-xl font-semibold text-navy dark:text-cream">Where your background is thin</h3>
          <div className="mt-4 space-y-3">
            {analysis.gaps.map((g) => (
              <div key={g.requirement} className="rounded-xl border border-navy/10 p-4 text-sm dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-navy dark:text-cream">{g.requirement}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${PROBABILITY_STYLES[g.probability] ?? PROBABILITY_STYLES.low}`}
                  >
                    {g.probability} chance they ask
                  </span>
                </div>
                <p className="mt-1 text-navy/70 dark:text-cream/70">{g.what_is_missing}</p>
                <p className="mt-1 font-medium text-navy dark:text-cream">How to address it: {g.how_to_address}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.likely_probes.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
          <h3 className="font-heading text-xl font-semibold text-navy dark:text-cream">What they&apos;ll probably ask about</h3>
          <div className="mt-4 space-y-3">
            {analysis.likely_probes.map((p) => (
              <div key={p.observation} className="rounded-xl bg-mist p-4 text-sm dark:bg-navy-800">
                <p className="font-medium text-navy dark:text-cream">{p.observation}</p>
                <p className="mt-1 text-navy/70 dark:text-cream/70">{p.how_to_handle}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {analysis.questions_most_likely_for_you.length > 0 && (
        <section className="rounded-2xl border border-steel/40 bg-steel/[0.08] p-6">
          <h3 className="font-heading text-xl font-semibold text-navy dark:text-cream">Most likely questions for you</h3>
          <div className="mt-4 space-y-3">
            {analysis.questions_most_likely_for_you.map((item) => (
              <div key={item.question_id} className="rounded-xl bg-white p-4 text-sm dark:bg-navy-800">
                <p className="font-medium text-navy dark:text-cream">{questionsById.get(item.question_id) ?? item.question_id}</p>
                <p className="mt-1 text-navy/70 dark:text-cream/70">{item.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
