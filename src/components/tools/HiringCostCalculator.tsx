"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import {
  INDUSTRIES,
  SENIORITY,
  ROLE_TYPES,
  calcEmployer,
  calcStaffing,
  calcSearch,
  type EmployerInputs,
  type StaffingInputs,
  type SearchInputs,
  type SeniorityKeyV2,
  type RoleTypeKey,
} from "@/lib/hiringCalculatorV2";

type Mode = "employer" | "staffing" | "search" | null;

const money = (n: number) => "$" + (Math.round((n || 0) / 100) * 100).toLocaleString("en-US");
const pct = (n: number) => Math.round(n * 100) + "%";

const INDUSTRY_OPTIONS = Object.keys(INDUSTRIES).map((k) => ({ value: k, label: k }));
const ROLE_TYPE_OPTIONS = Object.keys(ROLE_TYPES).map((k) => ({ value: k, label: k }));
const SENIORITY_OPTIONS = Object.keys(SENIORITY).map((k) => ({ value: k, label: k }));

const MODE_CARDS: { key: Exclude<Mode, null>; title: string; desc: string }[] = [
  { key: "employer", title: "We hire for ourselves", desc: "You have an in-house HR or talent team filling your own roles." },
  { key: "staffing", title: "We're a staffing firm", desc: "You place candidates with clients and want more coverage." },
  { key: "search", title: "We're an executive search firm", desc: "You run retained searches and carry the research load." },
];

const EMPLOYER_DEFAULTS: EmployerInputs = {
  industry: "IT",
  hires: 12,
  salary: 80000,
  days: 44,
  recruiters: 1,
  roleType: "Core operational",
  seniority: "Mid",
  recruiterSalary: 72000,
  pctTime: 1.0,
  ats: 6000,
  liSeats: 1,
  liCost: 10800,
  jobBoards: 6000,
  careersSite: 2000,
  nScreened: 12,
  nInterviewed: 5,
  nFinalists: 2,
  coordHours: 8,
  rateRecruiter: 45,
  ratePanel: 75,
  rateExec: 120,
  ads: 500,
  assessment: 150,
  fillInhouse: 0.75,
  fillMintex: 0.85,
  pExit: 0.2,
  routed: 12,
  cutTooling: false,
};

const STAFFING_DEFAULTS: StaffingInputs = {
  reqs: 200,
  fills: 45,
  gp: 18000,
  recruiters: 3,
  recCost: 115000,
  toolSeat: 18000,
  capacityPerRec: 45,
  fillMintex: 0.6,
};

const SEARCH_DEFAULTS: SearchInputs = {
  searches: 15,
  retainer: 60000,
  researchHours: 60,
  researchRate: 55,
  mappingTools: 1200,
  pFail: 0.15,
};

/* ------------------------------------------------------------- UI PARTS */
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-semibold text-navy dark:text-cream">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] leading-relaxed text-navy/70 dark:text-cream/70">{hint}</span>}
    </label>
  );
}

function NumField({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-3 transition-colors hover:border-navy/25 focus-within:border-steel dark:border-white/15 dark:bg-navy-900 dark:hover:border-white/25">
      {prefix && <span className="flex-shrink-0 text-sm font-semibold text-navy/50 dark:text-cream/50">{prefix}</span>}
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full flex-1 border-0 bg-transparent text-sm font-semibold text-navy !outline-none dark:text-cream"
      />
      {suffix && <span className="flex-shrink-0 text-sm font-medium text-navy/50 dark:text-cream/50">{suffix}</span>}
    </div>
  );
}

function Slider({ min, max, step = 1, value, onChange }: { min: number; max: number; step?: number; value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1 w-full cursor-pointer accent-steel"
    />
  );
}

function Row({
  label,
  value,
  sub,
  strong,
  accent,
  indent,
}: {
  label: string;
  value: string;
  sub?: string;
  strong?: boolean;
  accent?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-navy/10 py-2.5 text-[13.5px] dark:border-white/10 ${indent ? "pl-4" : ""}`}>
      <span className={strong ? "font-semibold text-navy dark:text-cream" : "text-navy/90 dark:text-cream/90"}>
        {label}
        {sub && <span className="ml-1.5 text-xs text-steel dark:text-steel-light">{sub}</span>}
      </span>
      <span
        className={`flex-shrink-0 tabular-nums ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-navy dark:text-cream"} ${strong ? "font-semibold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "accent" | "warn" }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5 dark:border-white/10 dark:bg-navy-900">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">{label}</p>
      <p
        className={`mt-2 font-heading text-[22px] font-bold tabular-nums ${
          tone === "accent" ? "text-emerald-600 dark:text-emerald-400" : tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-navy dark:text-cream"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-navy/70 dark:text-cream/70">{sub}</p>}
    </div>
  );
}

function Note({ tone = "warn", children }: { tone?: "warn" | "good"; children: ReactNode }) {
  const cls =
    tone === "good"
      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200"
      : "border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-200";
  return <div className={`my-4 rounded-r-lg border-l-2 p-4 text-[13px] leading-relaxed ${cls}`}>{children}</div>;
}

function Disclose({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="mt-5 rounded-3xl border border-navy/10 bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-900">
      <summary className="cursor-pointer list-none px-6 py-4 font-heading text-sm font-semibold text-navy dark:text-cream">{title}</summary>
      <div className="space-y-1 px-6 pb-6 text-[13.5px] leading-relaxed text-navy dark:text-cream">{children}</div>
    </details>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-4 text-sm text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
      &larr; Change who you are
    </button>
  );
}

function CtaRow() {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <ButtonLink href="/seek-talent/get-started" variant="primary">
        Get a tailored quote
      </ButtonLink>
      <ButtonLink href="/contact" variant="secondary">
        Talk to us
      </ButtonLink>
    </div>
  );
}

/* =========================================================== MAIN =========== */
export default function HiringCostCalculator() {
  const [mode, setMode] = useState<Mode>(null);
  const [a, setA] = useState<EmployerInputs>(EMPLOYER_DEFAULTS);
  const [b, setB] = useState<StaffingInputs>(STAFFING_DEFAULTS);
  const [c, setC] = useState<SearchInputs>(SEARCH_DEFAULTS);

  const upA = <K extends keyof EmployerInputs>(k: K, val: EmployerInputs[K]) => setA((s) => ({ ...s, [k]: val }));
  const upB = <K extends keyof StaffingInputs>(k: K, val: StaffingInputs[K]) => setB((s) => ({ ...s, [k]: val }));
  const upC = <K extends keyof SearchInputs>(k: K, val: SearchInputs[K]) => setC((s) => ({ ...s, [k]: val }));

  const RA = useMemo(() => calcEmployer(a), [a]);
  const RB = useMemo(() => calcStaffing(b), [b]);
  const RC = useMemo(() => calcSearch(c), [c]);

  /* ---------------------------------------------------------- mode picker */
  if (!mode) {
    return (
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Start with who you are</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {MODE_CARDS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className="rounded-2xl border border-l-[3px] border-navy/10 border-l-transparent bg-white p-6 text-left transition-colors hover:border-l-steel dark:border-white/10 dark:bg-navy-900"
            >
              <h3 className="font-heading text-base font-semibold text-navy dark:text-cream">{m.title}</h3>
              <p className="mt-1.5 text-sm text-navy/80 dark:text-cream/80">{m.desc}</p>
            </button>
          ))}
        </div>
        <p className="mt-8 text-xs text-navy/60 dark:text-cream/60">
          Nothing you enter is stored or sent anywhere. Every assumption we use is shown and can be changed.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------ EMPLOYER */
  if (mode === "employer") {
    const barMax = Math.max(RA.totalToday, 1);
    const withMintex = RA.totalToday - RA.lo.total;

    return (
      <div>
        <BackButton onClick={() => setMode(null)} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Employer &middot; in-house hiring</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">Your hiring cost, per year</h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* ---------------- inputs ---------------- */}
          <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Tell us about your hiring</p>

            <div className="mb-4">
              <Select
                label="What industry are you in?"
                value={a.industry}
                options={INDUSTRY_OPTIONS}
                onChange={(x) => setA((s) => ({ ...s, industry: x, days: INDUSTRIES[x] }))}
              />
            </div>

            <Field label="How many people do you hire in a year?">
              <NumField value={a.hires} min={1} onChange={(x) => setA((s) => ({ ...s, hires: x, routed: Math.min(s.routed, x) }))} />
            </Field>

            <Field label="Average salary for those roles">
              <NumField value={a.salary} prefix="$" step={5000} onChange={(x) => upA("salary", x)} />
            </Field>
            <div className="-mt-2.5 mb-4">
              <Slider min={35000} max={250000} step={5000} value={a.salary} onChange={(x) => upA("salary", x)} />
            </div>

            <Field
              label="How long does a role usually sit open?"
              hint={`${a.industry} benchmark: ${INDUSTRIES[a.industry]} days. Change it to your own experience.`}
            >
              <NumField value={a.days} suffix="days" min={1} onChange={(x) => upA("days", x)} />
            </Field>
            <div className="-mt-2.5 mb-4">
              <Slider min={7} max={120} value={a.days} onChange={(x) => upA("days", x)} />
            </div>

            <Field label="In-house recruiters" hint="Enter 0 if hiring managers do it themselves.">
              <NumField value={a.recruiters} step={0.5} onChange={(x) => upA("recruiters", x)} />
            </Field>

            <div className="mb-4">
              <Select label="What kind of roles are these?" value={a.roleType} options={ROLE_TYPE_OPTIONS} onChange={(x) => upA("roleType", x as RoleTypeKey)} />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy/70 dark:text-cream/70">
                This decides how much output is genuinely lost while a seat is empty.
              </p>
            </div>

            <div className="mb-4">
              <Select label="Typical seniority" value={a.seniority} options={SENIORITY_OPTIONS} onChange={(x) => upA("seniority", x as SeniorityKeyV2)} />
            </div>

            <div className="mt-2 border-t border-navy/10 pt-4 dark:border-white/10">
              <Field label={`Roles you'd route to Mintex: ${a.routed} of ${a.hires}`}>
                <Slider min={1} max={Math.max(1, a.hires)} value={a.routed} onChange={(x) => upA("routed", x)} />
              </Field>
            </div>
          </div>

          {/* ---------------- results ---------------- */}
          <div>
            <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Cost Mintex takes off the table</p>
              <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">
                {money(RA.lo.total)} &ndash; {money(RA.hi.total)}
              </p>
              <p className="mt-3 max-w-lg text-[13.5px] text-white/75">
                A year, across {a.routed} {a.routed === 1 ? "role" : "roles"}. Built from your own numbers: recovered vacancy days, internal hours returned
                to your team, searches that no longer fail, and replacements covered by guarantee.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <StatCard label="Your hiring costs today" value={money(RA.totalToday)} sub={`${money(RA.perHireToday)} per hire, all in`} />
              <StatCard
                label="Time to fill"
                value={`${Math.round(RA.daysMintexHi)}–${Math.round(RA.daysMintexLo)} days`}
                sub={`instead of ${a.days} days today`}
                tone="accent"
              />
              <StatCard label="Never on a spreadsheet" value={money(RA.invisible)} sub="empty seats, failed searches, early exits" tone="warn" />
            </div>

            <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-navy dark:text-cream">
                  <span>Hiring on your own</span>
                  <span className="tabular-nums font-semibold">{money(RA.totalToday)}</span>
                </div>
                <div className="h-6 overflow-hidden rounded-full bg-mist dark:bg-navy-800">
                  <div className="h-full rounded-full bg-steel" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-navy dark:text-cream">
                  <span>
                    Cost remaining with Mintex <span className="text-xs text-steel dark:text-steel-light">before our fee</span>
                  </span>
                  <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">{money(withMintex)}</span>
                </div>
                <div className="h-6 overflow-hidden rounded-full bg-mist dark:bg-navy-800">
                  <div
                    className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                    style={{ width: `${Math.max(0, Math.min(100, (withMintex / barMax) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {RA.vacancyIsNeutral && (
              <Note>
                For {a.roleType.toLowerCase()} roles at this salary, an empty seat is close to cost-neutral in cash terms &mdash; you aren&apos;t paying the
                salary while it&apos;s open. The savings above come from internal time and failed searches instead, not vacancy.
              </Note>
            )}

            {RA.lo.capped && (
              <Note>
                We&apos;ve capped the saving at 60% of your current cost. Your inputs produce a larger figure, but we&apos;d rather show you something you
                can defend internally.
              </Note>
            )}

            <Disclose title="Show me how we got there">
              <p className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What you spend today</p>
              <Row label="Recruiting team & tools" sub="fixed, paid whether or not anyone is hired" value={money(RA.fixedAnnual)} />
              <Row label="Cost per hire before anyone is interviewed" indent value={money(RA.fixedPerHire)} />
              <Row
                label={`Interview & screening time × ${a.hires}`}
                value={money((RA.screening + RA.interview + RA.finalPanel + RA.coordination) * a.hires)}
              />
              <Row label={`Onboarding, ads, assessments × ${a.hires}`} value={money((RA.onboarding + a.ads + a.assessment) * a.hires)} />
              <Row
                label={`Empty seat, ${a.days} days × ${a.hires}`}
                sub={`$${Math.round(RA.netVacDay).toLocaleString("en-US")}/day net`}
                value={money(RA.vacancyCost * a.hires)}
              />
              <Row label={`Ramp-up to full productivity × ${a.hires}`} value={money(RA.rampCost * a.hires)} />
              <Row
                label="Searches that don't produce a hire"
                sub={`${RA.failedSearches.toFixed(1)}/yr at ${pct(a.fillInhouse)} fill rate`}
                value={money(RA.failedAnnual)}
              />
              <Row label="People who leave inside a year" sub={`${pct(a.pExit)} of new hires`} value={money(RA.attritionAnnual)} />
              <Row label="Total" value={money(RA.totalToday)} strong />

              <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What Mintex removes</p>
              <Row
                label="Vacancy days recovered"
                sub={`${Math.round(RA.lo.daysSaved)}–${Math.round(RA.hi.daysSaved)} days faster per role`}
                value={`${money(RA.lo.savVac)} – ${money(RA.hi.savVac)}`}
                accent
              />
              <Row label="Internal hours returned to your team" sub="sourcing, screening, coordination" value={money(RA.lo.savTime)} accent />
              <Row label="Job board and advertising spend" value={money(RA.lo.savAds)} accent />
              {a.cutTooling && <Row label="Sourcing tool seats no longer needed" value={money(RA.lo.savTooling)} accent />}
              <Row
                label="Searches that no longer fail"
                sub={`${pct(a.fillMintex)} fill rate vs ${pct(a.fillInhouse)}`}
                value={money(RA.lo.savFailed)}
                accent
              />
              <Row label="Replacements covered by guarantee" value={money(RA.lo.savGuar)} accent />
              <Row label="Total removed" value={`${money(RA.lo.total)} – ${money(RA.hi.total)}`} strong accent />

              <Note tone="good">
                On your own numbers, engaging Mintex is cost-neutral at anything up to <strong>{money(RA.breakevenLo)}&ndash;{money(RA.breakevenHi)} per hire</strong>.
                What we actually charge depends on the role, the volume and the market &mdash; that&apos;s a conversation, not a number on a webpage.
              </Note>

              <p className="mt-3 text-xs leading-relaxed text-navy/70 dark:text-cream/70">
                We deliberately don&apos;t claim a saving on ramp-up. Mintex doesn&apos;t shorten how long someone takes to get up to speed &mdash; it starts
                that clock earlier, and that&apos;s already counted in the vacancy line above.
              </p>
            </Disclose>

            <Disclose title="Adjust our assumptions">
              <p className="mb-1 mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Your team & tools</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Loaded recruiter salary">
                  <NumField value={a.recruiterSalary} prefix="$" step={1000} onChange={(x) => upA("recruiterSalary", x)} />
                </Field>
                <Field label="Share of their time on hiring">
                  <NumField value={Math.round(a.pctTime * 100)} suffix="%" onChange={(x) => upA("pctTime", x / 100)} />
                </Field>
                <Field label="ATS / HRIS per year">
                  <NumField value={a.ats} prefix="$" step={500} onChange={(x) => upA("ats", x)} />
                </Field>
                <Field label="LinkedIn Recruiter seats">
                  <NumField value={a.liSeats} onChange={(x) => upA("liSeats", x)} />
                </Field>
                <Field label="Job boards per year">
                  <NumField value={a.jobBoards} prefix="$" step={500} onChange={(x) => upA("jobBoards", x)} />
                </Field>
                <Field label="Careers site & employer brand">
                  <NumField value={a.careersSite} prefix="$" step={500} onChange={(x) => upA("careersSite", x)} />
                </Field>
              </div>

              <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Your interview process</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Candidates screened per role">
                  <NumField value={a.nScreened} onChange={(x) => upA("nScreened", x)} />
                </Field>
                <Field label="Candidates interviewed">
                  <NumField value={a.nInterviewed} onChange={(x) => upA("nInterviewed", x)} />
                </Field>
                <Field label="Finalists">
                  <NumField value={a.nFinalists} onChange={(x) => upA("nFinalists", x)} />
                </Field>
                <Field label="Coordination hours per role">
                  <NumField value={a.coordHours} suffix="hrs" onChange={(x) => upA("coordHours", x)} />
                </Field>
                <Field label="Recruiter hourly cost">
                  <NumField value={a.rateRecruiter} prefix="$" onChange={(x) => upA("rateRecruiter", x)} />
                </Field>
                <Field label="Interview panel hourly cost">
                  <NumField value={a.ratePanel} prefix="$" onChange={(x) => upA("ratePanel", x)} />
                </Field>
                <Field label="Executive hourly cost">
                  <NumField value={a.rateExec} prefix="$" onChange={(x) => upA("rateExec", x)} />
                </Field>
                <Field label="Advertising per role">
                  <NumField value={a.ads} prefix="$" step={50} onChange={(x) => upA("ads", x)} />
                </Field>
              </div>

              <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Outcomes</p>
              <Field label={`Roles you currently fill without outside help: ${pct(a.fillInhouse)}`}>
                <Slider min={40} max={100} value={Math.round(a.fillInhouse * 100)} onChange={(x) => upA("fillInhouse", x / 100)} />
              </Field>
              <Field label={`Mintex fill rate: ${pct(a.fillMintex)}`} hint="We fill 80-90% depending on pay rate, location and job title.">
                <Slider min={80} max={90} value={Math.round(a.fillMintex * 100)} onChange={(x) => upA("fillMintex", x / 100)} />
              </Field>
              <Field label={`New hires who leave inside a year: ${pct(a.pExit)}`}>
                <Slider min={0} max={40} value={Math.round(a.pExit * 100)} onChange={(x) => upA("pExit", x / 100)} />
              </Field>

              <label className="mt-3 flex items-start gap-2.5 text-sm text-navy dark:text-cream">
                <input
                  type="checkbox"
                  checked={a.cutTooling}
                  onChange={(e) => upA("cutTooling", e.target.checked)}
                  className="mt-0.5 accent-steel"
                />
                <span>
                  Count sourcing tool seats we&apos;d no longer need
                  <span className="mt-1 block text-[11.5px] text-navy/70 dark:text-cream/70">Off by default. Only realistic if you route most hiring out.</span>
                </span>
              </label>

              <Note>
                Equipment and IT setup is left out of both columns on purpose &mdash; it costs the same however you hire, so including it would only flatter
                the comparison.
              </Note>
            </Disclose>

            <CtaRow />

            <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">
              Estimates for planning purposes. Benchmarks are directional US figures, replace any of them with your own hiring data above. Validate against
              your historical numbers before budgeting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ STAFFING */
  if (mode === "staffing") {
    return (
      <div>
        <BackButton onClick={() => setMode(null)} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Staffing firm &middot; MSP &middot; tier-1 vendor</p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">What are your uncovered reqs worth?</h2>

        <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Your desk, per year</p>
            <Field label="Reqs you receive">
              <NumField value={b.reqs} onChange={(x) => upB("reqs", x)} />
            </Field>
            <Field label="Reqs you actually fill">
              <NumField value={b.fills} onChange={(x) => upB("fills", x)} />
            </Field>
            <Field label="Average gross profit per placement">
              <NumField value={b.gp} prefix="$" step={500} onChange={(x) => upB("gp", x)} />
            </Field>
            <Field label="Recruiters on staff">
              <NumField value={b.recruiters} onChange={(x) => upB("recruiters", x)} />
            </Field>
            <Field label="Fully loaded cost per recruiter" hint="Base, commission, taxes and benefits.">
              <NumField value={b.recCost} prefix="$" step={5000} onChange={(x) => upB("recCost", x)} />
            </Field>
            <Field label="Sourcing tools per seat" hint="LinkedIn Recruiter, job boards, databases.">
              <NumField value={b.toolSeat} prefix="$" step={1000} onChange={(x) => upB("toolSeat", x)} />
            </Field>
            <Field label="Reqs one recruiter can genuinely work per year">
              <NumField value={b.capacityPerRec} onChange={(x) => upB("capacityPerRec", x)} />
            </Field>
          </div>

          <div>
            <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Gross profit going unworked</p>
              <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">{money(RB.gpCreated)}</p>
              <p className="mt-3 max-w-lg text-[13.5px] text-white/75">
                {`${Math.round(RB.uncovered)} reqs a year get no meaningful coverage. At a conservative ${pct(b.fillMintex)} fill rate on those, that's ${Math.round(RB.newPlacements)} placements you aren't making. Your share is set per engagement, we work under your brand.`}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <StatCard label="Cost per placement today" value={money(RB.costPerPlacement)} sub={`${pct(Math.max(0, RB.gpRetained))} of GP retained`} />
              <StatCard label="Reqs with no coverage" value={String(Math.round(RB.uncovered))} sub={`of ${b.reqs} received`} tone="warn" />
              <StatCard
                label="Fill rate on worked reqs"
                value={pct(RB.currentFillRate)}
                sub={`${b.fills} fills from ${Math.round(RB.capacity)} worked`}
              />
            </div>

            <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">The decision you&apos;re actually weighing</p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Hire another recruiter</p>
                  <Row label="Year-one cost" value={money(RB.firstYearCost)} />
                  <Row label="Productive from" value="Month 4" />
                  <Row label="Cost in a slow quarter" value="Unchanged" />
                  <Row label="Placements to break even" value={RB.recBreakeven.toFixed(1)} />
                  <Row label="If they don't work out" value={money(RB.hireRisk)} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">Split with Mintex</p>
                  <Row label="Year-one cost" value="$0 until a placement" accent />
                  <Row label="Productive from" value="Immediately" accent />
                  <Row label="Cost in a slow quarter" value="$0" accent />
                  <Row label="Placements to break even" value="0" accent />
                  <Row label="If it doesn't work out" value="No downside" accent />
                </div>
              </div>
              <Note tone="good">
                A recruiter is a fixed cost you carry through every slow quarter. A split is variable, it only exists when a placement does. We deliver under
                your brand, so the client relationship stays yours.
              </Note>
            </div>

            <CtaRow />

            <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">
              Estimates for planning purposes. Fill rate on uncovered reqs is set conservatively at {pct(b.fillMintex)}; real performance varies by pay rate,
              location and job title.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- SEARCH */
  return (
    <div>
      <BackButton onClick={() => setMode(null)} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Executive search</p>
      <h2 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">What does delivery cost you per search?</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Your search practice</p>
          <Field label="Searches per year">
            <NumField value={c.searches} onChange={(x) => upC("searches", x)} />
          </Field>
          <Field label="Average retainer">
            <NumField value={c.retainer} prefix="$" step={5000} onChange={(x) => upC("retainer", x)} />
          </Field>
          <Field label="Research & sourcing hours per search">
            <NumField value={c.researchHours} suffix="hrs" onChange={(x) => upC("researchHours", x)} />
          </Field>
          <Field label="Loaded hourly cost of research staff">
            <NumField value={c.researchRate} prefix="$" onChange={(x) => upC("researchRate", x)} />
          </Field>
          <Field label="Market mapping tools per search">
            <NumField value={c.mappingTools} prefix="$" step={100} onChange={(x) => upC("mappingTools", x)} />
          </Field>
          <Field label={`Searches that stall or die at shortlist: ${pct(c.pFail)}`}>
            <Slider min={0} max={40} value={Math.round(c.pFail * 100)} onChange={(x) => upC("pFail", x / 100)} />
          </Field>
        </div>

        <div>
          <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Delivery cost, per year</p>
            <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">{money(RC.annualDelivery)}</p>
            <p className="mt-3 max-w-lg text-[13.5px] text-white/75">
              {`${money(RC.deliveryPerSearch)} per search in research hours and mapping tools, before a single candidate is presented, and a further ${money(RC.failedCost)} a year tied up in searches that stall.`}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Cost per search" value={money(RC.deliveryPerSearch)} sub={`${pct(RC.deliveryPerSearch / c.retainer)} of retainer`} />
            <StatCard label="Stalled searches" value={money(RC.failedCost)} sub="delivery cost plus refund exposure" tone="warn" />
            <StatCard label="Retainer value recoverable" value={money(RC.capacityGain)} sub="from searches that reach close" tone="accent" />
          </div>

          <Note tone="good">
            Mintex carries the research and sourcing load so your partners stay on client work and shortlist quality. Engagement structure varies by
            practice, worth a conversation.
          </Note>

          <CtaRow />

          <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">Estimates for planning purposes. Adjust every input to your own practice.</p>
        </div>
      </div>
    </div>
  );
}
