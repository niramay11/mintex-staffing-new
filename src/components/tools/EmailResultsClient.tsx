"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { unpackState, type CalculatorBreakdownPayload } from "@/lib/calculatorShare";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBreakdownPayload(d: Record<string, unknown> | null): boolean {
  return (
    !!d &&
    typeof d.heading === "string" &&
    typeof d.headlineLabel === "string" &&
    typeof d.headlineValue === "string" &&
    Array.isArray(d.lines)
  );
}

export default function EmailResultsClient() {
  const [payload, setPayload] = useState<CalculatorBreakdownPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "invalid" | "ready">("loading");

  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const m = (window.location.hash || "").match(/[#&]s=([^&]+)/);
    const d = m ? unpackState(m[1]) : null;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from a share-link hash on mount */
    if (isBreakdownPayload(d)) {
      setPayload(d as unknown as CalculatorBreakdownPayload);
      setStatus("ready");
    } else {
      setStatus("invalid");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!payload) return;

    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      setSendState("error");
      return;
    }

    setSendState("sending");
    setError("");
    try {
      const res = await fetch("/api/hiring-cost-calculator/email-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          heading: payload.heading,
          headlineLabel: payload.headlineLabel,
          headlineValue: payload.headlineValue,
          lines: payload.lines,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Couldn't send that email — please try again.");
      setSendState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that email — please try again.");
      setSendState("error");
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-navy/70 dark:text-cream/70">Loading your breakdown…</p>;
  }

  if (status === "invalid") {
    return (
      <div className="rounded-3xl border border-navy/10 bg-white p-8 text-center dark:border-white/10 dark:bg-navy-900">
        <h2 className="font-heading text-xl font-bold text-navy dark:text-cream">We couldn&apos;t find a breakdown to email</h2>
        <p className="mt-2 text-sm text-navy/70 dark:text-cream/70">
          Run the calculator first, then click &ldquo;Email me this breakdown&rdquo; to come back here with your numbers.
        </p>
        <Link
          href="/resources/hiring-cost-calculator"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
        >
          Go to the calculator
        </Link>
      </div>
    );
  }

  const { heading, headlineLabel, headlineValue, lines } = payload!;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* ---------------- breakdown ---------------- */}
      <div className="rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Your calculated breakdown</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-navy dark:text-cream sm:text-3xl">{heading}</h1>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-navy via-navy-deep to-navy-secondary p-6 text-white dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">{headlineLabel}</p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums sm:text-4xl">{headlineValue}</p>
        </div>

        <div className="mt-6 divide-y divide-navy/10 dark:divide-white/10">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 text-[13.5px]">
              <span className={line.strong ? "font-semibold text-navy dark:text-cream" : "text-navy/85 dark:text-cream/85"}>{line.label}</span>
              <span
                className={`text-right tabular-nums ${line.strong ? "font-bold" : "font-semibold"} ${
                  line.accent ? "text-emerald-600 dark:text-emerald-400" : "text-navy dark:text-cream"
                }`}
              >
                {line.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- email form ---------------- */}
      <div className="h-fit rounded-3xl border border-navy/10 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
        <h2 className="font-heading text-lg font-bold text-navy dark:text-cream">Send my results</h2>

        {sendState === "sent" ? (
          <p className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
            Sent to <b>{email}</b>. Check your inbox for the full breakdown.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <label htmlFor="email-results-address" className="block text-sm font-semibold text-navy dark:text-cream">
              Your email address
            </label>
            <input
              id="email-results-address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1.5 w-full rounded-lg border border-navy/15 px-3.5 py-2.5 text-sm placeholder:text-navy/40 focus:border-steel focus:outline-none dark:border-white/15 dark:bg-navy-800 dark:text-cream dark:placeholder:text-cream/40"
            />
            {sendState === "error" && error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={sendState === "sending"}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-60 dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
            >
              {sendState === "sending" ? "Sending…" : "Send My Results"}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs leading-relaxed text-navy/60 dark:text-cream/60">
          We&apos;ll only use this to send your breakdown. No spam.
        </p>
        <Link href="/resources/hiring-cost-calculator" className="mt-4 block text-sm text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream">
          ← Back to the calculator
        </Link>
      </div>
    </div>
  );
}
