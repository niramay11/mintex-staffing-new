"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { calculateHiringCost, type HiringCostResult } from "@/lib/calculators";

const initialInputs = {
  adSpend: "1500",
  agencyFees: "0",
  recruiterHourlyRate: "45",
  recruiterHours: "40",
  onboardingCost: "800",
  rolesFilled: "1",
};

export type HiringCostInputs = typeof initialInputs;

export type BreakdownRow = { label: string; amount: number; pct: number };

function computeBreakdown(inputs: HiringCostInputs): { result: HiringCostResult; rows: BreakdownRow[] } {
  const adSpend = Number(inputs.adSpend) || 0;
  const agencyFees = Number(inputs.agencyFees) || 0;
  const recruiterHourlyRate = Number(inputs.recruiterHourlyRate) || 0;
  const recruiterHours = Number(inputs.recruiterHours) || 0;
  const recruiterCost = recruiterHourlyRate * recruiterHours;
  const onboardingCost = Number(inputs.onboardingCost) || 0;
  const rolesFilled = Number(inputs.rolesFilled) || 1;

  const result = calculateHiringCost({
    adSpend,
    agencyFees,
    recruiterHourlyRate,
    recruiterHours,
    onboardingCost,
    rolesFilled,
  });

  const total = result.totalCost || 1;
  const rows = [
    { label: "Job ad spend", amount: adSpend },
    { label: "Agency / staffing fees", amount: agencyFees },
    { label: "Internal recruiter time", amount: recruiterCost },
    { label: "Onboarding cost", amount: onboardingCost },
  ]
    .filter((row) => row.amount > 0)
    .map((row) => ({ ...row, pct: Math.round((row.amount / total) * 100) }));

  return { result, rows };
}

type Ctx = {
  inputs: HiringCostInputs;
  setField: (field: keyof HiringCostInputs, value: string) => void;
  result: HiringCostResult;
  rows: BreakdownRow[];
  calculate: () => void;
};

const HiringCostContext = createContext<Ctx | null>(null);

export function HiringCostProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<HiringCostInputs>(initialInputs);
  const [computed, setComputed] = useState(() => computeBreakdown(initialInputs));

  function setField(field: keyof HiringCostInputs, value: string) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  function calculate() {
    setComputed(computeBreakdown(inputs));
  }

  const value = useMemo<Ctx>(
    () => ({ inputs, setField, result: computed.result, rows: computed.rows, calculate }),
    [inputs, computed]
  );

  return <HiringCostContext.Provider value={value}>{children}</HiringCostContext.Provider>;
}

export function useHiringCost() {
  const ctx = useContext(HiringCostContext);
  if (!ctx) throw new Error("useHiringCost must be used within a HiringCostProvider");
  return ctx;
}
