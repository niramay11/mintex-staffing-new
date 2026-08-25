"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import PasteJobDescriptionKit from "@/components/tools/PasteJobDescriptionKit";
import type { Industry } from "@/content/types";
import { US_STATES } from "@/lib/interviewKit/schema";
import { buildKitSlug } from "@/lib/interviewKit/slug";
import { hasHazardDomain } from "@/lib/interviewKit/hazardDomain";

const seniorityOptions = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

const stateOptions = US_STATES.map((state) => ({ value: state, label: state }));

const BASE_FOCUS_OPTIONS = [
  { value: "", label: "Balanced" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "culture", label: "Culture / reliability" },
];
const SAFETY_FOCUS_OPTION = { value: "safety", label: "Safety" };

// Redirect BEFORE generating, straight to the kit's own indexed URL — the
// slug is deterministic from the form inputs (see slug.ts), so no API call
// happens here at all. The destination page does the (cached) generation
// and is what search engines actually see.
export default function AiInterviewGenerator({ industries }: { industries: Industry[] }) {
  const [tab, setTab] = useState<"title" | "jd">("title");
  const router = useRouter();
  const industryOptions = industries.map((industry) => ({
    value: industry.slug,
    label: industry.name.replace(/\s+Staffing$/i, ""),
  }));
  const [industrySlug, setIndustrySlug] = useState(industries[0]?.slug ?? "");
  const [seniority, setSeniority] = useState<"entry" | "mid" | "senior">("mid");
  const [state, setState] = useState<(typeof US_STATES)[number]>("New Jersey");
  const [focus, setFocus] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const industryName = industries.find((industry) => industry.slug === industrySlug)?.name ?? industrySlug;
  const focusOptions = hasHazardDomain(industryName) ? [...BASE_FOCUS_OPTIONS, SAFETY_FOCUS_OPTION] : BASE_FOCUS_OPTIONS;

  // If the user had Safety selected and then switches to an industry where
  // it doesn't apply, don't silently submit a focus mode that's no longer
  // shown as an option — reset it right here in the change handler rather
  // than an effect, since this is a direct response to a user action.
  function handleIndustryChange(newSlug: string) {
    setIndustrySlug(newSlug);
    const newIndustryName = industries.find((industry) => industry.slug === newSlug)?.name ?? newSlug;
    if (focus === "safety" && !hasHazardDomain(newIndustryName)) {
      setFocus("");
    }
  }

  function handleGenerate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobTitle.trim()) {
      setError("Enter the job title you're interviewing for.");
      return;
    }
    const industry = industries.find((i) => i.slug === industrySlug);
    if (!industry) {
      setError("Pick an industry.");
      return;
    }
    setError(null);
    setNavigating(true);
    const slug = buildKitSlug(
      { jobTitle: jobTitle.trim(), industryName, seniority, state, focus: focus || undefined },
      industry
    );
    router.push(`/interview-questions/${slug}`);
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-6 inline-flex rounded-full border border-navy/10 bg-white p-1 dark:border-white/10 dark:bg-navy-900">
        <button
          type="button"
          onClick={() => setTab("title")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "title" ? "bg-navy text-white dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light" : "text-navy/60 hover:text-navy dark:text-cream/60 dark:hover:text-cream"
          }`}
        >
          By job title
        </button>
        <button
          type="button"
          onClick={() => setTab("jd")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "jd" ? "bg-navy text-white dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light" : "text-navy/60 hover:text-navy dark:text-cream/60 dark:hover:text-cream"
          }`}
        >
          Paste a job description
        </button>
      </div>

      {tab === "jd" ? (
        <PasteJobDescriptionKit />
      ) : (
        <div className="mx-auto grid w-full items-start gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleGenerate}
            className="grid content-start gap-5 rounded-3xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-900"
          >
            <label className="block text-sm font-semibold text-navy dark:text-cream">
              Job title
              <input
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Warehouse Associate, Registered Nurse, CNC Machinist"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-normal text-navy placeholder:text-navy/35 focus:border-steel focus:outline-none dark:border-white/15 dark:bg-navy-900 dark:text-cream dark:placeholder:text-cream/35"
              />
            </label>

            <Select label="Industry" value={industrySlug} onChange={handleIndustryChange} options={industryOptions} />
            <Select
              label="State"
              value={state}
              onChange={(value) => setState(value as (typeof US_STATES)[number])}
              options={stateOptions}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Seniority"
                value={seniority}
                onChange={(value) => setSeniority(value as "entry" | "mid" | "senior")}
                options={seniorityOptions}
              />
              <Select label="Focus" value={focus} onChange={setFocus} options={focusOptions} />
            </div>

            <Button type="submit" className="mt-1 w-full" disabled={navigating}>
              {navigating ? "Loading your kit…" : "Generate Interview Kit"}
            </Button>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <p className="text-xs text-navy/70 dark:text-cream/70">
              AI-generated to help you prepare — not legal advice. Employment law varies by state; verify anything
              specific with your state&apos;s labor office before relying on it.
            </p>
          </form>

          <div className="rounded-3xl bg-navy p-7 text-white shadow-[0_20px_50px_-24px_rgba(0,48,96,0.5)] dark:bg-navy-800 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)]">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel-lighter">Your Interview Kit</h3>
            <p className="mt-5 text-sm text-steel-lighter">
              Enter a job title, pick your state, industry, and seniority, then generate a full kit — competency
              map, scored questions, your rights in your state, and prep tips, not just a flat question list.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
