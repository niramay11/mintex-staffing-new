"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  computeHiringCost,
  type HiringCostCalcInputs,
  type HiringCostResult,
  type IndustryKey,
  type MethodKey,
  type SeniorityKey,
} from "@/lib/calculators";

export type HiringCostInputs = HiringCostCalcInputs & { industryKey: IndustryKey };

const initialInputs: HiringCostInputs = {
  salary: 80000,
  seniorityKey: "mid",
  industryKey: "it",
  methodKey: "mintex_staffing",
  ttf: 35,
  cands: 15,
  rate: 75,
  bg: 150,
};

export type BreakdownRow = { key: string; label: string; amount: number; pct: number };

function withPct(result: HiringCostResult): BreakdownRow[] {
  const safeTotal = result.total || 1;
  return result.items.map((item) => ({ ...item, pct: (item.amount / safeTotal) * 100 }));
}

type Ctx = {
  inputs: HiringCostInputs;
  setField: <K extends keyof HiringCostInputs>(field: K, value: HiringCostInputs[K]) => void;
  result: HiringCostResult;
  breakdownRows: BreakdownRow[];
  internalHrResult: HiringCostResult;
  internalHrRows: BreakdownRow[];
  mintexResult: HiringCostResult;
};

const HiringCostContext = createContext<Ctx | null>(null);

export function HiringCostProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<HiringCostInputs>(initialInputs);

  function setField<K extends keyof HiringCostInputs>(field: K, value: HiringCostInputs[K]) {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }

  const value = useMemo<Ctx>(() => {
    const result = computeHiringCost(inputs);
    const internalHrResult = computeHiringCost({ ...inputs, methodKey: "internal_hr" });
    const mintexResult = computeHiringCost({ ...inputs, methodKey: "mintex_staffing" });
    return {
      inputs,
      setField,
      result,
      breakdownRows: withPct(result),
      internalHrResult,
      internalHrRows: withPct(internalHrResult),
      mintexResult,
    };
  }, [inputs]);

  return <HiringCostContext.Provider value={value}>{children}</HiringCostContext.Provider>;
}

export function useHiringCost() {
  const ctx = useContext(HiringCostContext);
  if (!ctx) throw new Error("useHiringCost must be used within a HiringCostProvider");
  return ctx;
}

export type { IndustryKey, MethodKey, SeniorityKey };
