"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { getInterviewQuestionSet } from "@/content/interviewQuestions";
import type { InterviewQuestionSet, Industry } from "@/content/types";

const roleLevels: InterviewQuestionSet["roleLevel"][] = ["Entry", "Mid", "Senior"];

const roleLevelOptions = roleLevels.map((level) => ({ value: level, label: level }));

export default function AiInterviewGenerator({ industries }: { industries: Industry[] }) {
  const industryOptions = industries.map((industry) => ({
    value: industry.slug,
    label: industry.name.replace(/\s+Staffing$/i, ""),
  }));
  const [industrySlug, setIndustrySlug] = useState(industries[0]?.slug ?? "");
  const [roleLevel, setRoleLevel] = useState<InterviewQuestionSet["roleLevel"]>("Mid");
  const [questions, setQuestions] = useState<string[] | null>(null);

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuestions(getInterviewQuestionSet(industrySlug, roleLevel).questions);
  }

  return (
    <div className="mx-auto grid w-full items-start gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleGenerate}
        className="grid content-start gap-5 rounded-3xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)]"
      >
        <Select label="Industry" value={industrySlug} onChange={setIndustrySlug} options={industryOptions} />
        <Select
          label="Role level"
          value={roleLevel}
          onChange={(value) => setRoleLevel(value as InterviewQuestionSet["roleLevel"])}
          options={roleLevelOptions}
        />

        <Button type="submit" className="mt-1 w-full">
          Generate Questions
        </Button>
      </form>

      <div className="rounded-3xl bg-navy p-7 text-white shadow-[0_20px_50px_-24px_rgba(0,48,96,0.5)]">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan-light">
          Interview Questions
        </h3>
        {questions ? (
          <ol className="mt-5 list-decimal space-y-3.5 pl-5 text-sm leading-relaxed text-white/90 marker:font-semibold marker:text-tan-light">
            {questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 text-sm text-steel-lighter">
            Pick an industry and role level, then generate a question set.
          </p>
        )}
        <p className="mt-6 border-t border-white/10 pt-5 text-xs text-white/50">
          Pulled from a curated question bank. 
        </p>
      </div>
    </div>
  );
}
