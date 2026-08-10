"use client";

import { useHiringCost } from "./HiringCostCalculatorContext";

const ACCENTS = [
  "var(--color-tan)",
  "var(--color-steel)",
  "var(--color-steel-light)",
  "var(--color-navy-secondary)",
];

export default function CostBreakdownPreview() {
  const { result, inHouseRows } = useHiringCost();

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div aria-hidden="true" className="absolute -right-14 -top-14 h-64 w-64 rounded-full bg-tan/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-steel/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-navy/10 bg-white p-8 shadow-[0_30px_70px_-28px_rgba(0,48,96,0.3)]">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-tan via-tan-light to-steel-light" />

        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tan/15 text-tan">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
              <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
              <path d="M8 6.5h8" strokeLinecap="round" />
              <circle cx="8.25" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="12" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
              <circle cx="15.75" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Your breakdown</p>
        </div>

        <p className="mt-4 font-heading text-5xl font-bold text-navy">
          ${Math.round(result.inHouseTotal).toLocaleString("en-US")}
        </p>
        <p className="text-sm text-navy/50">estimated cost if you hire this role in-house</p>

        <div className="mt-7 space-y-4">
          {inHouseRows.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-navy/70">
                  <span
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: ACCENTS[i % ACCENTS.length] }}
                  />
                  {row.label}
                </span>
                <span className="flex-shrink-0 font-semibold text-navy">
                  ${row.amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${row.pct}%`, background: ACCENTS[i % ACCENTS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-7 -right-6 flex items-center gap-3 rounded-2xl bg-navy px-5 py-4 text-white shadow-[0_20px_45px_-18px_rgba(0,48,96,0.45)]">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} stroke="currentColor" className="h-5 w-5 text-tan-light">
            <rect x="4" y="3" width="16" height="18" rx="2.5" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold leading-none">In-house vs. Mintex</p>
          <p className="mt-1 text-xs text-white/60">one clear comparison</p>
        </div>
      </div>
    </div>
  );
}
