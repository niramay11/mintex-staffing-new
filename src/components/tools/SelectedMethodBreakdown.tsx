"use client";

import { CONFIG } from "@/lib/calculators";
import { useHiringCost } from "./HiringCostCalculatorContext";

const ACCENTS = [
  "var(--color-navy)",
  "var(--color-steel)",
  "var(--color-steel-light)",
  "var(--color-navy-secondary)",
];

export default function SelectedMethodBreakdown() {
  const { inputs, result, breakdownRows } = useHiringCost();
  const methodLabel = CONFIG.method[inputs.methodKey].label;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden="true" className="absolute -right-14 -top-14 h-64 w-64 rounded-full bg-steel-lighter/40 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-steel/25 blur-2xl" />

      <div className="relative overflow-hidden rounded-[24px] border border-navy/10 bg-white p-6 shadow-[0_30px_70px_-28px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-steel to-steel-light" />

        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel/15 text-steel dark:bg-steel/20 dark:text-steel-light">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
              <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
              <path d="M8 6.5h8" strokeLinecap="round" />
              <circle cx="8.25" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="12" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="15.75" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Via {methodLabel}</p>
        </div>

        <p className="mt-4 font-heading text-4xl font-bold text-navy dark:text-cream">
          ${Math.round(result.total).toLocaleString("en-US")}
        </p>
        <p className="text-sm text-navy/90 dark:text-cream/90">estimated cost to fill this role this way</p>

        <div className="mt-6 space-y-3">
          {breakdownRows.map((row, i) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-navy dark:text-cream">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: ACCENTS[i % ACCENTS.length] }}
                  />
                  {row.label}
                </span>
                <span className="flex-shrink-0 font-semibold text-navy dark:text-cream">
                  ${row.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist dark:bg-navy-800">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(row.pct, 4)}%`, background: ACCENTS[i % ACCENTS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
