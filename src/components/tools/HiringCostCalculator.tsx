"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { CONFIG, computeHiringCost, type MethodKey } from "@/lib/calculators";
import { useHiringCost } from "./HiringCostCalculatorContext";

const PALETTE = [
  "var(--color-navy)",
  "var(--color-navy-secondary)",
  "var(--color-steel)",
  "var(--color-tan)",
  "var(--color-tan-light)",
  "var(--color-steel-light)",
  "var(--color-steel-lighter)",
  "var(--color-navy-deep)",
  "var(--color-mist-dark)",
];

const TABS = [
  { key: "breakdown", label: "Cost Breakdown" },
  { key: "methods", label: "Method Comparison" },
  { key: "roi", label: "ROI Analysis" },
] as const;

const SENIORITY_OPTIONS = Object.entries(CONFIG.seniority).map(([value, cfg]) => ({ value, label: cfg.label }));
const INDUSTRY_OPTIONS = Object.entries(CONFIG.industry).map(([value, cfg]) => ({ value, label: cfg.label }));
const METHOD_OPTIONS = Object.entries(CONFIG.method).map(([value, cfg]) => ({
  value,
  label: cfg.isPartner ? `${cfg.label} (Preferred Partner)` : cfg.label,
}));

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtPct = (n: number) => n.toFixed(1) + "%";

export default function HiringCostCalculator() {
  const { inputs, setField, result, breakdownRows } = useHiringCost();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("breakdown");

  const industry = CONFIG.industry[inputs.industryKey];
  const topItem = [...result.items].sort((a, b) => b.amount - a.amount)[0];
  const diffVsAvg = result.total - industry.avgCost;

  const mintexResult = computeHiringCost({ ...inputs, methodKey: "mintex_staffing" });
  const savingsVsMintex = result.total - mintexResult.total;

  const methodRows = (Object.keys(CONFIG.method) as MethodKey[]).map((key) => {
    const cfg = CONFIG.method[key];
    const r = computeHiringCost({ ...inputs, methodKey: key });
    return { key, cfg, total: r.total, ttf: Math.round(r.effectiveTtf) };
  });
  const nonPartnerRows = methodRows.filter((r) => !r.cfg.isPartner);
  const partnerRow = methodRows.find((r) => r.cfg.isPartner)!;
  const cheapest = Math.min(...nonPartnerRows.map((r) => r.total));
  const fastest = Math.min(...nonPartnerRows.map((r) => r.ttf));
  const orderedMethodRows = [partnerRow, ...nonPartnerRows];
  const cheapestOverall = partnerRow.total <= cheapest;
  const paidAgencyRows = nonPartnerRows.filter((r) => r.key === "staffing_agency" || r.key === "executive_search");
  const cheaperThanPaidAgencies = paidAgencyRows.length > 0 && paidAgencyRows.every((r) => partnerRow.total < r.total);

  const dailyBurden = (inputs.salary / 365) * CONFIG.vacancyBurdenFactor;
  const savings10Days = dailyBurden * 10;
  const badHirePct = inputs.seniorityKey === "entry" || inputs.seniorityKey === "mid" ? 0.3 : 0.5;
  const badHireCost = inputs.salary * badHirePct;
  const cheapestMethod = methodRows.reduce((a, b) => (a.total < b.total ? a : b));
  const potentialSavings = Math.max(0, result.total - cheapestMethod.total);

  return (
    <div className="grid gap-8">
      {/* INPUT PANELS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">Role &amp; Salary</h3>

          <NumberField
            label="Annual Salary"
            value={inputs.salary}
            onChange={(v) => setField("salary", v)}
            hint="Base annual salary for the role being filled."
            prefix="$"
          />

          <div className="mt-5">
            <Select
              label="Seniority Level"
              value={inputs.seniorityKey}
              onChange={(v) => setField("seniorityKey", v as typeof inputs.seniorityKey)}
              options={SENIORITY_OPTIONS}
            />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy/90">
              Drives onboarding length, ramp-up time and interview depth assumptions.
            </p>
          </div>

          <div className="mt-5">
            <Select
              label="Industry"
              value={inputs.industryKey}
              onChange={(v) => setField("industryKey", v as typeof inputs.industryKey)}
              options={INDUSTRY_OPTIONS}
            />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy/90">
              Avg for this industry: {fmt(industry.avgCost)}/hire &middot; {industry.avgDays} days to fill
            </p>
          </div>

          <div className="mt-5">
            <Select
              label="Hiring Method (Primary)"
              value={inputs.methodKey}
              onChange={(v) => setField("methodKey", v as MethodKey)}
              options={METHOD_OPTIONS}
            />
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy/90">
              This is the method used in the Cost Breakdown tab. Compare all 6 methods in the tab to the right.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-navy/10 bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">Hiring Process</h3>

          <NumberField
            label="Time to Fill"
            min={5}
            max={120}
            value={inputs.ttf}
            onChange={(v) => setField("ttf", v)}
            hint="Calendar days the seat sits vacant, start of search to accepted offer."
            suffix="days"
          />
          <NumberField
            label="Candidates Screened"
            min={5}
            max={100}
            value={inputs.cands}
            onChange={(v) => setField("cands", v)}
            hint="Total candidates given a phone screen and/or interview for this role."
          />
          <NumberField
            label="Avg. Interviewer Hourly Rate"
            min={25}
            max={300}
            value={inputs.rate}
            onChange={(v) => setField("rate", v)}
            hint="Blended fully-loaded hourly cost of staff running interviews."
            prefix="$"
            suffix="/hr"
          />
          <NumberField
            label="Background Check & Assessment Cost"
            min={50}
            max={500}
            value={inputs.bg}
            onChange={(v) => setField("bg", v)}
            hint="Background check, skills test, or assessment vendor fees."
            prefix="$"
            last
          />
        </div>
      </div>

      {/* RESULTS */}
      <div>
        <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-8 text-white shadow-[0_30px_70px_-28px_rgba(0,48,96,0.4)]">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-steel-lighter">
                Total Cost-to-Hire
              </p>
              <p className="mt-1.5 font-heading text-[42px] font-bold leading-none">{fmt(result.total)}</p>
              <p className="mt-1 text-[13.5px] text-white/70">
                {inputs.methodKey === "mintex_staffing"
                  ? "Typically 12.5% of annual salary, depending on role difficulty. Contact our team for an exact quote."
                  : `${fmtPct((result.total / inputs.salary) * 100)} of annual salary`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-steel-lighter">
                Industry Average
              </p>
              <p className="mt-1.5 text-xl font-bold">{fmt(industry.avgCost)}</p>
              <p className={`mt-1 text-[12.5px] ${diffVsAvg >= 0 ? "text-orange-300" : "text-emerald-300"}`}>
                {diffVsAvg >= 0 ? "+" : "−"}
                {fmt(Math.abs(diffVsAvg))} vs. {industry.label} avg
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-steel-lighter">
                Vacancy + Ramp-Up Cost
              </p>
              <p className="mt-1.5 text-xl font-bold">{fmt(result.hiddenCosts)}</p>
              <p className="mt-1 text-[11.5px] text-steel-lighter">The &quot;invisible&quot; costs most teams miss</p>
            </div>
          </div>
        </div>

        {/* Partner banner */}
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-3xl border border-tan/50 bg-tan/[0.1] p-6">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-tan bg-white text-tan">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
              <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3z" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="min-w-[240px] flex-1">
            <p className="flex flex-wrap items-center gap-2 font-heading text-[15px] font-semibold text-navy">
              Skip the hassle — hire through Mintex Staffing
              <span className="rounded-full bg-tan px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                Preferred Partner
              </span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-navy">
              {inputs.methodKey === "mintex_staffing"
                ? "You're already set up with Mintex Staffing. We charge one flat fee on the candidate's annual salary and nothing else. No job-board spend, no background-check bills, no other vendor to pay."
                : savingsVsMintex > 0
                  ? `Mintex Staffing sources, screens and delivers ready-to-interview candidates in 12–48 hours for one flat fee — 12.5% of the candidate's annual salary — and nothing else. That's ${fmt(savingsVsMintex)} less than your current selection.`
                  : `Mintex Staffing charges one flat fee — 12.5% of the candidate's annual salary — and nothing else: no job-board spend, no background-check bills, no other vendor. In exchange you get ready-to-interview candidates in 12–48 hrs instead of a ${inputs.ttf}-day search.`}
            </p>
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-navy px-5 py-3 text-center">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-steel-lighter">
              Mintex Fee
            </p>
            <p className="mt-0.5 text-xl font-bold text-white">{fmt(mintexResult.total)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-7 flex gap-1 border-b border-navy/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.key ? "border-tan text-navy" : "border-transparent text-steel hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "breakdown" && (
          <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-navy/10 pb-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Cost Item
                    </th>
                    <th className="border-b border-navy/10 pb-2.5 text-right text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Amount
                    </th>
                    <th className="border-b border-navy/10 pb-2.5 text-right text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.map((row, i) => (
                    <tr key={row.key} className="border-b border-navy/10">
                      <td className="py-3">
                        <span
                          className="mr-2 inline-block h-2.5 w-2.5 rounded-[3px]"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        {row.label}
                      </td>
                      <td className="py-3 text-right font-semibold text-navy">{fmt(row.amount)}</td>
                      <td className="py-3 text-right text-steel">{fmtPct(row.pct)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-4 text-base font-extrabold text-navy">Total Cost-to-Hire</td>
                    <td className="pt-4 text-right text-base font-extrabold text-navy">{fmt(result.total)}</td>
                    <td className="pt-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="mt-5 rounded-2xl border border-tan/30 bg-tan/[0.08] p-4 text-[12.5px] leading-relaxed text-navy">
              Your largest cost driver is &quot;{topItem.label}&quot;
              {inputs.methodKey === "mintex_staffing"
                ? " (Typically 12.5% of annual salary, depending on role difficulty. Contact our team for an exact quote.)"
                : ""}{" "}
              at {fmtPct((topItem.amount / result.total) * 100)}{" "}
              of total cost-to-hire. Vacancy and ramp-up productivity loss together account for{" "}
              {fmtPct((result.hiddenCosts / result.total) * 100)} of the total  costs most teams never put in a
              spreadsheet.
            </p>
          </div>
        )}

        {tab === "methods" && (
          <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-navy/10 pb-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Method
                    </th>
                    <th className="border-b border-navy/10 pb-2.5 text-center text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Total Cost
                    </th>
                    <th className="border-b border-navy/10 pb-2.5 text-center text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Est. Time to Fill
                    </th>
                    <th className="border-b border-navy/10 pb-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide text-steel">
                      Best For
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderedMethodRows.map((r) => (
                    <tr
                      key={r.key}
                      className={`border-b border-navy/10 ${
                        r.cfg.isPartner ? "bg-tan/[0.08]" : r.total === cheapest ? "bg-emerald-50/60" : ""
                      }`}
                    >
                      <td className={`py-3 ${r.cfg.isPartner ? "font-semibold text-navy" : "text-navy"}`}>
                        {r.cfg.label}
                      </td>
                      <td className="py-3 text-center font-semibold text-navy">{fmt(r.total)}</td>
                      <td className="py-3 text-center text-navy">
                        {r.ttf} days
                        {r.cfg.isPartner && (
                          <span className="ml-1 text-steel">(candidates in 12–48 hrs)</span>
                        )}
                      </td>
                      <td className="py-3 text-left text-[12.5px] text-navy/90">
                        {r.cfg.best}{" "}
                        {r.key === inputs.methodKey && <Badge>Selected</Badge>}
                        {r.cfg.isPartner && <Badge tan>Preferred Partner</Badge>}
                        {!r.cfg.isPartner && r.total === cheapest && <Badge>Lowest cost</Badge>}
                        {!r.cfg.isPartner && r.ttf === fastest && <Badge>Fastest</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 rounded-2xl border border-tan/30 bg-tan/[0.08] p-4 text-[12.5px] leading-relaxed text-navy">
              {cheapestOverall
                ? "At these inputs, Mintex Staffing is also the lowest total cost on the table — plus the fastest, most hands-off option. Mintex charges one flat fee (12.5% of annual salary) and nothing else."
                : cheaperThanPaidAgencies
                  ? `Mintex Staffing's flat 12.5% fee costs less than a Staffing Provider (20%) or Executive Recruiting Firm (28%) here — and it's the only cost you'll see, nothing else added. It shows higher than free/low-cost methods like In-House HR or Employee Recommendation in raw dollars — the trade you're paying for is candidates in 12–48 hrs instead of a ${inputs.ttf}-day search, with zero internal sourcing or screening effort.`
                  : "Method comparison re-runs the same formulas with method-specific adjustments (fee %, faster/slower sourcing, less/more internal interview time), using your current salary, seniority and process inputs. Mintex Staffing's only cost is a flat 12.5% placement fee — nothing else."}
            </p>
          </div>
        )}

        {tab === "roi" && (
          <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
            <div className="grid gap-4 sm:grid-cols-3">
              <RoiCard
                icon="⏱"
                label="Cost of 10 Extra Vacancy Days"
                num={fmt(savings10Days)}
                text={`If time-to-fill slips by 10 days, expect roughly ${fmt(savings10Days)} in added vacancy cost at this salary level.`}
              />
              <RoiCard
                icon="⚠"
                label="Estimated Cost of a Mis-Hire"
                num={fmt(badHireCost)}
                text={`A bad hire at this level typically costs ${Math.round(badHirePct * 100)}% of annual salary in lost productivity, rehiring and severance — reference figures commonly cited by SHRM / U.S. Dept. of Labor.`}
              />
              <RoiCard
                icon="💰"
                label="Potential Savings vs. Current Method"
                num={fmt(potentialSavings)}
                text={
                  potentialSavings > 0
                    ? `Switching to "${cheapestMethod.cfg.label}" could save about ${fmt(potentialSavings)} on this hire based on your inputs.`
                    : "Your selected method is already the lowest-cost option for these inputs."
                }
              />
            </div>
            <p className="mt-5 rounded-2xl border border-tan/30 bg-tan/[0.08] p-4 text-[12.5px] leading-relaxed text-navy">
              Reference figures (mis-hire cost, industry benchmarks) are illustrative planning estimates drawn from
              commonly cited HR industry ranges, not a live data feed. Use your own historical data where available.
            </p>
          </div>
        )}

        <details className="mt-6 rounded-3xl border border-navy/10 bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
          <summary className="cursor-pointer list-none px-6 py-4 font-heading text-sm font-semibold text-navy">
            How this calculator works (methodology &amp; assumptions)
          </summary>
          <div className="space-y-3 px-6 pb-6 text-[13.5px] leading-relaxed text-navy">
            <p>
              This tool uses standard HR / talent-acquisition cost-per-hire methodology (in the spirit of SHRM&apos;s
              cost-per-hire framework), broken into seven components.
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">1. Job Posting &amp; Advertising</h5>
            <p>
              Flat cost by hiring method (e.g. $350 for In-House HR Department, $0 for Staffing Provider / Executive
              Recruiting Firm / Employee Recommendation since it&apos;s bundled into the fee or unnecessary, $500 for
              Job Board Recruitment).
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">2. Interview &amp; Screening Time</h5>
            <p>
              Candidates screened &times; blended hours per candidate (by seniority) &times; interviewer hourly rate.
              Hours/candidate rises with seniority (2.5h entry &rarr; 8.5h director) to reflect more rounds and more
              senior interviewers.
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">3. Assessment &amp; Background Check</h5>
            <p>Direct pass-through of your input.</p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">4. Onboarding &amp; Training</h5>
            <p>
              Annual salary &times; onboarding % (3%&ndash;5% by seniority) &mdash; covers buddy/manager time,
              training materials and paperwork during the first weeks.
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">5. Equipment &amp; IT Setup</h5>
            <p>Flat allocation by seniority tier ($1,200&ndash;$3,500) for hardware, software licenses and account provisioning.</p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">6. Vacancy Cost</h5>
            <p>
              Time-to-fill days &times; (annual salary &divide; 365) &times; 0.55 &mdash; the 0.55 factor represents
              the average share of the vacant role&apos;s daily value that&apos;s lost to coverage gaps, overtime and
              delayed output while the seat is empty.
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">7. Ramp-Up Productivity Loss</h5>
            <p>
              Ramp-up months &times; (annual salary &divide; 12) &times; (1 &minus; average capacity during ramp-up).
              Average capacity during ramp-up ranges from 65% (entry-level, short ramp) down to 45%
              (director/executive, long ramp), based on common new-hire productivity curves.
            </p>
            <h5 className="mt-3 font-heading text-[13.5px] font-semibold text-navy">
              8. Employee Recommendation Bonus (only for that method)
            </h5>
            <p>Flat recommendation bonus paid to the recommending employee, default $1,500.</p>
            <p>
              Industry benchmark figures (average cost-per-hire, days-to-fill, shown next to each option in the
              Industry dropdown) are illustrative placeholder reference points for comparison, not a live data feed.
              All figures are estimates for planning purposes &mdash; always validate against your own historical
              hiring data.
            </p>
          </div>
        </details>

        <ButtonLink href="/seek-talent/get-started" variant="primary" className="mt-6 w-full justify-center sm:w-auto">
          Get a tailored quote
        </ButtonLink>
      </div>
    </div>
  );
}

function NumberField({
  label,
  min,
  max,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  last,
}: {
  label: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (value: number) => void;
  hint: string;
  prefix?: string;
  suffix?: string;
  last?: boolean;
}) {
  const [text, setText] = useState(String(value));

  const clamp = (n: number) => {
    let result = n;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  return (
    <div className={last ? "mt-5" : "mt-5 first:mt-0"}>
      <span className="text-sm font-semibold text-navy">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-3 transition-colors focus-within:border-tan hover:border-navy/25">
        {prefix && <span className="flex-shrink-0 text-sm font-semibold text-navy/50">{prefix}</span>}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={text}
          onChange={(event) => {
            const digitsOnly = event.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
            setText(digitsOnly);
            if (digitsOnly !== "") onChange(Number(digitsOnly));
          }}
          onBlur={() => {
            const clamped = clamp(Number(text) || min || 0);
            setText(String(clamped));
            onChange(clamped);
          }}
          className="w-full flex-1 border-0 bg-transparent text-sm font-semibold text-navy !outline-none"
        />
        {suffix && <span className="flex-shrink-0 text-sm font-medium text-navy/50">{suffix}</span>}
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy/90">{hint}</p>
    </div>
  );
}

function Badge({ children, tan }: { children: React.ReactNode; tan?: boolean }) {
  return (
    <span
      className={`ml-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        tan ? "bg-tan text-navy" : "bg-mist text-navy"
      }`}
    >
      {children}
    </span>
  );
}

function RoiCard({ icon, label, num, text }: { icon: string; label: string; num: string; text: string }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-mist/60 p-5">
      <span className="text-lg">{icon}</span>
      <h4 className="mt-2 font-heading text-sm font-semibold text-navy">{label}</h4>
      <p className="mt-1 text-2xl font-extrabold text-navy-secondary">{num}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy/90">{text}</p>
    </div>
  );
}
