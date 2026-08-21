// Mintex Hiring Cost Calculator — methodology v9 (Today vs With Mintex).
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
  plain: string;
}

export const ROLE_TYPES: Record<RoleTypeKey, RoleTypeConfig> = {
  "Revenue-generating / billable": {
    VM: 2.6,
    L: 0.65,
    COV: 0.25,
    plain: "brings money in directly — sales, billable delivery, clinical",
  },
  "Core operational": {
    VM: 2.1,
    L: 0.62,
    COV: 0.28,
    plain: "keeps the business running day to day",
  },
  "Support / administrative": {
    VM: 1.4,
    L: 0.35,
    COV: 0.15,
    plain: "supports other people's work rather than producing output directly",
  },
};

export const BURDEN = 1.28;
export const WORKDAYS = 260;
export const GAIN_LO = 0.3;
export const GAIN_HI = 0.4;
export const SHOW_BREAKEVEN = false;

/* How the hiring gets staffed — sets recruiters + share of time. */
export type StaffingModeKey = "Our managers do it themselves" | "One person, part of their job" | "A dedicated recruiting team";

interface StaffingModeState {
  recruiters: number;
  pctTime: number;
}

export const STAFFING_MODES: Record<StaffingModeKey, { set: (s: StaffingModeState) => StaffingModeState }> = {
  "Our managers do it themselves": { set: () => ({ recruiters: 0, pctTime: 1 }) },
  "One person, part of their job": {
    set: (s) => ({ recruiters: 1, pctTime: s.pctTime === 1 ? 0.4 : s.pctTime }),
  },
  "A dedicated recruiting team": {
    set: (s) => ({ recruiters: Math.max(1, s.recruiters), pctTime: 1 }),
  },
};

/* ---------------------------------------------------------------- MODE A */
export interface EmployerInputs {
  industry: string;
  hires: number;
  salary: number;
  days: number;
  recruiters: number;
  staffing: StaffingModeKey;
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
  addSpeed: number;
  addFill: number;
}

export interface EmployerSavings {
  daysSaved: number;
  savVac: number;
  savTime: number;
  savScreen: number;
  savCoord: number;
  savInt: number;
  savAds: number;
  savTooling: number;
  savFailed: number;
  savGuar: number;
  failedNow: number;
  failedMx: number;
  exitsInside: number;
  total: number;
  capped: boolean;
}

export interface EmployerResult {
  rt: RoleTypeConfig;
  sn: SeniorityConfigV2;
  dailySalary: number;
  dailyValue: number;
  dailyLost: number;
  dailyCover: number;
  dailyNotPaid: number;
  netVacDay: number;
  vacancyIsNeutral: boolean;
  tooling: number;
  recruiterCost: number;
  fixedAnnual: number;
  screening: number;
  interview: number;
  finalPanel: number;
  coordination: number;
  interviewTotal: number;
  onboarding: number;
  onbTotal: number;
  variablePerHire: number;
  vacancyCost: number;
  rampCost: number;
  attempted: number;
  failedSearches: number;
  failedWork: number;
  failedVac: number;
  costPerFailed: number;
  failedAnnual: number;
  leavers: number;
  costPerEarlyExit: number;
  attritionAnnual: number;
  totalToday: number;
  perHireToday: number;
  fixedPerHire: number;
  lo: EmployerSavings;
  hi: EmployerSavings;
  daysLo: number;
  daysHi: number;
  breakLo: number;
  breakHi: number;
  invisible: number;
}

export function calcEmployer(v: EmployerInputs): EmployerResult {
  const rt = ROLE_TYPES[v.roleType];
  const sn = SENIORITY[v.seniority];

  const dailySalary = v.salary / WORKDAYS;
  const dailyValue = dailySalary * rt.VM;
  const dailyLost = dailyValue * rt.L;
  const dailyCover = dailySalary * rt.COV;
  const dailyNotPaid = dailySalary * BURDEN;
  const netVacDay = Math.max(0, dailyLost + dailyCover - dailyNotPaid);
  const vacancyIsNeutral = netVacDay <= 0.0001;

  const tooling = v.ats + v.liSeats * v.liCost + v.jobBoards + v.careersSite;
  const recruiterCost = v.recruiters * v.recruiterSalary * BURDEN * v.pctTime;
  const fixedAnnual = recruiterCost + tooling;

  const screening = v.nScreened * 0.75 * v.rateRecruiter;
  const interview = v.nInterviewed * sn.panelHrs * v.ratePanel;
  const finalPanel = v.nFinalists * 2 * v.rateExec;
  const coordination = v.coordHours * v.rateRecruiter;
  const interviewTotal = screening + interview + finalPanel + coordination;

  const onboarding = v.salary * sn.onb;
  const onbTotal = onboarding + v.ads + v.assessment;
  const variablePerHire = interviewTotal + onbTotal;

  const vacancyCost = v.days * netVacDay;
  const rampCost = sn.ramp * (v.salary / 12) * (1 - sn.cap);

  const attempted = v.hires / v.fillInhouse;
  const failedSearches = attempted - v.hires;
  const failedWork = 0.6 * (screening + interview + coordination);
  const failedVac = 30 * netVacDay;
  const costPerFailed = failedWork + failedVac;
  const failedAnnual = failedSearches * costPerFailed;

  const leavers = v.pExit * v.hires;
  const costPerEarlyExit = variablePerHire + rampCost * 0.5 + v.days * netVacDay;
  const attritionAnnual = leavers * costPerEarlyExit;

  const totalToday =
    fixedAnnual + v.hires * (variablePerHire + vacancyCost + rampCost) + failedAnnual + attritionAnnual;

  const savingsAt = (g: number): EmployerSavings => {
    const daysSaved = v.days * g;
    const R = v.routed;
    const savVac = R * daysSaved * netVacDay;
    const savScreen = screening;
    const savCoord = 0.8 * coordination;
    const savInt = interview * (1 - 3 / 5);
    const savTime = R * (savScreen + savCoord + savInt);
    const savAds = R * v.ads;
    const savTooling = v.cutTooling ? 0.5 * (v.liSeats * v.liCost + v.jobBoards) : 0;
    const failedNow = R * (1 / v.fillInhouse - 1);
    const failedMx = R * (1 / v.fillMintex - 1);
    const savFailed = Math.max(0, failedNow - failedMx) * costPerFailed;
    const exitsInside = v.pExit * R * 0.4;
    const savGuar = exitsInside * (variablePerHire + 0.5 * rampCost + daysSaved * netVacDay);
    const raw = savVac + savTime + savAds + savTooling + savFailed + savGuar;
    return {
      daysSaved,
      savVac,
      savTime,
      savScreen,
      savCoord,
      savInt,
      savAds,
      savTooling,
      savFailed,
      savGuar,
      failedNow,
      failedMx,
      exitsInside,
      total: Math.min(raw, 0.6 * totalToday),
      capped: raw > 0.6 * totalToday,
    };
  };

  const lo = savingsAt(GAIN_LO);
  const hi = savingsAt(GAIN_HI);

  return {
    rt,
    sn,
    dailySalary,
    dailyValue,
    dailyLost,
    dailyCover,
    dailyNotPaid,
    netVacDay,
    vacancyIsNeutral,
    tooling,
    recruiterCost,
    fixedAnnual,
    screening,
    interview,
    finalPanel,
    coordination,
    interviewTotal,
    onboarding,
    onbTotal,
    variablePerHire,
    vacancyCost,
    rampCost,
    attempted,
    failedSearches,
    failedWork,
    failedVac,
    costPerFailed,
    failedAnnual,
    leavers,
    costPerEarlyExit,
    attritionAnnual,
    totalToday,
    perHireToday: totalToday / v.hires,
    fixedPerHire: fixedAnnual / v.hires,
    lo,
    hi,
    daysLo: v.days * (1 - GAIN_LO),
    daysHi: v.days * (1 - GAIN_HI),
    breakLo: lo.total / v.routed,
    breakHi: hi.total / v.routed,
    invisible: v.hires * vacancyCost + failedAnnual + attritionAnnual,
  };
}

/* ---------------------------------------------------------------- MODE B */
export type EngagementKeyB = "Full 360" | "Sourcing only";

export interface StaffingInputs {
  reqs: number;
  fills: number;
  gp: number;
  recruiters: number;
  recCost: number;
  toolSeat: number;
  capacityPerRec: number;
  engagement: EngagementKeyB;
}

export interface StaffingResult {
  fixedAnnual: number;
  capacity: number;
  worked: number;
  uncovered: number;
  coverage: number;
  ownFillRate: number;
  gpToday: number;
  costPerPlacement: number;
  keptToday: number;
  gpRetained: number;
  slowQuarter: number;
  reqsPerMonth: number;
  droppedPerMonth: number;
  newPlacements: number;
  gpCreated: number;
  uplift: number;
  coverageAfter: number;
  recBreakeven: number;
  rampLoss: number;
  firstYearCost: number;
  hireRisk: number;
  recExtraPlacements: number;
  recGp: number;
}

export function calcStaffing(v: StaffingInputs): StaffingResult {
  const fixedAnnual = v.recruiters * (v.recCost + v.toolSeat);
  const capacity = v.recruiters * v.capacityPerRec;
  const worked = Math.min(v.reqs, capacity);
  const uncovered = Math.max(0, v.reqs - capacity);
  const coverage = v.reqs > 0 ? worked / v.reqs : 0;
  const ownFillRate = worked > 0 ? v.fills / worked : 0;

  const gpToday = v.fills * v.gp;
  const costPerPlacement = v.fills > 0 ? fixedAnnual / v.fills : 0;
  const keptToday = gpToday - fixedAnnual;
  const gpRetained = v.gp > 0 ? (v.gp - costPerPlacement) / v.gp : 0;

  const slowQuarter = fixedAnnual / 4;
  const reqsPerMonth = v.reqs / 12;
  const droppedPerMonth = uncovered / 12;

  const newPlacements = uncovered * ownFillRate;
  const gpCreated = newPlacements * v.gp;
  const uplift = gpToday > 0 ? gpCreated / gpToday : 0;
  const coverageAfter = v.reqs > 0 ? Math.min(1, (worked + uncovered) / v.reqs) : 0;

  const recBreakeven = v.gp > 0 ? (v.recCost + v.toolSeat) / v.gp : 0;
  const rampLoss = 4 * (v.recCost / 12) * (1 - 0.35);
  const firstYearCost = v.recCost + v.toolSeat + rampLoss;
  const hireRisk = 0.3 * (v.recCost * 0.5 + rampLoss);
  const recExtraPlacements = v.capacityPerRec * ownFillRate;
  const recGp = recExtraPlacements * v.gp;

  return {
    fixedAnnual,
    capacity,
    worked,
    uncovered,
    coverage,
    ownFillRate,
    gpToday,
    costPerPlacement,
    keptToday,
    gpRetained,
    slowQuarter,
    reqsPerMonth,
    droppedPerMonth,
    newPlacements,
    gpCreated,
    uplift,
    coverageAfter,
    recBreakeven,
    rampLoss,
    firstYearCost,
    hireRisk,
    recExtraPlacements,
    recGp,
  };
}

/* ---------------------------------------------------------------- MODE C */
export type EngagementKeyC = "Research only" | "Full delivery";

export interface SearchInputs {
  searches: number;
  retainer: number;
  researchHours: number;
  researchRate: number;
  mappingTools: number;
  pFail: number;
  refundPct: number;
  extraSearches: number;
  engagement: EngagementKeyC;
}

export interface SearchResult {
  hoursPerSearch: number;
  deliveryPerSearch: number;
  annualDelivery: number;
  annualHours: number;
  pctOfRetainer: number;
  stalled: number;
  stalledCost: number;
  capacityValue: number;
  capacityMargin: number;
  feeIncome: number;
}

export function calcSearch(v: SearchInputs): SearchResult {
  const hoursPerSearch = v.researchHours;
  const deliveryPerSearch = hoursPerSearch * v.researchRate + v.mappingTools;
  const annualDelivery = v.searches * deliveryPerSearch;
  const annualHours = v.searches * hoursPerSearch;
  const pctOfRetainer = v.retainer > 0 ? deliveryPerSearch / v.retainer : 0;
  const stalled = v.pFail * v.searches;
  const stalledCost = stalled * (deliveryPerSearch + v.refundPct * v.retainer);
  const capacityValue = v.extraSearches * v.retainer;
  const capacityMargin = capacityValue - v.extraSearches * deliveryPerSearch;
  const feeIncome = v.searches * v.retainer;
  return {
    hoursPerSearch,
    deliveryPerSearch,
    annualDelivery,
    annualHours,
    pctOfRetainer,
    stalled,
    stalledCost,
    capacityValue,
    capacityMargin,
    feeIncome,
  };
}
