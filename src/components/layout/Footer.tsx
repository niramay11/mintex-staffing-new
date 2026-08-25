"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SocialIcon } from "./socialIcons";
import { BUSINESS } from "@/lib/site";
import type { Industry } from "@/content/types";

type SocialLink = { id: string; label: string; url: string; sort_order?: number };

const OTHER_FOOTER_COLUMNS = [
  {
    title: "Resources",
    links: [
      { label: "Hiring Cost Calculator", href: "/resources/hiring-cost-calculator" },
      { label: "AI Interview Generator", href: "/resources/ai-interview-generator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Insights", href: "/insights" },
      { label: "Contact Us", href: "/contact" },
      { label: "Client Login", href: "/client-portal" },
    ],
  },
];

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-[260px] right-6 z-50 flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1),0_8px_26px_rgba(0,0,0,0.04),0_2px_35px_rgba(0,0,0,0.02)] transition-[opacity,transform] duration-300 hover:bg-steel/10 dark:border dark:border-white/10 dark:bg-navy-900 dark:hover:bg-navy-800 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-steel dark:text-steel-light" aria-hidden="true">
        <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-medium text-steel dark:text-steel-light">Top</span>
    </button>
  );
}

export default function Footer({ siteImages, industries }: { siteImages: Record<string, string>; industries: Industry[] }) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const pathname = usePathname();
  const footerColumns = [
    {
      title: "Industries",
      links: industries.map((industry) => ({ label: industry.name, href: `/industries/${industry.slug}` })),
    },
    ...OTHER_FOOTER_COLUMNS,
  ];

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data) => setSocialLinks(Array.isArray(data) ? data : []))
      .catch(() => setSocialLinks([]));
  }, []);

  return (
    <>
      <footer className="border-t border-navy/[0.06] bg-navy px-6 pb-8 pt-14 text-white dark:border-white/10 dark:bg-navy-900 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1920px] grid-cols-2 gap-10 border-b border-white/10 pb-11 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-[300px] sm:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <Image src={siteImages["global:footer-logo"]} alt="Mintex Staffing" width={183} height={25} className="h-6 w-auto object-contain" />
            </Link>
            <p className="text-[14.5px] leading-relaxed text-steel-light">
              Connecting exceptional talent with leading employers.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-steel-lighter transition-colors hover:border-steel/50 hover:text-steel-lighter"
                  >
                    <SocialIcon label={link.label} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-steel-lighter">
                {column.title}
              </h3>
              <div className="flex flex-col gap-[11px]">
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[14.5px] text-steel-lighter hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-[1920px] flex-col items-start justify-between gap-3 pt-6 text-[13.5px] text-steel-light sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-x-2">
            <span>&copy; {new Date().getFullYear()} Mintex Staffing. All rights reserved.</span>
            <Link href="/privacy" className="underline-offset-2 hover:text-white hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/terms" className="underline-offset-2 hover:text-white hover:underline">
              Terms of Service
            </Link>
          </p>
          <p>2163 Oak Tree Rd, Edison, NJ 08820 &middot; <a href={`tel:${BUSINESS.telephone}`} className="hover:text-white">{BUSINESS.telephoneDisplay}</a></p>
        </div>
      </footer>
      <BackToTopButton />
    </>
  );
}
