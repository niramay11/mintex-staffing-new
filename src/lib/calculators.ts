export type ClientType = "direct" | "msp-tier1" | "msp-tier2";
export type DeliveryModel = "onshore" | "offshore";

export interface HiringCostInputs {
  annualSalary: number;
  timeToFillDays: number;
  adSpend: number;
  recruiterHourlyRate: number;
  recruiterHours: number;
  onboardingCost: number;
  clientType: ClientType;
  delivery: DeliveryModel;
}

export interface HiringCostBreakdownRow {
  label: string;
  amount: number;
}

export interface HiringCostResult {
  inHouseTotal: number;
  mintexTotal: number;
  savings: number;
  savingsPct: number;
  inHouseRows: HiringCostBreakdownRow[];
  mintexRows: HiringCostBreakdownRow[];
}

// Placement fee anchored to the 12% baseline already published on the homepage
// (HiringCalculatorPreview) for direct clients. Tier 1 MSP programs run at
// higher volume with tighter markups; Tier 2/franchise sits under a Tier 1 and
// adds its own layer on top, so it runs highest of the three.
export const MINTEX_FEE_RATES: Record<ClientType, number> = {
  direct: 0.12,
  "msp-tier1": 0.1,
  "msp-tier2": 0.15,
};

// Offshore delivery runs on a lower cost base than onshore.
export const OFFSHORE_FEE_MULTIPLIER = 0.85;

const WORKING_DAYS_PER_YEAR = 260;
// Fraction of a day's salary value treated as lost output while a seat is vacant.
const VACANCY_BURDEN_FACTOR = 0.8;
// New hires run below full output for a period after starting, regardless of
// who sourced them — this cost applies equally on both sides of the comparison.
const RAMP_UP_MONTHS = 4;
const RAMP_UP_LOST_CAPACITY = 0.55;
// Mintex's average time-to-fill, used as the vacancy-duration input for the
// "with Mintex" side of the comparison.
const MINTEX_TYPICAL_FILL_DAYS = 12;

function vacancyCost(annualSalary: number, days: number): number {
  return (annualSalary / WORKING_DAYS_PER_YEAR) * days * VACANCY_BURDEN_FACTOR;
}

function rampUpCost(annualSalary: number): number {
  return annualSalary * (RAMP_UP_MONTHS / 12) * RAMP_UP_LOST_CAPACITY;
}

function mintexFee(annualSalary: number, clientType: ClientType, delivery: DeliveryModel): number {
  const rate = MINTEX_FEE_RATES[clientType];
  const multiplier = delivery === "offshore" ? OFFSHORE_FEE_MULTIPLIER : 1;
  return annualSalary * rate * multiplier;
}

/**
 * Compares the cost of filling a role in-house against using Mintex, split
 * into the same cost categories on both sides so the two totals are directly
 * comparable. Fixed costs that don't change based on who sources the hire
 * (onboarding, ramp-up) are applied equally to both totals.
 */
export function calculateHiringCost(inputs: HiringCostInputs): HiringCostResult {
  const recruiterCost = inputs.recruiterHourlyRate * inputs.recruiterHours;
  const ramp = rampUpCost(inputs.annualSalary);

  const inHouseRows: HiringCostBreakdownRow[] = [
    { label: "Job ad spend", amount: inputs.adSpend },
    { label: "Internal recruiter time", amount: recruiterCost },
    { label: "Onboarding & training", amount: inputs.onboardingCost },
    { label: "Vacancy cost (role sits open)", amount: vacancyCost(inputs.annualSalary, inputs.timeToFillDays) },
    { label: "Ramp-up productivity loss", amount: ramp },
  ];

  const mintexRows: HiringCostBreakdownRow[] = [
    { label: "Mintex placement fee", amount: mintexFee(inputs.annualSalary, inputs.clientType, inputs.delivery) },
    { label: "Onboarding & training", amount: inputs.onboardingCost },
    { label: "Vacancy cost (faster fill)", amount: vacancyCost(inputs.annualSalary, MINTEX_TYPICAL_FILL_DAYS) },
    { label: "Ramp-up productivity loss", amount: ramp },
  ];

  const inHouseTotal = inHouseRows.reduce((sum, row) => sum + row.amount, 0);
  const mintexTotal = mintexRows.reduce((sum, row) => sum + row.amount, 0);
  const savings = inHouseTotal - mintexTotal;
  const savingsPct = inHouseTotal > 0 ? (savings / inHouseTotal) * 100 : 0;

  return { inHouseTotal, mintexTotal, savings, savingsPct, inHouseRows, mintexRows };
}
