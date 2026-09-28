import type { Industry } from "@/content/types";

export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavLink[];
}

// Industries are admin-managed (see src/lib/industries.ts), so the nav is
// built from a live list passed down from the server layout instead of a
// static import.
export function getNavItems(industries: Industry[]): NavItem[] {
  return [
    {
      label: "Get Hired",
      href: "/get-hired",
      children: [
        { label: "Apply to Jobs", href: "/get-hired/apply-to-jobs" },
        { label: "Share Your Resume", href: "/get-hired/share-resume" },
      ],
    },
    {
      label: "Seek Talent",
      href: "/seek-talent",
      children: [
        { label: "Contract Talent", href: "/seek-talent/contract-talent" },
        { label: "Permanent Talent", href: "/seek-talent/permanent-talent" },
        { label: "Executive Search", href: "/seek-talent/executive-search" },
        { label: "How We Work", href: "/seek-talent/how-we-work" },
      ],
    },
    {
      label: "Industries",
      href: "/industries",
      children: industries.map((industry) => ({ label: industry.name, href: `/industries/${industry.slug}` })),
    },
    {
      label: "Resources",
      href: "/resources",
      children: [
        { label: "Hiring Cost Calculator", href: "/resources/hiring-cost-calculator" },
        { label: "AI Interview Question Generator", href: "/resources/ai-interview-generator" },
        { label: "Interview Rights by State", href: "/interview-rights" },
      ],
    },
    // Plain link, no dropdown: every post lives on the one /insights page,
    // each card showing its (admin-typed) category.
    { label: "Insights", href: "/insights" },
  ];
}
