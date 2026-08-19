"use client";

import { useEffect, useState } from "react";
import { IconEnvelope, IconPin, IconSearch } from "./icons";

const inputClass =
  "w-full rounded-xl border-0 bg-mist py-3.5 pl-10 pr-3 text-sm text-navy placeholder:text-navy/45 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/25 dark:bg-navy-800 dark:text-cream dark:placeholder:text-cream/40 dark:focus:bg-navy-900";

interface JobAlertModalProps {
  initialKeyword?: string;
  initialLocation?: string;
  onClose: () => void;
}

export default function JobAlertModal({ initialKeyword = "", initialLocation = "", onClose }: JobAlertModalProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/job-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, keyword, location }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 pt-20 backdrop-blur-sm sm:pt-28"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_80px_-20px_rgba(0,48,96,0.5)] sm:p-10 dark:bg-navy-900">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-navy/50 hover:bg-mist hover:text-navy dark:text-cream/50 dark:hover:bg-navy-800 dark:hover:text-cream"
        >
          &times;
        </button>

        <h3 className="text-center text-2xl font-bold text-navy dark:text-cream">Create a Job Alert</h3>

        {submitted ? (
          <p className="mt-6 rounded-xl bg-steel-lighter/40 p-4 text-center text-sm text-navy dark:text-cream">
            You&apos;re subscribed! We&apos;ll email you as soon as a matching role goes live.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40 dark:text-cream/40" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job Title, Skills…"
                  className={inputClass}
                />
              </div>
              <div className="relative">
                <IconPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40 dark:text-cream/40" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, or..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="relative">
              <IconEnvelope className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40 dark:text-cream/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="!mt-6 w-full rounded-full bg-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary disabled:cursor-not-allowed disabled:opacity-60 dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
            >
              {submitting ? "Creating…" : "Create job alert"}
            </button>

            <p className="pt-1 text-xs leading-relaxed text-navy/50 dark:text-cream/50">
              By providing my personal information, I agree to be contacted by Mintex Staffing
              about matching roles.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
