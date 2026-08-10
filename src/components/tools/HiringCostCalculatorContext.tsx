"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  calculateHiringCost,
  type ClientType,
  type DeliveryModel,
  type HiringCostResult,
} from "@/lib/calculators";

const initialInputs = {
  annualSalary: "85000",
  timeToFillDays: "45",
  adSpend: "1500",
  recruiterHourlyRate: "45",
  recruiterHours: "40",
  onboardingCost: "800",
  clientType: "direct",
  delivery: "onshore",
  industry: "",
};

export type HiringCostInputs = typeof initialInputs;

export type BreakdownRow = { label: string; amount: number; pct: number };

function withPct(rows: { label: string; amount: number }[], total: number): BreakdownRow[] {
  const safeTotal = total || 1;
  return rows
    .filter((row) => row.amount > 0)
    .map((row) => ({ ...row, pct: Math.round((row.amount / safeTotal) * 100) }));
}

function computeBreakdown(inputs: HiringCostInputs) {
  const result = calculateHiringCost({
    annualSalary: Number(inputs.annualSalary) || 0,
    timeToFillDays: Number(inputs.timeToFillDays) || 0,
    adSpend: Number(inputs.adSpend) || 0,
    recruiterHourlyRate: Number(inputs.recruiterHourlyRate) || 0,
    recruiterHours: Number(inputs.recruiterHours) || 0,
    onboardingCost: Number(inputs.onboardingCost) || 0,
    clientType: inputs.clientType as ClientType,
    delivery: inputs.delivery as DeliveryModel,
  });

  return {
    result,
    inHouseRows: withPct(result.inHouseRows, result.inHouseTotal),
    mintexRows: withPct(result.mintexRows, result.mintexTotal),
  };
}

type Ctx = {
  inputs: HiringCostInputs;
  setField: (field: keyof HiringCostInputs, value: string) => void;
  result: HiringCostResult;
  inHouseRows: BreakdownRow[];
  mintexRows: BreakdownRow[];
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
    () => ({
      inputs,
      setField,
      result: computed.result,
      inHouseRows: computed.inHouseRows,
      mintexRows: computed.mintexRows,
      calculate,
    }),
    [inputs, computed]
  );

  return <HiringCostContext.Provider value={value}>{children}</HiringCostContext.Provider>;
}

export function useHiringCost() {
  const ctx = useContext(HiringCostContext);
  if (!ctx) throw new Error("useHiringCost must be used within a HiringCostProvider");
  return ctx;
}
