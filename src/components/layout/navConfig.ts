export interface NavLink {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavLink[];
}

export const navItems: NavItem[] = [
  {
    label: "Get Hired",
    href: "/get-hired",
    children: [
      { label: "Apply to Jobs", href: "/get-hired#apply-to-jobs" },
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
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Hiring Cost Calculator", href: "/resources/hiring-cost-calculator" },
      { label: "AI Interview Question Generator", href: "/resources/ai-interview-generator" },
    ],
  },
  {
    label: "Insights",
    href: "/insights",
    children: [
      { label: "Career Insights", href: "/insights?category=career" },
      { label: "Job Market Insights", href: "/insights?category=market" },
      { label: "Ongoing Hiring Trends", href: "/insights?category=trends" },
      { label: "All Blog Posts", href: "/insights" },
    ],
  },
];
