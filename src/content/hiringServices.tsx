import type { ComponentType } from "react";

export interface HiringPoint {
  title: string;
  description: string;
}

export interface HiringService {
  slug: string;
  name: string;
  badge: string;
  tagline: string;
  intro: string;
  accent: "tan" | "steel";
  icon: ComponentType<{ className?: string }>;
  points: HiringPoint[];
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9 2.6-5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>  
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export const hiringServices: HiringService[] = [
  {
    slug: "contract-talent",
    name: "Contract Talent",
    badge: "Flexible staffing",
    tagline: "Flexible talent for projects, seasonal peaks, and interim needs.",
    intro:
      "Grow your team faster with Mintex Staffing's contract talent solutions. Pre-qualified professionals ready to step in. Get started today.",
    accent: "tan",
    icon: IconClock,
    points: [
      {
        title: "No lengthy onboarding",
        description:
          "When business demands shift quickly, waiting months to fill a role isn’t a fruitful option. Mintex Staffing’s contract talent solutions connect employers with specialized professionals who are ready to step in, add immediate value, and hit the ground running — no lengthy onboarding required.",
      },
      {
        title: "Pre-qualified across every industry",
        description:
          "We place contract talent with businesses across the state, providing IT staffing, healthcare staffing, engineering staffing, manufacturing staffing, finance staffing, administrative staffing, sales staffing, customer service staffing, legal staffing and logistics staffing. Every candidate is pre-qualified and matched to your specific project scope, timeline, and skill requirements, so you won’t be sorting through unqualified resumes to find the right fit.",
      },
      {
        title: "Flexible contract-to-hire",
        description:
          "Need short-term coverage for a project surge, or want to evaluate talent before committing to a full-time hire? Our contract-to-hire model gives you the flexibility to scale your workforce up or down as business needs change, with the option to convert top performers into permanent team members when the fit is right.",
      },
      {
        title: "Ready to get started",
        description:
          "Ready to bring on-demand experts onto your team? Discuss your hiring needs with our staffing specialists or explore our full range of services to see how we support employers across the states.",
      },
    ],
  },
  {
    slug: "permanent-talent",
    name: "Permanent Talent",
    badge: "Long-term hires",
    tagline: "Full-time hires vetted for skills, culture, and long-term fit.",
    intro:
      "Speed up your hiring process with high-calibre permanent talent from Mintex Staffing. Quality-vetted candidates for long-term hires across the states. Get started today.",
    accent: "tan",
    icon: IconStar,
    points: [
      {
        title: "Speed without sacrificing quality",
        description:
          "Finding permanent talent shouldn’t mean choosing between speed and quality. Mintex Staffing’s permanent staffing solutions focus on high-performing professionals who align with your long-term vision and core company values, without stretching out your hiring timeline or dragging your hiring budget.",
      },
      {
        title: "Full-service recruitment, every industry",
        description:
          "We serve employers throughout the USA and provide IT staffing solutions, healthcare staffing solutions, engineering staffing solutions, manufacturing staffing solutions, finance staffing solutions, administrative staffing solutions, sales staffing solutions, customer service staffing solutions, legal staffing solutions and logistics staffing solutions. We handle the recruitment by sourcing, screening, and vetting, so your leadership team stays focused on running the business.",
      },
      {
        title: "Matched for genuine fit",
        description:
          "Every candidate we present will be a targeted, quality-vetted match for your role, not just a resume that checks boxes. That focus on genuine fit means faster time-to-hire and stronger long-term retention, because the professionals you bring on are chosen to grow with your company, not just fill a seat.",
      },
      {
        title: "Ready to build your core team",
        description:
          "Ready to build your core team with confidence? Discuss your hiring needs with our recruiters or explore our full range of staffing services to see how we support employers across the States.",
      },
    ],
  },
  {
    slug: "executive-search",
    name: "Executive Search",
    badge: "Leadership hiring",
    tagline: "Confidential search for senior leaders and hard-to-fill roles.",
    intro:
      "Confidential executive search for C-suite and board roles. Mintex’s team places leadership talent statewide and beyond.",
    accent: "steel",
    icon: IconBriefcase,
    points: [
      {
        title: "Confidential, high-stakes searches",
        description:
          "Filling a C-suite or board-level role is a decision that shapes your company’s direction for years to come. Mintex Staffing’s executive search practice connects organizations with highly qualified leaders who can take the business forward, without compromising the confidentiality your search demands.",
      },
      {
        title: "Discreet, policy-aligned process",
        description:
          "Our Edison, New Jersey team runs discreet, policy-aligned executive searches for organizations statewide and beyond, spanning public, private, and non-profit sectors. Every search is handled with strict adherence to your internal standards, so sensitive leadership transitions stay sealed tight from sourcing through placement.",
      },
      {
        title: "Board recruitment and advisory",
        description:
          "Beyond individual placements, we support board recruitment and advisory services, helping you build your strongest, highest-performing asset by identifying forward-thinking, diverse leaders who bring fresh perspective to your board or executive team. We look beyond resumes to find candidates who align with your culture, vision, and long-term goals.",
      },
      {
        title: "Ready to secure your next leader",
        description:
          "Ready to secure leadership talent that takes your organization forward? Discuss your hiring needs with our executive search team or explore our full range of staffing services across the States.",
      },
    ],
  },
];

export function getHiringServiceBySlug(slug: string): HiringService | undefined {
  return hiringServices.find((service) => service.slug === slug);
}
