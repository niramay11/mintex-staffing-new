"use client";

import { useState } from "react";

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function HiringCalculatorPreview() {
  const [roles, setRoles] = useState(11);
  const [salary, setSalary] = useState(125000);

  const traditionalCost = roles * salary * 0.2;
  const ourCost = roles * salary * 0.12;
  const savings = traditionalCost - ourCost;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-navy to-navy-secondary p-8 text-white">
      <span className="inline-flex items-center rounded-full bg-tan/[0.16] px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-tan-light">
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
            <span className="font-heading text-lg font-semibold text-tan-light">{roles}</span>
          </div>
          <input
            id="preview-roles"
            type="range"
            min={1}
            max={25}
            value={roles}
            onChange={(event) => setRoles(Number(event.target.value))}
            className="h-1 w-full cursor-pointer accent-tan"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-baseline justify-between">
            <label htmlFor="preview-salary" className="text-sm text-steel-lighter">
              Avg. annual salary
            </label>
            <span className="font-heading text-lg font-semibold text-tan-light">
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
            className="h-1 w-full cursor-pointer accent-tan"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-6 border-t border-white/10 pt-6">
        <div className="flex-1">
          <p className="text-[12.5px] text-steel-lighter">Typical agency (20%)</p>
          <p className="mt-1 font-heading text-xl font-semibold text-white/60 line-through decoration-white/30">
            {formatCurrency(traditionalCost)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] text-tan-light">You save with us</p>
          <p className="mt-1 font-heading text-2xl font-bold text-tan-light">
            {formatCurrency(savings)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-steel-lighter/80">
        Estimate based on a 20% traditional agency fee vs. Mintex&apos;s 12% placement fee. For an
        itemized breakdown, use the{" "}
        <a href="/resources/hiring-cost-calculator" className="underline hover:text-white">
          full hiring cost calculator
        </a>
        .
      </p>
    </div>
  );
}
