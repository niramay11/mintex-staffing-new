"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import PasteJobDescriptionKit from "@/components/tools/PasteJobDescriptionKit";
import type { Industry } from "@/content/types";
import { US_STATES } from "@/lib/interviewKit/schema";
import { buildKitSlug } from "@/lib/interviewKit/slug";

const seniorityOptions = [
  { value: "entry", label: "Entry" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

const stateOptions = US_STATES.map((state) => ({ value: state, label: state }));

const focusOptions = [
  { value: "", label: "Balanced" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "culture", label: "Culture / reliability" },
  { value: "safety", label: "Safety" },
];

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
      <div className="mb-6 inline-flex rounded-full border border-navy/10 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("title")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "title" ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
          }`}
        >
          By job title
        </button>
        <button
          type="button"
          onClick={() => setTab("jd")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "jd" ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
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
            className="grid content-start gap-5 rounded-3xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]"
          >
            <label className="block text-sm font-semibold text-navy">
              Job title
              <input
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="e.g. Warehouse Associate, Registered Nurse, CNC Machinist"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-normal text-navy placeholder:text-navy/35 focus:border-steel focus:outline-none"
              />
            </label>

            <Select label="Industry" value={industrySlug} onChange={setIndustrySlug} options={industryOptions} />
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-navy/40">
              AI-generated to help you prepare — not legal advice. Employment law varies by state; verify anything
              specific with your state&apos;s labor office before relying on it.
            </p>
          </form>

          <div className="rounded-3xl bg-navy p-7 text-white shadow-[0_20px_50px_-24px_rgba(0,48,96,0.5)]">
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
