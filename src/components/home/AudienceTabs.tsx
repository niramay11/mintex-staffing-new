"use client";

import Link from "next/link";
import { useState } from "react";

const employerServices = [
  {
    title: "Permanent Staffing",
    description: "Full-time hires vetted for skills, culture, and long-term fit.",
    href: "/seek-talent/permanent-talent",
  },
  {
    title: "Contract Staffing",
    description: "Flexible talent for projects, seasonal peaks, and interim needs.",
    href: "/seek-talent/contract-talent",
  },
  {
    title: "Executive Search",
    description: "Confidential search for senior leaders and hard-to-fill roles.",
    href: "/seek-talent/executive-search",
  },
  {
    title: "How We Work",
    description: "A scoped, transparent process built around your team.",
    href: "/seek-talent/how-we-work",
  },
];

const seekerServices = [
  {
    title: "Search Jobs",
    description: "Browse open roles across every industry we staff.",
    href: "/get-hired/apply-to-jobs",
  },
  {
    title: "Share Your Resume",
    description: "One profile, seen by our recruiters across every open role.",
    href: "/get-hired/share-resume",
  },
  {
    title: "Job Alerts",
    description: "Get emailed the moment a matching role goes live.",
    href: "/get-hired/apply-to-jobs",
  },
  {
    title: "Interview Prep",
    description: "Practical guidance and an AI question generator to help you prepare.",
    href: "/get-hired/interview-prep",
  },
];

export default function AudienceTabs() {
  const [tab, setTab] = useState<"employers" | "seekers">("employers");
  const services = tab === "employers" ? employerServices : seekerServices;

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-full bg-mist p-1.5">
          <button
            type="button"
            onClick={() => setTab("employers")}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === "employers" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
            }`}
          >
            For employers &middot; Hire Talent
          </button>
          <button
            type="button"
            onClick={() => setTab("seekers")}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === "seekers" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
            }`}
          >
            For job seekers &middot; Get Hired
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.title}
            href={service.href}
            className="rounded-2xl border border-navy/[0.08] p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,48,96,0.25)]"
          >
            <div className="mb-5 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-navy">
              <span className="h-2.5 w-2.5 rounded-full bg-tan" />
            </div>
            <h3 className="font-heading text-[18px] font-semibold text-navy">{service.title}</h3>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-steel">{service.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
