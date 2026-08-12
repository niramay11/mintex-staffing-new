export type SeniorityKey = "entry" | "mid" | "senior" | "manager" | "director";
export type IndustryKey =
  | "it"
  | "healthcare"
  | "engineering"
  | "manufacturing"
  | "finance"
  | "admin"
  | "sales"
  | "customer"
  | "logistics"
  | "creative"
  | "education"
  | "legal"
  | "hospitality";
export type MethodKey =
  | "internal_hr"
  | "staffing_agency"
  | "executive_search"
  | "job_boards"
  | "employee_referral"
  | "mintex_staffing";

interface SeniorityConfig {
  label: string;
  hoursPerCandidate: number;
  onboardingPct: number;
  equipCost: number;
  rampMonths: number;
  rampCapacity: number;
}

interface IndustryConfig {
  label: string;
  avgCost: number;
  avgDays: number;
}

interface MethodConfig {
  label: string;
  best: string;
  jobPostCost: number;
  agencyFeePct: number;
  referralBonus: number;
  interviewMult: number;
  ttfMult: number;
  isPartner?: boolean;
  flatFeeOnly?: boolean;
  ttfOverrideDays?: number;
}

export interface HiringCostBreakdownItem {
  key: string;
  label: string;
  amount: number;
}

export interface HiringCostResult {
  items: HiringCostBreakdownItem[];
  total: number;
  effectiveTtf: number;
  hiddenCosts: number;
}

export interface HiringCostCalcInputs {
  salary: number;
  seniorityKey: SeniorityKey;
  methodKey: MethodKey;
  ttf: number;
  cands: number;
  rate: number;
  bg: number;
}

// Cost-per-hire methodology in the spirit of SHRM's cost-per-hire framework, split into
// job posting, interview time, assessment, onboarding, equipment, vacancy, and ramp-up
// components. Constants here are illustrative planning benchmarks, not a live data feed —
// swap in historical data as it becomes available.
export const CONFIG: {
  seniority: Record<SeniorityKey, SeniorityConfig>;
  industry: Record<IndustryKey, IndustryConfig>;
  method: Record<MethodKey, MethodConfig>;
  vacancyBurdenFactor: number;
} = {
  seniority: {
    entry: { label: "Entry-level", hoursPerCandidate: 2.5, onboardingPct: 0.03, equipCost: 1200, rampMonths: 2, rampCapacity: 0.65 },
    mid: { label: "Mid-level", hoursPerCandidate: 3.75, onboardingPct: 0.035, equipCost: 2000, rampMonths: 3, rampCapacity: 0.6 },
    senior: { label: "Senior", hoursPerCandidate: 5.0, onboardingPct: 0.04, equipCost: 2500, rampMonths: 4, rampCapacity: 0.55 },
    manager: { label: "Manager", hoursPerCandidate: 6.5, onboardingPct: 0.045, equipCost: 3000, rampMonths: 4, rampCapacity: 0.5 },
    director: { label: "Director / Executive", hoursPerCandidate: 8.5, onboardingPct: 0.05, equipCost: 3500, rampMonths: 5, rampCapacity: 0.45 },
  },
  industry: {
    it: { label: "IT", avgCost: 10500, avgDays: 44 },
    healthcare: { label: "Healthcare", avgCost: 6200, avgDays: 35 },
    engineering: { label: "Engineering", avgCost: 8200, avgDays: 38 },
    manufacturing: { label: "Industrial & Manufacturing", avgCost: 4200, avgDays: 28 },
    finance: { label: "Finance & Accounting", avgCost: 9800, avgDays: 38 },
    admin: { label: "Administrative & Clerical", avgCost: 3000, avgDays: 22 },
    sales: { label: "Sales & Marketing", avgCost: 4500, avgDays: 30 },
    customer: { label: "Customer Service", avgCost: 2900, avgDays: 18 },
    logistics: { label: "Transportation & Logistics", avgCost: 3600, avgDays: 25 },
    creative: { label: "Creative & Design", avgCost: 5500, avgDays: 32 },
    education: { label: "Education", avgCost: 3600, avgDays: 40 },
    legal: { label: "Legal", avgCost: 8800, avgDays: 42 },
    hospitality: { label: "Hospitality", avgCost: 2600, avgDays: 20 },
  },
  method: {
    // Mintex charges one flat fee and nothing else — 12.5% of the candidate's annual salary.
    // No job posting, interview time, background check, onboarding or equipment cost is
    // billed to the client, so its total cost is just salary × 12.5%, full stop.
    mintex_staffing: {
      label: "Mintex Staffing",
      isPartner: true,
      flatFeeOnly: true,
      jobPostCost: 0,
      referralBonus: 0,
      interviewMult: 0,
      ttfMult: 0,
      agencyFeePct: 0.125,
      ttfOverrideDays: 3,
      best: "We source, screen & deliver ready-to-interview candidates in 12–48 hrs you pay only our one time flat fee",
    },
    internal_hr: {
      label: "In-House HR Department",
      jobPostCost: 350,
      agencyFeePct: 0,
      referralBonus: 0,
      interviewMult: 1.0,
      ttfMult: 1.0,
      best: "Most roles, cost-sensitive teams",
    },
    staffing_agency: {
      label: "Other Staffing Firm",
      jobPostCost: 0,
      agencyFeePct: 0.2,
      referralBonus: 0,
      interviewMult: 0.4,
      ttfMult: 0.7,
      best: "Hard-to-fill roles, speed over savings",
    },
    executive_search: {
      label: "Executive Search Firm",
      jobPostCost: 0,
      agencyFeePct: 0.28,
      referralBonus: 0,
      interviewMult: 0.3,
      ttfMult: 1.1,
      best: "Senior / executive & confidential searches",
    },
    job_boards: {
      label: "Job Boards",
      jobPostCost: 500,
      agencyFeePct: 0,
      referralBonus: 0,
      interviewMult: 1.3,
      ttfMult: 1.25,
      best: "High-volume, budget-constrained hiring",
    },
    employee_referral: {
      label: "Referrals",
      jobPostCost: 0,
      agencyFeePct: 0,
      referralBonus: 1500,
      interviewMult: 0.8,
      ttfMult: 0.75,
      best: "Culture-fit hires when your employee network is strong",
    },
  },
  vacancyBurdenFactor: 0.55,
};

export function computeHiringCost({
  salary,
  seniorityKey,
  methodKey,
  ttf,
  cands,
  rate,
  bg,
}: HiringCostCalcInputs): HiringCostResult {
  const sen = CONFIG.seniority[seniorityKey];
  const method = CONFIG.method[methodKey];

  if (method.flatFeeOnly) {
    const fee = salary * method.agencyFeePct;
    const effectiveTtf = method.ttfOverrideDays ?? ttf;
    return {
      items: [{ key: "agencyFee", label: "Mintex Placement Fee", amount: fee }],
      total: fee,
      effectiveTtf,
      hiddenCosts: 0,
    };
  }

  const jobPosting = method.jobPostCost;
  const interviewing = cands * sen.hoursPerCandidate * method.interviewMult * rate;
  const assessment = bg;
  const onboarding = salary * sen.onboardingPct;
  const equipment = sen.equipCost;
  const effectiveTtf = method.ttfOverrideDays ?? ttf * method.ttfMult;
  const vacancy = effectiveTtf * (salary / 365) * CONFIG.vacancyBurdenFactor;
  const rampLoss = sen.rampMonths * (salary / 12) * (1 - sen.rampCapacity);
  const agencyFee = salary * method.agencyFeePct;
  const referralBonus = method.referralBonus || 0;

  const items: HiringCostBreakdownItem[] = [
    { key: "jobPosting", label: "Job Posting & Advertising", amount: jobPosting },
    { key: "interviewing", label: "Interview & Screening Time", amount: interviewing },
    { key: "assessment", label: "Assessment & Background Check", amount: assessment },
    { key: "onboarding", label: "Onboarding & Training", amount: onboarding },
    { key: "equipment", label: "Equipment & IT Setup", amount: equipment },
    { key: "vacancy", label: "Vacancy Cost", amount: vacancy },
    { key: "rampLoss", label: "Ramp-Up Productivity Loss", amount: rampLoss },
  ];
  if (agencyFee > 0) items.push({ key: "agencyFee", label: "Agency / Search Fee", amount: agencyFee });
  if (referralBonus > 0) items.push({ key: "referralBonus", label: "Employee Recommendation Bonus", amount: referralBonus });

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total, effectiveTtf, hiddenCosts: vacancy + rampLoss };
}
