"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 00-16 0" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 7 9-7" />
    </svg>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a1 1 0 011-1h8a1 1 0 011 1v16M4 21h16M14 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7h1M7.5 11h1M7.5 15h1M11.5 7h1M11.5 11h1M11.5 15h1" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1.06 4.24a1 1 0 01-.5 1.11L7.1 10.24a11 11 0 006.66 6.66l1.13-1.7a1 1 0 011.11-.5l4.24 1.06a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C10.4 21 3 13.6 3 4.5V5z"
      />
    </svg>
  );
}

const SUBJECT_OPTIONS = [
  "I want to hire talent",
  "I'm looking for a job",
  "General question",
  "Something else",
].map((option) => ({ value: option, label: option }));

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40 dark:text-cream/40">
      {children}
    </span>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-navy/15 py-2.5 pl-10 pr-3.5 text-sm placeholder:text-navy/40 focus:border-steel focus:outline-none dark:bg-navy-900 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].value);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          phone: form.get("phone"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send message");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p className="rounded-md bg-steel-lighter/40 p-4 text-sm text-navy dark:text-cream">
        Thanks for reaching out! A member of our team will get back to you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-semibold text-navy dark:text-cream">
          Full Name
        </label>
        <div className="relative">
          <FieldIcon>
            <IconUser className="h-4 w-4" />
          </FieldIcon>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-semibold text-navy dark:text-cream">
          Email Address
        </label>
        <div className="relative">
          <FieldIcon>
            <IconEnvelope className="h-4 w-4" />
          </FieldIcon>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="Your email"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-company" className="block text-sm font-semibold text-navy dark:text-cream">
          Company Name
        </label>
        <div className="relative">
          <FieldIcon>
            <IconBuilding className="h-4 w-4" />
          </FieldIcon>
          <input
            id="contact-company"
            name="company"
            type="text"
            placeholder="Your company"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-phone" className="block text-sm font-semibold text-navy dark:text-cream">
          Phone Number
        </label>
        <div className="relative">
          <FieldIcon>
            <IconPhone className="h-4 w-4" />
          </FieldIcon>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            placeholder="Your phone number"
            className={inputClass}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <Select label="Subject" value={subject} onChange={setSubject} options={SUBJECT_OPTIONS} />
        <input type="hidden" name="subject" value={subject} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="contact-message" className="block text-sm font-semibold text-navy dark:text-cream">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="Write your message here..."
          className="mt-1.5 w-full rounded-lg border border-navy/15 px-3.5 py-2.5 text-sm placeholder:text-navy/40 focus:border-steel focus:outline-none dark:bg-navy-900 dark:border-white/15 dark:text-cream dark:placeholder:text-cream/40"
        />
      </div>
      {error && (
        <div className="sm:col-span-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary focus-visible:outline-2 focus-visible:outline-steel disabled:opacity-60 dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
        >
          <IconSend className="h-4 w-4" />
          {submitting ? "Sending…" : "Send Message"}
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
