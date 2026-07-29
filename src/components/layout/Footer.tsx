"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SocialIcon } from "./socialIcons";

type SocialLink = { id: string; label: string; url: string; sort_order?: number };

const footerColumns = [
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

export default function Footer({ siteImages }: { siteImages: Record<string, string> }) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data) => setSocialLinks(Array.isArray(data) ? data : []))
      .catch(() => setSocialLinks([]));
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <footer className="mx-auto mt-6 max-w-[1920px] rounded-[32px] bg-navy px-8 pb-8 pt-14 text-white sm:px-12">
        <div className="grid grid-cols-2 gap-10 border-b border-white/10 pb-11 sm:grid-cols-3 lg:grid-cols-[1.8fr_1fr_1fr]">
          <div className="col-span-2 max-w-[300px] sm:col-span-1">
            <Link href="/" className="mb-4 flex items-center">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-steel-lighter transition-colors hover:border-tan/50 hover:text-tan-light"
                  >
                    <SocialIcon label={link.label} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-tan-light">
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

        <div className="flex flex-col items-start justify-between gap-3 pt-6 text-[13.5px] text-steel-light sm:flex-row sm:items-center">
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
          <p>2163 Oak Tree Rd, Edison, NJ 08820 &middot; +1 (732) 983-5723</p>
        </div>
      </footer>
    </div>
  );
  
}
