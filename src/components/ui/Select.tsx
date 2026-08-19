"use client";

import { useEffect, useRef, useState } from "react";

export default function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className="relative block">
      <span className="text-sm font-semibold text-navy dark:text-cream">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-navy/15 bg-white px-4 py-3 text-left text-sm text-navy transition-colors hover:border-navy/25 focus:border-steel focus:outline-none focus-visible:outline-2 focus-visible:outline-steel dark:border-white/15 dark:bg-navy-900 dark:text-cream dark:hover:border-white/25"
      >
        {selected?.label}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className={`h-4 w-4 text-navy/40 transition-transform dark:text-cream/40 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-navy/10 bg-white p-1.5 shadow-[0_20px_45px_-18px_rgba(0,48,96,0.35)] dark:border-white/10 dark:bg-navy-900 dark:shadow-[0_20px_45px_-18px_rgba(0,0,0,0.5)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-steel/15 font-semibold text-navy dark:text-cream"
                      : "text-navy/75 hover:bg-mist dark:text-cream/75 dark:hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
