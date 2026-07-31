"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { navItems } from "./navConfig";
import { BUSINESS } from "@/lib/site";

function IconPhone({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1.06 4.24a1 1 0 01-.5 1.11L7.1 10.24a11 11 0 006.66 6.66l1.13-1.7a1 1 0 011.11-.5l4.24 1.06a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C10.4 21 3 13.6 3 4.5V5z"
      />
    </svg>
  );
}

export default function Header({ siteImages }: { siteImages: Record<string, string> }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between gap-4 rounded-full border border-navy/[0.06] bg-white/85 py-2 pl-5 pr-2.5 shadow-[0_8px_30px_rgba(0,48,96,0.08)] backdrop-blur-md">
        <Link href="/" className="flex flex-shrink-0 items-center">
          <Image src={siteImages["global:header-logo-mark"]} alt="Mintex Staffing" width={72} height={36} preload className="h-9 w-auto object-contain lg:hidden" />
          <Image src={siteImages["global:header-logo"]} alt="Mintex Staffing" width={183} height={25} preload className="hidden h-6 w-auto object-contain lg:block" />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isOpen = desktopOpen === item.label;
            return (
              <div
                key={item.label}
                className="group relative"
                onMouseEnter={() => item.children && setDesktopOpen(item.label)}
                onMouseLeave={() => setDesktopOpen((current) => (current === item.label ? null : current))}
              >
                <div className="flex items-center rounded-full text-[14.5px] font-medium text-navy hover:bg-navy/[0.06]">
                  <Link
                    href={item.href}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      setDesktopOpen(null);
                    }}
                    className="py-2 pl-4 pr-1"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} submenu`}
                      aria-expanded={isOpen}
                      onClick={() => setDesktopOpen((current) => (current === item.label ? null : item.label))}
                      className="py-2 pl-1 pr-4"
                    >
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-navy/50">
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {item.children && (
                  <div
                    className={`absolute left-1/2 top-full z-50 grid w-64 max-h-[70vh] -translate-x-1/2 grid-cols-1 gap-1 overflow-y-auto rounded-2xl border border-navy/[0.06] bg-white p-2 shadow-[0_20px_50px_-15px_rgba(0,48,96,0.3)] transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 ${
                      isOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={(event) => {
                          event.currentTarget.blur();
                          setDesktopOpen(null);
                        }}
                        className="rounded-lg px-3 py-2 text-sm text-navy hover:bg-cream"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <Link
          href="/client-portal"
          className="hidden flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-navy px-6 py-2.5 text-[14.5px] font-semibold text-white transition-colors hover:bg-navy-deep lg:inline-flex"
        >
          Client Login
        </Link>

        <div className="flex flex-shrink-0 items-center gap-1 lg:hidden">
          <a
            href={`tel:${BUSINESS.telephone}`}
            aria-label="Call Mintex Staffing"
            className="rounded-full p-3.5 text-navy hover:bg-navy/[0.06]"
          >
            <IconPhone className="h-5 w-5" />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="rounded-full p-3.5 text-navy hover:bg-navy/[0.06]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              {mobileOpen ? (
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              ) : (
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mx-auto mt-2 max-w-[1700px] rounded-3xl border border-navy/[0.06] bg-white p-3 shadow-[0_20px_50px_-15px_rgba(0,48,96,0.25)] lg:hidden">
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-navy/[0.06] py-1 last:border-b-0">
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-3 text-sm font-medium text-navy"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <button
                    type="button"
                    aria-label={`Toggle ${item.label} submenu`}
                    onClick={() =>
                      setMobileExpanded((current) => (current === item.label ? null : item.label))
                    }
                    className="p-3 text-navy/50"
                  >
                    {mobileExpanded === item.label ? "−" : "+"}
                  </button>
                )}
              </div>
              {item.children && mobileExpanded === item.label && (
                <div className="flex flex-col gap-1 pb-3 pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-navy/70 hover:bg-cream"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/client-portal"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex items-center justify-center rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            Client Login
          </Link>
        </nav>
      )}
    </header>
  );
}
