"use client";

import { Button } from "@/components/ui/Button";
import { useHiringCost, type HiringCostInputs } from "./HiringCostCalculatorContext";

export default function HiringCostCalculator() {
  const { inputs, setField, result, calculate } = useHiringCost();

  function handleChange(field: keyof HiringCostInputs) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setField(field, event.target.value);
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    calculate();
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="grid content-start gap-4 rounded-lg border border-navy/10 bg-white p-6">
        <Field label="Job ad spend ($)" value={inputs.adSpend} onChange={handleChange("adSpend")} />
        <Field label="Agency / staffing fees ($)" value={inputs.agencyFees} onChange={handleChange("agencyFees")} />
        <Field
          label="Internal recruiter hourly rate ($)"
          value={inputs.recruiterHourlyRate}
          onChange={handleChange("recruiterHourlyRate")}
        />
        <Field
          label="Internal recruiter hours spent"
          value={inputs.recruiterHours}
          onChange={handleChange("recruiterHours")}
        />
        <Field label="Onboarding cost ($)" value={inputs.onboardingCost} onChange={handleChange("onboardingCost")} />
        <Field label="Roles filled" value={inputs.rolesFilled} onChange={handleChange("rolesFilled")} />
        <Button type="submit">Calculate</Button>
      </form>

      <div className="rounded-lg bg-navy p-6 text-white">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-tan-light">Result</h3>
        <p className="mt-4 text-4xl font-bold">
          ${result.costPerHire.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="mt-1 text-sm text-white/70">cost per hire</p>
        <p className="mt-6 text-sm text-white/80">
          Total hiring spend: ${result.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="mt-6 text-xs text-white/50">
          Formula: (ad spend + agency fees + recruiter time cost + onboarding cost) &divide; roles
          filled.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block text-sm font-medium text-navy">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2 text-sm font-normal"
      />
    </label>
  );
}
