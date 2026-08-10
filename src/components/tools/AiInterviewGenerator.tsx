"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import type { Industry } from "@/content/types";
import { US_STATES, type InterviewKit } from "@/lib/interviewKit/schema";

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

const STAGE_LABELS: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical Round",
  panel: "Panel",
  final: "Final Round",
};

const WEIGHT_STYLES: Record<string, string> = {
  critical: "bg-tan/20 text-navy",
  important: "bg-mist text-navy/80",
  "nice-to-have": "bg-mist text-navy/50",
};

export default function AiInterviewGenerator({ industries }: { industries: Industry[] }) {
  const industryOptions = industries.map((industry) => ({
    value: industry.slug,
    label: industry.name.replace(/\s+Staffing$/i, ""),
  }));
  const [industrySlug, setIndustrySlug] = useState(industries[0]?.slug ?? "");
  const [seniority, setSeniority] = useState<"entry" | "mid" | "senior">("mid");
  const [state, setState] = useState<(typeof US_STATES)[number]>("New Jersey");
  const [focus, setFocus] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [kit, setKit] = useState<InterviewKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const industryName = industries.find((industry) => industry.slug === industrySlug)?.name ?? industrySlug;

  async function handleGenerate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobTitle.trim()) {
      setError("Enter the job title you're interviewing for.");
      return;
    }
    setLoading(true);
    setError(null);
    setKit(null);
    try {
      const res = await fetch("/api/generate-interview-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), industryName, seniority, state, focus: focus || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setKit(data.kit as InterviewKit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full">
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
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-normal text-navy placeholder:text-navy/35 focus:border-tan focus:outline-none"
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

          <Button type="submit" className="mt-1 w-full" disabled={loading}>
            {loading ? "Generating your kit…" : "Generate Interview Kit"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-navy/40">
            AI-generated to help you prepare — not legal advice. Employment law varies by state; verify anything
            specific with your state's labor office before relying on it.
          </p>
        </form>

        <div className="rounded-3xl bg-navy p-7 text-white shadow-[0_20px_50px_-24px_rgba(0,48,96,0.5)]">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan-light">Your Interview Kit</h3>
          {kit ? (
            <div className="mt-4 space-y-1 text-sm text-white/85">
              <p className="text-lg font-semibold text-white">{kit.role.title}</p>
              <p className="text-xs text-tan-light">{kit.region.state}</p>
              <p>{kit.role.summary}</p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-steel-lighter">
              Enter a job title, pick your state, industry, and seniority, then generate a full kit — competency map,
              scored questions, your rights in your state, and prep tips, not just a flat question list.
            </p>
          )}
        </div>
      </div>

      {kit && (
        <div className="mt-10 space-y-8">
          <section>
            <h3 className="font-heading text-xl font-semibold text-navy">Competency map</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {kit.competency_map.map((c) => (
                <span
                  key={c.competency}
                  title={c.why_it_matters}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${WEIGHT_STYLES[c.weight] ?? WEIGHT_STYLES["nice-to-have"]}`}
                >
                  {c.competency}
                </span>
              ))}
            </div>
          </section>

          {kit.sections.map((section) => (
            <section key={section.stage}>
              <h3 className="font-heading text-xl font-semibold text-navy">
                {STAGE_LABELS[section.stage] ?? section.stage}
                <span className="ml-2 text-sm font-normal text-navy/50">~{section.duration_minutes} min</span>
              </h3>
              <div className="mt-3 space-y-3">
                {section.questions.map((q) => (
                  <details key={q.id} className="group rounded-2xl border border-navy/10 bg-white p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="text-sm font-medium text-navy">{q.question}</span>
                      <span className="flex flex-shrink-0 items-center gap-2">
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-navy/60">
                          {q.type.replace("_", " ")}
                        </span>
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-navy/60">
                          Lvl {q.difficulty}
                        </span>
                      </span>
                    </summary>
                    <div className="mt-4 space-y-3 border-t border-navy/10 pt-4 text-sm text-navy/75">
                      <p className="italic text-navy/60">{q.subtext}</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="font-semibold text-navy">Strong answer includes</p>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4">
                            {q.what_strong_looks_like.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-navy">Weak answer looks like</p>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4">
                            {q.what_weak_looks_like.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-navy">Follow-up probes</p>
                        <ul className="mt-1.5 list-disc space-y-1 pl-4">
                          {q.follow_up_probes.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="font-heading text-xl font-semibold text-navy">How you'll be scored</h3>
            <p className="mt-2 text-sm text-navy/60">Dimensions: {kit.how_youll_be_scored.dimensions.join(", ")}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(["1", "3", "5"] as const).map((n) => (
                <div key={n} className="rounded-xl bg-mist p-3 text-sm text-navy/75">
                  <p className="font-semibold text-navy">{n} / 5</p>
                  <p className="mt-1">{kit.how_youll_be_scored.anchors[n]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-tan/40 bg-tan/[0.08] p-6">
            <h3 className="font-heading text-xl font-semibold text-navy">Know your rights in {kit.region.state}</h3>
            <p className="mt-1 text-xs text-navy/50">
              Not legal advice — verify anything specific with {kit.region.state}'s labor office before relying on
              it.
            </p>
            <div className="mt-4 space-y-3">
              {kit.your_rights.cannot_be_asked.map((item) => (
                <div key={item.question} className="rounded-xl bg-white p-4 text-sm">
                  <p className="text-navy/50 line-through">{item.question}</p>
                  <p className="mt-1 text-navy/70">{item.why}</p>
                  <p className="mt-1 font-medium text-navy">If you're asked this: {item.how_to_respond}</p>
                </div>
              ))}
            </div>
            {kit.your_rights.state_specific.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-4 text-sm text-navy/70">
                {kit.your_rights.state_specific.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="font-heading text-xl font-semibold text-navy">Prep before you go in</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-navy">Think through these before the interview</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                  {kit.prep.star_prompts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-navy">Questions to ask them</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                  {kit.prep.questions_to_ask_them.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {kit.prep.likely_skills_tests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-navy">You may also be tested on</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                  {kit.prep.likely_skills_tests.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
