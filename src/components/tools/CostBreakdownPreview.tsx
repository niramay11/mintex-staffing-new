"use client";

import { useHiringCost } from "./HiringCostCalculatorContext";

const ACCENTS = [
  "var(--color-navy)",
  "var(--color-steel)",
  "var(--color-steel-light)",
  "var(--color-navy-secondary)",
];

const NOT_BILLED = [
  "No job posting cost",
  "No interview screening cost",
  "No onboarding or equipment fee",
  "No other vendor to pay",
];

export default function CostBreakdownPreview() {
  const { inputs, internalHrResult, internalHrRows, mintexResult } = useHiringCost();
  const savings = internalHrResult.total - mintexResult.total;

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div aria-hidden="true" className="absolute -right-14 -top-14 h-64 w-64 rounded-full bg-steel-lighter/40 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-steel/25 blur-2xl" />

      <div className="relative grid gap-5 sm:grid-cols-2">
        {/* In-house card */}
        <div className="relative overflow-hidden rounded-[24px] border border-navy/10 bg-white p-6 shadow-[0_30px_70px_-28px_rgba(0,48,96,0.3)]">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-steel to-steel-light" />

          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel/15 text-steel">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
                <path d="M8 6.5h8" strokeLinecap="round" />
                <circle cx="8.25" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
                <circle cx="12" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
                <circle cx="15.75" cy="11.25" r="0.9" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">If hired in-house</p>
          </div>

          <p className="mt-4 font-heading text-4xl font-bold text-navy">
            ${Math.round(internalHrResult.total).toLocaleString("en-US")}
          </p>
          <p className="text-sm text-navy/90">estimated cost to fill this role yourself</p>

          <div className="mt-6 space-y-3">
            {internalHrRows.map((row, i) => (
              <div key={row.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-navy">
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
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(row.pct, 4)}%`, background: ACCENTS[i % ACCENTS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mintex card */}
        <div className="relative overflow-hidden rounded-[24px] border border-steel bg-gradient-to-b from-steel/[0.12] to-white p-6 shadow-[0_30px_70px_-28px_rgba(0,48,96,0.3)]">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-steel via-steel-lighter to-steel-light" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-steel/20 text-steel">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                  <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3z" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy">With Mintex</p>
            </div>
            <span className="rounded-full bg-white border border-navy px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-navy">
              Recommended
            </span>
          </div>

          <p className="mt-4 font-heading text-4xl font-bold text-navy">
            ${Math.round(mintexResult.total).toLocaleString("en-US")}
          </p>
          <p className="text-sm text-navy/90">one flat fee 10% - 20% of the salary, nothing else</p>

          <ul className="mt-6 space-y-3 text-xs text-navy">
            <li className="flex items-start gap-1.5 font-medium">
              <CheckIcon />
              Recieve initial candidate profiles within 12-48 hrs, not {inputs.ttf} days
            </li>
            {NOT_BILLED.map((item) => (
              <li key={item} className="flex items-start gap-1.5 font-medium">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl bg-navy px-4 py-3 text-center">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-steel-lighter">You save</p>
            <p className="mt-0.5 text-xl font-bold text-white">
              {savings >= 0 ? "" : "−"}${Math.abs(Math.round(savings)).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>

      <span className="absolute left-1/2 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-mist bg-navy text-[11px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(0,48,96,0.5)] sm:flex">
        VS
      </span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-steel">
      <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.18" />
      <path d="M6 10.2l2.5 2.5L14 7.5" stroke="var(--color-navy)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
