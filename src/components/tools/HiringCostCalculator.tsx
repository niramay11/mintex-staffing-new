"use client";

import type { Industry } from "@/content/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { useHiringCost, type HiringCostInputs } from "./HiringCostCalculatorContext";

const CLIENT_TYPE_OPTIONS = [
  { value: "direct", label: "Direct client" },
  { value: "msp-tier1", label: "MSP — Tier 1" },
  { value: "msp-tier2", label: "MSP — Tier 2 / Franchise" },
];

const DELIVERY_OPTIONS = [
  { value: "onshore", label: "Onshore" },
  { value: "offshore", label: "Offshore" },
];

export default function HiringCostCalculator({ industries = [] }: { industries?: Industry[] }) {
  const { inputs, setField, result, calculate } = useHiringCost();

  const industryOptions = [
    { value: "", label: "General / not sure" },
    ...industries.map((industry) => ({ value: industry.slug, label: industry.name })),
  ];
  const selectedIndustryName = industries.find((industry) => industry.slug === inputs.industry)?.name;

  const clientTypeLabel =
    inputs.clientType === "direct"
      ? "direct-client"
      : inputs.clientType === "msp-tier1"
        ? "MSP Tier 1"
        : "MSP Tier 2 / franchise";
  const engagementNote = `Estimate only, based on a ${clientTypeLabel} ${inputs.delivery} engagement. Onboarding and ramp-up costs are counted on both sides since they apply to the new hire regardless of who sources them — the savings come from avoided ad spend and recruiter time, a faster average fill, and Mintex's fee vs. an unfilled seat.`;

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
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Client type"
            value={inputs.clientType}
            onChange={(value) => setField("clientType", value)}
            options={CLIENT_TYPE_OPTIONS}
          />
          <Select
            label="Delivery"
            value={inputs.delivery}
            onChange={(value) => setField("delivery", value)}
            options={DELIVERY_OPTIONS}
          />
        </div>

        <Select
          label="Industry"
          value={inputs.industry}
          onChange={(value) => setField("industry", value)}
          options={industryOptions}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Annual salary for the role ($)" value={inputs.annualSalary} onChange={handleChange("annualSalary")} />
          <Field
            label="Time to fill if hired in-house (days)"
            value={inputs.timeToFillDays}
            onChange={handleChange("timeToFillDays")}
          />
        </div>

        <Field label="Job ad spend ($)" value={inputs.adSpend} onChange={handleChange("adSpend")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Internal recruiter hourly rate ($)"
            value={inputs.recruiterHourlyRate}
            onChange={handleChange("recruiterHourlyRate")}
          />
          <Field
            label="Internal recruiter hours spent (days)"
            value={inputs.recruiterHours}
            onChange={handleChange("recruiterHours")}
          />
        </div>
        <Field label="Onboarding & training cost ($)" value={inputs.onboardingCost} onChange={handleChange("onboardingCost")} />

        <Button type="submit">Calculate</Button>
      </form>

      <div className="rounded-lg bg-navy p-6 text-white">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-tan-light">Result</h3>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/60">If hired in-house</p>
            <p className="mt-1 text-2xl font-bold">
              ${result.inHouseTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-tan-light">With Mintex</p>
            <p className="mt-1 text-2xl font-bold text-tan-light">
              ${result.mintexTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-white/10 p-4">
          <p className="text-3xl font-bold text-tan-light">
            ${Math.max(result.savings, 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-sm text-white/80">
            estimated savings ({Math.max(Math.round(result.savingsPct), 0)}%) using Mintex for this hire
          </p>
        </div>

        <ButtonLink href="/contact" variant="primary" className="mt-6 w-full justify-center">
          Get a tailored {selectedIndustryName ? `${selectedIndustryName} ` : ""}quote
        </ButtonLink>

        <p className="mt-4 text-xs text-white/50">{engagementNote}</p>
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
