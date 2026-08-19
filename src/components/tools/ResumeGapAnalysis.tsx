"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";
import GapAnalysisView from "@/components/tools/GapAnalysisView";
import type { InterviewKit } from "@/lib/interviewKit/schema";
import type { GapAnalysis } from "@/lib/interviewKit/gapSchema";
import { RESUME_MAX_CHARS } from "@/lib/interviewKit/gapSchema";
import { GEMINI_PAID_TIER_CONFIRMED } from "@/lib/interviewKit/apiTier";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Private, in-memory-only: whether pasted as text or uploaded as a file,
// the resume content is sent straight to the API route and never written
// anywhere — an uploaded file's bytes are parsed into text server-side and
// discarded, never touching disk. Works alongside any kit — the JD-paste
// path passes real extracted requirements for sharper gaps; the public
// title-only path (no jdContext) still works, just compares against the
// kit's general competency map instead of a specific posting's must-haves.
export default function ResumeGapAnalysis({
  kit,
  jdContext,
}: {
  kit: InterviewKit;
  jdContext?: { mustHaveSkills?: string[]; namedTools?: string[] };
}) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);

  const overLimit = resumeText.length > RESUME_MAX_CHARS;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "paste") {
      if (!resumeText.trim()) {
        setError("Paste your resume text.");
        return;
      }
      if (overLimit) {
        setError(`That's too long (${resumeText.length} characters, max ${RESUME_MAX_CHARS}).`);
        return;
      }
    } else if (!file) {
      setError("Choose a PDF or Word (.docx) file.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      let res: Response;
      if (mode === "upload" && file) {
        const form = new FormData();
        form.set("resumeFile", file);
        form.set("kit", JSON.stringify(kit));
        if (jdContext) form.set("jdContext", JSON.stringify(jdContext));
        res = await fetch("/api/generate-gap-analysis", { method: "POST", body: form });
      } else {
        res = await fetch("/api/generate-gap-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, kit, jdContext }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setAnalysis(data.gapAnalysis as GapAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
      <h3 className="font-heading text-xl font-semibold text-navy dark:text-cream">See how your background stacks up</h3>
      <p className="mt-1 text-sm text-navy/60 dark:text-cream/60">
        Share your resume to see your strengths for this specific role, gaps an interviewer will likely probe, and
        which of the questions above are most likely for you.
      </p>
      <p className="mt-2 text-xs text-navy/40 dark:text-cream/40">
        {GEMINI_PAID_TIER_CONFIRMED
          ? "Your resume is processed in memory to generate this analysis and is never stored. It is sent to our AI provider for analysis under terms that prohibit using it for model training. Nothing is saved after this page closes."
          : "Processed in memory to generate this analysis and never stored — an uploaded file is read for its text and discarded, never saved to disk. We have not yet independently confirmed whether our AI provider's terms exclude this from model training, so avoid uploading anything you would not want a third party to see."}
      </p>

      {!analysis && (
        <>
          <div className="mt-4 inline-flex rounded-full border border-navy/10 bg-mist p-1 dark:border-white/10 dark:bg-navy-800">
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "paste"
                  ? "bg-navy text-white dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
                  : "text-navy/60 hover:text-navy dark:text-cream/60 dark:hover:text-cream"
              }`}
            >
              Paste text
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === "upload"
                  ? "bg-navy text-white dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
                  : "text-navy/60 hover:text-navy dark:text-cream/60 dark:hover:text-cream"
              }`}
            >
              Upload file
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {mode === "paste" ? (
              <>
                <textarea
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste your resume text here…"
                  rows={8}
                  className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-normal text-navy placeholder:text-navy/35 focus:border-steel focus:outline-none dark:border-white/15 dark:bg-navy-900 dark:text-cream dark:placeholder:text-cream/35"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${overLimit ? "text-red-600 dark:text-red-400" : "text-navy/40 dark:text-cream/40"}`}>
                    {resumeText.length.toLocaleString()} / {RESUME_MAX_CHARS.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-navy/20 bg-mist/40 p-6 text-center dark:border-white/15 dark:bg-navy-800/40">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-navy/70 file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:hover:bg-navy/90 dark:text-cream/70 dark:file:bg-steel dark:file:text-navy-950 dark:file:hover:bg-steel-light"
                />
                <p className="mt-2 text-xs text-navy/40 dark:text-cream/40">PDF or Word (.docx), up to 5MB.</p>
                {file && !ACCEPTED_FILE_TYPES.includes(file.type) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">That file type isn&apos;t supported — use a PDF or .docx.</p>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Reading your resume and analyzing…" : "Analyze My Fit"}
            </Button>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </form>
        </>
      )}

      {analysis && (
        <div className="mt-6 space-y-4">
          <GapAnalysisView analysis={analysis} kit={kit} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setAnalysis(null);
              setResumeText("");
              setFile(null);
            }}
          >
            Analyze a different resume
          </Button>
        </div>
      )}
    </section>
  );
}
