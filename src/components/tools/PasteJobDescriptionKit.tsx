"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import InterviewKitView from "@/components/tools/InterviewKitView";
import ResumeGapAnalysis from "@/components/tools/ResumeGapAnalysis";
import { US_STATES, type InterviewKit } from "@/lib/interviewKit/schema";
import { JD_MAX_CHARS } from "@/lib/interviewKit/jdSchema";

type JdContext = { mustHaveSkills?: string[]; namedTools?: string[] };

// Private path: this kit is generated live from whatever text is pasted in
// and rendered inline, right here — it never gets its own URL, is never
// cached, and is never indexed. Refreshing the page loses it; that's the
// point, not a bug (see implementation notes on the private path).

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

export default function PasteJobDescriptionKit() {
  const [jobDescription, setJobDescription] = useState("");
  const [seniority, setSeniority] = useState<"entry" | "mid" | "senior">("mid");
  const [state, setState] = useState<(typeof US_STATES)[number]>("New Jersey");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const [jdContext, setJdContext] = useState<JdContext | undefined>(undefined);

  const overLimit = jobDescription.length > JD_MAX_CHARS;

  async function handleGenerate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobDescription.trim()) {
      setError("Paste the job description text.");
      return;
    }
    if (overLimit) {
      setError(`That's too long (${jobDescription.length} characters, max ${JD_MAX_CHARS}) — paste just the job posting.`);
      return;
    }
    setLoading(true);
    setError(null);
    setKit(null);
    try {
      const res = await fetch("/api/generate-jd-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, seniority, state, focus: focus || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setKit(data.kit as InterviewKit);
      setJdContext(data.jdContext as JdContext | undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full">
      <form
        onSubmit={handleGenerate}
        className="grid content-start gap-5 rounded-3xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]"
      >
        <label className="block text-sm font-semibold text-navy">
          Job description
          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job posting text here…"
            rows={8}
            className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-normal text-navy placeholder:text-navy/35 focus:border-steel focus:outline-none"
          />
          <span className={`mt-1 block text-right text-xs ${overLimit ? "text-red-600" : "text-navy/40"}`}>
            {jobDescription.length.toLocaleString()} / {JD_MAX_CHARS.toLocaleString()}
          </span>
        </label>

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

        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? "Reading the posting and generating…" : "Generate Interview Kit From This Posting"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-navy/40">
          This kit is generated fresh from the text you paste and is never saved or indexed — it disappears if you
          leave or refresh this page. Not legal advice; verify anything specific with your state&apos;s labor office.
        </p>
      </form>

      {kit && (
        <div className="mt-10">
          <p className="mb-4 rounded-xl bg-steel/10 px-4 py-3 text-sm text-navy/70">
            Generated from your pasted posting — grounded in the tools and requirements it actually named, not
            guessed. This isn&apos;t saved anywhere; copy anything you want to keep before leaving this page.
          </p>
          <InterviewKitView kit={kit} />
          <div className="mt-8">
            <ResumeGapAnalysis kit={kit} jdContext={jdContext} />
          </div>
        </div>
      )}
    </div>
  );
}
