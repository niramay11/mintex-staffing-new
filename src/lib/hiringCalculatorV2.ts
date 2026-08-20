// Mintex Hiring Cost Calculator — methodology v2 (Today vs With Mintex).
// Pure calculation layer, kept separate from the legacy method-comparison
// calculator in calculators.ts so the homepage widget and any other
// consumer of the old API are unaffected.

export const INDUSTRIES: Record<string, number> = {
  IT: 44,
  Healthcare: 49,
  Engineering: 50,
  "Industrial & Manufacturing": 33,
  "Finance & Accounting": 42,
  "Administrative & Clerical": 27,
  "Sales & Marketing": 35,
  "Customer Service": 25,
  "Transportation & Logistics": 30,
  "Creative & Design": 38,
  Legal: 45,
  Hospitality: 24,
};

export type SeniorityKeyV2 = "Entry" | "Mid" | "Senior" | "Director";

interface SeniorityConfigV2 {
  panelHrs: number;
  onb: number;
  ramp: number;
  cap: number;
}

export const SENIORITY: Record<SeniorityKeyV2, SeniorityConfigV2> = {
  Entry: { panelHrs: 2.5, onb: 0.03, ramp: 2.0, cap: 0.65 },
  Mid: { panelHrs: 4.5, onb: 0.035, ramp: 3.0, cap: 0.6 },
  Senior: { panelHrs: 6.5, onb: 0.045, ramp: 4.5, cap: 0.55 },
  Director: { panelHrs: 8.5, onb: 0.05, ramp: 6.0, cap: 0.5 },
};

export type RoleTypeKey = "Revenue-generating / billable" | "Core operational" | "Support / administrative";

interface RoleTypeConfig {
  VM: number;
  L: number;
  COV: number;
}

export const ROLE_TYPES: Record<RoleTypeKey, RoleTypeConfig> = {
  "Revenue-generating / billable": { VM: 3.0, L: 0.7, COV: 0.3 },
  "Core operational": { VM: 2.2, L: 0.65, COV: 0.3 },
  "Support / administrative": { VM: 1.5, L: 0.4, COV: 0.2 },
};

export const BURDEN = 1.28;
export const WORKDAYS = 260;
export const GAIN_LO = 0.3;
export const GAIN_HI = 0.4;

/* ---------------------------------------------------------------- MODE A */
export interface EmployerInputs {
  industry: string;
  hires: number;
  salary: number;
  days: number;
  recruiters: number;
  roleType: RoleTypeKey;
  seniority: SeniorityKeyV2;
  recruiterSalary: number;
  pctTime: number;
  ats: number;
  liSeats: number;
  liCost: number;
  jobBoards: number;
  careersSite: number;
  nScreened: number;
  nInterviewed: number;
  nFinalists: number;
  coordHours: number;
  rateRecruiter: number;
  ratePanel: number;
  rateExec: number;
  ads: number;
  assessment: number;
  fillInhouse: number;
  fillMintex: number;
  pExit: number;
  routed: number;
  cutTooling: boolean;
}

export interface EmployerSavings {
  daysSaved: number;
  savVac: number;
  savTime: number;
  savAds: number;
  savTooling: number;
  savFailed: number;
  savGuar: number;
  total: number;
  capped: boolean;
}

export interface EmployerResult {
  netVacDay: number;
  vacancyIsNeutral: boolean;
  fixedAnnual: number;
  tooling: number;
  screening: number;
  interview: number;
  finalPanel: number;
  coordination: number;
  onboarding: number;
  variablePerHire: number;
  vacancyCost: number;
  rampCost: number;
  failedSearches: number;
  costPerFailed: number;
  failedAnnual: number;
  attritionAnnual: number;
  totalToday: number;
  perHireToday: number;
  fixedPerHire: number;
  lo: EmployerSavings;
  hi: EmployerSavings;
  daysMintexLo: number;
  daysMintexHi: number;
  breakevenLo: number;
  breakevenHi: number;
  invisible: number;
}

export function calcEmployer(v: EmployerInputs): EmployerResult {
  const rt = ROLE_TYPES[v.roleType];
  const sn = SENIORITY[v.seniority];
  const dailySalary = v.salary / WORKDAYS;

  const netVacDay = Math.max(0, dailySalary * (rt.VM * rt.L + rt.COV - BURDEN));
  const vacancyIsNeutral = netVacDay <= 0.0001;

  const tooling = v.ats + v.liSeats * v.liCost + v.jobBoards + v.careersSite;
  const fixedAnnual = v.recruiters * v.recruiterSalary * BURDEN * v.pctTime + tooling;

  const screening = v.nScreened * 0.75 * v.rateRecruiter;
  const interview = v.nInterviewed * sn.panelHrs * v.ratePanel;
  const finalPanel = v.nFinalists * 2 * v.rateExec;
  const coordination = v.coordHours * v.rateRecruiter;
  const onboarding = v.salary * sn.onb;
  const variablePerHire = screening + interview + finalPanel + coordination + v.assessment + v.ads + onboarding;

  const vacancyCost = v.days * netVacDay;
  const rampCost = sn.ramp * (v.salary / 12) * (1 - sn.cap);

  const attempted = v.hires / v.fillInhouse;
  const failedSearches = attempted - v.hires;
  const costPerFailed = 0.6 * (screening + interview + coordination) + 30 * netVacDay;
  const failedAnnual = failedSearches * costPerFailed;

  const costPerEarlyExit = variablePerHire + rampCost * 0.5 + v.days * netVacDay;
  const attritionAnnual = v.pExit * v.hires * costPerEarlyExit;

  const totalToday =
    fixedAnnual + v.hires * (variablePerHire + vacancyCost + rampCost) + failedAnnual + attritionAnnual;

  const savingsAt = (g: number): EmployerSavings => {
    const daysSaved = v.days * g;
    const R = v.routed;
    const savVac = R * daysSaved * netVacDay;
    const savTime = R * (screening + 0.8 * coordination + interview * (1 - 3 / 5));
    const savAds = R * v.ads;
    const savTooling = v.cutTooling ? 0.5 * (v.liSeats * v.liCost + v.jobBoards) : 0;
    const failedOnRouted = R * (1 / v.fillInhouse - 1);
    const failedMintex = R * (1 / v.fillMintex - 1);
    const savFailed = Math.max(0, failedOnRouted - failedMintex) * costPerFailed;
    const exitsInside = v.pExit * R * 0.4;
    const savGuar = exitsInside * (variablePerHire + 0.5 * rampCost + daysSaved * netVacDay);
    const raw = savVac + savTime + savAds + savTooling + savFailed + savGuar;
    const total = Math.min(raw, 0.6 * totalToday);
    return { daysSaved, savVac, savTime, savAds, savTooling, savFailed, savGuar, total, capped: raw > 0.6 * totalToday };
  };

  const lo = savingsAt(GAIN_LO);
  const hi = savingsAt(GAIN_HI);

  return {
    netVacDay,
    vacancyIsNeutral,
    fixedAnnual,
    tooling,
    screening,
    interview,
    finalPanel,
    coordination,
    onboarding,
    variablePerHire,
    vacancyCost,
    rampCost,
    failedSearches,
    costPerFailed,
    failedAnnual,
    attritionAnnual,
    totalToday,
    perHireToday: totalToday / v.hires,
    fixedPerHire: fixedAnnual / v.hires,
    lo,
    hi,
    daysMintexLo: v.days * (1 - GAIN_LO),
    daysMintexHi: v.days * (1 - GAIN_HI),
    breakevenLo: lo.total / v.routed,
    breakevenHi: hi.total / v.routed,
    invisible: v.hires * vacancyCost + failedAnnual + attritionAnnual,
  };
}

/* ---------------------------------------------------------------- MODE B */
export interface StaffingInputs {
  reqs: number;
  fills: number;
  gp: number;
  recruiters: number;
  recCost: number;
  toolSeat: number;
  capacityPerRec: number;
  fillMintex: number;
}

export interface StaffingResult {
  capacity: number;
  uncovered: number;
  currentFillRate: number;
  costPerPlacement: number;
  gpRetained: number;
  newPlacements: number;
  gpCreated: number;
  recBreakeven: number;
  rampLoss: number;
  hireRisk: number;
  firstYearCost: number;
}

export function calcStaffing(v: StaffingInputs): StaffingResult {
  const capacity = v.recruiters * v.capacityPerRec;
  const uncovered = Math.max(0, v.reqs - capacity);
  const currentFillRate = capacity > 0 ? v.fills / capacity : 0;
  const costPerPlacement = v.fills > 0 ? (v.recruiters * (v.recCost + v.toolSeat)) / v.fills : 0;
  const gpRetained = v.gp > 0 ? (v.gp - costPerPlacement) / v.gp : 0;
  const newPlacements = uncovered * v.fillMintex;
  const gpCreated = newPlacements * v.gp;
  const recBreakeven = (v.recCost + v.toolSeat) / v.gp;
  const rampLoss = 4 * (v.recCost / 12) * (1 - 0.35);
  const hireRisk = 0.3 * (v.recCost * 0.5 + rampLoss);
  return {
    capacity,
    uncovered,
    currentFillRate,
    costPerPlacement,
    gpRetained,
    newPlacements,
    gpCreated,
    recBreakeven,
    rampLoss,
    hireRisk,
    firstYearCost: v.recCost + v.toolSeat + rampLoss,
  };
}

/* ---------------------------------------------------------------- MODE C */
export interface SearchInputs {
  searches: number;
  retainer: number;
  researchHours: number;
  researchRate: number;
  mappingTools: number;
  pFail: number;
}

export interface SearchResult {
  deliveryPerSearch: number;
  annualDelivery: number;
  failedCost: number;
  capacityGain: number;
}

export function calcSearch(v: SearchInputs): SearchResult {
  const deliveryPerSearch = v.researchHours * v.researchRate + v.mappingTools;
  const annualDelivery = v.searches * deliveryPerSearch;
  const failedCost = v.pFail * v.searches * (deliveryPerSearch + 0.3 * v.retainer);
  const capacityGain = v.searches * v.pFail * 0.6 * v.retainer;
  return { deliveryPerSearch, annualDelivery, failedCost, capacityGain };
}
