"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-cream/40 px-4 py-2.5 text-sm text-navy placeholder:text-navy/30 transition-colors focus:border-tan focus:bg-white focus:outline-none focus:ring-4 focus:ring-tan/15";
const labelClasses = "block text-sm font-semibold text-navy";

const contactOptions = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
] as const;

export default function HiringInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preferredContact, setPreferredContact] = useState<"phone" | "email">("phone");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/hiring-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.get("jobTitle"),
          zipCode: form.get("zipCode"),
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company"),
          position: form.get("position"),
          preferredContact,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send inquiry");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-xl bg-steel-lighter/40 p-4 text-sm text-navy">
        Thanks for reaching out! One of our recruiters will connect with you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="hiring-job-title" className={labelClasses}>
          Job title
        </label>
        <input id="hiring-job-title" name="jobTitle" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-zip" className={labelClasses}>
          Zip code
        </label>
        <input id="hiring-zip" name="zipCode" type="text" required className={inputClasses} />
      </div>

      <div className="sm:col-span-2 mt-1 flex items-center gap-3">
        <span className="h-px flex-1 bg-navy/10" />
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-steel">Contact information</p>
        <span className="h-px flex-1 bg-navy/10" />
      </div>

      <div>
        <label htmlFor="hiring-first-name" className={labelClasses}>
          First name
        </label>
        <input id="hiring-first-name" name="firstName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-last-name" className={labelClasses}>
          Last name
        </label>
        <input id="hiring-last-name" name="lastName" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-email" className={labelClasses}>
          Professional email
        </label>
        <input id="hiring-email" name="email" type="email" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-phone" className={labelClasses}>
          Primary contact number
        </label>
        <input id="hiring-phone" name="phone" type="tel" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-company" className={labelClasses}>
          Company name
        </label>
        <input id="hiring-company" name="company" type="text" required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="hiring-position" className={labelClasses}>
          Your current position in the firm
        </label>
        <input id="hiring-position" name="position" type="text" required className={inputClasses} />
      </div>
      <div className="sm:col-span-2">
        <label id="hiring-preferred-contact-label" className={labelClasses}>
          Preferred way of contacting
        </label>
        <div
          role="radiogroup"
          aria-labelledby="hiring-preferred-contact-label"
          className="mt-1.5 inline-flex rounded-xl border border-navy/15 bg-cream/40 p-1"
        >
          {contactOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={preferredContact === option.value}
              onClick={() => setPreferredContact(option.value)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                preferredContact === option.value ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="sm:col-span-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="sm:col-span-2 mt-2">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto sm:px-12 disabled:opacity-60">
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
