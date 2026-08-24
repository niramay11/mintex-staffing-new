"use client";

import { useState } from "react";
import type { InterviewKit } from "@/lib/interviewKit/schema";
import { STAGE_LABELS } from "@/components/tools/KitSection";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailKitButton({ kit, slug }: { kit: InterviewKit; slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      setState("error");
      return;
    }

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/interview-kit/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          slug,
          roleTitle: kit.role.title,
          state: kit.region.state,
          competencies: kit.competency_map.map((c) => c.competency),
          sections: kit.sections.map((s) => ({
            label: STAGE_LABELS[s.stage] ?? s.stage,
            count: s.questions.length,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Couldn't send that email — please try again.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that email — please try again.");
      setState("error");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 text-sm font-medium text-navy/70 transition-colors hover:border-steel hover:text-steel print:hidden dark:border-white/15 dark:text-cream/70 dark:hover:border-steel-light dark:hover:text-steel-light"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z M3.5 7.5l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Email me this kit
      </button>
    );
  }

  if (state === "sent") {
    return (
      <p className="text-sm text-navy/70 dark:text-cream/70">
        Sent to <b>{email}</b> — check your inbox for the link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 print:hidden">
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-56 rounded-full border border-navy/15 px-4 py-2 text-sm placeholder:text-navy/40 focus:border-steel focus:outline-none dark:border-white/15 dark:bg-navy-800 dark:text-cream dark:placeholder:text-cream/40"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary disabled:opacity-60 dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
      >
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      {state === "error" && error && <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
