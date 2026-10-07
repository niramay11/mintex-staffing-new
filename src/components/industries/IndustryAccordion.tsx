"use client";

import { useState } from "react";

// Divider-row accordion with a round "+" toggle, used on the industry pages.
// Answers stay in the DOM when collapsed (grid-rows 0fr), so they're still
// crawlable and match the page's FAQPage schema.
export default function IndustryAccordion({
  items,
  wideAnswers = false,
}: {
  items: { question: string; answer: string }[];
  // Lets answers span the full row instead of capping at 560px.
  wideAnswers?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-navy/10 border-b border-navy/10 dark:divide-white/10 dark:border-white/10">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left"
            >
              <span className="text-[16px] font-medium leading-snug text-navy dark:text-cream">{item.question}</span>
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-navy shadow-[0_1px_3px_rgba(0,48,96,0.1)] transition-all duration-300 group-hover:bg-navy group-hover:text-white dark:bg-navy-800 dark:text-cream dark:group-hover:bg-steel dark:group-hover:text-navy-950 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p
                  className={`${wideAnswers ? "pr-12 sm:pr-14" : "max-w-[560px]"} pb-6 text-[15px] leading-[1.7] text-navy/70 dark:text-cream/70`}
                >{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
