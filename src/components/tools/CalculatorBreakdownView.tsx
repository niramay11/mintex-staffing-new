import type { CalculatorBreakdownLine } from "@/lib/calculatorShare";

// Plain display, no hooks or client-only APIs — usable from both the
// client-rendered email-results page and the server-rendered saved-results
// page without needing a "use client" boundary.
export default function CalculatorBreakdownView({
  heading,
  headlineLabel,
  headlineValue,
  lines,
}: {
  heading: string;
  headlineLabel: string;
  headlineValue: string;
  lines: CalculatorBreakdownLine[];
}) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Your calculated breakdown</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-navy dark:text-cream sm:text-3xl">{heading}</h1>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-6 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{headlineLabel}</p>
        <p className="mt-2 font-heading text-3xl font-bold tabular-nums sm:text-4xl">{headlineValue}</p>
      </div>

      <div className="mt-6 divide-y divide-navy/10 dark:divide-white/10">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 text-[13.5px]">
            <span className={line.strong ? "font-semibold text-navy dark:text-cream" : "text-navy/85 dark:text-cream/85"}>{line.label}</span>
            <span
              className={`text-right tabular-nums ${line.strong ? "font-bold" : "font-semibold"} ${
                line.accent ? "text-emerald-600 dark:text-emerald-400" : "text-navy dark:text-cream"
              }`}
            >
              {line.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
