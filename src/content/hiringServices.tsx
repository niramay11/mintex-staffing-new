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
      "Scale your business with our contract talent solutions where we help you to connect with specialized professionals who are ready to step in, add immediate and can convert into full-time professionals. Based in Edison, New Jersey, we place contract talent with employers across the state.",
    accent: "tan",
    icon: IconClock,
    points: [
      {
        title: "On-demand experts",
        description:
          "Hire talents when your business needs them, we help you match your project/business requirements and lunch pre-qualified talents who has relevant skills and experience that your firm needs today.",
      },
      {
        title: "Flexibility to expand",
        description:
          "Match your headcount for your project workloads and expand your delivery capabilities during peak demands and allocate your resources seamlessly",
      },
      {
        title: "Fast momentum",
        description:
          "Our contract professionals are picked for their industry readiness and adaptability; they will drop into your workflows and start contributing from day one.",
      },
      {
        title: "Clear path to permanent fit",
        description:
          "Use contract roles as an organic way to evaluate mutual alignment. By working together on real projects first, both your team and the candidate can ensure a perfect cultural and technical fit before making a long-term commitment.",
      },
    ],
  },
  {
    slug: "permanent-talent",
    name: "Permanent Talent",
    badge: "Long-term hires",
    tagline: "Full-time hires vetted for skills, culture, and long-term fit.",
    intro:
      "Our permanent staffing solutions focuses on high-calibre professionals and quicker hiring timeline, who align with your long-term vision and core company values. Finding exceptional talent shouldn't require compromising your timeline or budget, we take care of the recruitment, so your leadership stay completely focused on what matter the most. Headquartered in Edison, NJ, we serve employers throughout New Jersey.",
    accent: "tan",
    icon: IconStar,
    points: [
      {
        title: "We are focused on quality",
        description:
          "You should not be drowning in unverified/AI Generated applications, we take care of your staffing needs and deliver top tier matches of highly targeted shortlist of candidates",
      },
      {
        title: "Hiring is done in matter of days",
        description:
          "Finding top-tier candidates and deciding is quicker cause you will be selecting from a pool of pre-qualified candidates.",
      },
      {
        title: "End to end support",
        description:
          "Our expert recruiters will work with you to make sure the offer made by you is competitive and up to the industry standard.",
      },
    ],
  },
  {
    slug: "executive-search",
    name: "Executive Search",
    badge: "Leadership hiring",
    tagline: "Confidential search for senior leaders and hard-to-fill roles.",
    intro:
      "We connect you with the C-suite highly qualified professionals who will take your company ahead, and we make sure its sealed tight according to your policy and organization standards. Our Edison, New Jersey team runs confidential searches for organizations statewide and beyond.",
    accent: "steel",
    icon: IconBriefcase,
    points: [
      {
        title: "Board recruitment and advisory",
        description:
          "We help you build your strongest high performing asset by identifying forward-thinking, diverse experts for public, private and non-profit organizations.",
      },
      {
        title: "Top-tier talent placement",
        description:
          "Our consultants are experienced business experts who will fish out the top-tier talents from exclusive global networks to match your organization standards.",
      },
      {
        title: "Cultural fit",
        description:
          "Our approach is to identify exceptional candidates from a curated list of skills professionals for their track record, competencies, and cultural alignment to seamlessly deploy them into your current system.",
      },
      {
        title: "Making your search our priority",
        description:
          "Regardless of your firm's position, we will guide you with absolute focus. Our dedicated consultants will manage the relationship end-to-end and will provide transparency in communication, expert advice in negotiations, and onboarding support from initial consultation until your new leader jumps in.",
      },
    ],
  },
];

export function getHiringServiceBySlug(slug: string): HiringService | undefined {
  return hiringServices.find((service) => service.slug === slug);
}
