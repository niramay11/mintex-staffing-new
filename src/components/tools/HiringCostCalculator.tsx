"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { packState, unpackState, type CalculatorBreakdownLine, type CalculatorBreakdownPayload } from "@/lib/calculatorShare";
import {
  INDUSTRIES,
  SENIORITY,
  ROLE_TYPES,
  STAFFING_MODES,
  SHOW_BREAKEVEN,
  calcEmployer,
  calcStaffing,
  calcSearch,
  type EmployerInputs,
  type StaffingInputs,
  type SearchInputs,
  type SeniorityKeyV2,
  type RoleTypeKey,
  type StaffingModeKey,
  type EngagementKeyB,
  type EngagementKeyC,
} from "@/lib/hiringCalculatorV2";

type Mode = "employer" | "staffing" | "search" | null;

const money = (n: number) => "$" + (Math.round((n || 0) / 100) * 100).toLocaleString("en-US");
const exact = (n: number) => "$" + Math.round(n || 0).toLocaleString("en-US");
const pct = (n: number) => Math.round(n * 100) + "%";

const INDUSTRY_OPTIONS = Object.keys(INDUSTRIES).map((k) => ({ value: k, label: k }));
const ROLE_TYPE_OPTIONS = Object.keys(ROLE_TYPES).map((k) => ({ value: k, label: k }));
const SENIORITY_OPTIONS = Object.keys(SENIORITY).map((k) => ({ value: k, label: k }));
const STAFFING_OPTIONS = Object.keys(STAFFING_MODES).map((k) => ({ value: k, label: k }));

const MODE_CARDS: { key: Exclude<Mode, null>; title: string; desc: string; imageKey: string; alt: string }[] = [
  {
    key: "employer",
    title: "We hire for ourselves",
    desc: "You have an in-house HR or talent team filling your own roles.",
    imageKey: "hiring-cost-calculator:mode-employer-visual",
    alt: "In-house HR or talent team filling their own company's roles",
  },
  {
    key: "staffing",
    title: "We're a staffing firm",
    desc: "You place candidates with clients and want more coverage.",
    imageKey: "hiring-cost-calculator:mode-staffing-visual",
    alt: "Staffing firm recruiter placing candidates with clients",
  },
  {
    key: "search",
    title: "We're an executive search firm",
    desc: "You run retained searches and carry the research load.",
    imageKey: "hiring-cost-calculator:mode-search-visual",
    alt: "Executive search consultant running a retained search",
  },
];

const EMPLOYER_DEFAULTS: EmployerInputs = {
  industry: "IT",
  hires: 10,
  salary: 80000,
  days: 44,
  recruiters: 1,
  staffing: "A dedicated recruiting team",
  roleType: "Core operational",
  seniority: "Mid",
  recruiterSalary: 68000,
  pctTime: 1.0,
  ats: 4800,
  liSeats: 1,
  liCost: 10800,
  jobBoards: 3000,
  careersSite: 0,
  nScreened: 10,
  nInterviewed: 4,
  nFinalists: 2,
  coordHours: 6,
  rateRecruiter: 40,
  ratePanel: 70,
  rateExec: 100,
  ads: 300,
  assessment: 100,
  fillInhouse: 0.75,
  fillMintex: 0.85,
  pExit: 0.18,
  routed: 10,
  cutTooling: false,
  addSpeed: 0.15,
  addFill: 0.05,
};

const STAFFING_DEFAULTS: StaffingInputs = {
  reqs: 200,
  fills: 45,
  gp: 18000,
  recruiters: 3,
  recCost: 115000,
  toolSeat: 18000,
  capacityPerRec: 45,
  engagement: "Full 360",
};

const SEARCH_DEFAULTS: SearchInputs = {
  searches: 15,
  retainer: 60000,
  researchHours: 60,
  researchRate: 55,
  mappingTools: 1200,
  pFail: 0.15,
  refundPct: 0.3,
  extraSearches: 3,
  engagement: "Research only",
};

/* ------------------------------------------------------------- UI PARTS */
function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
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

function Toggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <div className="flex overflow-hidden rounded-full border border-navy/15 dark:border-white/15">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`flex-1 px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
            value === o
              ? "bg-navy text-white dark:bg-cream dark:text-navy-950"
              : "bg-white text-navy/70 hover:bg-mist dark:bg-navy-900 dark:text-cream/70 dark:hover:bg-navy-800"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Callout({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200"
      : "bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100";
  return <div className={`-mt-2 mb-4 rounded-xl p-3.5 text-[12.5px] leading-relaxed ${cls}`}>{children}</div>;
}

function Note({ tone = "warn", children }: { tone?: "warn" | "good"; children: ReactNode }) {
  const cls =
    tone === "good"
      ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200"
      : "border-amber-500 bg-amber-50 text-amber-800 dark:border-amber-400 dark:bg-amber-400/10 dark:text-amber-200";
  return <div className={`my-4 rounded-r-lg border-l-2 p-4 text-[13px] leading-relaxed ${cls}`}>{children}</div>;
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-r-lg border-l-[3px] border-emerald-600 bg-emerald-50 p-4 text-[13.5px] leading-relaxed text-emerald-900 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-100">
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: string; tone?: "default" | "accent" | "warn" }) {
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

function Chip({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  return (
    <span
      className={`ml-2 inline-block rounded-full px-2 py-0.5 align-middle text-[11px] font-semibold tabular-nums ${
        delta > 0
          ? "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
      }`}
    >
      {delta > 0 ? "+" : "−"}
      {money(Math.abs(delta))}
    </span>
  );
}

function Line({
  label,
  perHire = "—",
  perYear,
  note,
  accent,
  strong,
  warn,
  openAll,
  tags,
  live,
}: {
  label: ReactNode;
  perHire?: string;
  perYear: string;
  note?: ReactNode;
  accent?: boolean;
  strong?: boolean;
  warn?: boolean;
  openAll?: boolean;
  tags?: string[];
  live?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const show = open || openAll;
  const hot = !!(live && tags && tags.includes(live));

  return (
    <div
      className={`border-b border-navy/10 dark:border-white/10 ${
        strong ? "mt-1 border-b-0 border-t-2 border-t-navy dark:border-t-cream/40" : ""
      } ${hot ? "rounded-lg bg-emerald-50 shadow-[inset_3px_0_0_theme(colors.emerald.500)] dark:bg-emerald-400/10" : ""}`}
    >
      <button
        type="button"
        onClick={() => note && setOpen((o) => !o)}
        disabled={!note}
        className={`flex w-full items-center justify-between gap-3 py-2.5 text-left text-[13.5px] ${note ? "cursor-pointer" : "cursor-default"} ${
          hot ? "pl-2.5" : ""
        }`}
      >
        <span className="flex flex-1 items-baseline gap-1.5">
          {note && (
            <span className={`inline-block w-2.5 flex-shrink-0 text-steel transition-transform dark:text-steel-light ${show ? "rotate-45" : ""}`}>+</span>
          )}
          <span className={strong ? "font-semibold text-navy dark:text-cream" : "text-navy/90 dark:text-cream/90"}>{label}</span>
        </span>
        <span className="flex flex-shrink-0 gap-4">
          <span
            className={`w-[84px] text-right text-xs tabular-nums ${accent ? "text-emerald-600 dark:text-emerald-400" : "text-navy/60 dark:text-cream/60"}`}
          >
            {perHire}
          </span>
          <span
            className={`w-[100px] text-right text-[13.5px] tabular-nums ${
              accent ? "text-emerald-600 dark:text-emerald-400" : warn ? "text-amber-600 dark:text-amber-400" : "text-navy dark:text-cream"
            } ${strong ? "font-bold" : "font-semibold"}`}
          >
            {perYear}
          </span>
        </span>
      </button>
      {show && note && (
        <div className="mb-3 rounded-lg bg-mist p-3.5 text-[13px] leading-relaxed text-navy/90 dark:bg-navy-800 dark:text-cream/80">{note}</div>
      )}
    </div>
  );
}

function ColHead() {
  return (
    <div className="flex items-center justify-end gap-4 border-b border-navy/10 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-steel dark:border-white/10 dark:text-steel-light">
      <span className="w-[84px] text-right">Per hire</span>
      <span className="w-[100px] text-right">Per year</span>
    </div>
  );
}

function Disclose({
  title,
  sub,
  open,
  onToggle,
  children,
}: {
  title: string;
  sub?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-white dark:border-white/10 dark:bg-navy-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left font-heading text-sm font-semibold text-navy dark:text-cream"
      >
        <span>
          {title}
          {sub && (
            <>
              {" "}
              <em className="ml-2 text-xs font-normal not-italic text-steel dark:text-steel-light">{sub}</em>
            </>
          )}
        </span>
        <span className={`text-lg text-steel transition-transform dark:text-steel-light ${open ? "rotate-90" : ""}`}>&rsaquo;</span>
      </button>
      {open && <div className="space-y-0.5 px-6 pb-6">{children}</div>}
    </div>
  );
}

function DiscloseTrigger({ title, sub, open, onToggle }: { title: string; sub?: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-3 rounded-3xl border border-navy/10 bg-white px-6 py-4 text-left font-heading text-sm font-semibold text-navy dark:border-white/10 dark:bg-navy-900 dark:text-cream"
    >
      <span>
        {title}
        {sub && (
          <>
            {" "}
            <em className="ml-2 text-xs font-normal not-italic text-steel dark:text-steel-light">{sub}</em>
          </>
        )}
      </span>
      <span className={`text-lg text-steel transition-transform dark:text-steel-light ${open ? "rotate-90" : ""}`}>&rsaquo;</span>
    </button>
  );
}

function DisclosePanel({ children }: { children: ReactNode }) {
  return <div className="space-y-0.5 rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">{children}</div>;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-4 text-sm text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">← Change who you are</button>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

function CtaRow({
  emailHref,
  breakdown,
  onSave,
  saveState,
}: {
  emailHref: string;
  breakdown: CalculatorBreakdownPayload;
  onSave: (breakdown: CalculatorBreakdownPayload) => void;
  saveState: SaveState;
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <ButtonLink href={emailHref} variant="primary">Email me this breakdown</ButtonLink>
      <button
        type="button"
        onClick={() => onSave(breakdown)}
        disabled={saveState === "saving"}
        className="inline-flex items-center justify-center rounded-full border border-navy/10 bg-white px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-mist focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-60 dark:border-white/10 dark:bg-navy-900 dark:text-cream dark:hover:bg-navy-800"
      >
        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Link copied ✓" : saveState === "error" ? "Try again" : "Save these numbers"}
      </button>
    </div>
  );
}

function SavedLinkBox({ url, error }: { url: string | null; error: string }) {
  if (error) {
    return (
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
        {error}
      </div>
    );
  }
  if (!url) return null;
  return (
    <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-4 dark:border-white/10 dark:bg-navy-900">
      <p className="text-sm font-semibold text-navy dark:text-cream">Link copied — save it somewhere safe</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy/70 dark:text-cream/70">
        Bookmark it, email it to yourself, whatever&apos;s easiest. Paste this link into any browser, any time, and
        you&apos;ll see these exact numbers again — we keep them saved on our end.
      </p>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="mt-3 w-full rounded-lg border border-navy/10 bg-mist px-3 py-2 font-mono text-[11.5px] text-navy/80 dark:border-white/10 dark:bg-navy-800 dark:text-cream/70"
      />
    </div>
  );
}

/* =========================================================== MAIN =========== */
export default function HiringCostCalculator({ siteImages }: { siteImages: Record<string, string> }) {
  const [mode, setMode] = useState<Mode>(null);
  const [showWork, setShowWork] = useState(false);
  const [showAssump, setShowAssump] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [live, setLive] = useState<string | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const prevTotal = useRef<number | null>(null);
  const [view, setView] = useState<"Whole year" | "One role">("Whole year");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const [a, setA] = useState<EmployerInputs>(EMPLOYER_DEFAULTS);
  const [b, setB] = useState<StaffingInputs>(STAFFING_DEFAULTS);
  const [c, setC] = useState<SearchInputs>(SEARCH_DEFAULTS);

  const upA = <K extends keyof EmployerInputs>(k: K, val: EmployerInputs[K]) => setA((s) => ({ ...s, [k]: val }));
  const upB = <K extends keyof StaffingInputs>(k: K, val: StaffingInputs[K]) => setB((s) => ({ ...s, [k]: val }));
  const upC = <K extends keyof SearchInputs>(k: K, val: SearchInputs[K]) => setC((s) => ({ ...s, [k]: val }));

  // Load numbers from a share link, if the page was opened from one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = (window.location.hash || "").match(/[#&]s=([^&]+)/);
    if (!m) return;
    const d = unpackState(m[1]);
    if (!d) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from a share-link hash on mount
    if (typeof d.m === "string") setMode(d.m as Mode);
    if (d.a) setA((s) => ({ ...s, ...(d.a as Partial<EmployerInputs>) }));
    if (d.b) setB((s) => ({ ...s, ...(d.b as Partial<StaffingInputs>) }));
    if (d.c) setC((s) => ({ ...s, ...(d.c as Partial<SearchInputs>) }));
    if (d.v === "Whole year" || d.v === "One role") setView(d.v);
  }, []);

  const saveResult = async (breakdown: CalculatorBreakdownPayload) => {
    if (typeof window === "undefined") return;
    setSaveState("saving");
    setSaveError("");
    try {
      const res = await fetch("/api/hiring-cost-calculator/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(breakdown),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Couldn't save — please try again.");
      const url = `${window.location.origin}/resources/hiring-cost-calculator/saved/${json.code}`;
      setSavedUrl(url);
      setSaveState("saved");
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save — please try again.");
      setSaveState("error");
    }
  };

  const R = useMemo(() => calcEmployer(a), [a]);

  // Same maths, run again as if another recruiter had been hired.
  const addDays = Math.max(1, a.days * (1 - a.addSpeed));
  const addFillRate = Math.min(0.95, a.fillInhouse + a.addFill);
  const scenAdd = useMemo(
    () => calcEmployer({ ...a, recruiters: a.recruiters + 1, liSeats: a.liSeats + 1, days: addDays, fillInhouse: addFillRate }),
    [a, addDays, addFillRate]
  );

  useEffect(() => {
    const t = R.totalToday;
    if (prevTotal.current !== null && Math.abs(t - prevTotal.current) > 50) {
      setDelta(t - prevTotal.current);
      const id = setTimeout(() => setDelta(null), 4000);
      prevTotal.current = t;
      return () => clearTimeout(id);
    }
    prevTotal.current = t;
  }, [R.totalToday]);

  const RB = useMemo(() => calcStaffing(b), [b]);
  const RC = useMemo(() => calcSearch(c), [c]);

  /* ---------------------------------------------------------- mode picker */
  if (!mode) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Mintex Staffing</div>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-navy dark:text-cream sm:text-4xl">What is your hiring actually costing you?</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-navy/75 dark:text-cream/75">A few questions. We&apos;ll add up what you spend in a year — including the costs that never reach a spreadsheet — and show you what changes with Mintex. Every number comes with a plain-English explanation.</p>
        <div className="mt-7 grid gap-6 sm:grid-cols-3 lg:gap-8">
          {MODE_CARDS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className="group flex h-full flex-col rounded-[22px] border border-navy/10 bg-white p-3 text-left shadow-[0_10px_30px_-18px_rgba(0,48,96,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-steel/50 hover:shadow-[0_24px_44px_-16px_rgba(0,48,96,0.4)] dark:border-white/10 dark:bg-navy-900 dark:hover:border-steel/40"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-mist dark:bg-navy-800">
                <Image
                  src={siteImages[m.imageKey]}
                  alt={m.alt}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>

              <div className="flex flex-1 flex-col px-2 pb-1 pt-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading text-[15px] font-semibold text-navy dark:text-cream">{m.title}</h3>
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-steel text-white">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth={3} stroke="currentColor" className="h-2.5 w-2.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 flex-1 text-[13px] leading-relaxed text-navy/60 dark:text-cream/60">{m.desc}</p>

                <div className="mt-3 flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy transition-colors group-hover:bg-navy group-hover:text-white dark:border-white/15 dark:text-cream dark:group-hover:bg-steel dark:group-hover:text-navy-950">
                    Start
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-8 text-xs text-navy/60 dark:text-cream/60">Nothing you enter is stored or sent anywhere. Every assumption we use is shown and can be changed.</p>
      </div>
    );
  }

  /* ----------------------------------------------------------- EMPLOYER */
  if (mode === "employer") {
    const H = a.hires;
    const oneRole = view === "One role";
    const div = oneRole ? Math.max(1, H) : 1;
    const unitLab = oneRole ? "per role" : "per year";
    const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
    const parts = [
      { k: "your recruiting team", v: R.fixedAnnual },
      { k: "interview time", v: R.interviewTotal * H },
      { k: "onboarding and ads", v: R.onbTotal * H },
      { k: "seats sitting empty", v: R.vacancyCost * H },
      { k: "new starters getting up to speed", v: R.rampCost * H },
      { k: "searches that find nobody", v: R.failedAnnual },
      { k: "people leaving early", v: R.attritionAnnual },
    ];
    const big = parts.reduce((m, x) => (x.v > m.v ? x : m), parts[0]);
    const topHeavy = R.fixedPerHire > 0.15 * a.salary && a.recruiters > 0;
    const scenarioOptions: [string, number][] = [
      ["carrying on", R.totalToday],
      ["another recruiter", scenAdd.totalToday],
      ["Mintex", R.totalToday - R.lo.total],
    ];
    const cheapestOption = scenarioOptions.reduce((m, x) => (x[1] < m[1] ? x : m))[0];

    const employerEmailLines: CalculatorBreakdownLine[] = [
      { label: "Total hiring cost today", value: money(R.totalToday), strong: true },
      { label: "Cost per hire today", value: money(R.perHireToday) },
      { label: "Your recruiting team & tools (fixed, per year)", value: money(R.fixedAnnual) },
      { label: "Interview & screening time", value: money(R.interviewTotal * H) },
      { label: "Onboarding & advertising", value: money(R.onbTotal * H) },
      { label: "Vacancy cost — seats sitting empty", value: money(R.vacancyCost * H) },
      { label: "Ramp-up productivity loss", value: money(R.rampCost * H) },
      { label: "Failed searches", value: money(R.failedAnnual) },
      { label: "Early leavers (attrition)", value: money(R.attritionAnnual) },
      { label: "Average days a seat stays open", value: `${a.days} days` },
      {
        label: `Savings with Mintex (${a.routed} of ${H} roles routed)`,
        value: `${money(R.lo.total)} – ${money(R.hi.total)}`,
        accent: true,
      },
      { label: "Hiring cost with Mintex", value: money(R.totalToday - R.lo.total), strong: true, accent: true },
    ];
    const employerBreakdown: CalculatorBreakdownPayload = {
      mode: "employer",
      heading: "Your hiring cost, per year",
      headlineLabel: "What Mintex saves you",
      headlineValue: `${money(R.lo.total)} – ${money(R.hi.total)}`,
      lines: employerEmailLines,
    };
    const employerEmailHref = "/resources/hiring-cost-calculator/email-results#s=" + packState(employerBreakdown);

    return (
      <div>
        <BackButton onClick={() => setMode(null)} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Employer &middot; in-house hiring</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">Your hiring cost, per year</h1>

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
              <NumField value={a.salary} prefix="$" step={5000} min={20000} onChange={(x) => upA("salary", x)} />
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

            <div className="mb-4">
              <Select
                label="Who actually does your hiring?"
                value={a.staffing}
                options={STAFFING_OPTIONS}
                onChange={(x) =>
                  setA((s) => ({ ...s, staffing: x as StaffingModeKey, ...STAFFING_MODES[x as StaffingModeKey].set(s) }))
                }
              />
            </div>

            {a.staffing === "One person, part of their job" && (
              <Field label={`How much of their week goes on hiring: ${pct(a.pctTime)}`}>
                <Slider min={10} max={90} step={5} value={Math.round(a.pctTime * 100)} onChange={(x) => upA("pctTime", x / 100)} />
              </Field>
            )}

            {a.staffing === "A dedicated recruiting team" && (
              <Field label="How many recruiters?">
                <NumField value={a.recruiters} min={1} onChange={(x) => upA("recruiters", x)} />
              </Field>
            )}

            <Callout tone={a.recruiters === 0 ? "warn" : "info"}>
              {a.recruiters === 0 ? (
                <>No recruiter salary goes into the numbers. But your managers&apos; time doesn&apos;t come free — the hours they spend screening, interviewing and scheduling are still counted further down, and for you that&apos;s the whole cost.</>
              ) : (
                <>We&apos;ll count{" "}<b>{exact(R.recruiterCost)}</b> a year of salary — that&apos;s{" "}
                  {a.staffing === "One person, part of their job" ? (
                    <>
                      {pct(a.pctTime)} of one {exact(a.recruiterSalary)}{" "}salary</>
                  ) : (
                    <>
                      {a.recruiters} &times; {exact(a.recruiterSalary)}
                    </>
                  )}{" "}{" "}plus tax and benefits — and{" "}<b>{exact(R.tooling)}</b> of software and job boards. You pay this whether you hire {a.hires}{" "}people or none.</>
              )}
            </Callout>

            <div className="mb-4">
              <Select label="What kind of roles are these?" value={a.roleType} options={ROLE_TYPE_OPTIONS} onChange={(x) => upA("roleType", x as RoleTypeKey)} />
            </div>
            <Callout tone={R.vacancyIsNeutral ? "warn" : "info"}>
              {R.vacancyIsNeutral ? (
                <>This tells us how much output you lose while the seat is empty. For a role that{" "}{R.rt.plain}, the answer is <b>almost nothing in cash</b>{" "}{" "}— you&apos;re not paying the salary, and the work mostly waits or gets absorbed. So filling faster won&apos;t save you money here; your savings will come from staff time instead.</>
              ) : (
                <>This tells us how much output you lose while the seat is empty. For a role that{" "}{R.rt.plain}, we work that out at{" "}
                  <b>{exact(R.netVacDay)} a day</b> — so <b>{money(R.vacancyCost)}</b> over the {a.days}{" "}days it stays open. Pick a different kind of role and that figure moves.</>
              )}
            </Callout>

            <div className="mb-4">
              <Select label="How senior are they, typically?" value={a.seniority} options={SENIORITY_OPTIONS} onChange={(x) => upA("seniority", x as SeniorityKeyV2)} />
            </div>
            <Callout>For a{" "}<b>{a.seniority.toLowerCase()}</b> hire we assume <b>{R.sn.panelHrs} hours</b> of your team&apos;s time with each person they interview,{" "}
              <b>{pct(R.sn.onb)} of salary</b> to get them started ({exact(R.onboarding)}), and <b>{R.sn.ramp} months</b>{" "}before they&apos;re at full speed. More senior means longer interviews and a longer run-up.</Callout>

            <div className="border-t border-navy/10 pt-4 dark:border-white/10">
              <Field label={`Roles you'd route to Mintex: ${a.routed} of ${H}`}>
                <Slider min={1} max={Math.max(1, H)} value={a.routed} onChange={(x) => upA("routed", x)} />
              </Field>
            </div>
          </div>

          {/* ---------------- results ---------------- */}
          <div>
            <div className="mb-4 inline-flex overflow-hidden rounded-full border border-navy/15 dark:border-white/15">
              {(["Whole year", "One role"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setView(o)}
                  className={`px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                    view === o
                      ? "bg-navy text-white dark:bg-cream dark:text-navy-950"
                      : "bg-white text-navy/70 hover:bg-mist dark:bg-navy-900 dark:text-cream/70 dark:hover:bg-navy-800"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">What Mintex saves you &middot; {unitLab}</p>
              <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">
                {money(R.lo.total / div)} &ndash; {money(R.hi.total / div)}
              </p>
              <p className="mt-3 max-w-lg text-[13.5px] text-white/75">
                {oneRole ? (
                  <>One {a.seniority.toLowerCase()} role at {money(a.salary)}.</>
                ) : (
                  <>Across{" "}{plural(a.routed, "role")} a year &mdash; {money(R.lo.total / a.routed)} to {money(R.hi.total / a.routed)}{" "}each.</>
                )}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Hiring costs you"
                value={
                  <>
                    {money(R.totalToday / div)}
                    <Chip delta={delta} />
                  </>
                }
                sub={oneRole ? `${money(R.totalToday)} across ${plural(a.hires, "hire")}` : `${money(R.perHireToday)} a hire`}
              />
              <StatCard
                label="Your seat stays empty"
                value={`${Math.round(R.daysHi)}–${Math.round(R.daysLo)} days`}
                sub={`yours today: ${a.days} days`}
                tone="accent"
              />
              <StatCard label="Your biggest cost" value={money(big.v / div)} sub={`${big.k} — ${pct(big.v / R.totalToday)} of the total`} tone="warn" />
            </div>

            {topHeavy && (
              <Note>You&apos;re paying{" "}<b>{money(R.fixedPerHire)}</b> in team and tools for every hire, before anyone is interviewed. At {plural(a.hires, "hire")}{" "}{" "}a year that&apos;s the number to look at first.</Note>
            )}

            <div className="mt-5 rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Your three choices, side by side</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      title: "Carry on as you are",
                      color: "text-steel dark:text-steel-light",
                      value: R.totalToday,
                      delta: null as number | null,
                      best: false,
                      rows: [
                        ["Seat empty for", `${a.days} days`],
                        ["You fill", pct(a.fillInhouse)],
                        ["Fixed cost a year", money(R.fixedAnnual)],
                        ["If hiring stops", "you still pay it"],
                      ],
                    },
                    {
                      title: "Hire another recruiter",
                      color: "text-amber-600 dark:text-amber-400",
                      value: scenAdd.totalToday,
                      delta: scenAdd.totalToday - R.totalToday,
                      best: false,
                      rows: [
                        ["Seat empty for", `${Math.round(addDays)} days`],
                        ["You fill", pct(addFillRate)],
                        ["Fixed cost a year", money(scenAdd.fixedAnnual)],
                        ["If hiring stops", "you still pay it"],
                      ],
                    },
                    {
                      title: "Bring in Mintex",
                      color: "text-emerald-700 dark:text-emerald-400",
                      value: R.totalToday - R.lo.total,
                      delta: -R.lo.total,
                      best: true,
                      rows: [
                        ["Seat empty for", `${Math.round(R.daysLo)} days`],
                        ["You fill", pct(a.fillMintex)],
                        ["Fixed cost a year", "none"],
                        ["If hiring stops", "you pay nothing"],
                      ],
                    },
                  ] as const
                ).map((o) => (
                  <div
                    key={o.title}
                    className={
                      o.best
                        ? "rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-400/10"
                        : "rounded-2xl border border-navy/10 bg-mist p-4 dark:border-white/10 dark:bg-navy-800"
                    }
                  >
                    <p className={`text-[13px] font-semibold ${o.color}`}>{o.title}</p>
                    <p
                      className={`mt-2 font-heading text-xl font-bold tabular-nums ${
                        o.best ? "text-emerald-700 dark:text-emerald-400" : "text-navy dark:text-cream"
                      }`}
                    >
                      {money(o.value / div)}
                    </p>
                    {o.delta !== null && (
                      <p
                        className={`mt-1 text-xs font-semibold tabular-nums ${
                          o.delta > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {o.delta > 0 ? "+" : "−"}
                        {money(Math.abs(o.delta) / div)}{" "}vs today</p>
                    )}
                    <div className="mt-3 space-y-1.5 border-t border-navy/10 pt-3 dark:border-white/10">
                      {o.rows.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-2 text-xs text-navy/70 dark:text-cream/70">
                          <span>{k}</span>
                          <span className="font-semibold text-navy dark:text-cream">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-mist p-3.5 text-[13px] text-navy dark:bg-navy-800 dark:text-cream">Cheapest here:{" "}<b>{cheapestOption}</b> &mdash; and a recruiter costs{" "}
                {money(Math.abs(scenAdd.totalToday - (R.totalToday - R.lo.total)) / div)}{" "}more than we would, before our fee.</div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={`A new recruiter would fill roles ${pct(a.addSpeed)} faster`}>
                  <Slider min={0} max={40} step={5} value={Math.round(a.addSpeed * 100)} onChange={(x) => upA("addSpeed", x / 100)} />
                </Field>
                <Field label={`...and lift how many you fill by ${Math.round(a.addFill * 100)} points`}>
                  <Slider min={0} max={20} value={Math.round(a.addFill * 100)} onChange={(x) => upA("addFill", x / 100)} />
                </Field>
              </div>
              <p className="text-[11.5px] leading-relaxed text-navy/60 dark:text-cream/60">Your guess, not ours. We&apos;ve assumed four months before a new recruiter is going properly.</p>
            </div>

            {R.vacancyIsNeutral && (
              <Note>For this kind of role at this salary, an empty seat costs you roughly nothing in cash — you&apos;re not paying the salary while it&apos;s open. So the savings below come from staff time and failed searches instead.</Note>
            )}
            {R.lo.capped && (
              <Note>We&apos;ve capped the saving at 60% of what you spend now. Your numbers produce a bigger figure, but we&apos;d rather show you something you can defend to your finance team.</Note>
            )}

            <Prompt>
              <b>These are careful starting figures, not yours.</b> Open <b>Your numbers</b>{" "}and change anything that&apos;s wrong — the total usually goes up.</Prompt>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DiscloseTrigger title="Show me how we got there" sub="every number, in plain English" open={showWork} onToggle={() => setShowWork(!showWork)} />
                <DiscloseTrigger title="Your numbers" sub="change anything that looks wrong" open={showAssump} onToggle={() => setShowAssump(!showAssump)} />
              </div>

              <div className="grid items-start gap-4 sm:grid-cols-2">
              <div>
              {showWork && (
              <DisclosePanel>
                  <div className="mb-2.5 mt-1 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What you spend today</p>
                    <button type="button" onClick={() => setExpandAll(!expandAll)} className="text-[12.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {expandAll ? "Collapse all" : "Explain every line"}
                    </button>
                  </div>
                  <ColHead />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["team"]}
                    label="Your recruiting team and the tools they use"
                    perYear={money(R.fixedAnnual)}
                    note={
                      <>
                        {exact(R.recruiterCost)} of salary with tax and benefits, plus {exact(R.tooling)} of software and job boards. That&apos;s{" "}
                        <b>{money(R.fixedPerHire)}</b>{" "}a hire before anyone is interviewed — and you pay it either way.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process"]}
                    label="Time your team spends screening and interviewing"
                    perHire={money(R.interviewTotal)}
                    perYear={money(R.interviewTotal * H)}
                    note={
                      <>
                        {a.nScreened} screened ({exact(R.screening)}), {a.nInterviewed} interviewed ({exact(R.interview)}), {a.nFinalists}{" "}met a leader ({" "}{exact(R.finalPanel)}), plus {a.coordHours} hours of scheduling ({exact(R.coordination)}).</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process"]}
                    label="Onboarding, job ads and background checks"
                    perHire={money(R.onbTotal)}
                    perYear={money(R.onbTotal * H)}
                    note={
                      <>
                        {pct(R.sn.onb)} of salary ({exact(R.onboarding)}) in manager time, training and paperwork. Plus {exact(a.ads)} to advertise and{" "}
                        {exact(a.assessment)}{" "}for checks.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    label={`The seat sitting empty for ${a.days} days`}
                    perHire={money(R.vacancyCost)}
                    perYear={money(R.vacancyCost * H)}
                    note={
                      <>The job is worth{" "}{exact(R.dailyValue)} a day. You lose {exact(R.dailyLost)} of that while it&apos;s empty, plus {exact(R.dailyCover)}{" "}{" "}covering it — but you save{" "}{exact(R.dailyNotPaid)} in unpaid salary. Net: <b>{exact(R.netVacDay)} a day</b>.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    label="New starters not yet at full speed"
                    perHire={money(R.rampCost)}
                    perYear={money(R.rampCost * H)}
                    note={
                      <>
                        {R.sn.ramp} months at roughly {pct(R.sn.cap)} output. The missing {pct(1 - R.sn.cap)} is <b>{money(R.rampCost)}</b>. We don&apos;t claim to save you this.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process", "outcomes"]}
                    label="Searches that end without a hire"
                    perYear={money(R.failedAnnual)}
                    note={
                      <>At{" "}{pct(a.fillInhouse)}, getting {H} hires means running {R.attempted.toFixed(1)} searches &mdash;{" "}
                        <b>{R.failedSearches.toFixed(1)} find nobody</b>. Each burns {exact(R.failedWork)}{" "}of your team&apos;s time and 30 more days of empty seat.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process", "outcomes"]}
                    label="People who leave within the first year"
                    perYear={money(R.attritionAnnual)}
                    note={
                      <>
                        <b>{R.leavers.toFixed(1)} of your {H}</b> leave inside a year. Each one means doing the whole hire again &mdash; about{" "}
                        <b>{money(R.costPerEarlyExit)}</b>.</>
                    }
                  />

                  <Line strong label="Total" perHire={money(R.perHireToday)} perYear={money(R.totalToday)} />

                  <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What Mintex removes</p>
                  <ColHead />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["outcomes"]}
                    accent
                    label="Roles filled faster, so seats sit empty less"
                    perHire={money(R.lo.savVac / a.routed)}
                    perYear={`${money(R.lo.savVac)}–${money(R.hi.savVac)}`}
                    note={
                      <>
                        <b>
                          {Math.round(R.lo.daysSaved)}–{Math.round(R.hi.daysSaved)}{" "}days sooner</b>{" "}{" "}(we fill 30–40% faster), at{" "}{exact(R.netVacDay)}{" "}a day.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process"]}
                    accent
                    label="Hours your team gets back"
                    perHire={money(R.lo.savTime / a.routed)}
                    perYear={money(R.lo.savTime)}
                    note={
                      <>We take the sourcing, screening and scheduling ({exact(R.lo.savScreen + R.lo.savCoord)}), and you interview{" "}
                        <b>3 instead of {a.nInterviewed}</b> ({exact(R.lo.savInt)}). You still make the call.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["process"]}
                    accent
                    label="Job advertising you no longer pay for"
                    perHire={exact(a.ads)}
                    perYear={money(R.lo.savAds)}
                    note={<>{exact(a.ads)} per role, across {a.routed} roles.</>}
                  />

                  {a.cutTooling && (
                    <Line
                      openAll={expandAll}
                      accent
                      label="Sourcing tools you could drop"
                      perYear={money(R.lo.savTooling)}
                      note={<>Half your LinkedIn Recruiter and job board spend, since you&apos;d need fewer seats.</>}
                    />
                  )}

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["outcomes"]}
                    accent
                    label="Searches that no longer come up empty"
                    perYear={money(R.lo.savFailed)}
                    note={
                      <>
                        <b>{R.lo.failedNow.toFixed(1)}</b> dead searches today, <b>{R.lo.failedMx.toFixed(1)}</b> with us &mdash; at{" "}
                        {money(R.costPerFailed)}{" "}each.</>
                    }
                  />

                  <Line
                    openAll={expandAll}
                    live={live}
                    tags={["outcomes"]}
                    accent
                    label="Replacements we cover free under guarantee"
                    perYear={money(R.lo.savGuar)}
                    note={
                      <>About{" "}<b>{R.lo.exitsInside.toFixed(1)}</b>{" "}would leave inside our 30–90 day guarantee. We replace those free.</>
                    }
                  />

                  <Line strong accent label="Total removed" perHire={money(R.lo.total / a.routed)} perYear={`${money(R.lo.total)}–${money(R.hi.total)}`} />

                  {SHOW_BREAKEVEN && (
                    <Note tone="good">On your own numbers, using Mintex pays for itself at anything up to{" "}
                      <strong>
                        {money(R.breakLo)}&ndash;{money(R.breakHi)}{" "}per hire</strong>{" "}. What we actually charge depends on the role, the volume and the market — that&apos;s a conversation, not a number on a webpage.</Note>
                  )}

                  <Note>
                    <b>Left out on purpose:</b> the {money(R.rampCost * H)}{" "}of getting up to speed (we start the clock earlier, we don&apos;t shorten it), and laptops and IT setup (same cost either way).</Note>
              </DisclosePanel>
              )}
              </div>

              <div>
              {showAssump && (
              <DisclosePanel>
                  <p className="mb-4 mt-1 text-[12.5px] leading-relaxed text-navy/70 dark:text-cream/70">Click a box &mdash; we&apos;ll light up the lines it changes.</p>

                  <div onFocus={() => setLive("team")} onBlur={() => setLive(null)}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Your team &amp; tools &middot; per year</p>
                    <p className="mb-3 text-[11.5px] leading-relaxed text-navy/60 dark:text-cream/60">Changes{" "}<b className="text-emerald-600 dark:text-emerald-400">your recruiting team</b>{" "}line.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Recruiter salary">
                        <NumField value={a.recruiterSalary} prefix="$" step={1000} onChange={(x) => upA("recruiterSalary", x)} />
                      </Field>
                      <Field label="ATS / HR software">
                        <NumField value={a.ats} prefix="$" step={500} onChange={(x) => upA("ats", x)} />
                      </Field>
                      <Field label="LinkedIn Recruiter seats">
                        <NumField value={a.liSeats} onChange={(x) => upA("liSeats", x)} />
                      </Field>
                      <Field label="Job boards">
                        <NumField value={a.jobBoards} prefix="$" step={500} onChange={(x) => upA("jobBoards", x)} />
                      </Field>
                      <Field label="Careers site & branding">
                        <NumField value={a.careersSite} prefix="$" step={500} onChange={(x) => upA("careersSite", x)} />
                      </Field>
                    </div>
                  </div>

                  <div onFocus={() => setLive("process")} onBlur={() => setLive(null)}>
                    <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Your interview process &middot; per role</p>
                    <p className="mb-3 text-[11.5px] leading-relaxed text-navy/60 dark:text-cream/60">Changes{" "}<b className="text-emerald-600 dark:text-emerald-400">interview time</b>, <b className="text-emerald-600 dark:text-emerald-400">onboarding</b>,{" "}
                      <b className="text-emerald-600 dark:text-emerald-400">failed searches</b>, <b className="text-emerald-600 dark:text-emerald-400">early leavers</b>{" "}— and the{" "}<b className="text-emerald-600 dark:text-emerald-400">hours we give back</b>.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="People phone-screened">
                        <NumField value={a.nScreened} onChange={(x) => upA("nScreened", x)} />
                      </Field>
                      <Field label="People interviewed">
                        <NumField value={a.nInterviewed} onChange={(x) => upA("nInterviewed", x)} />
                      </Field>
                      <Field label="Finalists">
                        <NumField value={a.nFinalists} onChange={(x) => upA("nFinalists", x)} />
                      </Field>
                      <Field label="Scheduling & admin hours">
                        <NumField value={a.coordHours} suffix="hrs" onChange={(x) => upA("coordHours", x)} />
                      </Field>
                      <Field label="Recruiter cost per hour">
                        <NumField value={a.rateRecruiter} prefix="$" onChange={(x) => upA("rateRecruiter", x)} />
                      </Field>
                      <Field label="Interviewer cost per hour">
                        <NumField value={a.ratePanel} prefix="$" onChange={(x) => upA("ratePanel", x)} />
                      </Field>
                      <Field label="Senior leader cost per hour">
                        <NumField value={a.rateExec} prefix="$" onChange={(x) => upA("rateExec", x)} />
                      </Field>
                      <Field label="Advertising per role">
                        <NumField value={a.ads} prefix="$" step={50} onChange={(x) => upA("ads", x)} />
                      </Field>
                    </div>
                    <Field label="Background check & testing per role">
                      <NumField value={a.assessment} prefix="$" step={50} onChange={(x) => upA("assessment", x)} />
                    </Field>
                  </div>

                  <div onFocus={() => setLive("outcomes")} onBlur={() => setLive(null)} onMouseEnter={() => setLive("outcomes")} onMouseLeave={() => setLive(null)}>
                    <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Outcomes</p>
                    <p className="mb-3 text-[11.5px] leading-relaxed text-navy/60 dark:text-cream/60">Changes{" "}<b className="text-emerald-600 dark:text-emerald-400">failed searches</b>, <b className="text-emerald-600 dark:text-emerald-400">early leavers</b>{" "}{" "}and most of{" "}<b className="text-emerald-600 dark:text-emerald-400">what Mintex removes</b>.</p>
                    <Field label={`Roles you fill without outside help: ${pct(a.fillInhouse)}`}>
                      <Slider min={40} max={100} value={Math.round(a.fillInhouse * 100)} onChange={(x) => upA("fillInhouse", x / 100)} />
                    </Field>
                    <Field label={`Roles Mintex fills: ${pct(a.fillMintex)}`} hint="We fill 80–90%, depending on pay rate, location and job title.">
                      <Slider min={80} max={90} value={Math.round(a.fillMintex * 100)} onChange={(x) => upA("fillMintex", x / 100)} />
                    </Field>
                    <Field label={`New hires who leave inside a year: ${pct(a.pExit)}`}>
                      <Slider min={0} max={40} value={Math.round(a.pExit * 100)} onChange={(x) => upA("pExit", x / 100)} />
                    </Field>
                    <label className="mt-3 flex items-start gap-2.5 text-sm text-navy dark:text-cream">
                      <input type="checkbox" checked={a.cutTooling} onChange={(e) => upA("cutTooling", e.target.checked)} className="mt-0.5 accent-steel" />
                      <span>Count sourcing tools you&apos;d no longer need{" "}<span className="mt-1 block text-[11.5px] text-navy/70 dark:text-cream/70">Off by default — only realistic if we handle most of your hiring.</span>
                      </span>
                    </label>
                  </div>
              </DisclosePanel>
              )}
              </div>
              </div>
            </div>

            <CtaRow emailHref={employerEmailHref} breakdown={employerBreakdown} onSave={saveResult} saveState={saveState} />
            <SavedLinkBox url={savedUrl} error={saveError} />

            <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">Estimates for planning. Where you haven&apos;t given us a number we&apos;ve used a US industry benchmark — all editable above. Check against your own records before budgeting from this.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------- STAFFING */
  if (mode === "staffing") {
    const sourcingOnly = b.engagement === "Sourcing only";

    const staffingEmailLines: CalculatorBreakdownLine[] = [
      { label: "Reqs that come in per year", value: `${b.reqs}` },
      { label: "Placements you make", value: `${b.fills}` },
      { label: "Coverage — reqs your team can actually work", value: `${pct(RB.coverage)} (${Math.round(RB.worked)} of ${b.reqs})` },
      { label: "Reqs nobody gets to", value: `${Math.round(RB.uncovered)} reqs` },
      { label: "Placements you'd have made from the rest", value: `${Math.round(RB.newPlacements)}` },
      { label: "Money sitting on the table", value: money(RB.gpCreated), strong: true, accent: true },
      { label: "Your recruiters & tools (fixed cost, per year)", value: money(RB.fixedAnnual) },
      { label: "Cost carried by every placement", value: money(RB.costPerPlacement) },
      { label: "Cost of a quiet quarter", value: money(RB.slowQuarter) },
      { label: "Hiring another recruiter — year one, all in", value: money(RB.firstYearCost) },
      { label: "Risk if that recruiter doesn't work out", value: money(RB.hireRisk) },
      { label: "With Mintex — year one cost", value: "$0 until we place", accent: true },
    ];
    const staffingBreakdown: CalculatorBreakdownPayload = {
      mode: "staffing",
      heading: "How many of your reqs never get worked?",
      headlineLabel: "Reqs nobody gets to, per year",
      headlineValue: `${Math.round(RB.uncovered)} reqs · ${money(RB.gpCreated)}`,
      lines: staffingEmailLines,
    };
    const staffingEmailHref = "/resources/hiring-cost-calculator/email-results#s=" + packState(staffingBreakdown);

    return (
      <div>
        <BackButton onClick={() => setMode(null)} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Staffing firm &middot; MSP &middot; tier-1 vendor</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">How many of your reqs never get worked?</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
          <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Your desk, per year</p>
            <Field label="Reqs that come in">
              <NumField value={b.reqs} onChange={(x) => upB("reqs", x)} />
            </Field>
            <Field label="Placements you make">
              <NumField value={b.fills} onChange={(x) => upB("fills", x)} />
            </Field>
            <Field label="What you keep on an average placement" hint="Your gross profit — the bill rate less what the candidate costs you.">
              <NumField value={b.gp} prefix="$" step={500} onChange={(x) => upB("gp", x)} />
            </Field>
            <Field label="Recruiters on the desk">
              <NumField value={b.recruiters} onChange={(x) => upB("recruiters", x)} />
            </Field>
            <Field label="What one recruiter costs you a year" hint="Base, commission, tax and benefits.">
              <NumField value={b.recCost} prefix="$" step={5000} onChange={(x) => upB("recCost", x)} />
            </Field>
            <Field label="Tools per recruiter a year" hint="LinkedIn Recruiter, job boards, databases.">
              <NumField value={b.toolSeat} prefix="$" step={1000} onChange={(x) => upB("toolSeat", x)} />
            </Field>
            <Field label="Reqs one recruiter can really work in a year" hint="Not what lands in their inbox — what they can actually source and submit on.">
              <NumField value={b.capacityPerRec} onChange={(x) => upB("capacityPerRec", x)} />
            </Field>
            <div className="border-t border-navy/10 pt-4 dark:border-white/10">
              <Field
                label="How you'd work with us"
                hint={sourcingOnly ? "We send you candidates. You submit, you own the process." : "We source, screen and manage the candidate through to start."}
              >
                <Toggle<EngagementKeyB> value={b.engagement} onChange={(x) => upB("engagement", x)} options={["Full 360", "Sourcing only"]} />
              </Field>
            </div>
          </div>

          <div>
            <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Reqs nobody gets to &middot; per year</p>
              <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">
                {Math.round(RB.uncovered)} reqs &middot; {money(RB.gpCreated)}
              </p>
              <p className="mt-3 max-w-lg text-[13.5px] text-white/75">That&apos;s about{" "}<b>{RB.droppedPerMonth.toFixed(0)} a month</b>{" "}nobody can pick up. Not because you&apos;d lose them — at your own fill rate of{" "}{pct(RB.ownFillRate)} you&apos;d close around {Math.round(RB.newPlacements)}{" "}of them. There simply aren&apos;t enough hours.</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-navy/10 bg-white p-5 dark:border-white/10 dark:bg-navy-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">You cover</p>
                <p className={`mt-2 font-heading text-[22px] font-bold tabular-nums ${RB.coverage < 0.7 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {pct(RB.coverage)}
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mist dark:bg-navy-800">
                  <div
                    className={`h-full rounded-full ${RB.coverage < 0.7 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, RB.coverage * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-navy/70 dark:text-cream/70">
                  {Math.round(RB.worked)} of {b.reqs}{" "}reqs get worked</p>
              </div>
              <StatCard label="Every placement carries" value={money(RB.costPerPlacement)} sub="just to keep the desk running" />
              <StatCard label="A quiet quarter still costs" value={money(RB.slowQuarter)} sub="whether you place anyone or not" tone="warn" />
            </div>

            <Prompt>
              <b>These are starting numbers, not yours.</b>{" "}We&apos;ve kept them careful on purpose. Change anything in the panel on the left — especially how many reqs one recruiter can really work — and every line below moves with it.</Prompt>

            <Disclose title="Show me how we got there" sub="every number, in plain English" open={showWork} onToggle={() => setShowWork(!showWork)}>
              <div className="mb-2.5 mt-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What your desk costs today</p>
                <button type="button" onClick={() => setExpandAll(!expandAll)} className="text-[12.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {expandAll ? "Collapse all" : "Explain every line"}
                </button>
              </div>
              <ColHead />

              <Line
                openAll={expandAll}
                label="Your recruiters and their tools"
                perHire={money(RB.costPerPlacement)}
                perYear={money(RB.fixedAnnual)}
                note={
                  <>
                    <b>{b.recruiters}</b> recruiters at {exact(b.recCost)} each, plus {exact(b.toolSeat)} of tools each, is <b>{exact(RB.fixedAnnual)}</b>{" "}a year. Spread across your{" "}{b.fills} placements, every deal carries <b>{money(RB.costPerPlacement)}</b>{" "}of desk cost before commission. This is a{" "}<b>fixed</b>{" "}number — it doesn&apos;t drop when the market does.</>
                }
              />

              <Line
                openAll={expandAll}
                warn
                label="What a quiet quarter costs you anyway"
                perYear={money(RB.slowQuarter)}
                note={
                  <>Three months of recruiters and tools is{" "}<b>{money(RB.slowQuarter)}</b>. It goes out whether the reqs are flowing or not. That&apos;s the bit that hurts when a client puts hiring on hold or an MSP goes quiet on you.</>
                }
              />

              <Line
                openAll={expandAll}
                label="Reqs your team can actually get to"
                perYear={`${Math.round(RB.worked)} of ${b.reqs}`}
                note={
                  <>At{" "}<b>{b.capacityPerRec} reqs</b> per recruiter a year, {b.recruiters} recruiters can properly work about{" "}
                    <b>{Math.round(RB.capacity)}</b>. You receive <b>{b.reqs}</b> — roughly {RB.reqsPerMonth.toFixed(0)} a month. So{" "}
                    <b>{Math.round(RB.uncovered)}</b>{" "}never get real attention. If that capacity number looks wrong, change it in the panel.</>
                }
              />

              <Line
                openAll={expandAll}
                label="Placements you'd have made from the rest"
                perYear={`${Math.round(RB.newPlacements)}`}
                note={
                  <>We apply{" "}<b>your own fill rate</b>, not ours. You close {b.fills} from {Math.round(RB.worked)} worked reqs — that&apos;s{" "}
                    <b>{pct(RB.ownFillRate)}</b>. Apply that to the {Math.round(RB.uncovered)} you never touch and it&apos;s about{" "}
                    <b>{Math.round(RB.newPlacements)} placements</b>, worth <b>{money(RB.gpCreated)}</b>{" "}in gross profit. We&apos;re not claiming to be better than you — just that reqs nobody works fill at zero.</>
                }
              />

              <Line strong label="Money sitting on the table" perYear={money(RB.gpCreated)} />

              <Note>
                <b>It isn&apos;t only about the reqs you miss.</b>{" "}On an MSP or a tier-1 panel, a req you don&apos;t submit on is a req somebody else fills. Miss enough and your ranking slips, and once the ranking slips the reqs stop coming. It happens quietly on direct accounts too — send a client five roles, get candidates back on two, and they start calling someone else.</Note>

              <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Your two ways out of it</p>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">Hire another recruiter</p>
                  <Line
                    openAll={expandAll}
                    label="Year one, all in"
                    perYear={money(RB.firstYearCost)}
                    note={
                      <>
                        {exact(b.recCost)} salary and commission, {exact(b.toolSeat)} of tools, plus roughly {money(RB.rampLoss)}{" "}of lost production while they learn your desk in the first four months.</>
                    }
                  />
                  <Line label="Actually productive from" perYear="Month 4" />
                  <Line warn label="Cost if the quarter goes quiet" perYear={money(RB.slowQuarter)} />
                  <Line
                    openAll={expandAll}
                    label="Deals before they pay for themselves"
                    perYear={RB.recBreakeven.toFixed(1)}
                    note={
                      <>At{" "}{exact(b.gp)} gross profit a placement, they need <b>{RB.recBreakeven.toFixed(1)} deals</b>{" "}before they&apos;ve paid for themselves.</>
                    }
                  />
                  <Line
                    openAll={expandAll}
                    warn
                    label="If they don't work out"
                    perYear={money(RB.hireRisk)}
                    note={
                      <>Roughly 3 in 10 recruiter hires don&apos;t last the year. Half a year&apos;s money plus the time they spent learning your desk is about{" "}<b>{money(RB.hireRisk)}</b>{" "}— and you&apos;re back where you started, a year later.</>
                    }
                  />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">Split with Mintex</p>
                  <Line accent label="Year one, all in" perYear="$0 until we place" />
                  <Line accent label="Actually productive from" perYear="Day one" />
                  <Line accent label="Cost if the quarter goes quiet" perYear="$0" />
                  <Line accent label="Deals before they pay for themselves" perYear="None" />
                  <Line accent label="If it doesn't work out" perYear="You've lost nothing" />
                </div>
              </div>

              <Note tone="good">
                {sourcingOnly ? (
                  <>You&apos;ve told us you&apos;d want{" "}<b>sourcing only</b>{" "}— we find and screen, you submit and run the process. Your client never deals with us, your recruiters stop spending their day in a database, and you decide who goes forward.</>
                ) : (
                  <>You&apos;ve told us you&apos;d want{" "}<b>full 360</b>{" "}— we source, screen and manage the candidate through to start, under your brand. Your client sees your firm throughout. The relationship stays yours; only the delivery load moves.</>
                )}
              </Note>
            </Disclose>

            <CtaRow emailHref={staffingEmailHref} breakdown={staffingBreakdown} onSave={saveResult} saveState={saveState} />
            <SavedLinkBox url={savedUrl} error={saveError} />

            <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">Estimates for planning. We apply your own fill rate to uncovered reqs, not ours — change any number above and everything recalculates.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- SEARCH */
  const researchOnly = c.engagement === "Research only";

  const searchEmailLines: CalculatorBreakdownLine[] = [
    { label: "Searches run per year", value: `${c.searches}` },
    { label: "Average fee per search", value: money(c.retainer) },
    { label: "Research cost per search", value: `${money(RC.deliveryPerSearch)} (${pct(RC.pctOfRetainer)} of fee)` },
    { label: "Total research + stalled cost, per year", value: money(RC.annualDelivery + RC.stalledCost), strong: true },
    { label: "Searches that stall or die", value: `${RC.stalled.toFixed(1)} a year — ${money(RC.stalledCost)}` },
    { label: "Hours spent searching per year", value: `${RC.annualHours.toLocaleString()} hrs` },
    { label: "Fee income", value: money(RC.feeIncome) },
    {
      label: "Extra searches possible if research were handled",
      value: `${c.extraSearches} searches — ${money(RC.capacityValue)} in fees`,
      accent: true,
    },
    { label: "Hours back in your partners' week", value: `${RC.annualHours.toLocaleString()} hrs`, accent: true },
  ];
  const searchBreakdown: CalculatorBreakdownPayload = {
    mode: "search",
    heading: "How much of your fee is gone before you send a name?",
    headlineLabel: "What the work costs you, per year",
    headlineValue: money(RC.annualDelivery + RC.stalledCost),
    lines: searchEmailLines,
  };
  const searchEmailHref = "/resources/hiring-cost-calculator/email-results#s=" + packState(searchBreakdown);

  return (
    <div>
      <BackButton onClick={() => setMode(null)} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Executive search</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy dark:text-cream sm:text-4xl">How much of your fee is gone before you send a name?</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel dark:text-steel-light">Your search practice</p>
          <Field label="Searches you run a year">
            <NumField value={c.searches} onChange={(x) => upC("searches", x)} />
          </Field>
          <Field label="Average fee per search">
            <NumField value={c.retainer} prefix="$" step={5000} onChange={(x) => upC("retainer", x)} />
          </Field>
          <Field label="Hours of digging per search" hint="Mapping the market, building the long list, making first contact.">
            <NumField value={c.researchHours} suffix="hrs" onChange={(x) => upC("researchHours", x)} />
          </Field>
          <Field label="What an hour of that time costs you" hint="Your researcher's real cost — or a partner's, if partners are the ones doing it.">
            <NumField value={c.researchRate} prefix="$" onChange={(x) => upC("researchRate", x)} />
          </Field>
          <Field label="Databases and market data per search">
            <NumField value={c.mappingTools} prefix="$" step={100} onChange={(x) => upC("mappingTools", x)} />
          </Field>
          <Field label={`Searches that stall or die: ${pct(c.pFail)}`}>
            <Slider min={0} max={40} value={Math.round(c.pFail * 100)} onChange={(x) => upC("pFail", x / 100)} />
          </Field>
          <Field label={`Fee you refund or credit when one dies: ${pct(c.refundPct)}`} hint="Set it to 0 if your terms don't give anything back.">
            <Slider min={0} max={100} value={Math.round(c.refundPct * 100)} onChange={(x) => upC("refundPct", x / 100)} />
          </Field>
          <Field label="Extra searches you could take on if the digging were done" hint="Your call. How many more could your partners realistically handle?">
            <NumField value={c.extraSearches} onChange={(x) => upC("extraSearches", x)} />
          </Field>
          <div className="border-t border-navy/10 pt-4 dark:border-white/10">
            <Field
              label="What you'd hand over"
              hint={researchOnly ? "We map the market and build the long list. Your partners take it from there." : "We take it through to a shortlist your partners can present."}
            >
              <Toggle<EngagementKeyC> value={c.engagement} onChange={(x) => upC("engagement", x)} options={["Research only", "Full delivery"]} />
            </Field>
          </div>
        </div>

        <div>
          <div className="rounded-3xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-7 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">What the work costs you &middot; per year</p>
            <p className="mt-3 font-heading text-4xl font-bold tabular-nums sm:text-[42px]">{money(RC.annualDelivery + RC.stalledCost)}</p>
            <p className="mt-3 max-w-lg text-[13.5px] text-white/75">
              {money(RC.deliveryPerSearch)} of research goes into every search before a name reaches the client —{" "}
              <b>{pct(RC.pctOfRetainer)} of your fee</b>. Add the searches that die and you&apos;re at {money(RC.annualDelivery + RC.stalledCost)} against{" "}
              {money(RC.feeIncome)}{" "}of fee income.</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Digging, per search" value={money(RC.deliveryPerSearch)} sub={`${pct(RC.pctOfRetainer)} of a ${money(c.retainer)} fee`} />
            <StatCard label="Searches that die" value={money(RC.stalledCost)} sub={`${RC.stalled.toFixed(1)} a year, work plus what you refund`} tone="warn" />
            <StatCard label="Hours spent searching" value={RC.annualHours.toLocaleString()} sub="time not spent winning the next search" />
          </div>

          <Prompt>
            <b>These are starting numbers, not yours.</b>{" "}The one that matters most is what an hour of that time costs. If partners do their own digging rather than a researcher, put a partner&apos;s rate in and watch every figure below move.</Prompt>

          <Disclose title="Show me how we got there" sub="every number, in plain English" open={showWork} onToggle={() => setShowWork(!showWork)}>
            <div className="mb-2.5 mt-1 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What each search costs you to run</p>
              <button type="button" onClick={() => setExpandAll(!expandAll)} className="text-[12.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                {expandAll ? "Collapse all" : "Explain every line"}
              </button>
            </div>
            <ColHead />

            <Line
              openAll={expandAll}
              label="Time spent finding people"
              perHire={money(c.researchHours * c.researchRate)}
              perYear={money(c.searches * c.researchHours * c.researchRate)}
              note={
                <>
                  <b>{c.researchHours} hours</b> of mapping the market, building a long list and making first contact, at {exact(c.researchRate)}{" "}an hour, is{" "}<b>{money(c.researchHours * c.researchRate)}</b> a search. Across {c.searches} searches that&apos;s{" "}
                  <b>{RC.annualHours.toLocaleString()} hours</b>{" "}a year your partners spend looking for people instead of sitting in front of clients.</>
              }
            />

            <Line
              openAll={expandAll}
              label="Databases and market data"
              perHire={money(c.mappingTools)}
              perYear={money(c.searches * c.mappingTools)}
              note={<>{exact(c.mappingTools)} per search of subscriptions and market data.</>}
            />

            <Line
              openAll={expandAll}
              label="Total before a name reaches the client"
              perHire={money(RC.deliveryPerSearch)}
              perYear={money(RC.annualDelivery)}
              note={
                <>
                  <b>{money(RC.deliveryPerSearch)}</b> a search — <b>{pct(RC.pctOfRetainer)}</b> of your {money(c.retainer)}{" "}fee, spent before the client has laid eyes on a single person. That&apos;s your margin going into work nobody ever sees.</>
              }
            />

            <Line
              openAll={expandAll}
              warn
              label="Searches that never close"
              perYear={money(RC.stalledCost)}
              note={
                <>At{" "}<b>{pct(c.pFail)}</b>, about <b>{RC.stalled.toFixed(1)} searches a year</b> stall or die. You&apos;ve still done{" "}
                  {money(RC.deliveryPerSearch)}{" "}of research on each{" "}{c.refundPct > 0 && (
                    <>, and you give back{" "}{pct(c.refundPct)} of the fee ({money(c.refundPct * c.retainer)})</>
                  )}{" "}. About{" "}<b>{money(RC.deliveryPerSearch + c.refundPct * c.retainer)}</b>{" "}each.</>
              }
            />

            <Line strong label="The work, plus the ones that die" perYear={money(RC.annualDelivery + RC.stalledCost)} />

            <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-steel dark:text-steel-light">What changes with Mintex</p>
            <ColHead />

            <Line
              openAll={expandAll}
              accent
              label="Hours back in your partners' week"
              perHire={`${c.researchHours} hrs`}
              perYear={`${RC.annualHours.toLocaleString()} hrs`}
              note={
                <>
                  {researchOnly ? (
                    <>We map the market and build the long list. Your partners pick up a researched pool instead of a blank page.</>
                  ) : (
                    <>We take it through to a shortlist. Your partners assess, present and advise — the part clients actually pay a search firm for.</>
                  )}{" "}{" "}That&apos;s{" "}<b>{RC.annualHours.toLocaleString()} hours</b>{" "}a year off the desk.</>
              }
            />

            <Line
              openAll={expandAll}
              accent
              label="Searches you could take on instead"
              perYear={money(RC.capacityValue)}
              note={
                <>You told us your partners could run{" "}<b>{c.extraSearches} more searches</b> a year if research were handled. At {money(c.retainer)}{" "}a search that&apos;s{" "}<b>{money(RC.capacityValue)}</b> in fees, or about <b>{money(RC.capacityMargin)}</b>{" "}once you take off what each one costs to run. This one is your number, not ours — change it in the panel if it&apos;s optimistic.</>
              }
            />

            <Note>
              <b>What we&apos;re not claiming.</b>{" "}We haven&apos;t assumed we save your dead searches. Searches die for reasons no amount of digging fixes — the brief changes, the budget disappears, they hire someone internally. Covering more of the market helps. We&apos;re not going to put a number on it and ask you to take our word for it.</Note>
          </Disclose>

          <Note tone="good">
            {researchOnly ? (
              <>You&apos;ve told us you&apos;d want{" "}<b>research only</b>{" "}— mapping, long-listing and first approaches. Your partners keep the client conversation entirely.</>
            ) : (
              <>You&apos;ve told us you&apos;d want{" "}<b>full delivery</b>{" "}— we take it to shortlist under your name. Candidates meet your firm, not ours.</>
            )}
          </Note>

          <CtaRow emailHref={searchEmailHref} breakdown={searchBreakdown} onSave={saveResult} saveState={saveState} />
          <SavedLinkBox url={savedUrl} error={saveError} />

          <p className="mt-6 text-xs leading-relaxed text-navy/60 dark:text-cream/60">Estimates for planning. Every number above is yours to change.</p>
        </div>
      </div>
    </div>
  );
}
