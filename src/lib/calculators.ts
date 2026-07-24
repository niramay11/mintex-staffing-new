export interface HiringCostInputs {
  adSpend: number;
  agencyFees: number;
  recruiterHourlyRate: number;
  recruiterHours: number;
  onboardingCost: number;
  rolesFilled: number;
}

export interface HiringCostResult {
  totalCost: number;
  costPerHire: number;
}

/**
 * Standard cost-per-hire formula: total hiring spend (external + internal
 * labor + onboarding) divided by roles filled.
 */
export function calculateHiringCost(inputs: HiringCostInputs): HiringCostResult {
  const internalRecruitingCost = inputs.recruiterHourlyRate * inputs.recruiterHours;
  const totalCost =
    inputs.adSpend + inputs.agencyFees + internalRecruitingCost + inputs.onboardingCost;
  const rolesFilled = Math.max(inputs.rolesFilled, 1);

  return {
    totalCost,
    costPerHire: totalCost / rolesFilled,
  };
}
