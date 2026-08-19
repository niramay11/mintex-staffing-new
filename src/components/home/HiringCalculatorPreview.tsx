"use client";

import { useState } from "react";
import { computeHiringCost } from "@/lib/calculators";

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

const BASE_INPUTS = {
  seniorityKey: "mid" as const,
  ttf: 35,
  cands: 15,
  rate: 75,
  bg: 150,
};

export default function HiringCalculatorPreview() {
  const [roles, setRoles] = useState(11);
  const [salary, setSalary] = useState(125000);

  const inHouseCost = computeHiringCost({ ...BASE_INPUTS, salary, methodKey: "internal_hr" }).total;
  const staffingCost = computeHiringCost({ ...BASE_INPUTS, salary, methodKey: "staffing_agency" }).total;
  const traditionalCost = roles * inHouseCost;
  const ourCost = roles * staffingCost;
  const savings = traditionalCost - ourCost;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-navy to-navy-secondary p-8 text-white dark:from-navy-900 dark:to-navy-800">
      <span className="inline-flex items-center rounded-full bg-steel/[0.16] px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-steel-lighter">
        HIRING COST CALCULATOR
      </span>
      <h3 className="mt-5 font-heading text-2xl font-semibold text-white">
        See what smarter hiring saves you
      </h3>

      <div className="mt-7 flex flex-col gap-6">
        <div>
          <div className="mb-2.5 flex items-baseline justify-between">
            <label htmlFor="preview-roles" className="text-sm text-steel-lighter">
              Roles to fill
            </label>
            <span className="font-heading text-lg font-semibold text-steel-lighter">{roles}</span>
          </div>
          <input
            id="preview-roles"
            type="range"
            min={1}
            max={25}
            value={roles}
            onChange={(event) => setRoles(Number(event.target.value))}
            className="h-1 w-full cursor-pointer accent-steel"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-baseline justify-between">
            <label htmlFor="preview-salary" className="text-sm text-steel-lighter">
              Avg. annual salary
            </label>
            <span className="font-heading text-lg font-semibold text-steel-lighter">
              ${Math.round(salary / 1000)}k
            </span>
          </div>
          <input
            id="preview-salary"
            type="range"
            min={40000}
            max={250000}
            step={5000}
            value={salary}
            onChange={(event) => setSalary(Number(event.target.value))}
            className="h-1 w-full cursor-pointer accent-steel"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-6 border-t border-white/10 pt-6">
        <div className="flex-1">
          <p className="text-[12.5px] text-steel-lighter">Hiring in-house</p>
          <p className="mt-1 font-heading text-xl font-semibold text-white/60 line-through decoration-white/30">
            {formatCurrency(traditionalCost)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] text-steel-lighter">You save with us</p>
          <p className="mt-1 font-heading text-2xl font-bold text-steel-lighter">
            {formatCurrency(savings)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-steel-lighter/80">
        Estimate based on standard cost-per-hire methodology (job posting, interview time, onboarding,
        vacancy cost) for hiring in-house vs. working with a staffing partner. For an itemized
        breakdown, use the{" "}
        <a href="/resources/hiring-cost-calculator" className="underline hover:text-white">
          full hiring cost calculator
        </a>
        .
      </p>
    </div>
  );
}
