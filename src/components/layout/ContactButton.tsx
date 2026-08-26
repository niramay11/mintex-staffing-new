"use client";

import { useState } from "react";

const PHONE_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
  "Hi, I'm interested in job opportunities at Mintex Staffing.";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@mintexstaffing.com";

export default function ContactButton() {
  const [open, setOpen] = useState(false);

  const whatsappHref = PHONE_NUMBER
    ? `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : null;
  const emailHref = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      <a
        href={emailHref}
        aria-label="Email us"
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy dark:bg-cream dark:text-navy ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 6 8 7 8-7" />
        </svg>
      </a>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${
            open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.44 1.73 6.35L3.2 28.8l6.63-1.7a12.75 12.75 0 0 0 6.17 1.57h.005c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.67-12.8-12.67Zm0 23.36h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4 1.03 1.07-3.9-.253-.4a10.56 10.56 0 0 1-1.63-5.63c0-5.85 4.76-10.61 10.61-10.61 2.83 0 5.5 1.1 7.5 3.1a10.53 10.53 0 0 1 3.1 7.51c0 5.85-4.76 10.61-10.61 10.61Zm5.82-7.94c-.32-.16-1.9-.94-2.19-1.04-.29-.1-.51-.16-.72.16-.21.32-.83 1.04-1.02 1.25-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.19-.32-.02-.49.14-.65.15-.15.33-.4.5-.6.16-.19.22-.32.33-.53.1-.21.05-.4-.05-.56-.1-.16-.72-1.74-.99-2.39-.26-.63-.53-.54-.72-.55h-.62c-.21 0-.55.08-.85.4-.29.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.1 1.31 3.32.16.21 2.19 3.35 5.36 4.56 3.16 1.21 3.16.8 3.73.75.57-.05 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
          </svg>
        </a>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Contact us"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy dark:bg-cream dark:text-navy"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
