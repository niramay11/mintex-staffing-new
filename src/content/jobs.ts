import type { Job } from "./types";

export const jobs: Job[] = [
  { id: "it-01", title: "Senior Full-Stack Engineer", industrySlug: "it-staffing", location: "Remote (US)", type: "Contract", salaryRange: "$110k–$140k", postedAt: "2026-07-01", summary: "Build and ship customer-facing features across a React/Node stack for a growing fintech client." },
  { id: "it-02", title: "Cloud Infrastructure Engineer", industrySlug: "it-staffing", location: "Austin, TX", type: "Permanent", salaryRange: "$125k–$155k", postedAt: "2026-06-24", summary: "Own AWS infrastructure-as-code and CI/CD pipelines for a mid-size SaaS platform." },
  { id: "it-03", title: "IT Project Manager", industrySlug: "it-staffing", location: "Chicago, IL", type: "Contract", salaryRange: "$90k–$115k", postedAt: "2026-06-18", summary: "Lead a cross-functional team through an ERP modernization rollout." },

  { id: "hc-01", title: "Registered Nurse, ICU", industrySlug: "healthcare-staffing", location: "Denver, CO", type: "Contract", salaryRange: "$48–$58/hr", postedAt: "2026-07-05", summary: "13-week travel contract in a Level II trauma center ICU." },
  { id: "hc-02", title: "Physical Therapist", industrySlug: "healthcare-staffing", location: "Tampa, FL", type: "Permanent", salaryRange: "$85k–$100k", postedAt: "2026-06-29", summary: "Outpatient orthopedic clinic seeking a licensed PT for a growing caseload." },
  { id: "hc-03", title: "Healthcare Practice Administrator", industrySlug: "healthcare-staffing", location: "Remote (US)", type: "Permanent", salaryRange: "$70k–$90k", postedAt: "2026-06-15", summary: "Oversee daily operations for a multi-location outpatient group." },

  { id: "en-01", title: "Structural Engineer, PE", industrySlug: "engineering-staffing", location: "Seattle, WA", type: "Permanent", salaryRange: "$100k–$130k", postedAt: "2026-07-03", summary: "Design commercial and mixed-use structures for a growing regional firm." },
  { id: "en-02", title: "Electrical Engineer", industrySlug: "engineering-staffing", location: "Houston, TX", type: "Contract", salaryRange: "$60–$75/hr", postedAt: "2026-06-27", summary: "Support power distribution design for an industrial plant expansion." },

  { id: "mf-01", title: "Production Supervisor", industrySlug: "manufacturing-staffing", location: "Columbus, OH", type: "Permanent", salaryRange: "$65k–$80k", postedAt: "2026-07-02", summary: "Lead a 20-person production shift at a food & beverage manufacturing plant." },
  { id: "mf-02", title: "Quality Engineer", industrySlug: "manufacturing-staffing", location: "Grand Rapids, MI", type: "Permanent", salaryRange: "$75k–$95k", postedAt: "2026-06-20", summary: "Own root-cause investigations and CAPA processes for an automotive supplier." },

  { id: "fn-01", title: "FP&A Analyst", industrySlug: "finance-staffing", location: "New York, NY", type: "Permanent", salaryRange: "$90k–$110k", postedAt: "2026-07-04", summary: "Partner with department leads on budgeting and forecast modeling." },
  { id: "fn-02", title: "Staff Accountant", industrySlug: "finance-staffing", location: "Remote (US)", type: "Contract", salaryRange: "$35–$45/hr", postedAt: "2026-06-22", summary: "Support month-end close for a multi-entity portfolio company." },

  { id: "ad-01", title: "Executive Assistant", industrySlug: "administrative-staffing", location: "Los Angeles, CA", type: "Permanent", salaryRange: "$75k–$90k", postedAt: "2026-07-06", summary: "Support a C-suite executive across scheduling, travel, and board prep." },
  { id: "ad-02", title: "Office Manager", industrySlug: "administrative-staffing", location: "Boston, MA", type: "Permanent", salaryRange: "$60k–$70k", postedAt: "2026-06-19", summary: "Run day-to-day office operations for a 40-person professional services firm." },

  { id: "sl-01", title: "Account Executive, Mid-Market", industrySlug: "sales-staffing", location: "Remote (US)", type: "Permanent", salaryRange: "$80k base / $160k OTE", postedAt: "2026-07-07", summary: "Own a full-cycle sales motion for a B2B SaaS platform." },
  { id: "sl-02", title: "Sales Development Representative", industrySlug: "sales-staffing", location: "Dallas, TX", type: "Permanent", salaryRange: "$50k base / $70k OTE", postedAt: "2026-06-26", summary: "Generate qualified pipeline for an enterprise sales team." },

  { id: "cs-01", title: "Customer Success Manager", industrySlug: "customer-service-staffing", location: "Remote (US)", type: "Permanent", salaryRange: "$70k–$85k", postedAt: "2026-07-01", summary: "Own renewals and expansion for a portfolio of mid-market accounts." },
  { id: "cs-02", title: "Support Team Lead", industrySlug: "customer-service-staffing", location: "Phoenix, AZ", type: "Permanent", salaryRange: "$55k–$65k", postedAt: "2026-06-21", summary: "Lead a 10-person support team across chat, email, and phone channels." },

  { id: "lg-01", title: "Warehouse Operations Supervisor", industrySlug: "logistics-staffing", location: "Memphis, TN", type: "Permanent", salaryRange: "$58k–$68k", postedAt: "2026-07-05", summary: "Manage inbound/outbound operations for a regional distribution center." },
  { id: "lg-02", title: "Supply Chain Planner", industrySlug: "logistics-staffing", location: "Remote (US)", type: "Contract", salaryRange: "$40–$50/hr", postedAt: "2026-06-23", summary: "Drive demand planning and inventory optimization for a retail client." },
];

export function getJobsByIndustry(slug: string): Job[] {
  return jobs.filter((job) => job.industrySlug === slug);
}
