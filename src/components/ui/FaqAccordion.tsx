"use client";

import { useState } from "react";

export default function FaqAccordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-8 space-y-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
            className={`overflow-hidden rounded-2xl border bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-colors dark:bg-navy-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
              isOpen ? "border-steel/40" : "border-navy/10 dark:border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-base font-bold text-navy dark:text-cream">{faq.question}</span>
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-mist text-navy transition-transform duration-300 dark:bg-navy-800 dark:text-cream ${
                  isOpen ? "rotate-180 bg-steel/15 text-steel dark:text-steel-light" : ""
                }`}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-navy/70 dark:text-cream/70">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
